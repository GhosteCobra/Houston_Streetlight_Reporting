import csv
import json
import time
from pathlib import Path

import requests


LAYER_URL = (
    "https://gis.centerpointenergy.com/arcgis/rest/services/"
    "SORA/SLO_REPORTING_WEB_MERCATOR/MapServer/3"
)

OUTPUT_GEOJSON = Path("houston_streetlights.geojson")
OUTPUT_CSV = Path("houston_streetlights.csv")

PAGE_SIZE = 1000
TIMEOUT = 60


def arcgis_request(url, params):
    """Make an ArcGIS REST request and validate the response."""
    response = requests.get(
        url,
        params=params,
        timeout=TIMEOUT,
        headers={
            "User-Agent": "Houston-Streetlight-Research/1.0",
            "Accept": "application/json",
        },
    )

    response.raise_for_status()

    data = response.json()

    if "error" in data:
        raise RuntimeError(
            f"ArcGIS error:\n{json.dumps(data['error'], indent=2)}"
        )

    return data


def get_layer_info():
    print("Checking ArcGIS layer...")

    info = arcgis_request(
        LAYER_URL,
        {"f": "json"},
    )

    print(f"Layer: {info.get('name')}")
    print(f"Geometry: {info.get('geometryType')}")
    print(f"Max record count: {info.get('maxRecordCount')}")

    return info


def get_object_ids():
    """Get every streetlight ObjectID first."""
    print("Requesting streetlight IDs...")

    query_url = f"{LAYER_URL}/query"

    data = arcgis_request(
        query_url,
        {
            "where": "1=1",
            "returnIdsOnly": "true",
            "f": "json",
        },
    )

    object_ids = data.get("objectIds", [])

    print(f"Found {len(object_ids):,} streetlight records.")

    return sorted(object_ids)


def download_batch(object_ids):
    """
    Download one batch.

    outSR=4326 asks ArcGIS to return ordinary
    longitude/latitude coordinates.
    """
    query_url = f"{LAYER_URL}/query"

    params = {
        "objectIds": ",".join(map(str, object_ids)),
        "outFields": "*",
        "returnGeometry": "true",
        "outSR": "4326",
        "f": "geojson",
    }

    response = requests.get(
        query_url,
        params=params,
        timeout=TIMEOUT,
        headers={
            "User-Agent": "Houston-Streetlight-Research/1.0",
            "Accept": "application/geo+json, application/json",
        },
    )

    response.raise_for_status()

    data = response.json()

    if "error" in data:
        raise RuntimeError(
            json.dumps(data["error"], indent=2)
        )

    return data.get("features", [])


def download_all(object_ids):
    features = []

    total = len(object_ids)

    for start in range(0, total, PAGE_SIZE):
        batch = object_ids[start:start + PAGE_SIZE]

        print(
            f"Downloading "
            f"{start + 1:,}-{min(start + PAGE_SIZE, total):,} "
            f"of {total:,}"
        )

        batch_features = download_batch(batch)
        features.extend(batch_features)

        # Be polite to the public server.
        time.sleep(0.2)

    return features


def save_geojson(features):
    collection = {
        "type": "FeatureCollection",
        "features": features,
    }

    with OUTPUT_GEOJSON.open("w", encoding="utf-8") as f:
        json.dump(collection, f, ensure_ascii=False)

    print(
        f"Saved {len(features):,} features → "
        f"{OUTPUT_GEOJSON}"
    )


def save_csv(features):
    """
    Flatten GeoJSON properties and add latitude/longitude
    columns so the result is easy to use in pandas,
    PostgreSQL, QGIS, etc.
    """

    if not features:
        print("No features to save.")
        return

    property_names = set()

    for feature in features:
        property_names.update(
            feature.get("properties", {}).keys()
        )

    property_names = sorted(property_names)

    fieldnames = [
        "longitude",
        "latitude",
        *property_names,
    ]

    with OUTPUT_CSV.open(
        "w",
        newline="",
        encoding="utf-8",
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        for feature in features:

            properties = feature.get(
                "properties",
                {}
            ).copy()

            geometry = feature.get(
                "geometry"
            ) or {}

            coordinates = geometry.get(
                "coordinates"
            ) or [None, None]

            row = {
                "longitude": coordinates[0],
                "latitude": coordinates[1],
                **properties,
            }

            writer.writerow(row)

    print(
        f"Saved {len(features):,} rows → "
        f"{OUTPUT_CSV}"
    )


def main():

    get_layer_info()

    object_ids = get_object_ids()

    if not object_ids:
        raise RuntimeError(
            "ArcGIS returned no streetlight IDs."
        )

    features = download_all(object_ids)

    print(
        f"\nDownloaded {len(features):,} streetlights."
    )

    save_geojson(features)
    save_csv(features)

    print("\nDone.")


if __name__ == "__main__":
    main()