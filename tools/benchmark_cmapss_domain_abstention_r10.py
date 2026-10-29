#!/usr/bin/env python3
"""MA00 R10: label-blind, source-calibrated OOD abstention on NASA FD002.

FD001 TRAIN supplies models and OOD calibration. No FD001 TEST/RUL, FD003
records or FD002 TRAIN. The FD002 TEST RUL file is read only AFTER all
predictions AND abstention decisions are fixed. RUL is SIMULATED TURBOFAN
cycles, never real vehicle wear/health.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import statistics
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.benchmark_cmapss_sensors import (
    SOURCE_SHA256, read_sensor_trajectories, features,
    fit_ridge, samples, predict, metrics,
)
from tools.benchmark_cmapss_fd001 import parse_test_rul

VERSION="ma00-r10-fd001-to-fd002-domain-abstention-v1"
REQUIRED=("train_FD001.txt","test_FD002.txt","RUL_FD002.txt")
MAX_ZIP=35_000_000
MAX_UNCOMPRESSED=80_000_000
ALPHA=1.0
CALIBRATION_FIRST_ENGINE=81
TRAIN_EXPECTED=(100,20631)
TEST_ENGINES_EXPECTED=259
NEAR_CONSTANT=1e-8


def read_source(zip_path,expected_sha=SOURCE_SHA256):
    path=Path(zip_path)
    if path.stat().st_size>MAX_ZIP:
        raise ValueError("NASA archive exceeds limit")
    raw=path.read_bytes()
    digest=hashlib.sha256(raw).hexdigest()
    if digest!=expected_sha:
        raise ValueError("NASA ZIP source hash mismatch")
    selected={}
    def walk(z,depth):
        members=z.infolist()
        if len(members)>65 or sum(m.file_size for m in members)>MAX_UNCOMPRESSED:
            raise ValueError("NASA ZIP exceeds bounded inspection")
        for member in members:
            if member.is_dir():
                continue
            name=Path(member.filename).name
            if name in REQUIRED:
                if name in selected or member.file_size>15_000_000:
                    raise ValueError("Duplicate or oversized selected file")
                with z.open(member) as source:
                    selected[name]=source.read().decode("ascii")
            elif depth==0 and name.lower().endswith(".zip"):
                if member.file_size>MAX_ZIP:
                    raise ValueError("Nested ZIP oversize")
                with z.open(member) as source:
                    nested=source.read()
                with zipfile.ZipFile(io.BytesIO(nested)) as inner:
                    walk(inner,1)
    with zipfile.ZipFile(io.BytesIO(raw)) as outer:
        walk(outer,0)
    if set(selected)!=set(REQUIRED):
        raise ValueError("FD001 source and FD002 external evaluation files required")
    return digest,selected


def reference_fit(engines):
    """Fit novelty score from 80 source engines; only their FINAL features.

    Calibration is performed on a separate 20-engine source TRAIN subset.
    Note terminal/full-lifetime source prefixes differ from truncated test.
    """
    if sorted(engines)!=list(range(1,len(engines)+1)) or len(engines)<10:
        raise ValueError("Contiguous source engine IDs required")
    # For synthetic unit tests n>=10, use 80/20 fraction if fewer than 100.
    if len(engines)==100:
        fit_ids=list(range(1,CALIBRATION_FIRST_ENGINE))
        calibration_ids=list(range(CALIBRATION_FIRST_ENGINE,101))
    else:
        cut=max(5,int(.8*len(engines)))
        fit_ids=list(range(1,cut+1))
        calibration_ids=list(range(cut+1,len(engines)+1))
    if len(calibration_ids)<2:
        raise ValueError("Insufficient distinct calibration engines")
    fit=[features(engines[uid],len(engines[uid])) for uid in fit_ids]
    calib=[features(engines[uid],len(engines[uid])) for uid in calibration_ids]
    operations={j:(min(x[j] for x in fit),max(x[j] for x in fit)) for j in (1,2,3)}
    median={}
    scale={}
    for j in range(4,25):
        values=[x[j] for x in fit]
        mid=statistics.median(values)
        deviations=[abs(v-mid) for v in values]
        mad=statistics.median(deviations)
        # MAD=0 for nearly constant channels. Exclude them from novelty
        # rather than synthesizing an arbitrary physical sensor error floor.
        s=1.4826*mad
        if s>NEAR_CONSTANT:
            median[j]=mid
            scale[j]=s
    if not scale:
        raise ValueError("No variable sensors to calibrate")
    model={"operations":operations,"median":median,"scale":scale}
    scores=[sensor_novelty(x,model) for x in calib]
    scores.sort()
    # Standard split-conformal rank, with n=20 and nominal 95%:
    # ceil(0.95*(20+1))=20 -> largest calibration score.
    k=min(len(scores), math.ceil(.95*(len(scores)+1)))-1
    cutoff=scores[k]
    model["noveltyThreshold"]=cutoff
    model["calibrationCount"]=len(calib)
    model["fitCount"]=len(fit)
    return model,calib


def sensor_novelty(x,gate):
    return max(abs(x[j]-gate["median"][j])/gate["scale"][j]
               for j in gate["scale"])


def decision(x,gate):
    if len(x)!=25 or not all(math.isfinite(v) for v in x):
        raise ValueError("Invalid external trajectory feature vector")
    operations_shift=any(
        x[j]<gate["operations"][j][0] or x[j]>gate["operations"][j][1]
        for j in (1,2,3)
    )
    score=sensor_novelty(x,gate)
    sensor_shift=score>gate["noveltyThreshold"]
    return {
        "accept":not (operations_shift or sensor_shift),
        "operatingOOD":operations_shift,
        "sensorOOD":sensor_shift,
        "noveltyScore":score,
    }


def _mae_pairs(actual,primary,baseline,mask):
    rows=[i for i,accepted in enumerate(mask) if accepted]
    if not rows:
        return {"engineCount":0,"primaryMAEcycles":None,
                "baselineMAEcycles":None,"primaryMinusBaselineMAEcycles":None}
    a=sum(abs(primary[i]-actual[i]) for i in rows)/len(rows)
    b=sum(abs(baseline[i]-actual[i]) for i in rows)/len(rows)
    return {"engineCount":len(rows),"primaryMAEcycles":round(a,3),
            "baselineMAEcycles":round(b,3),
            "primaryMinusBaselineMAEcycles":round(a-b,3)}


def evaluate(fd001_train,fd002_test,fd002_rul,*,strict=False):
    train=read_sensor_trajectories(fd001_train)
    external=read_sensor_trajectories(fd002_test)
    if strict and (len(train),sum(map(len,train.values())))!=TRAIN_EXPECTED:
        raise ValueError("Unexpected official FD001 training inventory")
    if strict and len(external)!=TEST_ENGINES_EXPECTED:
        raise ValueError("Unexpected official FD002 test engine count")

    # Previously frozen predictor from R6: alpha=1, FD001 TRAIN only.
    frozen=fit_ridge(samples(train),"cycle_sensors",ALPHA)
    if len(frozen["trainEngineIds"])!=len(train):
        raise AssertionError("Missing training engine")
    # Entirely label-blind gate: fit 80 FD001 engines, calibrate on other 20
    # FD001 TRAIN engines. This is NOT a calibration of prediction accuracy.
    guard,calibration=reference_fit(train)
    calibration_decisions=[decision(x,guard) for x in calibration]
    final_features=[features(seq,len(seq)) for _,seq in sorted(external.items())]
    all_decisions=[decision(x,guard) for x in final_features]
    model_preds=[predict(frozen,x) for x in final_features]
    life=statistics.median(len(seq) for seq in train.values())
    baseline=[max(0,life-len(seq)) for _,seq in sorted(external.items())]

    # The ONLY use of FD002 RUL: score predictions and decisions already frozen.
    truth=parse_test_rul(fd002_rul,len(external))
    accept=[a["accept"] for a in all_decisions]
    count=sum(accept)
    before=_mae_pairs(truth,model_preds,baseline,[True]*len(truth))
    accepted=_mae_pairs(truth,model_preds,baseline,accept)
    rejected=_mae_pairs(truth,model_preds,baseline,[not x for x in accept])
    outcomes={
        "accept":count,
        "abstain":len(external)-count,
        "coverageFraction":round(count/len(external),5),
        "abstentionFraction":round(1-count/len(external),5),
        "operatingOOD":sum(x["operatingOOD"] for x in all_decisions),
        "sensorOOD":sum(x["sensorOOD"] for x in all_decisions),
        "bothOOD":sum(x["operatingOOD"] and x["sensorOOD"] for x in all_decisions),
    }
    return {
        "schema":VERSION,"domain":"NASA C-MAPSS simulated turbofan only",
        "fitDataset":"FD001 TRAIN", "evaluationDataset":"FD002 TEST",
        "fd001TrainingEngines":len(train),"fd002TestEngines":len(external),
        "fd002TestRows":sum(len(s) for s in external.values()),
        "fd001TestOpened":False,"fd001RulTestOpened":False,
        "fd003Opened":False,"fd002TrainOpened":False,
        "fd002RULReadOnlyAfterDecisionsAndPredictions":True,
        "predictor":"R6 combined FD001 ridge alpha=1 (unchanged)",
        "sourceGateTrainingEngines":guard["fitCount"],
        "sourceGateCalibrationEngines":guard["calibrationCount"],
        "sourceCalibrationAcceptance":{
            "accepted":sum(x["accept"] for x in calibration_decisions),
            "total":len(calibration_decisions),
        },
        "gate":{"operatingReference":"strict range over source gate fit engines",
                "sensorReference":"max absolute MAD-z of nonconstant measured channels",
                "sensorThresholdQuantile":"split-source-engine rank ceil(0.95*(n+1))",
                "sensorThresholdValue":round(guard["noveltyThreshold"],5),
                "variableSensorCount":len(guard["scale"]),
                "ignoredNearConstantSensorCount":21-len(guard["scale"]),
                "acceptWhen":"all three operating settings in source ranges AND max sensor novelty within source calibration threshold",
                "predictorsOrThresholdsTunedOnFD002":False,
                "selectiveErrorGuarantee":False},
        "decisions":outcomes,
        "wholeCohort":before,"acceptedOnly":accepted,"abstainedOnlyForAudit":rejected,
        "mechanicalAgeKm":None,"autoEngineRemainingLife":None,
        "automotiveWearValidated":False,
        "limitations":[
            "FD002 has six simulated operating regimes; FD001 training covers one. Gate may reject every new regime.",
            "Threshold is calibrated for source novelty, NOT misprediction risk; selective MAE has no guaranteed bound.",
            "The calibration source contains full run-to-failure terminals, but FD002 TEST is truncated before failure.",
            "Nearconstant sensor channels are ignored for novelty; no proof that accepted samples share degradation mechanisms.",
            "Coverage and conditional MAE are descriptive of 259 independent SIMULATED engines, not vehicle reliability.",
            "FD002 TEST RUL is consumed once and cannot subsequently be used for tuning.",
            "No car-specific mechanical age, health percentage or remaining real-world useful life.",
        ]
    }


def run_archive(path):
    digest,source=read_source(path)
    report=evaluate(source["train_FD001.txt"],source["test_FD002.txt"],
                    source["RUL_FD002.txt"],strict=True)
    report["sourceArchiveSha256"]=digest
    return report


if __name__=="__main__":
    cli=argparse.ArgumentParser(description="MA00 R10 frozen FD001 domain guard on unseen FD002")
    cli.add_argument("pinned_nasa_zip")
    args=cli.parse_args()
    print(json.dumps(run_archive(args.pinned_nasa_zip),indent=2))
