"""Offline acceptance tests for the user-supplied exporter. No provider data."""
import contextlib
import csv
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "streetlight_export.py"
spec = importlib.util.spec_from_file_location("streetlight_export", SCRIPT)
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


def feature(oid=1):
    return {"type": "Feature", "properties": {"OBJECTID": oid, "pole_id": f"DEMO-{oid}"},
            "geometry": {"type": "Point", "coordinates": [-95.36, 29.76]}}


def layer_info(limit=1000):
    return {"name": "DEMO layer", "geometryType": "esriGeometryPoint",
            "maxRecordCount": limit, "supportedQueryFormats": "JSON, geoJSON",
            "fields": [{"name": "OBJECTID", "type": "esriFieldTypeOID"}]}


class ExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        for name, value in [("OUTPUT_GEOJSON", root / "out.geojson"),
                            ("OUTPUT_CSV", root / "out.csv")]:
            self.enterContext(patch.object(exporter, name, value))
        self.enterContext(contextlib.redirect_stdout(io.StringIO()))
        self.get = self.enterContext(patch.object(exporter.requests, "get"))
        self.enterContext(patch.object(exporter.time, "sleep"))

    def responses(self, *payloads):
        self.get.side_effect = [Mock(json=Mock(return_value=p)) for p in payloads]

    def test_complete_synthetic_export(self):
        self.responses(layer_info(),
                       {"objectIds": [1, 2]},
                       {"type": "FeatureCollection", "features": [feature(1), feature(2)]})
        exporter.main(bbox=[-95.37, 29.75, -95.35, 29.77])
        result = json.loads(exporter.OUTPUT_GEOJSON.read_text(encoding="utf-8"))
        self.assertEqual([f["properties"]["pole_id"] for f in result["features"]],
                         ["DEMO-1", "DEMO-2"])
        with exporter.OUTPUT_CSV.open(newline="", encoding="utf-8") as stream:
            rows = list(csv.DictReader(stream))
        self.assertEqual(len(rows), 2)
        self.assertEqual((rows[0]["longitude"], rows[0]["latitude"]), ("-95.36", "29.76"))

    def test_arcgis_error_stops_before_outputs(self):
        self.responses({"error": {"code": 404, "message": "Service not found"}})
        with self.assertRaisesRegex(RuntimeError, "Service not found"):
            exporter.main(bbox=[-95.37, 29.75, -95.35, 29.77])
        self.assertFalse(exporter.OUTPUT_GEOJSON.exists())
        self.assertFalse(exporter.OUTPUT_CSV.exists())

    def test_http_error_propagates(self):
        self.get.return_value.raise_for_status.side_effect = exporter.requests.HTTPError("503")
        with self.assertRaises(exporter.requests.HTTPError):
            exporter.get_layer_info()

    def test_empty_ids_stop_before_outputs(self):
        self.responses(layer_info(), {"objectIds": []})
        with self.assertRaisesRegex(RuntimeError, "no streetlight IDs"):
            exporter.main(bbox=[-95.37, 29.75, -95.35, 29.77])
        self.assertFalse(exporter.OUTPUT_GEOJSON.exists())

    def test_multiple_batches_preserve_features(self):
        self.responses(*[{"type": "FeatureCollection", "features": [feature(i)]} for i in [1, 2, 3]])
        with patch.object(exporter, "PAGE_SIZE", 1):
            result = exporter.download_all([1, 2, 3])
        self.assertEqual([f["properties"]["OBJECTID"] for f in result], [1, 2, 3])

    def test_incomplete_export_is_rejected(self):
        self.responses(layer_info(1),
                       {"objectIds": [1, 2]},
                       {"type": "FeatureCollection", "features": [feature(1)],
                        "exceededTransferLimit": True})
        with self.assertRaisesRegex(RuntimeError, "(?i)incomplete|missing|transfer|limit"):
            exporter.main(bbox=[-95.37, 29.75, -95.35, 29.77])
        self.assertFalse(exporter.OUTPUT_GEOJSON.exists())

    def test_malformed_collection_is_rejected(self):
        self.responses({"unexpected": "response"})
        with self.assertRaises((RuntimeError, ValueError)):
            exporter.download_batch([1])

    def test_geometry_coordinates_take_precedence_over_properties(self):
        item = feature()
        item["properties"].update(longitude=0, latitude=0)
        exporter.save_csv([item])
        with exporter.OUTPUT_CSV.open(newline="", encoding="utf-8") as stream:
            reader = csv.DictReader(stream)
            self.assertEqual(len(reader.fieldnames), len(set(reader.fieldnames)))
            row = next(reader)
        self.assertEqual((row["longitude"], row["latitude"]), ("-95.36", "29.76"))


    def test_default_run_is_metadata_only(self):
        self.responses(layer_info())
        exporter.main()
        self.assertEqual(self.get.call_count, 1)
        self.assertFalse(exporter.OUTPUT_GEOJSON.exists())

    def test_bbox_and_record_limit(self):
        self.responses({"objectIds": [1, 2]})
        with self.assertRaisesRegex(RuntimeError, "limit"):
            exporter.get_object_ids([-95.37, 29.75, -95.35, 29.77], max_records=1)
        params = self.get.call_args.kwargs["params"]
        self.assertEqual(params["geometryType"], "esriGeometryEnvelope")
        self.assertEqual(params["inSR"], "4326")

    def test_invalid_bbox_makes_no_request(self):
        with self.assertRaises(ValueError):
            exporter.main(bbox=[-95, 30, -96, 29])
        self.get.assert_not_called()

    def test_server_record_limit_controls_batching(self):
        self.responses(layer_info(1), {"objectIds": [1, 2]},
                       {"type": "FeatureCollection", "features": [feature(1)]},
                       {"type": "FeatureCollection", "features": [feature(2)]})
        exporter.main(bbox=[-95.37, 29.75, -95.35, 29.77])
        self.assertEqual(self.get.call_count, 4)
        result = json.loads(exporter.OUTPUT_GEOJSON.read_text())
        self.assertEqual(len(result["features"]), 2)

    def test_wrong_or_duplicate_ids_rejected_even_with_correct_count(self):
        for returned in [[feature(1), feature(1)], [feature(1), feature(3)]]:
            self.responses({"type": "FeatureCollection", "features": returned})
            with self.assertRaisesRegex(RuntimeError, "Incomplete batch"):
                exporter.download_batch([1, 2])

    def test_wrong_layer_rejected(self):
        info = layer_info()
        info["geometryType"] = "esriGeometryPolygon"
        self.responses(info)
        with self.assertRaisesRegex(RuntimeError, "point layer"):
            exporter.get_layer_info()

    def test_invalid_geometry_rejected(self):
        for geometry in [None, {"type": "Point", "coordinates": [float("nan"), 29]},
                         {"type": "Point", "coordinates": [200, 29]}]:
            item = feature()
            item["geometry"] = geometry
            self.responses({"type": "FeatureCollection", "features": [item]})
            with self.assertRaises(RuntimeError):
                exporter.download_batch([1])

    def test_geojson_id_used_when_oid_property_is_omitted(self):
        item = feature()
        item["properties"].pop("OBJECTID")
        item["id"] = 1
        self.responses({"type": "FeatureCollection", "features": [item]})
        self.assertEqual(len(exporter.download_batch([1])), 1)

    def test_csv_preserves_all_colliding_source_values(self):
        item = feature()
        item["properties"].update(longitude=0, source_longitude=7)
        exporter.save_csv([item])
        with exporter.OUTPUT_CSV.open(newline="", encoding="utf-8") as stream:
            row = next(csv.DictReader(stream))
        self.assertEqual(row["longitude"], "-95.36")
        self.assertEqual(row["source_longitude"], "7")
        self.assertEqual(row["source_source_longitude"], "0")

    def test_spatial_query_tolerance_does_not_expand_export(self):
        outside = feature(2)
        outside["geometry"]["coordinates"] = [-95.34999, 29.76]
        self.responses(layer_info(), {"objectIds": [1, 2]},
                       {"type": "FeatureCollection", "features": [feature(1), outside]})
        exporter.main(bbox=[-95.37, 29.75, -95.35, 29.77])
        result = json.loads(exporter.OUTPUT_GEOJSON.read_text())
        self.assertEqual([f["properties"]["OBJECTID"] for f in result["features"]], [1])

if __name__ == "__main__":
    unittest.main()
