"""MA00 R9 tests use only artificially generated turbofan-like data."""
import hashlib
import io
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

import tools.benchmark_cmapss_fd003_transfer_r9 as transfer


def fake_trajectories(lifetimes, observed=None, *, alternate=False):
    lines=[]
    for uid,life in enumerate(lifetimes,1):
        cutoff=observed[uid-1] if observed is not None else life
        for cycle in range(1,cutoff+1):
            remain=life-cycle
            operation=[0.0,0.0,100.0]
            measured=[float(2*j+0.1*remain+uid*0.01+(cycle%3)*0.02
                            + (0.5 if alternate else 0)) for j in range(21)]
            row=[uid,cycle]+operation+measured
            assert len(row)==26
            lines.append(" ".join(map(str,row)))
    return "\n".join(lines)+"\n"


class R9Tests(unittest.TestCase):
    def setUp(self):
        self.train=fake_trajectories([50,70,90,110,130])
        self.test=fake_trajectories([60,85,115,140],[40,50,80,100],alternate=True)
        self.rul="20\n35\n35\n40\n"

    def test_out_of_cohort_transfer_and_independent_engine_metrics(self):
        r=transfer.evaluate_transfer(self.train,self.test,self.rul)
        self.assertEqual(r["fd001TrainEngines"],5)
        self.assertEqual(r["fd003TestEngines"],4)
        self.assertTrue(r["allModelsFrozenBeforeFD003RULScoring"])
        self.assertEqual(r["alphaFixedFromPriorR6Train"],1.0)
        self.assertFalse(r["fd001TestOpened"])
        self.assertFalse(r["fd001RulTestRead"])
        self.assertFalse(r["fd003TrainOpened"])
        self.assertFalse(r["automotiveWearValidated"])
        self.assertIsNone(r["actualWearOrAutomotiveLife"])
        self.assertEqual(set(r["metrics"]),{
            "fd001_train_constant_median_rul",
            "fd001_train_median_lifetime_minus_cycles",
            "frozen_fd001_ridge_cycle",
            "frozen_fd001_ridge_sensors",
            "frozen_fd001_ridge_cycle_sensors",
        })
        for m in r["metrics"].values():
            self.assertGreaterEqual(m["MAEcycles"],0)
            self.assertEqual(sum(x["engines"] for x in m["perActualRulBand"].values()),4)
        self.assertEqual(r["primaryPairedUncertainty"]["repetitions"],1000)
        self.assertEqual(r["primaryPairedUncertainty"]["resamplingUnit"],
                         "one independent simulated FD003 test engine")

    def test_altering_withheld_fd003_rul_only_changes_scores(self):
        a=transfer.evaluate_transfer(self.train,self.test,self.rul)
        b=transfer.evaluate_transfer(self.train,self.test,"2\n3\n4\n5\n")
        self.assertEqual(a["fd001MedianLifetime"],b["fd001MedianLifetime"])
        self.assertEqual(a["fd001MedianRowRUL"],b["fd001MedianRowRUL"])
        self.assertEqual(a["fd003OutOfSourceTrainRanges"],b["fd003OutOfSourceTrainRanges"])
        self.assertNotEqual(a["metrics"],b["metrics"])
        self.assertFalse(a["fd003TrainOpened"])

    def test_external_label_alignment_and_integrity_gates(self):
        for bad in ["1\n2\n3","nan\n2\n3\n4","1\n2\n-3\n4","1 2\n2\n3\n4"]:
            with self.subTest(labels=bad), self.assertRaises(ValueError):
                transfer.evaluate_transfer(self.train,self.test,bad)
        with self.assertRaisesRegex(ValueError,"FD001 training inventory"):
            transfer.evaluate_transfer(self.train,self.test,self.rul,strict=True)
        with self.assertRaisesRegex(ValueError,"Paired engine errors"):
            transfer.engine_bootstrap_delta([1],[1])

    def test_reader_opens_only_expected_members_and_rejects_forged_archive(self):
        with tempfile.TemporaryDirectory() as temp:
            path=Path(temp)/"nasa-fixture.zip"
            nested=io.BytesIO()
            with zipfile.ZipFile(nested,"w") as inside:
                inside.writestr("data/train_FD001.txt",self.train)
                inside.writestr("data/test_FD003.txt",self.test)
                inside.writestr("data/RUL_FD003.txt",self.rul)
                # Deliberately invalid unselected files ensure no accidental read.
                inside.writestr("data/test_FD001.txt",b"\xff\xfe bad")
                inside.writestr("data/RUL_FD001.txt",b"\xff\xfe bad")
                inside.writestr("data/train_FD003.txt",b"\xff\xfe bad")
            with zipfile.ZipFile(path,"w") as outer:
                outer.writestr("CMAPSSData.zip",nested.getvalue())
            digest=hashlib.sha256(path.read_bytes()).hexdigest()
            got,named=transfer.read_selected_source(path,expected_sha=digest)
            self.assertEqual(got,digest)
            self.assertEqual(set(named),set(transfer.REQUIRED))
            self.assertEqual(named["train_FD001.txt"],self.train)
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                transfer.read_selected_source(path)
            with zipfile.ZipFile(path,"a") as outer:
                outer.writestr("test_FD003.txt",self.test)
            updated_hash=hashlib.sha256(path.read_bytes()).hexdigest()
            with self.assertRaisesRegex(ValueError,"Duplicate"):
                transfer.read_selected_source(path,expected_sha=updated_hash)


if __name__=="__main__":
    unittest.main()
