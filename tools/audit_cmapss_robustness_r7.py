#!/usr/bin/env python3
"""MA00 R7: train-only noise/collinearity investigation of simulated NASA FD001.

This intentionally DOES NOT parse the FD001 test trajectories or RUL labels.
Every score comes from 5-fold ENGINE-separated internal TRAIN validation.
No retuning to a previously consumed FD001 TEST set; no automotive inference.
"""
from __future__ import annotations

import argparse
import json
import math
import random
import statistics
from collections import defaultdict

from tools.benchmark_cmapss_fd001 import unpack_fd001
from tools.benchmark_cmapss_sensors import (
    SOURCE_SHA256, read_sensor_trajectories, samples, features,
    fit_ridge, predict, select_features,
)

SCHEMA = "ma00-fd001-train-only-noise-diagnostics-v1"
MODES = ("cycle", "cycle_operating", "cycle_measurements", "cycle_sensors")
ALPHAS = (20.0, 200.0, 2000.0)
LEVELS = (0.0, 0.02, 0.05, 0.10)
SEEDS = (7, 29, 53, 83, 107)
CHECKPOINTS = (50, 100, 150)
FOLDS = 5
CONST_RANGE = 1e-8
COLLINEAR_LIMIT = .995


def weighted_sensor_stats(checkpoints):
    """Per-sensor variation from TRAIN checkpoints only (not R6 fallback SD=1)."""
    if not checkpoints:
        raise ValueError("No training data")
    total = sum(row[3] for row in checkpoints)
    result = []
    for idx in range(4, 25):  # 21 measurement channels, not 3 operations.
        values = [row[1][idx] for row in checkpoints]
        span = max(values) - min(values)
        avg = sum(value*row[3] for value,row in zip(values,checkpoints))/total
        variance = sum((value-avg)**2*row[3] for value,row in zip(values,checkpoints))/total
        result.append({"index":idx, "span":span, "sd":math.sqrt(max(variance,0.0))})
    return result


def correlations(checkpoints):
    """Training-only sensor redundancy; no pseudo-significance or p-values."""
    stats = weighted_sensor_stats(checkpoints)
    active = [x for x in stats if x["span"]>CONST_RANGE and x["sd"]>CONST_RANGE]
    total = sum(row[3] for row in checkpoints)
    means = {}
    for s in active:
        j=s["index"]
        means[j]=sum(row[1][j]*row[3] for row in checkpoints)/total
    pairs = []
    for i,left in enumerate(active):
        for right in active[i+1:]:
            a,b=left["index"],right["index"]
            cov=sum((row[1][a]-means[a])*(row[1][b]-means[b])*row[3]
                    for row in checkpoints)/total
            rho=cov/(left["sd"]*right["sd"])
            if math.isfinite(rho) and abs(rho)>=COLLINEAR_LIMIT:
                pairs.append((abs(rho),a-3,b-3,round(rho,6)))
    pairs.sort(reverse=True)
    return {
        "measurementCount":21,
        "nearConstantMeasurements":[s["index"]-3 for s in stats if s["span"]<=CONST_RANGE or s["sd"]<=CONST_RANGE],
        "highCorrelationPairCount":len(pairs),
        "topNearCollinearPairs":[{"sensorA":a,"sensorB":b,"correlation":r}
                                 for _,a,b,r in pairs[:12]],
        "limitAbsCorrelation":COLLINEAR_LIMIT,
        "meaning":"Measured channels only, TRAIN checkpoints. No causal importance inferred.",
    }


def fold_points(engines):
    """At fixed public cycle numbers; no end-of-life oracle selects the cut."""
    result = {}
    for uid,history in sorted(engines.items()):
        values=[]
        for cycle in CHECKPOINTS:
            if cycle<len(history):  # never make an already-failed state into a prediction.
                values.append((cycle,features(history,cycle),float(len(history)-cycle)))
        result[uid]=values
    return result


def _noise_sensitive(model, sensor_sds, held, *, seed, level):
    rng=random.Random(seed)
    sds=sensor_sds
    predictions={}
    for uid, entries in sorted(held.items()):
        outputs=[]
        for cycle,x,y in entries:
            noisy=x.copy()
            for i in range(4,25):
                if level>0 and sds[i]>CONST_RANGE:
                    noisy[i]+=rng.gauss(0.0,level*sds[i])
            outputs.append((cycle,y,predict(model,noisy)))
        predictions[uid]=outputs
    return predictions


def _engine_errors(per_engine):
    # Seeds are repeated perturbations of the SAME engine, not 5 new engines.
    grouped=defaultdict(list)
    for key,entries in per_engine.items():
        uid=key[0] if isinstance(key,tuple) else key
        grouped[uid].extend(entries)
    values=[]
    per_horizon=defaultdict(lambda:defaultdict(list))
    for uid,entries in grouped.items():
        if not entries:
            continue
        errors=[abs(p-y) for cycle,y,p in entries]
        values.append(sum(errors)/len(errors))
        for (cycle,y,p) in entries:
            per_horizon[cycle][uid].append(abs(p-y))
    if not values:
        raise ValueError("No eligible held-out engine checkpoints")
    return {
        "engineCount":len(values),
        "uniqueEngineCheckpointCount":sum(len(v) for v in per_horizon.values()),
        "perturbedPredictionCount":sum(len(a) for v in per_horizon.values() for a in v.values()),
        "engineBalancedMAE":round(sum(values)/len(values),3),
        "maxEngineMeanAE":round(max(values),3),
        "byObservedCycle":{
            str(cycle):{
                "engines":len(engine_errors),
                "perturbedPredictions":sum(len(a) for a in engine_errors.values()),
                "MAE":round(sum(sum(a)/len(a) for a in engine_errors.values())/len(engine_errors),3)
            }
            for cycle,engine_errors in sorted(per_horizon.items())
        },
    }


def analyze_train_only(text, *, strict_counts=False):
    engines=read_sensor_trajectories(text)
    if len(engines)<FOLDS*2:
        raise ValueError("At least 10 training engines required")
    total_rows=sum(len(h) for h in engines.values())
    if strict_counts and (len(engines),total_rows)!=(100,20631):
        raise ValueError("Unexpected original NASA FD001 TRAIN inventory")
    all_training_samples=samples(engines)
    diagnostic=correlations(all_training_samples)
    report={}
    for mode in MODES:
        by_alpha={}
        for alpha in ALPHAS:
            fold_coefficients=[]
            # Train-only deterministic outer GroupKFold; alpha fixed and reported,
            # not selected using heldout results, and no NASA TEST labels read.
            level_predictions={lv:defaultdict(list) for lv in LEVELS}
            for fold in range(FOLDS):
                train_ids=[uid for uid in engines if (uid-1)%FOLDS != fold]
                hold_ids=[uid for uid in engines if (uid-1)%FOLDS == fold]
                train_set={uid:engines[uid] for uid in train_ids}
                held_set={uid:engines[uid] for uid in hold_ids}
                train_checkpoints=samples(train_set)
                raw_stats=weighted_sensor_stats(train_checkpoints)
                sensor_sds={s["index"]:s["sd"] if s["span"]>CONST_RANGE and s["sd"]>CONST_RANGE else 0.0 for s in raw_stats}
                model=fit_ridge(train_checkpoints,mode,alpha)
                fold_coefficients.append(sum(abs(z) for z in model["beta"][1:]))
                if set(model["trainEngineIds"]) & set(hold_ids):
                    raise AssertionError("Engine leakage into heldout fold")
                held=fold_points(held_set)
                for level in LEVELS:
                    # Multiple fixed-seed perturbations, no chance to tune against TEST.
                    for seed in (SEEDS if level else SEEDS[:1]):
                        perturb=_noise_sensitive(model,sensor_sds,held,
                                                 seed=seed+fold*1009,level=level)
                        for uid, entries in perturb.items():
                            level_predictions[level][(uid,seed)].extend(entries)
            by_level={}
            for level in LEVELS:
                result=_engine_errors(level_predictions[level])
                result["independentEngines"]=len(engines)
                result["noiseSeeds"]=len(SEEDS) if level else 1
                by_level[str(level)]=result
            clean=by_level["0.0"]["engineBalancedMAE"]
            stressed=by_level["0.1"]["engineBalancedMAE"]
            by_alpha[str(int(alpha))]={
                "noiseByTrainStandardDeviation":by_level,
                "foldMeanStandardizedCoefficientL1":round(statistics.mean(fold_coefficients),3),
                "stressToCleanMAERatio":round(stressed/clean,3) if clean>0 else None,
            }
        report[mode]=by_alpha
    return {
        "schema":SCHEMA,
        "domain":"SIMULATED NASA turbofan FD001 TRAIN only",
        "trainEngines":len(engines),"trainRows":total_rows,
        "trainingCheckpointCount":len(all_training_samples),
        "heldOutCheckpoints":list(CHECKPOINTS),
        "engineFoldCount":FOLDS,
        "fitUsesOnlyOtherEngines":True,
        "simulatedEngineTestTouched":False,
        "rulTestLabelsRead":False,
        "hyperparametersSelectedOnHeldOutResults":False,
        "regularizationGridEvaluatedNotOptimized":list(ALPHAS),
        "noiseLevelsRelativeToTrainMeasuredSensorSD":list(LEVELS),
        "noiseSeeds":list(SEEDS),
        "noiseInjectedInto":"Only 21 nonconstant measured sensor channels; NOT operating settings or cycle",
        "sensorDiagnostics":diagnostic,
        "groups":report,
        "mechanicalAgeKm":None,
        "automotiveWearValidated":False,
        "limitations":[
            "This is TRAIN-only crossvalidation on one SIMULATED engine family, not external validation",
            "Selected checkpoints are fixed cycle 50/100/150 conditional on the engine surviving to them",
            "Train samples have per-engine weights; inference unit is complete simulated engine",
            "Train-derived noise is a stress test, NOT verified sensor or ELM327 measurement uncertainty",
            "No statistical independence of seeds, confidence interval or physically calibrated diagnostic accuracy claimed",
            "Previously consumed NASA FD001 TEST is not touched; do not retune based on prior TEST outcomes",
        ],
    }


def run_archive(path):
    digest,parts=unpack_fd001(path)
    if digest!=SOURCE_SHA256:
        raise ValueError("NASA source SHA-256 not the R5 pinned archive")
    # FD001 TEST and its label file are not parsed or evaluated.
    report=analyze_train_only(parts["train_FD001.txt"],strict_counts=True)
    report["sourceArchiveSha256"]=digest
    return report


if __name__=="__main__":
    parser=argparse.ArgumentParser(description="MA00 R7 TRAIN-only sensor noise and ablation analysis")
    parser.add_argument("nasa_archive")
    args=parser.parse_args()
    print(json.dumps(run_archive(args.nasa_archive),ensure_ascii=False,indent=2))
