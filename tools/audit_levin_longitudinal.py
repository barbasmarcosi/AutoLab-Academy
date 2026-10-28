#!/usr/bin/env python3
"""MA00 LEVIN longitudinal inventory, read-only and strictly aggregate-only.

This is a protocol auditor, not a health estimator. Source requires an external
CSV supplied by its owner: original LEVIN GitHub only documents external links.
Do not download/upload GPS, identifiers or original CSV to GitHub artifacts.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from collections import defaultdict
from datetime import datetime
from pathlib import Path

VERSION = "ma00-levin-trip-audit-v1"
# The official README uses camel case abbreviations, not a stable typed schema.
ALIASES = {
    "vehicle": ("deviceID", "deviceId", "device_id", "Device Id", "deviceid"),
    "trip": ("tripID", "tripId", "trip_id", "Trip ID"),
    "time": ("timestamp", "timeStamp", "Time Stamp", "time"),
    "rpm": ("rpm", "RPM"), "speed": ("speed", "speedOBD", "obdSpeed"),
    "ect": ("cTemp", "coolantTemp"), "load": ("eLoad", "engineLoad"),
}
MAX_ROWS = 750_000
MAX_BYTES = 100_000_000


def _name(headers, logical):
    found = [h for h in ALIASES[logical] if h in headers]
    if len(found) != 1:
        raise ValueError("Missing or ambiguous column " + logical)
    return found[0]


def _timestamp(value):
    # Upstream documents local wall-clock seconds, WITHOUT timezone.
    # Do not assign UTC or infer GPS time/independent days.
    if not isinstance(value, str):
        raise ValueError("Timestamp invalid")
    try:
        result = datetime.strptime(value.strip(), "%Y-%m-%d %H:%M:%S")
    except ValueError as e:
        raise ValueError("Timestamp invalid: " + value[:32]) from e
    return result


def _number(text, name):
    if text is None or text == "":
        return None
    try:
        val = float(text)
    except (TypeError, ValueError) as e:
        raise ValueError("Non-numeric " + name) from e
    if not math.isfinite(val):
        raise ValueError("Nonfinite " + name)
    return val


def _median(a):
    values = sorted(a)
    n = len(values)
    return values[n // 2] if n % 2 else (values[n // 2 - 1] + values[n // 2]) / 2


def audit_levin_csv(path: str | Path, max_rows: int = MAX_ROWS):
    path = Path(path)
    if path.stat().st_size > MAX_BYTES:
        raise ValueError("Dataset too large for local audited import")
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for data in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(data)
    trip_stats = defaultdict(lambda: {"rows": 0, "duplicates": 0, "outOfOrder": 0,
                                      "missingRequiredValues": 0, "last": None, "runs": [],
                                      "run": []})
    malformed_numeric = 0
    rows_count = 0
    with path.open(newline="", encoding="utf-8-sig") as stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames or len(reader.fieldnames) != len(set(reader.fieldnames)):
            raise ValueError("Invalid or duplicate headers")
        names = {k: _name(reader.fieldnames, k) for k in ALIASES}
        for line, row in enumerate(reader, start=2):
            rows_count += 1
            if rows_count > max_rows:
                raise ValueError("Row limit exceeded")
            if None in row or None in row.values():
                raise ValueError("Incomplete CSV row " + str(line))
            vehicle, trip = row[names["vehicle"]].strip(), row[names["trip"]].strip()
            if not vehicle or not trip or len(vehicle) > 120 or len(trip) > 120:
                raise ValueError("Vehicle and trip identifiers required")
            when = _timestamp(row[names["time"]])
            try:
                values = {k: _number(row[names[k]], k) for k in ("rpm", "speed", "ect", "load")}
            except ValueError:
                malformed_numeric += 1
                raise ValueError("Invalid numeric row " + str(line))
            state = trip_stats[(vehicle, trip)]
            state["rows"] += 1
            before = state["last"]
            if before is not None:
                delta = (when - before).total_seconds()
                if delta <= 0:
                    if delta == 0:
                        state["duplicates"] += 1
                    else:
                        state["outOfOrder"] += 1
                    state["runs"].append(state["run"])
                    state["run"] = []
                elif delta > 2:
                    state["runs"].append(state["run"])
                    state["run"] = []
            state["last"] = when
            if any(v is None for v in values.values()):
                state["missingRequiredValues"] += 1
                if state["run"]:
                    state["runs"].append(state["run"])
                    state["run"] = []
                continue
            valid = (0 <= values["speed"] <= 1 and 550 <= values["rpm"] <= 1150 and
                     75 <= values["ect"] <= 110 and 0 <= values["load"] <= 35)
            if not valid:
                if state["run"]:
                    state["runs"].append(state["run"])
                    state["run"] = []
                continue
            state["run"].append((when, values))
    if not rows_count:
        raise ValueError("No vehicle observations found")
    summary = []
    samples_per_vehicle = defaultdict(list)
    for (vehicle, trip), state in trip_stats.items():
        if state["run"]:
            state["runs"].append(state["run"])
        eligible = []
        for run in state["runs"]:
            if len(run) < 20:
                continue
            duration = (run[-1][0] - run[0][0]).total_seconds()
            if duration < 19:
                continue
            rpm = [x[1]["rpm"] for x in run]
            ect = [x[1]["ect"] for x in run]
            load = [x[1]["load"] for x in run]
            if max(ect) - min(ect) > 5 or max(load) - min(load) > 10:
                continue
            eligible.append({
                "start": run[0][0], "n": len(run), "duration": duration,
                "rpmMedian": _median(rpm), "ectMedian": _median(ect),
                "loadMedian": _median(load)
            })
        # At most one per trip for independent trip-level summaries.
        best = max(eligible, key=lambda x: (x["n"], x["duration"])) if eligible else None
        if best:
            samples_per_vehicle[vehicle].append(best)
        summary.append((state, best))
    vehicle_reports = []
    for vehicle in sorted({k[0] for k in trip_stats}):
        windows = sorted(samples_per_vehicle[vehicle], key=lambda x: x["start"])
        rpm_drift = (windows[-1]["rpmMedian"] - windows[0]["rpmMedian"]) if len(windows) >= 2 else None
        # No vehicle or trip IDs, GPS or calendar dates in the exported report.
        vehicle_reports.append({
            "anonymousLabel": "vehicle-%03d" % (len(vehicle_reports) + 1),
            "comparableTripWindows": len(windows),
            "firstLastIdleRpmDelta": round(rpm_drift, 3) if rpm_drift is not None else None,
            "repeatabilityQuantified": False,
            "wearOrAgeIdentified": False
        })
    return {
        "schema": VERSION, "sourceSha256": digest.hexdigest(),
        "rows": rows_count, "distinctDevices": len(vehicle_reports),
        "distinctVehicleTripPairs": len(trip_stats),
        "duplicateTimestampsWithinTrip": sum(s["duplicates"] for s, _ in summary),
        "outOfOrderTimestampsWithinTrip": sum(s["outOfOrder"] for s, _ in summary),
        "rowsWithMissingRequiredSignals": sum(s["missingRequiredValues"] for s, _ in summary),
        "invalidNumericRows": malformed_numeric,
        "tripWindowsWithWarmIdle": sum(bool(x) for _, x in summary),
        "vehiclesWithAtLeastTwoTripWindows": sum(x["comparableTripWindows"] >= 2 for x in vehicle_reports),
        "vehicles": vehicle_reports,
        "timeZoneVerified": False, "maintenanceHistoryVerified": False,
        "closedLoopFuelVerified": False, "independentMechanicalReference": False,
        "mechanicalAgeKm": None, "remainingUsefulLife": None,
        "qualityLimitations": [
            "Upstream deviceID-to-vehicle mapping is an operator claim, not independently authenticated",
            "Timestamps lack timezone; multiple trips need not imply independent mechanical states",
            "Trip-level first/last RPM difference includes temperature, control and accessory confounders",
            "Closed-loop PID 0103, STFT/LTFT and mechanical wear ground truth are not in the documented schema",
            "No precision, prediction, trend of wear or causality may be claimed from this inventory",
        ],
    }


def main():
    cli = argparse.ArgumentParser(description="MA00 LEVIN aggregate-only local CSV audit")
    cli.add_argument("csv_file")
    args = cli.parse_args()
    print(json.dumps(audit_levin_csv(args.csv_file), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
