#!/usr/bin/env python3
"""MA00 C-MAPSS FD001 benchmark for SIMULATED aircraft turbofan RUL ONLY.

Baselines are trained on training engines exclusively. The test RUL file is
opened only for evaluation. No per-row random splits or automotive claims.
No numpy/sklearn dependency; intentionally transparent baseline.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import statistics
import zipfile
from pathlib import Path

SCHEMA = "ma00-nasa-cmapss-fd001-prior-baselines-v1"
REQUIRED = ("train_FD001.txt", "test_FD001.txt", "RUL_FD001.txt")
MAX_ZIP_BYTES = 35_000_000
MAX_UNCOMPRESSED_BYTES = 80_000_000
MAX_TOTAL_ROWS = 250_000


def unpack_fd001(archive: str | Path):
    archive = Path(archive)
    if archive.stat().st_size > MAX_ZIP_BYTES:
        raise ValueError("NASA archive too large")
    data = archive.read_bytes()
    blob = hashlib.sha256(data).hexdigest()
    result = {}
    with zipfile.ZipFile(archive, "r") as z:
        info = z.infolist()
        if len(info) > 50 or sum(x.file_size for x in info) > MAX_UNCOMPRESSED_BYTES:
            raise ValueError("Archive contents too large")
        for member in info:
            # Ignore other FD00x subsets and folders; never extract to filesystem.
            basename = Path(member.filename).name
            if basename not in REQUIRED:
                continue
            if member.is_dir() or member.file_size > 15_000_000:
                raise ValueError("Expected NASA text file is invalid")
            if basename in result:
                raise ValueError("Duplicated NASA input within archive")
            with z.open(member) as stream:
                result[basename] = stream.read().decode("ascii")
    if set(result) != set(REQUIRED):
        raise ValueError("NASA FD001 train/test/RUL members not found")
    return blob, result


def load_trajectories(data: str, kind: str, max_rows=MAX_TOTAL_ROWS):
    trajectories = {}
    last_id = 0
    n = 0
    for line in data.splitlines():
        if not line.strip():
            continue
        n += 1
        if n > max_rows:
            raise ValueError("Too many CMAPSS rows")
        parts = line.split()
        if len(parts) != 26:
            raise ValueError("Expected FD001 26 columns per row")
        try:
            numbers = list(map(float, parts))
        except ValueError as e:
            raise ValueError("Non-numeric simulated sensor reading") from e
        if not all(map(math.isfinite, numbers)):
            raise ValueError("Nonfinite CMAPSS sensor reading")
        uid, cycle = numbers[:2]
        if not (uid.is_integer() and cycle.is_integer() and uid>=1 and cycle>=1):
            raise ValueError("Engine/cycle identifiers invalid")
        uid, cycle = int(uid), int(cycle)
        if uid < last_id:
            raise ValueError("Interleaved engine rows forbidden in this benchmark")
        last_id = uid
        seq = trajectories.setdefault(uid, [])
        if cycle != len(seq)+1:
            raise ValueError("Noncontiguous or duplicate cycle within engine")
        seq.append(cycle)
    if not trajectories:
        raise ValueError("Empty NASA " + kind)
    return {uid: seq[-1] for uid, seq in trajectories.items()}, n


def parse_test_rul(text: str, units: int):
    values = []
    for line in text.splitlines():
        if not line.strip():
            continue
        fields = line.split()
        if len(fields) != 1:
            raise ValueError("Test RUL is one positive scalar per engine")
        try:
            value = float(fields[0])
        except ValueError as e:
            raise ValueError("Invalid RUL value") from e
        if not math.isfinite(value) or value < 0 or not value.is_integer():
            raise ValueError("Invalid RUL integer")
        values.append(int(value))
    if len(values) != units:
        raise ValueError("RUL targets not aligned to test engines")
    return values


def evaluate_fd001(train: str, test: str, test_rul: str, *,
                   strict_nasa_counts: bool = False):
    training, train_rows = load_trajectories(train, "train")
    testing, test_rows = load_trajectories(test, "test")
    if sorted(training) != list(range(1, len(training)+1)) or sorted(testing) != list(range(1, len(testing)+1)):
        raise ValueError("Engine IDs must be contiguous within each independent split")
    if strict_nasa_counts and (len(training),len(testing),train_rows,test_rows)!=(100,100,20631,13096):
        raise ValueError("Unexpected published FD001 engine/row inventory")
    targets = parse_test_rul(test_rul, len(testing))
    # Training label RUL is derived from complete simulated training trajectories.
    # At no point are test labels or test sensor values used to fit a prior.
    lengths = list(training.values())
    prior_full_life = statistics.median(lengths)
    training_ruls = [length-cycle for length in lengths for cycle in range(1,length+1)]
    prior_constant_rul = statistics.median(training_ruls)
    predictions = {
        "train_row_constant_median": [prior_constant_rul] * len(testing),
        "train_engine_life_median_minus_observed_cycle": [
            max(0, prior_full_life - testing[uid]) for uid in sorted(testing)
        ],
    }
    estimates = {}
    for name, values in predictions.items():
        errors = [pred-target for pred,target in zip(values,targets)]
        estimates[name] = {
            "MAEcycles": round(sum(abs(x) for x in errors)/len(errors),3),
            "RMSEcycles": round(math.sqrt(sum(x*x for x in errors)/len(errors)),3),
            "negativeRulPredictions": sum(x<0 for x in values),
            "predictionUsesTestRul": False,
            "predictionUsesTestSensors": False,
        }
    return {
        "schema": SCHEMA, "domain": "synthetic_aircraft_turbofan",
        "trainEngines": len(training), "testEngines": len(testing),
        "trainRows": train_rows, "testRows": test_rows,
        "trainingMedianFullLifeCycles": prior_full_life,
        "trainingRowMedianRulCycles": prior_constant_rul,
        "baselineMetrics": estimates,
        "splitUnit": "entire_simulated_engine",
        "testRulUsedOnlyForScoring": True, "automotiveWearValidation": False,
        "mechanicalAgeKm": None, "realEngineCalibration": False,
        "caveat": "FD001 is SIMULATED TURBOFAN run-to-failure data; no causal wear inference and no transfer to OBD engines."
    }


def run_archive(path: str | Path):
    sha, parts = unpack_fd001(path)
    report = evaluate_fd001(parts[REQUIRED[0]], parts[REQUIRED[1]],
                            parts[REQUIRED[2]], strict_nasa_counts=True)
    report["sourceArchiveSha256"] = sha
    report["sourceUrl"] = ("https://phm-datasets.s3.amazonaws.com/NASA/"
                           "6.+Turbofan+Engine+Degradation+Simulation+Data+Set.zip")
    return report


if __name__ == "__main__":
    cli = argparse.ArgumentParser(description="MA00 NASA FD001 independent engine-prior baselines")
    cli.add_argument("source_zip")
    args = cli.parse_args()
    print(json.dumps(run_archive(args.source_zip), indent=2))
