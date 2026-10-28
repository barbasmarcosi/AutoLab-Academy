"""MA00 R8 regression tests on FAKE engines: no NASA test labels or vehicles."""
import hashlib
import io
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch
import tools.audit_cmapss_stress_mechanism_r8 as experiment


def fake_training():
    lines=[]
    for uid in range(1,11):
        life=165+uid*4
        for cycle in range(1,life+1):
            remaining=life-cycle
            settings=[0.00001*uid,0.0,100.0]
            measurements=[
                (remaining*0.002+uid*0.04+j*.1+(cycle%3)*.003) if j<20 else 0.0
                for j in range(21)]
            row=[uid,cycle]+settings+measurements
            assert len(row)==26
            lines.append(" ".join(str(v) for v in row))
    return "\n".join(lines)+"\n"


class TestR8(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text=fake_training()
        cls.report=experiment.analyze_train_only(cls.text)

    def test_same_models_and_engines_across_every_noise_policy(self):
        d=self.report
        self.assertEqual(d["schema"],experiment.SCHEMA)
        self.assertEqual(d["trainingEngines"],10)
        self.assertTrue(d["trainTestSeparationPreserved"])
        self.assertFalse(d["testRulLabelsRead"])
        self.assertFalse(d["testTrajectoriesParsed"])
        self.assertTrue(d["identicalModelsAndNoiseDrawsForAllPolicies"])
        self.assertIsNone(d["mechanicalAgeKm"])
        self.assertFalse(d["automotiveWearValidated"])
        self.assertEqual(set(d["policies"]),set(experiment.POLICIES))
        for name,record in d["policies"].items():
            self.assertEqual(record["independentEngineCount"],10)
            self.assertEqual(
                record["predictionsIncludingPerturbations"],
                record["uniqueEngineCheckpointCount"]*len(experiment.SEEDS),
                name)
            self.assertTrue(all(int(c) in experiment.CHECKPOINTS for c in record["perCutoff"]))

    def test_r6_and_r7_noise_are_paired_and_constant_channels_not_jittered(self):
        features=[float(j) for j in range(25)]
        draws={j:1.0 for j in range(1,25)}
        model={"std":[1.0]*25,"beta":[0]*26}
        sd={j:(0.0 if j==24 else 0.5) for j in range(4,25)}
        get=lambda p:experiment._policy_noise(model,sd,features,draws,p)
        clean=get("clean")
        strict=get("r7_measured_variable")
        all_mode=get("r6_all_channels")
        ops=get("r6_operating_only")
        meas=get("r6_measurements_all")
        combo=get("r7_measured_plus_r6_operating")
        self.assertEqual(clean,features)
        for j in range(1,4):
            self.assertEqual(strict[j],clean[j])
            self.assertAlmostEqual(ops[j]-clean[j],0.1)
            self.assertAlmostEqual(meas[j]-clean[j],0.0)
            self.assertAlmostEqual(combo[j]-clean[j],0.1)
        for j in range(4,24):
            self.assertAlmostEqual(strict[j]-clean[j],0.05)
            self.assertAlmostEqual(meas[j]-clean[j],0.1)
            self.assertAlmostEqual(combo[j]-clean[j],0.05)
        self.assertEqual(strict[24],clean[24])
        self.assertAlmostEqual(meas[24]-clean[24],.1)
        self.assertAlmostEqual(all_mode[24]-clean[24],.1)
        self.assertEqual(experiment._normal_draws(7,1,50),experiment._normal_draws(7,1,50))
        self.assertNotEqual(experiment._normal_draws(7,1,50),experiment._normal_draws(29,1,50))
        with self.assertRaises(ValueError):
            get("pretend_real_calibrated_noise")

    def test_constant_sensors_identified_and_r7_clean_stability(self):
        self.assertIn(21,self.report["constantSensorIndicesFromTrainFolds"])
        self.assertEqual(self.report["cleanVsStressedDifferences"]["clean"],0)
        self.assertGreaterEqual(self.report["policies"]["clean"]["engineBalancedMAEcycles"],0)
        self.assertEqual(len(self.report["byFeatureGroupExpectedLinearPerturbationBeforeClipping"]["measurement"]),21)
        self.assertEqual(len(self.report["byFeatureGroupExpectedLinearPerturbationBeforeClipping"]["operating"]),3)
        # Guard against false claims of extra independent engines from noise.
        self.assertEqual(len(experiment.SEEDS),5)

    def test_score_counts_engine_not_noise_seed(self):
        data={
            1:[(50,10,15,7),(50,10,25,29)],
            2:[(50,20,20,7),(50,20,30,29)],
        }
        r=experiment._score(data)
        self.assertEqual(r["independentEngineCount"],2)
        self.assertEqual(r["uniqueEngineCheckpointCount"],2)
        self.assertEqual(r["predictionsIncludingPerturbations"],4)
        self.assertEqual(r["engineBalancedMAEcycles"],7.5)
        self.assertEqual(r["perCutoff"]["50"]["engines"],2)

    def test_train_only_archive_read_does_not_open_invalid_test_bytes(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/"fake-outer.zip"
            nested=io.BytesIO()
            with zipfile.ZipFile(nested,"w") as inner:
                inner.writestr("CMAPSSData/train_FD001.txt",self.text)
                inner.writestr("CMAPSSData/test_FD001.txt",b"\xff\xfe not ASCII and intentionally INVALID")
                inner.writestr("CMAPSSData/RUL_FD001.txt",b"\xff never read")
            with zipfile.ZipFile(p,"w") as z:
                z.writestr("CMAPSSData.zip",nested.getvalue())
            digest=hashlib.sha256(p.read_bytes()).hexdigest()
            with patch.object(experiment,"SOURCE_SHA256",digest):
                observed,data=experiment._take_only_training(p)
            self.assertEqual(observed,digest)
            self.assertEqual(data,self.text)
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                experiment._take_only_training(p)

    def test_reject_too_few_engines_and_unauthorized_source(self):
        with self.assertRaisesRegex(ValueError,"At least 10"):
            experiment.analyze_train_only("\n".join(self.text.splitlines()[:35]))
        with self.assertRaisesRegex(ValueError,"inventory mismatch"):
            experiment.analyze_train_only(self.text,strict=True)


if __name__=="__main__":
    unittest.main()
