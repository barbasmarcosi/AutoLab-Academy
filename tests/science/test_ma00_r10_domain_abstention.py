"""MA00 R10: synthetic fixtures only, no NASA evaluation labels."""
import hashlib
import io
import tempfile
import unittest
import zipfile
from pathlib import Path
from tools import benchmark_cmapss_domain_abstention_r10 as r10


def engines(lives, *, truncate=None, operating=0.0, shift=0.0):
    lines=[]
    for uid,life in enumerate(lives,1):
        observed=life if truncate is None else truncate[uid-1]
        for cycle in range(1,observed+1):
            # Synthetic simulator-like trajectory with known partial observed cycles.
            sensors=[0.05*(life-cycle)+0.1*uid+j*0.4+shift for j in range(20)]+[7.0]
            row=[uid,cycle,operating,0.0,100.0]+sensors
            assert len(row)==26
            lines.append(" ".join(map(str,row)))
    return "\n".join(lines)+"\n"


class MA00R10Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.training=engines([36+4*i for i in range(10)])
        cls.test=engines([40,44,48,52],truncate=[25,30,35,40],operating=0.0)
        cls.labels="15\n14\n13\n12\n"

    def test_gate_calibration_and_threshold_are_label_blind(self):
        a=r10.evaluate(self.training,self.test,self.labels)
        b=r10.evaluate(self.training,self.test,"2\n3\n4\n5\n")
        self.assertEqual(a["schema"],r10.VERSION)
        self.assertTrue(a["fd002RULReadOnlyAfterDecisionsAndPredictions"])
        for flag in ("fd001TestOpened","fd001RulTestOpened","fd003Opened","fd002TrainOpened"):
            self.assertFalse(a[flag])
        self.assertEqual(a["sourceGateTrainingEngines"],8)
        self.assertEqual(a["sourceGateCalibrationEngines"],2)
        self.assertEqual(a["fd002TestEngines"],4)
        self.assertEqual(a["fd002TestRows"],130)
        self.assertEqual(a["decisions"],b["decisions"])
        self.assertEqual(a["sourceCalibrationAcceptance"],b["sourceCalibrationAcceptance"])
        self.assertEqual(a["gate"],b["gate"])
        self.assertFalse(a["automotiveWearValidated"])
        self.assertIsNone(a["mechanicalAgeKm"])
        self.assertTrue(a["gate"]["selectiveErrorGuarantee"] is False)
        self.assertEqual(a["decisions"]["accept"]+a["decisions"]["abstain"],4)
        self.assertEqual(a["wholeCohort"]["engineCount"],4)
        self.assertNotEqual(a["wholeCohort"],b["wholeCohort"])
        self.assertEqual(a["acceptedOnly"]["engineCount"],a["decisions"]["accept"])
        self.assertEqual(a["abstainedOnlyForAudit"]["engineCount"],a["decisions"]["abstain"])

    def test_out_of_operation_and_sensor_support_are_separate_reasons(self):
        train=r10.read_sensor_trajectories(self.training)
        gate,_=r10.reference_fit(train)
        x=r10.features(train[1],len(train[1]))
        self.assertFalse(r10.decision(x,gate)["operatingOOD"])
        changed=x.copy()
        changed[1]=999.0
        op=r10.decision(changed,gate)
        self.assertTrue(op["operatingOOD"])
        self.assertFalse(op["accept"])
        shifted=x.copy()
        shifted[4]+=1e6
        pred=r10.decision(shifted,gate)
        self.assertTrue(pred["sensorOOD"])
        self.assertFalse(pred["accept"])
        self.assertFalse(pred["operatingOOD"])
        with self.assertRaisesRegex(ValueError,"Invalid external"):
            r10.decision([float("nan")]*25,gate)

    def test_empty_coverage_abstains_without_inventing_accuracy(self):
        no_support=engines([40,44,48,52],truncate=[25,30,35,40],operating=999)
        report=r10.evaluate(self.training,no_support,self.labels)
        self.assertEqual(report["decisions"]["accept"],0)
        self.assertEqual(report["decisions"]["abstain"],4)
        self.assertEqual(report["acceptedOnly"]["engineCount"],0)
        self.assertIsNone(report["acceptedOnly"]["primaryMAEcycles"])
        self.assertIsNone(report["acceptedOnly"]["baselineMAEcycles"])
        self.assertEqual(report["decisions"]["operatingOOD"],4)

    def test_source_reader_never_decodes_consumed_or_train_fd002(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/"local-nasa-fixture.zip"
            inner=io.BytesIO()
            with zipfile.ZipFile(inner,"w") as archive:
                archive.writestr("data/train_FD001.txt",self.training)
                archive.writestr("data/test_FD002.txt",self.test)
                archive.writestr("data/RUL_FD002.txt",self.labels)
                for name in ("test_FD001.txt","RUL_FD001.txt","test_FD003.txt",
                             "RUL_FD003.txt","train_FD002.txt"):
                    archive.writestr("data/"+name,b"\xff no permitted access")
            with zipfile.ZipFile(path,"w") as outer:
                outer.writestr("nested-data.zip",inner.getvalue())
            digest=hashlib.sha256(path.read_bytes()).hexdigest()
            sha,selected=r10.read_source(path,expected_sha=digest)
            self.assertEqual(sha,digest)
            self.assertEqual(set(selected),set(r10.REQUIRED))
            with self.assertRaisesRegex(ValueError,"hash mismatch"):
                r10.read_source(path)
            with zipfile.ZipFile(path,"a") as outer:
                outer.writestr("test_FD002.txt",self.test)
            digest=hashlib.sha256(path.read_bytes()).hexdigest()
            with self.assertRaisesRegex(ValueError,"Duplicate"):
                r10.read_source(path,expected_sha=digest)

    def test_fail_closed_on_bad_labels_and_inventory(self):
        with self.assertRaisesRegex(ValueError,"Unexpected official"):
            r10.evaluate(self.training,self.test,self.labels,strict=True)
        for labels in ("1\n2","nan\n1\n2\n3","-1\n0\n1\n2"):
            with self.subTest(labels=labels),self.assertRaises(ValueError):
                r10.evaluate(self.training,self.test,labels)


if __name__=="__main__":
    unittest.main()
