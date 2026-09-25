"""Inspect or export a bounded area from an approved ArcGIS point layer."""
import argparse
import csv
import json
import math
import time
from pathlib import Path

import requests

LAYER_URL = (
    "https://sora.centerpointenergy.com/arcgis/rest/services/"
    "SORA/SLO_REPORTING_HOU_MERCATOR/MapServer/0"
)
OUTPUT_GEOJSON = Path(".artifacts/exports/houston_streetlights.geojson")
OUTPUT_CSV = Path(".artifacts/exports/houston_streetlights.csv")
PAGE_SIZE = 1000
TIMEOUT = 60


def arcgis_request(url, params):
    response = requests.get(url, params=params, timeout=TIMEOUT, headers={
        "User-Agent": "Houston-Streetlight-Research/1.0",
        "Accept": "application/geo+json, application/json",
    })
    response.raise_for_status()
    try:
        data = response.json()
    except ValueError as exc:
        raise RuntimeError(f"ArcGIS returned invalid JSON at {url}") from exc
    if not isinstance(data, dict):
        raise RuntimeError("ArcGIS response must be a JSON object")
    if "error" in data:
        raise RuntimeError(f"ArcGIS error at {url}: {json.dumps(data['error'])}")
    return data


def get_layer_info(layer_url=LAYER_URL):
    print("Checking ArcGIS layer...")
    info = arcgis_request(layer_url, {"f": "json"})
    if info.get("geometryType") != "esriGeometryPoint":
        raise RuntimeError("The selected layer is not a point layer")
    formats = info.get("supportedQueryFormats", "").lower().split(",")
    if "geojson" not in [value.strip() for value in formats]:
        raise RuntimeError("The selected layer does not advertise GeoJSON queries")
    print(f"Layer: {info.get('name')}; max records per request: {info.get('maxRecordCount')}")
    return info


def validate_bbox(bbox):
    if len(bbox) != 4 or not all(math.isfinite(v) for v in bbox):
        raise ValueError("bbox requires four finite coordinates")
    west, south, east, north = bbox
    if not (-180 <= west < east <= 180 and -90 <= south < north <= 90):
        raise ValueError("bbox must be west south east north in WGS84, without crossing the dateline")
    return bbox


def get_object_ids(bbox, layer_url=LAYER_URL, max_records=1000):
    validate_bbox(bbox)
    if max_records < 1:
        raise ValueError("max_records must be positive")
    data = arcgis_request(f"{layer_url}/query", {
        "where": "1=1", "returnIdsOnly": "true", "f": "json",
        "geometry": ",".join(map(str, bbox)), "geometryType": "esriGeometryEnvelope",
        "inSR": "4326", "spatialRel": "esriSpatialRelIntersects",
    })
    if "objectIds" not in data or data.get("exceededTransferLimit"):
        raise RuntimeError("Missing or incomplete object ID response")
    ids = data["objectIds"]
    if ids is None:
        ids = []
    if not isinstance(ids, list) or any(type(oid) is not int for oid in ids):
        raise RuntimeError("Invalid object IDs")
    if len(set(ids)) != len(ids):
        raise RuntimeError("Duplicate object IDs")
    if len(ids) > max_records:
        raise RuntimeError(f"Area contains {len(ids)} records; limit is {max_records}. Narrow the bbox.")
    return sorted(ids)


def validate_feature(feature):
    if not isinstance(feature, dict) or feature.get("type") != "Feature":
        raise RuntimeError("Invalid GeoJSON feature")
    if not isinstance(feature.get("properties"), dict):
        raise RuntimeError("Feature properties must be an object")
    geometry = feature.get("geometry")
    if not isinstance(geometry, dict) or geometry.get("type") != "Point":
        raise RuntimeError("Missing or non-point geometry")
    coords = geometry.get("coordinates")
    if not isinstance(coords, list) or len(coords) < 2:
        raise RuntimeError("Missing point coordinates")
    if any(type(v) not in (int, float) or not math.isfinite(v) for v in coords):
        raise RuntimeError("Non-finite or invalid coordinates")
    if not (-180 <= coords[0] <= 180 and -90 <= coords[1] <= 90):
        raise RuntimeError("Coordinates are outside WGS84 bounds")


def download_batch(object_ids, layer_url=LAYER_URL, oid_field="OBJECTID", fields=None):
    data = arcgis_request(f"{layer_url}/query", {
        "objectIds": ",".join(map(str, object_ids)),
        "outFields": ",".join(fields or [oid_field]),
        "returnGeometry": "true", "outSR": "4326", "f": "geojson",
    })
    if data.get("exceededTransferLimit"):
        raise RuntimeError("Incomplete batch: ArcGIS transfer limit exceeded")
    features = data.get("features")
    if data.get("type") != "FeatureCollection" or not isinstance(features, list):
        raise RuntimeError("Missing or malformed GeoJSON feature collection")
    returned_ids = []
    for feature in features:
        validate_feature(feature)
        oid = feature["properties"].get(oid_field, feature.get("id"))
        if type(oid) is not int:
            raise RuntimeError("Missing or invalid object ID in feature")
        returned_ids.append(oid)
    if len(returned_ids) != len(object_ids) or set(returned_ids) != set(object_ids):
        raise RuntimeError("Incomplete batch: missing, duplicate, or unexpected object IDs")
    return features


def download_all(object_ids, layer_url=LAYER_URL, page_size=None, oid_field="OBJECTID", fields=None):
    page_size = PAGE_SIZE if page_size is None else page_size
    if page_size < 1:
        raise ValueError("page_size must be positive")
    features = []
    for start in range(0, len(object_ids), page_size):
        batch = object_ids[start:start + page_size]
        features.extend(download_batch(batch, layer_url, oid_field, fields))
        if start + page_size < len(object_ids):
            time.sleep(0.2)
    return features


def save_geojson(features):
    for feature in features:
        validate_feature(feature)
    OUTPUT_GEOJSON.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_GEOJSON.open("w", encoding="utf-8") as stream:
        json.dump({"type": "FeatureCollection", "features": features}, stream,
                  ensure_ascii=False, allow_nan=False)


def save_csv(features):
    for feature in features:
        validate_feature(feature)
    names = sorted({name for feature in features for name in feature["properties"]})
    # Preserve colliding source values under unique source_ names.
    used = set(names) | {"longitude", "latitude"}
    columns = {}
    for name in names:
        column = name
        if name in ("longitude", "latitude"):
            column = "source_" + name
            while column in used:
                column = "source_" + column
        columns[name] = column
        used.add(column)
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=["longitude", "latitude", *columns.values()])
        writer.writeheader()
        for feature in features:
            coords = feature["geometry"]["coordinates"]
            row = {columns[k]: v for k, v in feature["properties"].items()}
            row.update(longitude=coords[0], latitude=coords[1])
            writer.writerow(row)


def main(bbox=None, layer_url=LAYER_URL, max_records=1000):
    if bbox is not None:
        validate_bbox(bbox)
    info = get_layer_info(layer_url)
    if bbox is None:
        print("Metadata check complete. Supply --bbox WEST SOUTH EAST NORTH for a bounded export.")
        return
    oid_fields = [f["name"] for f in info.get("fields", []) if f.get("type") == "esriFieldTypeOID"]
    if len(oid_fields) != 1:
        raise RuntimeError("Layer must expose exactly one object ID field")
    limit = info.get("maxRecordCount")
    if type(limit) is not int or limit < 1:
        raise RuntimeError("Layer has no valid maxRecordCount")
    fields = [oid_fields[0]]
    if any(f.get("name") == "FACILITYID" for f in info.get("fields", [])):
        fields.append("FACILITYID")
    ids = get_object_ids(bbox, layer_url, max_records)
    if not ids:
        raise RuntimeError("ArcGIS returned no streetlight IDs for this area")
    features = download_all(ids, layer_url, min(PAGE_SIZE, limit), oid_fields[0], fields)
    # ArcGIS spatial queries can include points just outside the envelope.
    west, south, east, north = bbox
    bounded = [feature for feature in features
               if west <= feature["geometry"]["coordinates"][0] <= east
               and south <= feature["geometry"]["coordinates"][1] <= north]
    if len(bounded) != len(features):
        print(f"Excluded {len(features) - len(bounded)} points outside the exact WGS84 bbox.")
    features = bounded
    save_geojson(features)
    save_csv(features)
    print(f"Saved {len(features)} records to {OUTPUT_GEOJSON} and {OUTPUT_CSV}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--layer-url", default=LAYER_URL)
    parser.add_argument("--bbox", nargs=4, type=float, metavar=("WEST", "SOUTH", "EAST", "NORTH"))
    parser.add_argument("--max-records", type=int, default=1000)
    args = parser.parse_args()
    try:
        main(args.bbox, args.layer_url, args.max_records)
    except (RuntimeError, ValueError, requests.RequestException, OSError) as exc:
        parser.exit(1, f"Export failed: {exc}\n")
