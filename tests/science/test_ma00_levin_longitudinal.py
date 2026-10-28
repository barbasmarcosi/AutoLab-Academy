"""MA00 LEVIN audit tests: all data generated here, never represented as field data."""
import csv
import tempfile
import unittest
from pathlib import Path
from tools.audit_levin_longitudinal import audit_levin_csv

FIELDS = ["deviceID", "tripID", "timestamp", "rpm", "speed", "cTemp", "eLoad"]


def row(unit, trip, second, rpm=800, speed=0, ect=90, load=18):
    return dict(deviceID=unit, tripID=trip, timestamp=f"2026-01-{trip:02d} 13:{second // 60:02d}:{second % 60:02d}",
                rpm=str(rpm), speed=str(speed), cTemp=str(ect), eLoad=str(load))


def fixture(records, headers=FIELDS):
    temp = tempfile.TemporaryDirectory()
    path = Path(temp.name) / "private-telematics.csv"
    with path.open("w", newline="", encoding="utf8") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)
    return temp, path


class LevinTests(unittest.TestCase):
    def test_two_trip_windows_are_descriptive_not_mechanical_age(self):
        data = ([row("device-internal-secret", 1, i, rpm=800+i%3) for i in range(30)] +
                [row("device-internal-secret", 2, i, rpm=810+i%3) for i in range(30)])
        tmp, path = fixture(data)
        try:
            report = audit_levin_csv(path)
        finally:
            tmp.cleanup()
        self.assertEqual(report["rows"], 60)
        self.assertEqual(report["distinctDevices"], 1)
        self.assertEqual(report["distinctVehicleTripPairs"], 2)
        self.assertEqual(report["tripWindowsWithWarmIdle"], 2)
        self.assertEqual(report["vehiclesWithAtLeastTwoTripWindows"], 1)
        self.assertEqual(report["vehicles"][0]["firstLastIdleRpmDelta"], 10)
        self.assertFalse(report["timeZoneVerified"])
        self.assertFalse(report["closedLoopFuelVerified"])
        self.assertIsNone(report["mechanicalAgeKm"])
        self.assertNotIn("device-internal-secret", str(report))
        self.assertNotIn("2026-01-01", str(report))

    def test_driving_warmup_gaps_and_short_idle_do_not_count_as_valid_windows(self):
        data = ([row("carA", 1, i, speed=50) for i in range(25)] +
                [row("carA", 1, i+25, ect=55) for i in range(25)] +
                [row("carA", 1, i+50, rpm=800+i%2) for i in range(10)] +
                [row("carA", 2, i, rpm=800+i%2) for i in range(30) if i not in range(10, 14)])
        tmp, path = fixture(data)
        try:
            report = audit_levin_csv(path)
        finally:
            tmp.cleanup()
        self.assertEqual(report["tripWindowsWithWarmIdle"], 0)
        self.assertEqual(report["vehiclesWithAtLeastTwoTripWindows"], 0)

    def test_duplicate_timestamp_is_counted_and_never_implies_independence(self):
        rows = [row("carA", 1, i) for i in range(30)]
        rows[19]["timestamp"] = rows[18]["timestamp"]
        tmp, path = fixture(rows)
        try:
            report = audit_levin_csv(path)
        finally:
            tmp.cleanup()
        self.assertEqual(report["duplicateTimestampsWithinTrip"], 1)
        self.assertEqual(report["vehiclesWithAtLeastTwoTripWindows"], 0)

    def test_fails_on_missing_identity_nonfinite_numeric_and_bad_calendar(self):
        scenarios = [
            ([row("", 1, i) for i in range(25)], FIELDS),
            ([row("carA", 1, i, rpm="nan") for i in range(25)], FIELDS),
            ([{**row("carA", 1, i), "timestamp": "2026-02-30 13:00:00"} for i in range(25)], FIELDS),
            ([row("carA", 1, i) for i in range(25)], FIELDS[:-1]),
        ]
        for records, header in scenarios:
            tmp, path = fixture(records, header)
            try:
                with self.assertRaises(ValueError):
                    audit_levin_csv(path)
            finally:
                tmp.cleanup()

    def test_do_not_require_or_export_location_fields(self):
        data = [{**row("carA", 1, i), "gpsLatitude": "53.0", "gpsLongitude": "-13.0"} for i in range(24)]
        tmp, path = fixture(data, FIELDS + ["gpsLatitude", "gpsLongitude"])
        try:
            report = audit_levin_csv(path)
        finally:
            tmp.cleanup()
        self.assertNotIn("gpsLatitude", str(report))
        self.assertNotIn("53.0", str(report))


if __name__ == "__main__":
    unittest.main()
