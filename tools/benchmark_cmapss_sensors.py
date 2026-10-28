#!/usr/bin/env python3
"""MA00 R6: engine-separated regularized sensor experiment on SIMULATED NASA FD001.

No Numpy or model dependencies. A transparent linear ridge baseline with:
- deterministic whole-engine 5-fold TRAIN-ONLY cross-validation,
- per-engine-balanced training checkpoints, training-only feature normalization,
- TEST labels used solely to score frozen models,
- sensor/age ablations and a deterministic sensor-noise stress test.

RUL is simulated turbofan CYCLES, NOT automotive mileage/wear/health.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import random
import statistics
import sys
from pathlib import Path

# Direct CLI invocation has tools/ as sys.path[0]; add the repository root.
# This module remains importable by unittest without installation.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.benchmark_cmapss_fd001 import (
    evaluate_fd001, unpack_fd001, parse_test_rul, REQUIRED,
)

VERSION = "ma00-nasa-fd001-sensor-ridge-research-v1"
SOURCE_SHA256 = "c9c5dec12a945a82e8bb4446589d7fb3cc057b5e5d81fa1a12e25ee9912ad3b2"
ALPHAS = (1.0, 20.0, 200.0)
SEED = 20261028
WINDOW = 5


def read_sensor_trajectories(text):
    result = {}
    last_id = 0
    count = 0
    for line in text.splitlines():
        if not line.strip():
            continue
        parts = line.split()
        if len(parts) != 26:
            raise ValueError("FD001 requires 26 columns")
        try:
            values = [float(x) for x in parts]
        except ValueError as e:
            raise ValueError("Non-numeric sensor observation") from e
        if any(not math.isfinite(v) for v in values):
            raise ValueError("Nonfinite sensor observation")
        uid, cycle = values[:2]
        if uid < 1 or cycle < 1 or not uid.is_integer() or not cycle.is_integer():
            raise ValueError("Invalid simulated engine/cycle")
        uid, cycle = int(uid), int(cycle)
        if uid < last_id:
            raise ValueError("Interleaved engine records")
        seq = result.setdefault(uid, [])
        if cycle != len(seq) + 1:
            raise ValueError("Noncontiguous engine cycles")
        seq.append(tuple(values[2:]))  # Three operating settings and 21 sensors.
        last_id = uid
        count += 1
        if count > 250000:
            raise ValueError("Too many simulator observations")
    if not result or sorted(result) != list(range(1, len(result)+1)):
        raise ValueError("Invalid contiguous per-split engine identifiers")
    return result


def features(history, count):
    if not 1 <= count <= len(history):
        raise ValueError("Missing sensor history")
    window = history[max(0, count-WINDOW):count]
    # Latest observed only, no future trajectory leakage.
    averages = [sum(row[j] for row in window)/len(window) for j in range(24)]
    return [float(count)] + averages


def samples(engines):
    dataset = []
    for uid, history in sorted(engines.items()):
        length = len(history)
        checkpoints = list(range(20, length+1, 10))
        if not checkpoints or checkpoints[-1] != length:
            checkpoints.append(length)
        # Each engine has total weight one, regardless of number of rows.
        weight = 1.0/len(checkpoints)
        for cycle in checkpoints:
            dataset.append((uid, features(history, cycle), float(length-cycle), weight))
    return dataset


def select_features(x, mode):
    if mode == "cycle":
        return x[:1]
    if mode == "sensors":
        return x[1:]
    if mode == "cycle_sensors":
        return x
    if mode == "cycle_operating":
        return x[:4]
    if mode == "cycle_measurements":
        return x[:1]+x[4:]
    if mode == "operating":
        return x[1:4]
    if mode == "measurements":
        return x[4:]
    raise ValueError("Unknown ablation")


def solve_linear(a, b):
    n = len(b)
    aug = [list(a[i]) + [b[i]] for i in range(n)]
    for i in range(n):
        pivot = max(range(i, n), key=lambda j: abs(aug[j][i]))
        if abs(aug[pivot][i]) < 1e-12:
            raise ValueError("Singular ridge system")
        aug[i], aug[pivot] = aug[pivot], aug[i]
        norm = aug[i][i]
        for j in range(i, n+1):
            aug[i][j] /= norm
        for k in range(i+1, n):
            factor = aug[k][i]
            for j in range(i+1, n+1):
                aug[k][j] -= factor*aug[i][j]
            aug[k][i] = 0.0
    result = [0.0]*n
    for i in range(n-1, -1, -1):
        result[i] = aug[i][n] - sum(aug[i][j]*result[j] for j in range(i+1, n))
    return result


def fit_ridge(checkpoints, mode, alpha):
    if not checkpoints or alpha <= 0:
        raise ValueError("Training observations/penalty required")
    xs = [select_features(row[1], mode) for row in checkpoints]
    n = len(xs[0])
    total_w = sum(item[3] for item in checkpoints)
    mu = [sum(x[j]*item[3] for x, item in zip(xs, checkpoints))/total_w for j in range(n)]
    std = [math.sqrt(sum((x[j]-mu[j])**2*item[3] for x,item in zip(xs,checkpoints))/total_w) or 1.0 for j in range(n)]
    p = n + 1
    matrix = [[0.0]*p for _ in range(p)]
    rhs = [0.0]*p
    for x, (_, __, target, weight) in zip(xs, checkpoints):
        z = [1.0] + [(x[j]-mu[j])/std[j] for j in range(n)]
        for j in range(p):
            rhs[j] += weight*z[j]*target
            for k in range(j, p):
                matrix[j][k] += weight*z[j]*z[k]
    for j in range(1, p):
        matrix[j][j] += alpha
    for j in range(p):
        for k in range(j):
            matrix[j][k] = matrix[k][j]
    beta = solve_linear(matrix, rhs)
    return {"mode":mode,"alpha":alpha,"mu":mu,"std":std,"beta":beta,
            "trainEngineIds":sorted({row[0] for row in checkpoints})}


def predict(model, full_features):
    selected = select_features(full_features, model["mode"])
    value = model["beta"][0] + sum(model["beta"][j+1]*(x-model["mu"][j])/model["std"][j]
                                 for j,x in enumerate(selected))
    return max(0.0, value)


def metrics(actual, predicted):
    if len(actual) != len(predicted) or not actual:
        raise ValueError("Need one prediction per complete held-out engine")
    diffs = [p-y for p,y in zip(predicted, actual)]
    return {"MAEcycles":round(sum(abs(d) for d in diffs)/len(diffs),3),
            "RMSEcycles":round(math.sqrt(sum(d*d for d in diffs)/len(diffs)),3)}


def cross_validate(engines, mode, alpha, folds=5):
    if len(engines) < folds or folds < 2:
        raise ValueError("Not enough independent train engines for folds")
    records = samples(engines)
    per_engine = []
    for fold in range(folds):
        train = [row for row in records if (row[0]-1)%folds != fold]
        held = [row for row in records if (row[0]-1)%folds == fold]
        model = fit_ridge(train, mode, alpha)
        if set(model["trainEngineIds"]) & {row[0] for row in held}:
            raise AssertionError("Engine leakage")
        grouped = {}
        for uid, x, y, _ in held:
            grouped.setdefault(uid, []).append(abs(predict(model,x)-y))
        per_engine.extend(sum(group)/len(group) for group in grouped.values())
    return round(sum(per_engine)/len(per_engine), 5)


def train_only_selection(train_engines):
    # All model families and alpha values are evaluated on TRAIN folds only.
    scores = {}
    for mode in ("cycle", "sensors", "cycle_sensors"):
        grid = {str(alpha):cross_validate(train_engines, mode, alpha) for alpha in ALPHAS}
        best = min(ALPHAS, key=lambda a:(grid[str(a)],a))
        scores[mode] = {"bestAlpha":best,"trainEngineCVmae":round(grid[str(best)],3),
                        "gridTrainCV":grid}
    return scores


def evaluate_sensor_models(train_text, test_text, rul_text, *, strict_counts=False):
    baseline = evaluate_fd001(train_text, test_text, rul_text, strict_nasa_counts=strict_counts)
    train = read_sensor_trajectories(train_text)
    test = read_sensor_trajectories(test_text)
    targets = parse_test_rul(rul_text, len(test))
    selected = train_only_selection(train)
    predictions = {}
    for mode in selected:
        fitted = fit_ridge(samples(train),mode,selected[mode]["bestAlpha"])
        if len(fitted["trainEngineIds"]) != len(train):
            raise AssertionError("Not all training engines used")
        forecast = [predict(fitted,features(history,len(history))) for _,history in sorted(test.items())]
        predictions[mode] = {"testMetrics":metrics(targets,forecast),
                             "trainOnlyCrossValidation":selected[mode],
                             "trainedOnTestEngines":False,"trainedOnTestRul":False}
    # Precommitted deterministic stress: selected SENSOR+AGE model with sensor
    # inputs perturbed by 0.10 training-only SD. NEVER used for selection.
    model = fit_ridge(samples(train),"cycle_sensors",selected["cycle_sensors"]["bestAlpha"])
    rng = random.Random(SEED)
    forecast = []
    for _, history in sorted(test.items()):
        x = features(history,len(history))
        stressed = [x[0]] + [x[j] + rng.gauss(0, 0.1*model["std"][j-1])
                                for j in range(1, len(x))]
        forecast.append(predict(model,stressed))
    predictions["cycle_sensors_10pct_train_sd_noise"] = {
        "testMetrics":metrics(targets,forecast),
        "retrainedForStress":False,
        "noiseStandardDeviation": "0.10 * train-only feature sd per sensor",
        "seed":SEED,
    }
    ref = baseline["baselineMetrics"]
    best_test = predictions["cycle_sensors"]["testMetrics"]["MAEcycles"]
    basic = ref["train_engine_life_median_minus_observed_cycle"]["MAEcycles"]
    return {
        "schema":VERSION,"domain":"SIMULATED turbofan; NOT automotive",
        "trainEngines":len(train),"testEngines":len(test),
        "trainRows":baseline["trainRows"],"testRows":baseline["testRows"],
        "selectionMetric":"5-fold TRAIN-engine CV mean engine-balanced checkpoint MAE",
        "testMetric":"one final available checkpoint per TEST engine",
        "testLabelsUsedForSelection":False,"independentEngineSplits":True,
        "baselineMetrics":ref,"sensorModels":predictions,
        "cycleSensorBeatsNonSensorBaseline":best_test < basic,
        "cycleSensorMAEimprovementPct":round(100*(basic-best_test)/basic,2),
        "mechanicalAgeKm":None,"automotiveWearValidated":False,
        "warning":"Single simulated FD001 domain. Test inspected once; do not retune after seeing result."
    }


def run_archive(path):
    digest, contents = unpack_fd001(path)
    if digest != SOURCE_SHA256:
        raise ValueError("NASA archive SHA-256 differs from previously observed official source")
    report = evaluate_sensor_models(contents[REQUIRED[0]],contents[REQUIRED[1]],
                                    contents[REQUIRED[2]],strict_counts=True)
    report["sourceArchiveSha256"] = digest
    return report


if __name__ == "__main__":
    parser=argparse.ArgumentParser(description="MA00 one-shot NASA FD001 sensor-vs-cycle-only research")
    parser.add_argument("official_nasa_zip")
    args=parser.parse_args()
    print(json.dumps(run_archive(args.official_nasa_zip),indent=2))
