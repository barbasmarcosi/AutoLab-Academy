import csv
import tempfile
import unittest
from pathlib import Path
from tools.audit_mechanical_age_dataset import audit_csv


class TestMechanicalAgeAudit(unittest.TestCase):
    def test_detects_vehicle_label_confounding_and_split_leakage(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "obd.csv"
            with p.open("w", newline="", encoding="utf8") as f:
                w = csv.DictWriter(f, fieldnames=["vehicle_id", "timestamp", "RPM", "ECT", "label", "split"])
                w.writeheader()
                for vehicle, label, split in [
                    ("unit-1", "healthy", "train"), ("unit-1", "healthy", "test"),
                    ("unit-2", "faulty", "test"), ("unit-2", "faulty", "test")
                ]:
                    w.writerow(dict(vehicle_id=vehicle, timestamp="1", RPM="800" if vehicle == "unit-1" else "NaN", ECT="90", label=label, split=split))
            v = audit_csv(p)
            self.assertEqual(v["rows"], 4)
            self.assertEqual(v["independent_vehicle_ids"], 2)
            self.assertTrue(v["label_vehicle_confounding_risk"])
            self.assertEqual(v["cross_split_vehicle_leakage_count"], 1)
            self.assertEqual(v["duplicate_vehicle_timestamp_pairs"], 2)
            self.assertEqual(v["invalid_numeric_fraction"]["RPM"], 0.5)
            self.assertFalse(v["eligible_for_age_calibration"])

    def test_refuses_missing_identity_and_empty_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "obd.csv"
            p.write_text("vehicle_id,RPM\n,700\n", encoding="utf8")
            with self.assertRaisesRegex(ValueError, "Missing vehicle"):
                audit_csv(p)
            p.write_text("vehicle_id,RPM\n", encoding="utf8")
            with self.assertRaisesRegex(ValueError, "no observations"):
                audit_csv(p)
            p.write_text("RPM\n800\n", encoding="utf8")
            with self.assertRaisesRegex(ValueError, "identifier column"):
                audit_csv(p)


if __name__ == "__main__":
    unittest.main()
