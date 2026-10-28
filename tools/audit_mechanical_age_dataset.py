"""MA00: read-only profile for externally acquired *CSV* telemetry; no age estimation.

Do not put raw datasets, VINs, license-restricted data or credentials in the repo.
Converting XLSX/CBF to CSV is an explicit, separately audited preprocessing step.
"""
from __future__ import annotations
import argparse
import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path

NUMERIC = ("LOAD_PCT", "ECT", "RPM", "VSS", "IAT", "MAP", "MAF", "FRP", "BARO", "VPWR", "AAT")

def audit_csv(path: str | Path, vehicle_col="vehicle_id", time_col="timestamp", label_col="label", split_col="split"):
    vehicles = Counter()
    labels = defaultdict(set)
    vehicle_splits = defaultdict(set)
    missing = Counter()
    invalid_numeric = Counter()
    duplicate_vehicle_time = 0
    seen_times = set()
    rows = 0
    with Path(path).open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames or vehicle_col not in reader.fieldnames:
            raise ValueError("CSV header and vehicle identifier column are required")
        columns = list(reader.fieldnames)
        signals = [field for field in NUMERIC if field in columns]
        for row in reader:
            rows += 1
            vehicle = (row.get(vehicle_col) or "").strip()
            if not vehicle:
                raise ValueError(f"Missing vehicle identifier on data row {rows}")
            vehicles[vehicle] += 1
            for field in columns:
                val = (row.get(field) or "").strip()
                if not val:
                    missing[field] += 1
                if field in signals and val:
                    try:
                        if not math.isfinite(float(val)):
                            invalid_numeric[field] += 1
                    except (ValueError, TypeError):
                        invalid_numeric[field] += 1
            if label_col in columns and (row.get(label_col) or "").strip():
                labels[vehicle].add(row[label_col].strip())
            if split_col in columns and (row.get(split_col) or "").strip():
                vehicle_splits[vehicle].add(row[split_col].strip())
            if time_col in columns and (row.get(time_col) or "").strip():
                key = (vehicle, row[time_col].strip())
                if key in seen_times:
                    duplicate_vehicle_time += 1
                seen_times.add(key)
    if not rows:
        raise ValueError("CSV contains no observations")
    distinct_labels = sorted({label for v in labels.values() for label in v})
    singleton = bool(labels) and all(len(v) == 1 for v in labels.values())
    confounded = len(distinct_labels) >= 2 and singleton
    label_vehicle_count = {label: sum(label in tags for tags in labels.values()) for label in distinct_labels}
    return {
        "schema": "MA00-source-audit-v0",
        "rows": rows,
        "independent_vehicle_ids": len(vehicles),
        "columns": columns,
        "available_obd_signals": signals,
        "missing_fraction": {field: round(missing[field] / rows, 6) for field in columns},
        "invalid_numeric_fraction": {field: round(invalid_numeric[field] / rows, 6) for field in signals},
        "duplicate_vehicle_timestamp_pairs": duplicate_vehicle_time if time_col in columns else None,
        "label_classes": distinct_labels,
        "vehicle_support_per_label": label_vehicle_count,
        "label_vehicle_confounding_risk": confounded,
        "cross_split_vehicle_leakage_count": sum(len(s) > 1 for s in vehicle_splits.values()) if split_col in columns else None,
        "has_structural_wear_ground_truth": False,
        "eligible_for_age_calibration": False,
        "limits": "Rows are not independent engines. No verified wear, repair or life-outcome labels in this audit."
    }

def main():
    parser = argparse.ArgumentParser(description="Audit an existing local CSV (no network, no training).")
    parser.add_argument("csv_path")
    parser.add_argument("--vehicle-col", default="vehicle_id")
    parser.add_argument("--time-col", default="timestamp")
    parser.add_argument("--label-col", default="label")
    parser.add_argument("--split-col", default="split")
    args = parser.parse_args()
    print(json.dumps(audit_csv(args.csv_path, args.vehicle_col, args.time_col, args.label_col, args.split_col), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
