#!/usr/bin/env python3
"""MA00 R9: one-shot frozen FD001-to-FD003 simulated turbofan transfer.

Train exclusively on FD001 TRAIN, with the original R6 combined-model alpha=1.
Evaluate FD003 TEST exactly once. FD001 TEST and RUL are NEVER opened.
FD003 TRAIN is NEVER opened or used for tuning. All numbers = simulated cycles,
not automotive life, wear, or health.
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
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.benchmark_cmapss_fd001 import parse_test_rul
from tools.benchmark_cmapss_sensors import (
    SOURCE_SHA256, read_sensor_trajectories, samples, features,
    fit_ridge, predict, metrics,
)

SCHEMA="ma00-nasa-fd001-to-fd003-external-transfer-v1"
# Frozen, NOT chosen based on FD003 or re-inspected FD001 TEST:
ALPHA=1.0
EXPECTED_FD001_TRAIN=(100,20631)
EXPECTED_FD003_TEST_ENGINES=100
BOOTSTRAP_SEED=20261028
BOOTSTRAP_REPEATS=1000
REQUIRED=("train_FD001.txt","test_FD003.txt","RUL_FD003.txt")
MAX_ZIP=35_000_000
MAX_UNCOMPRESSED=80_000_000
RUL_BUCKETS=(50,100)


def read_selected_source(zip_path, *, expected_sha=SOURCE_SHA256):
    """Fetch precisely 3 members (FD001 TRAIN, FD003 TEST, FD003 RUL).
    Do not access FD001 TEST/RUL or FD003 TRAIN; never extract to disk.
    """
    path=Path(zip_path)
    if path.stat().st_size>MAX_ZIP:
        raise ValueError("ZIP exceeds research size limit")
    raw=path.read_bytes()
    digest=hashlib.sha256(raw).hexdigest()
    if digest!=expected_sha:
        raise ValueError("ZIP SHA-256 differs from pinned R5 official NASA source")
    chosen={}
    def visit(archive,depth):
        members=archive.infolist()
        if len(members)>65 or sum(entry.file_size for entry in members)>MAX_UNCOMPRESSED:
            raise ValueError("NASA ZIP exceeds bounded inspection limits")
        for entry in members:
            if entry.is_dir():
                continue
            name=Path(entry.filename).name
            if name in REQUIRED:
                if name in chosen or entry.file_size>15_000_000:
                    raise ValueError("Duplicate or oversized NASA selected input")
                with archive.open(entry) as stream:
                    chosen[name]=stream.read().decode("ascii")
            elif name.lower().endswith(".zip") and depth==0:
                if entry.file_size>MAX_ZIP:
                    raise ValueError("Nested NASA ZIP exceeds size limit")
                with archive.open(entry) as stream:
                    content=stream.read()
                with zipfile.ZipFile(io.BytesIO(content)) as inner:
                    visit(inner,1)
    with zipfile.ZipFile(io.BytesIO(raw)) as outer:
        visit(outer,0)
    if set(chosen)!=set(REQUIRED):
        raise ValueError("Expected FD001 TRAIN and FD003 TEST/RUL in official ZIP")
    return digest,chosen


def engine_bootstrap_delta(a,b):
    """Paired resampling of whole simulated TEST engines, fixed seed.
    Difference is MAE(a) minus MAE(b), so positive favors b.
    This is a descriptive interval WITHIN NASA FD003, not real-world coverage.
    """
    if len(a)!=len(b) or len(a)<2:
        raise ValueError("Paired engine errors required")
    rng=random.Random(BOOTSTRAP_SEED)
    diffs=[abs(x)-abs(y) for x,y in zip(a,b)]
    mean=sum(diffs)/len(diffs)
    bootstrap=[]
    for _ in range(BOOTSTRAP_REPEATS):
        bootstrap.append(sum(diffs[rng.randrange(len(diffs))] for i in range(len(diffs)))/len(diffs))
    bootstrap.sort()
    return {"meanMAEImprovementCycles":round(mean,3),
            "descriptivePairedBootstrap95pct":[round(bootstrap[24],3),round(bootstrap[975],3)],
            "resamplingUnit":"one independent simulated FD003 test engine",
            "repetitions":BOOTSTRAP_REPEATS}


def _band(rul):
    if rul<RUL_BUCKETS[0]:
        return "RUL_0_49"
    if rul<RUL_BUCKETS[1]:
        return "RUL_50_99"
    return "RUL_100_plus"


def evaluate_transfer(fd001_train,fd003_test,fd003_rul,*,strict=False):
    train=read_sensor_trajectories(fd001_train)
    test=read_sensor_trajectories(fd003_test)
    rows_train=sum(len(v) for v in train.values())
    rows_test=sum(len(v) for v in test.values())
    if strict and (len(train),rows_train)!=EXPECTED_FD001_TRAIN:
        raise ValueError("FD001 training inventory not the pinned original")
    if strict and len(test)!=EXPECTED_FD003_TEST_ENGINES:
        raise ValueError("FD003 test must contain 100 independent simulated engines")
    training_records=samples(train)
    models={
        mode:fit_ridge(training_records,mode,ALPHA)
        for mode in ("cycle","sensors","cycle_sensors")
    }
    if any(len(model["trainEngineIds"])!=len(train) for model in models.values()):
        raise AssertionError("Frozen models not trained on all FD001 train engines")
    train_cycle_lengths=[len(seq) for seq in train.values()]
    median_life=statistics.median(train_cycle_lengths)
     # R5 constant reference uses all TRAIN rows, not checkpoint-weighted samples.
    train_row_ruls=[
        len(sequence)-cycle
        for sequence in train.values()
        for cycle in range(1,len(sequence)+1)
    ]
    median_train_rul=statistics.median(train_row_ruls)
    records=[(uid,features(seq,len(seq)),len(seq)) for uid,seq in sorted(test.items())]
    forecasts={
        "fd001_train_constant_median_rul":[median_train_rul]*len(records),
        "fd001_train_median_lifetime_minus_cycles":[max(0,median_life-cycles)
                                                    for _,_,cycles in records],
    }
    for mode,model in models.items():
        forecasts["frozen_fd001_ridge_"+mode]=[predict(model,x) for _,x,_ in records]
    # Frozen FD001 models and all FD003 predictions are ready. ONLY now parse
    # the withheld simulated FD003 TEST RUL labels for scoring.
    actual=parse_test_rul(fd003_rul,len(test))
    summaries={}
    for name,values in forecasts.items():
        errors=[guess-truth for guess,truth in zip(values,actual)]
        groups={}
        for band in ("RUL_0_49","RUL_50_99","RUL_100_plus"):
            e=[abs(errors[i]) for i,truth in enumerate(actual) if _band(truth)==band]
            groups[band]={"engines":len(e),"MAEcycles":round(sum(e)/len(e),3) if e else None}
        summaries[name]={
            **metrics(actual,values),
            "meanSignedErrorCycles":round(statistics.mean(errors),3),
            "perActualRulBand":groups,
        }
    base_errors=[v-t for v,t in zip(forecasts["fd001_train_median_lifetime_minus_cycles"],actual)]
    primary_errors=[v-t for v,t in zip(forecasts["frozen_fd001_ridge_cycle_sensors"],actual)]
    primary=engine_bootstrap_delta(base_errors,primary_errors)
    measurements=[row[1] for row in training_records]
    mins=[min(x[j] for x in measurements) for j in range(25)]
    maxs=[max(x[j] for x in measurements) for j in range(25)]
    # This only describes support of FD001 TRAIN; no adaptation allowed.
    out_of_train_ranges={}
    for key,indices in (
        ("cycle",[0]),("operations",[1,2,3]),("measurements",list(range(4,25)))):
        count=sum(any(x[j]<mins[j] or x[j]>maxs[j] for j in indices)
                  for _,x,_ in records)
        out_of_train_ranges[key]={
            "testEnginesWithAnyOutsideFD001TrainRange":count,
            "testEngines":len(test)
        }
    return {
        "schema":SCHEMA,
        "domain":"SIMULATED NASA turbofan transfer, FD001 TRAIN -> FD003 TEST",
        "fd001TrainEngines":len(train),"fd001TrainRows":rows_train,
        "fd003TestEngines":len(test),"fd003TestRows":rows_test,
        "sourceTrainSubset":"FD001 TRAIN (one simulated operating condition, one fault mode)",
        "newEvaluationSubset":"FD003 TEST (one operating condition, two simulated fault modes)",
        "fd001TestOpened":False,"fd001RulTestRead":False,
        "fd003TrainOpened":False,"fd003TestLabelsUsedOnlyOnceForScoring":True,
        "alphaFixedFromPriorR6Train":ALPHA,
        "allModelsFrozenBeforeFD003RULScoring":True,
        "fd001MedianLifetime":median_life,"fd001MedianRowRUL":median_train_rul,
        "testMetricUnit":"one final available prefix per independent FD003 simulated engine",
        "metrics":summaries,
        "primaryComparison":"FD001 median lifetime minus elapsed cycles vs FD001 frozen cycle+sensors ridge",
        "primaryPairedUncertainty":primary,
        "fd003OutOfSourceTrainRanges":out_of_train_ranges,
        "fd003PerEngineFaultModeAvailable":False,
        "actualWearOrAutomotiveLife":None,
        "automotiveWearValidated":False,
        "meaning":"External subset with different simulated fault modes, NOT a real automotive engine fleet.",
        "limitations":[
            "FD003 is another simulated condition in the SAME NASA C-MAPSS family, not independent physical hardware.",
            "FD003 labels do not identify individual fan-vs-HPC failure modes: do not claim per-mode accuracy.",
            "FD003 TEST has now been consumed once; future hyperparameter decisions require new untouched cohorts.",
            "Bootstrap uses simulated engines as units and does not quantify transport to real vehicles.",
            "No tuning, normalization refit, or model changes based on FD003 labels were permitted.",
            "No automotive km, health %, physical wear or causal degradation mechanism is identified.",
        ]
    }


def run_archive(path):
    sha,files=read_selected_source(path)
    output=evaluate_transfer(files["train_FD001.txt"],files["test_FD003.txt"],
                             files["RUL_FD003.txt"],strict=True)
    output["sourceArchiveSha256"]=sha
    return output


if __name__=="__main__":
    parser=argparse.ArgumentParser(description="MA00 R9 one-shot NASA FD001 to FD003 simulator transfer")
    parser.add_argument("original_nasa_zip")
    args=parser.parse_args()
    print(json.dumps(run_archive(args.original_nasa_zip),ensure_ascii=False,indent=2))
