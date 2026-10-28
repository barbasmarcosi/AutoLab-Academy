#!/usr/bin/env python3
"""MA00 R8: explain R6-vs-R7 artificial noise with PAIRED TRAIN-only tests.

The exact same held-out TRAIN engines, fixed checkpoints, fitted coefficient
vectors and noise draws are used across counterfactual policies. Never selects
hyperparameters or evaluates previously consumed NASA TEST. A stress mechanism
is NOT a calibrated ELM327 sensor-error model.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import random
import statistics
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.benchmark_cmapss_sensors import (
    SOURCE_SHA256, read_sensor_trajectories, features, samples, fit_ridge, predict,
)
from tools.audit_cmapss_robustness_r7 import (
    weighted_sensor_stats, CONST_RANGE, FOLDS, CHECKPOINTS,
)

SCHEMA="ma00-r8-paired-noise-mechanism-train-only-v1"
ALPHA=20.0
# Original R6 TRAIN-CV chose alpha=1.0; R8 began with alpha=20.0.
# Compare both on TRAIN only. Never select based on previously consumed TEST.
ALLOWED_ALPHA=(1.0,20.0)
LEVEL=.10
SEEDS=(7,29,53,83,107)
# The R6 control is a verbatim relative-scale protocol: add one normal draw
# multiplied by 0.1*model.std for EACH of 24 noncycle columns.
POLICIES=(
    "clean",
    "r7_measured_variable",
    "r6_operating_only",
    "r6_measurements_all",
    "r6_all_channels",
    "r7_measured_plus_r6_operating",
)
MAX_ZIP=35_000_000
MAX_MEMBER=15_000_000


def _take_only_training(archive):
    """Read one named TRAIN member from verified official archive; never open TEST."""
    archive=Path(archive)
    if archive.stat().st_size>MAX_ZIP:
        raise ValueError("NASA archive too large")
    encoded=archive.read_bytes()
    digest=hashlib.sha256(encoded).hexdigest()
    if digest!=SOURCE_SHA256:
        raise ValueError("NASA archive does not match pinned official SHA-256")
    found=[]
    # One-level nested ZIP supported without extracting members to disk.
    def inspect(z,depth):
        members=z.infolist()
        if len(members)>65 or sum(m.file_size for m in members)>80_000_000:
            raise ValueError("NASA archive structure exceeds limits")
        for entry in members:
            if entry.is_dir():
                continue
            base=Path(entry.filename).name
            if base=="train_FD001.txt":
                if entry.file_size>MAX_MEMBER:
                    raise ValueError("Oversize NASA TRAIN input")
                with z.open(entry) as reader:
                    found.append(reader.read().decode("ascii"))
            elif depth==0 and base.lower().endswith(".zip"):
                if entry.file_size>MAX_ZIP:
                    raise ValueError("Oversize nested NASA zip")
                with z.open(entry) as reader:
                    nested=reader.read()
                with zipfile.ZipFile(io.BytesIO(nested),"r") as inner:
                    inspect(inner,1)
    with zipfile.ZipFile(io.BytesIO(encoded),"r") as top:
        inspect(top,0)
    if len(found)!=1:
        raise ValueError("Exactly one NASA TRAIN file required")
    return digest,found[0]


def _sd_by_index(train_records):
    stats=weighted_sensor_stats(train_records)
    return {item["index"]:(item["sd"] if
            item["sd"]>CONST_RANGE and item["span"]>CONST_RANGE else 0.0)
            for item in stats}


def _normal_draws(seed,engine,cycle):
    # Shared random draws across all policies (fair paired counterfactual).
    rng=random.Random(seed*1000003+engine*1009+cycle)
    return {j:rng.gauss(0,1) for j in range(1,25)}


def _policy_noise(model, train_sensor_sd, full_features, draws, policy):
    if policy not in POLICIES:
        raise ValueError("Unknown preregistered noise policy")
    result=list(full_features)
    for j in range(1,25):
        if policy=="clean":
            continue
        if policy=="r6_all_channels":
            sd=model["std"][j]
        elif policy=="r6_operating_only":
            sd=model["std"][j] if j<=3 else 0.0
        elif policy=="r6_measurements_all":
            sd=model["std"][j] if j>=4 else 0.0
        elif policy=="r7_measured_variable":
            sd=train_sensor_sd[j] if j>=4 else 0.0
        elif policy=="r7_measured_plus_r6_operating":
            sd=model["std"][j] if j<=3 else train_sensor_sd[j]
        else:
            raise AssertionError("Unrecognized policy")
        if sd>0:
            result[j]+=LEVEL*sd*draws[j]
    return result


def _score(predictions):
    # Three design units: independent engines, eligible checkpoints, repeats
    # of perturbation. Never inflate n=100 into 500 simulated engines.
    engine_errors=[]
    by_checkpoint=defaultdict(lambda:defaultdict(list))
    unique_checkpoints=set()
    for engine in sorted(predictions):
        events=predictions[engine]
        if not events:
            continue
        errors=[]
        for cycle,truth,guess,seed in events:
            err=abs(guess-truth)
            errors.append(err)
            by_checkpoint[cycle][engine].append(err)
            unique_checkpoints.add((engine,cycle))
        engine_errors.append(sum(errors)/len(errors))
    if not engine_errors:
        raise ValueError("No evaluable held-out training engines")
    return {
        "independentEngineCount":len(engine_errors),
        "uniqueEngineCheckpointCount":len(unique_checkpoints),
        "predictionsIncludingPerturbations":sum(map(len,predictions.values())),
        "engineBalancedMAEcycles":round(statistics.mean(engine_errors),3),
        "medianEngineMAEcycles":round(statistics.median(engine_errors),3),
        "worstEngineMeanAEcycles":round(max(engine_errors),3),
        "perCutoff":{
            str(c):{
                "engines":len(engine_map),
                "engineBalancedMAEcycles":round(statistics.mean(
                    statistics.mean(error_list) for error_list in engine_map.values()),3),
            } for c,engine_map in sorted(by_checkpoint.items())
        },
    }


def analyze_train_only(training_text,*,strict=False,alpha=ALPHA):
    if alpha not in ALLOWED_ALPHA:
        raise ValueError("Only preregistered alpha=1 or alpha=20 permitted")
    engines=read_sensor_trajectories(training_text)
    if len(engines)<10:
        raise ValueError("At least 10 independent training engines needed")
    if strict and (len(engines),sum(map(len,engines.values())))!=(100,20631):
        raise ValueError("FD001 TRAIN inventory mismatch")
    outcomes={policy:defaultdict(list) for policy in POLICIES}
    channel_groups=defaultdict(list)
    constant_sensors=set()
    for fold in range(FOLDS):
        train_ids={uid for uid in engines if (uid-1)%FOLDS!=fold}
        held_ids={uid for uid in engines if (uid-1)%FOLDS==fold}
        if train_ids & held_ids:
            raise AssertionError("R8 engine leakage")
        train_records=samples({uid:engines[uid] for uid in train_ids})
        model=fit_ridge(train_records,"cycle_sensors",alpha)
        if set(model["trainEngineIds"]) & held_ids:
            raise AssertionError("Train/heldout overlap")
        sensor_sds=_sd_by_index(train_records)
        for j in range(4,25):
            if sensor_sds[j]==0:
                constant_sensors.add(j-3) # NASA original sensor S1 to S21.
        # Standardized coefficient * standardized artificial sigma gives
        # a clean linear prediction perturbation before prediction is clipped.
        # This table quantifies R6-prior relative sensitivity per channel.
        for j in range(1,25):
            beta=model["beta"][1+j] # coefficient: full features index j
            channel_groups["operating" if j<=3 else "measurement"].append(
                (j,abs(beta)*LEVEL,abs(beta)*LEVEL*(
                    sensor_sds[j]/model["std"][j] if j>=4 else 0)))
        for uid in sorted(held_ids):
            history=engines[uid]
            for cycle in CHECKPOINTS:
                if len(history)<=cycle:
                    continue
                original=features(history,cycle)
                truth=len(history)-cycle
                for seed in SEEDS:
                    draws=_normal_draws(seed,uid,cycle)
                    for policy in POLICIES:
                        noisy=_policy_noise(model,sensor_sds,original,draws,policy)
                        guess=predict(model,noisy)
                        outcomes[policy][uid].append((cycle,truth,guess,seed))
    analyses={name:_score(entries) for name,entries in outcomes.items()}
    expected=len(SEEDS)
    for report in analyses.values():
        if report["independentEngineCount"]!=len(engines) or \
           report["predictionsIncludingPerturbations"]!= \
           report["uniqueEngineCheckpointCount"]*expected:
            raise AssertionError("Invalid noise replication counts")
    clean=analyses["clean"]["engineBalancedMAEcycles"]
    by_source={}
    for source in ("operating","measurement"):
        pairs=channel_groups[source]
        # Across all 5 fits, averages of sensitivity * 0.1 sigma.
        by_channel=defaultdict(list)
        for j,r6,r7 in pairs:
            by_channel[j].append((r6,r7))
        rankings=[
            {"channel":("operating"+str(j) if j<4 else "S"+str(j-3)),
             "meanR6AbsoluteBetaTimesNoise":round(statistics.mean(v[0] for v in series),5),
             "meanR7AbsoluteBetaTimesNoise":round(statistics.mean(v[1] for v in series),5)}
            for j,series in by_channel.items()
        ]
        rankings.sort(key=lambda x:(-x["meanR6AbsoluteBetaTimesNoise"],x["channel"]))
        by_source[source]=rankings
    return {
        "schema":SCHEMA,
        "domain":"SIMULATED NASA FD001 TRAIN-only mechanism audit",
        "trainingEngines":len(engines),
        "crossValidationByIndependentEngine":True,
        "trainTestSeparationPreserved":True,
        "testTrajectoriesParsed":False,
        "testRulLabelsRead":False,
        "alphaFixed":alpha,"noiseStdFraction":LEVEL,
        "seedValues":list(SEEDS),
        "observedCheckpoints":list(CHECKPOINTS),
        "constantSensorIndicesFromTrainFolds":sorted(constant_sensors),
        "identicalModelsAndNoiseDrawsForAllPolicies":True,
        "policies":analyses,
        "cleanVsStressedDifferences":{
            name:round(report["engineBalancedMAEcycles"]-clean,3)
            for name,report in analyses.items()
        },
        "byFeatureGroupExpectedLinearPerturbationBeforeClipping":by_source,
        "mechanicalAgeKm":None,"automotiveWearValidated":False,
        "validityLimitations":[
            "Comparisons isolate stress policies on identical ENGINE folds and fixed checkpoints only",
            "Absolute-beta noise sensitivity is a linear projection before RUL clipping, not physical sensor accuracy",
            "R8 does not replay the R6 LAST-TEST-checkpoint design or reuse its consumed labels",
            "Folds are not an independent external fleet; severe noise on real vehicles remains uncalibrated",
            "R7 variable-only perturbations differ fundamentally from R6 which adds jitter to all 24 noncycle features",
            "No km-equivalent wear, automotive RUL, engine health percentage or causal evidence may be reported",
        ],
    }


def run_archive(archive,*,alpha=ALPHA):
    digest,train=_take_only_training(archive)
    report=analyze_train_only(train,strict=True,alpha=alpha)
    report["officialZipSha256"]=digest
    return report


if __name__=="__main__":
    cli=argparse.ArgumentParser(description="MA00 R8 paired TRAIN-only sensor stress mechanism")
    cli.add_argument("original_nasa_zip")
    cli.add_argument("--alpha",type=float,choices=ALLOWED_ALPHA,default=ALPHA)
    args=cli.parse_args()
    print(json.dumps(run_archive(args.original_nasa_zip,alpha=args.alpha),ensure_ascii=False,indent=2))
