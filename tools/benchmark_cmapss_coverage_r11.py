#!/usr/bin/env python3
"""MA00 R11: preregistered coverage, split calibration and abstention on FD004.

Only FD004 TRAIN is used to fit model, novelty gate, error quantile.
FD004 TEST is evaluated ONCE at the end. FD001/2/3 TEST are never opened.
NASA simulated turbofan RUL CYCLES, NOT automotive wear or km.
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

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from tools.benchmark_cmapss_sensors import (
    SOURCE_SHA256, read_sensor_trajectories, samples, features,
    fit_ridge, predict,
)
from tools.benchmark_cmapss_fd001 import parse_test_rul

SCHEMA="ma00-r11-fd004-split-calibrated-coverage-v1"
REQUIRED=("train_FD004.txt","test_FD004.txt","RUL_FD004.txt")
MAX_ZIP=35_000_000
MAX_UNCOMPRESSED=80_000_000
FIT_LAST=199
GATE_CAL_LAST=224
SOURCE_TOTAL=249
TEST_TOTAL=248
EXPECTED_TRAIN_ROWS=61249
EXPECTED_TEST_ROWS=41214
ALPHA=20.0
NOMINAL_GATE=.95
NOMINAL_RUL_COVERAGE=.90
MAX_SOURCE_INTERVAL_HALF_WIDTH=100.0
PSEUDO_CENSOR_FRACTION=.65
MIN_OBSERVED_CYCLES=20
EPS=1e-8


def read_source(path, *, expected_sha=SOURCE_SHA256):
    archive=Path(path)
    if archive.stat().st_size>MAX_ZIP:
        raise ValueError("Oversized NASA ZIP")
    raw=archive.read_bytes()
    digest=hashlib.sha256(raw).hexdigest()
    if digest!=expected_sha:
        raise ValueError("Official NASA ZIP hash mismatch")
    found={}
    def visit(z,depth):
        members=z.infolist()
        if len(members)>65 or sum(x.file_size for x in members)>MAX_UNCOMPRESSED:
            raise ValueError("NASA ZIP uncompressed limit exceeded")
        for member in members:
            if member.is_dir():
                continue
            name=Path(member.filename).name
            if name in REQUIRED:
                if name in found or member.file_size>15_000_000:
                    raise ValueError("Duplicated or oversized selected NASA member")
                with z.open(member) as reader:
                    found[name]=reader.read().decode("ascii")
            elif depth==0 and name.lower().endswith(".zip"):
                if member.file_size>MAX_ZIP:
                    raise ValueError("Nested NASA ZIP oversized")
                with z.open(member) as reader:
                    nested=reader.read()
                with zipfile.ZipFile(io.BytesIO(nested)) as inner:
                    visit(inner,1)
    with zipfile.ZipFile(io.BytesIO(raw)) as outer:
        visit(outer,0)
    if set(found)!=set(REQUIRED):
        raise ValueError("NASA FD004 three selected members unavailable")
    return digest,found


def precommitted_checkpoint(history):
    # Fixed pseudo-censoring protocol for train-only gate & residual calibration.
    n=len(history)
    if n<=MIN_OBSERVED_CYCLES:
        raise ValueError("Calibration engine too short")
    cycle=max(MIN_OBSERVED_CYCLES,math.floor(n*PSEUDO_CENSOR_FRACTION))
    if cycle>=n:
        raise AssertionError("Calibration prefix must precede failure")
    return cycle,features(history,cycle),n-cycle


def quantile_rank(values,prob):
    # Conservative split rank; infinity when insufficient n for the nominal
    # quantile. Do not silently promise coverage if n is too small.
    if not values or not 0<prob<1:
        raise ValueError("Independent calibration observations required")
    ordered=sorted(values)
    k=math.ceil((len(ordered)+1)*prob)
    return ordered[k-1] if k<=len(ordered) else math.inf


def fit_support(fit_records):
    """Robust channel novelty from source FIT engine checkpoints only.

    The source operating min-max is a strict *gate* rather than an inferred
    classification of fault states. Weak support can induce zero coverage.
    """
    xs=[row[1] for row in fit_records]
    operations={i:(min(x[i] for x in xs),max(x[i] for x in xs)) for i in (1,2,3)}
    center={}
    scale={}
    for j in range(4,25):
        vals=[x[j] for x in xs]
        med=statistics.median(vals)
        mad=statistics.median(abs(v-med) for v in vals)
        sigma=1.4826*mad
        if sigma>EPS:
            center[j]=med
            scale[j]=sigma
    if not scale:
        raise ValueError("No variable sensor channels to audit")
    return {"operations":operations,"center":center,"scale":scale}


def novelty(x,reference):
    if len(x)!=25 or not all(math.isfinite(v) for v in x):
        raise ValueError("Missing/nonfinite engine features")
    sensor_score=max(abs(x[j]-reference["center"][j])/reference["scale"][j]
                     for j in reference["scale"])
    operation_outside=any(x[j]<low or x[j]>high
                         for j,(low,high) in reference["operations"].items())
    return {"sensorScore":sensor_score,"operatingOutside":operation_outside}


def predict_and_gate(train,external):
    ids=sorted(train)
    if ids!=list(range(1,len(train)+1)) or len(ids)<15:
        raise ValueError("Invalid FD004 training-engine inventory")
    if len(train)==SOURCE_TOTAL:
        fit_ids=ids[:FIT_LAST]
        gate_ids=ids[FIT_LAST:GATE_CAL_LAST]
        risk_ids=ids[GATE_CAL_LAST:]
    else:
        # For unit tests only; never dynamically alter official split sizes.
        first=max(5,int(.8*len(ids)))
        second=max(first+2,int(.9*len(ids)))
        fit_ids=ids[:first]
        gate_ids=ids[first:second]
        risk_ids=ids[second:]
    if min(len(gate_ids),len(risk_ids))<2:
        raise ValueError("Too few separate calibration engines")
    fit_samples=samples({i:train[i] for i in fit_ids})
    model=fit_ridge(fit_samples,"cycle_sensors",ALPHA)
    if set(model["trainEngineIds"])!=set(fit_ids):
        raise AssertionError("Engine leakage in fit split")
    support=fit_support(fit_samples)
    gate_features=[precommitted_checkpoint(train[i])[1] for i in gate_ids]
    novelty_scores=[novelty(x,support)["sensorScore"] for x in gate_features]
    threshold=quantile_rank(novelty_scores,NOMINAL_GATE)
    # The source gate calibration remains separate from residual calibration.
    def accepted(x):
        score=novelty(x,support)
        return {"accept":not score["operatingOutside"] and score["sensorScore"]<=threshold,
                "sensorOutside":score["sensorScore"]>threshold,
                "operatingOutside":score["operatingOutside"]}
    risk_data=[precommitted_checkpoint(train[i]) for i in risk_ids]
    risk_residuals=[abs(predict(model,x)-true)
                    for _,x,true in risk_data if accepted(x)["accept"]]
    if risk_residuals:
        radius=quantile_rank(risk_residuals,NOMINAL_RUL_COVERAGE)
    else:
        radius=math.inf

    reports=[]
    for uid,h in sorted(external.items()):
        x=features(h,len(h))
        state=accepted(x)
        prediction=predict(model,x)
        # Domain acceptance is separate from interval-width budget.
        publishable=(state["accept"] and math.isfinite(radius) and
                     radius<=MAX_SOURCE_INTERVAL_HALF_WIDTH)
        reports.append({
            "id":uid, "decision":state, "prediction":prediction,
            "publishable":publishable,
            "interval":(max(0,prediction-radius),prediction+radius)
                        if publishable else None,
            "elapsedCycles":len(h),
        })
    return reports,{
        "fitEngines":len(fit_ids),"noveltyCalibrationEngines":len(gate_ids),
        "riskCalibrationEngines":len(risk_ids),
        "riskCalibrationAccepted":len(risk_residuals),
        "variableMeasurementChannels":len(support["scale"]),
        "ignoredNearlyConstantChannels":21-len(support["scale"]),
        "noveltyThreshold":round(threshold,4),
        "nominalNoveltyQuantile":NOMINAL_GATE,
        "intervalHalfWidth":round(radius,3) if math.isfinite(radius) else None,
        "intervalBoundWasFinite":math.isfinite(radius),
        "maxAllowedIntervalHalfWidth":MAX_SOURCE_INTERVAL_HALF_WIDTH,
        "nominalIntervalCoverage":NOMINAL_RUL_COVERAGE,
        "pseudoCensoringFraction":PSEUDO_CENSOR_FRACTION,
        "sourceRiskCalibrationBasedOnDistinctEngines":True,
    },statistics.median(len(train[i]) for i in fit_ids)


def _metrics_by_selection(truth,recs,baseline,mask):
    ids=[i for i,v in enumerate(mask) if v]
    if not ids:
        return {"engines":0,"ridgeMAEcycles":None,"baselineMAEcycles":None,
                "ridgeBiasCycles":None,"intervalCoverageFraction":None}
    errors=[recs[i]["prediction"]-truth[i] for i in ids]
    covered=[recs[i]["interval"][0]<=truth[i]<=recs[i]["interval"][1]
             for i in ids if recs[i]["interval"] is not None]
    return {
        "engines":len(ids),
        "ridgeMAEcycles":round(sum(abs(e) for e in errors)/len(ids),3),
        "baselineMAEcycles":round(sum(abs(baseline[i]-truth[i]) for i in ids)/len(ids),3),
        "ridgeBiasCycles":round(statistics.mean(errors),3),
        "intervalCoverageFraction":round(sum(covered)/len(covered),5) if covered else None,
    }


def evaluate(fd004_train,fd004_test,fd004_rul,*,strict=False):
    train=read_sensor_trajectories(fd004_train)
    test=read_sensor_trajectories(fd004_test)
    if strict and (len(train),sum(len(h) for h in train.values()))!=(SOURCE_TOTAL,EXPECTED_TRAIN_ROWS):
        raise ValueError("Unexpected official FD004 TRAIN inventory")
    if strict and (len(test),sum(len(h) for h in test.values()))!=(TEST_TOTAL,EXPECTED_TEST_ROWS):
        raise ValueError("Unexpected official FD004 TEST inventory")

    # All training, gate, radius and test decisions are label-blind wrt FD004 TEST.
    reports,calibration,median_life=predict_and_gate(train,test)
    baseline=[max(0,median_life-r["elapsedCycles"]) for r in reports]
    decisions=[r["decision"] for r in reports]
    domain=[r["decision"]["accept"] for r in reports]
    publish=[r["publishable"] for r in reports]
    # Only now read withheld test labels. This subset is consumed once in R11.
    truth=parse_test_rul(fd004_rul,len(test))
    return {
        "schema":SCHEMA,
        "sourceSha256Expected":SOURCE_SHA256,
        "domain":"NASA C-MAPSS simulated turbofan FD004, six operating conditions and two fault modes",
        "trainEngines":len(train),"testEngines":len(test),
        "trainRows":sum(len(h) for h in train.values()),
        "testRows":sum(len(h) for h in test.values()),
        "fitAndCalibrationSeparatelyByEngine":True,
        "testLabelsReadOnlyAfterDecisions":True,
        "previousFD001FD002FD003TestsRead":False,
        "fd004TestPreviouslyUntouched":True,
        "alphaFrozen":ALPHA,
        "calibration":calibration,
        "decisionCounts":{
            "sourceDomainAccepted":sum(domain),
            "domainAbstained":len(test)-sum(domain),
            "publishedPredictions":sum(publish),
            "totalAbstentions":len(test)-sum(publish),
            "coverageFraction":round(sum(publish)/len(test),5),
            "sensorOOD":sum(x["sensorOutside"] for x in decisions),
            "operatingOOD":sum(x["operatingOutside"] for x in decisions),
            "bothOOD":sum(x["operatingOutside"] and x["sensorOutside"] for x in decisions),
            "withheldBecauseOfIntervalWidth":sum(x and not y for x,y in zip(domain,publish))
        },
        "wholeCohortForAudit":_metrics_by_selection(truth,reports,baseline,[True]*len(test)),
        "publishedOnly":_metrics_by_selection(truth,reports,baseline,publish),
        "withheldOnlyForAudit":_metrics_by_selection(truth,reports,baseline,[not x for x in publish]),
        "actualAutomotiveWear":None,"remainingAutomotiveLife":None,
        "physicalSensorUncertaintyValidated":False,
        "scientificLimitations":[
            "Calibration terminal-truncated at fixed 65% of true simulated life; FD004 TEST cutoff mechanism may differ.",
            "Nominal conformal rank is not a guaranteed error/coverage bound without exchangeability.",
            "Gate cutoff and residual quantile are calibrated on distinct TRAIN engines, not test labels.",
            "Calibration residuals conditioned on gate acceptance may have small effective sample size.",
            "MAE on published cases is a post-selection descriptive metric, not accuracy guarantee.",
            "No individual fault-mode labels, hence no defensible per-mechanism performance.",
            "FD004 TEST consumed after this run: do not tune hyperparameters or thresholds on it.",
            "No validation for OBD, real automobiles, physical mechanical age or RUL.",
        ]
    }


def run_archive(path):
    sha,items=read_source(path)
    result=evaluate(items["train_FD004.txt"],items["test_FD004.txt"],items["RUL_FD004.txt"],strict=True)
    result["sourceArchiveSha256"]=sha
    return result


if __name__=="__main__":
    cli=argparse.ArgumentParser(description="MA00 R11 source split-calibration, FD004 coverage and abstention")
    cli.add_argument("pinned_nasa_archive")
    args=cli.parse_args()
    print(json.dumps(run_archive(args.pinned_nasa_archive),indent=2))
