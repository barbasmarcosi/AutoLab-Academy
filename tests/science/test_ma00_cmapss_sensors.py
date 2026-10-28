"""Independent simulated fixtures for MA00 FD001 ridge; never call fixtures real NASA."""
import tempfile
import unittest
import zipfile
from pathlib import Path
from tools.benchmark_cmapss_sensors import (
    read_sensor_trajectories, features, samples, fit_ridge, cross_validate,
    evaluate_sensor_models, run_archive, train_only_selection,
)


def trajectory(lengths, observed=None):
    out = []
    for uid, full in enumerate(lengths, start=1):
        n = observed[uid-1] if observed else full
        for cycle in range(1, n+1):
            remain = full-cycle
            # Deliberately perfect artificial RUL sensor for a positive control.
            sensor = remain/10.0
            values = [uid,cycle,0.0,0.0,100.0,sensor]
            values.extend([0.1*k + uid*0.001 for k in range(20)])
            out.append(" ".join(map(str, values)))
    return "\n".join(out) + "\n"


class TestMA00Sensors(unittest.TestCase):
    def setUp(self):
        self.train = trajectory([50,60,70,80,90,100,110,120,130,140])
        self.test = trajectory([55,75,105,135],observed=[35,50,70,95])
        self.labels = "20\n25\n35\n40\n"

    def test_sensor_model_vs_age_only_and_group_isolation(self):
        result=evaluate_sensor_models(self.train,self.test,self.labels)
        self.assertEqual(result["trainEngines"],10)
        self.assertEqual(result["testEngines"],4)
        self.assertEqual(result["trainRows"],950)
        self.assertEqual(result["testRows"],250)
        self.assertTrue(result["independentEngineSplits"])
        self.assertFalse(result["testLabelsUsedForSelection"])
        self.assertIsNone(result["mechanicalAgeKm"])
        self.assertFalse(result["automotiveWearValidated"])
        for mode in ("cycle","sensors","cycle_sensors"):
            chosen=result["sensorModels"][mode]
            self.assertFalse(chosen["trainedOnTestRul"])
            self.assertFalse(chosen["trainedOnTestEngines"])
            self.assertIn(chosen["trainOnlyCrossValidation"]["bestAlpha"],(1.0,20.0,200.0))
        self.assertEqual(result["sensorModels"]["cycle_sensors_10pct_train_sd_noise"]["seed"],20261028)
        self.assertLess(result["sensorModels"]["cycle_sensors"]["testMetrics"]["MAEcycles"],50)

    def test_only_test_labels_change_scores_not_train_fold_selection(self):
        original=evaluate_sensor_models(self.train,self.test,self.labels)
        changed=evaluate_sensor_models(self.train,self.test,"1\n1\n1\n1\n")
        for mode in ("cycle","sensors","cycle_sensors"):
            self.assertEqual(original["sensorModels"][mode]["trainOnlyCrossValidation"],
                             changed["sensorModels"][mode]["trainOnlyCrossValidation"])
        self.assertNotEqual(original["sensorModels"]["cycle_sensors"]["testMetrics"],
                            changed["sensorModels"]["cycle_sensors"]["testMetrics"])

    def test_folds_exclude_every_held_engine(self):
        engines=read_sensor_trajectories(self.train)
        training=samples(engines)
        self.assertEqual(len({s[0] for s in training}),10)
        for uid in engines:
            model=fit_ridge([r for r in training if r[0]!=uid],"cycle_sensors",20)
            self.assertNotIn(uid,model["trainEngineIds"])
        self.assertGreaterEqual(cross_validate(engines,"cycle_sensors",1.0),0)
        self.assertEqual(train_only_selection(engines),train_only_selection(engines))

    def test_sensor_history_and_guards_are_not_permissive(self):
        engines=read_sensor_trajectories(self.train)
        self.assertEqual(len(features(engines[1],20)),25)
        self.assertEqual(features(engines[1],20)[0],20.0)
        with self.assertRaises(ValueError):
            features(engines[1],len(engines[1])+1)
        for invalid in [
            self.train.replace("1 2 ", "1 1 ",1),
            self.train.replace("1 1 ", "1 9 ",1),
            self.train.replace("0.0", "nan",1),
            "1 1 2 3",
        ]:
            with self.subTest(invalid=invalid[:30]),self.assertRaises(ValueError):
                read_sensor_trajectories(invalid)
        with self.assertRaisesRegex(ValueError,"Not enough"):
            cross_validate({1:engines[1]},"cycle",20)

    def test_source_hash_refuses_unverified_turbofan_artifact(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/"invented_nasa.zip"
            with zipfile.ZipFile(path,"w") as z:
                z.writestr("train_FD001.txt",self.train)
                z.writestr("test_FD001.txt",self.test)
                z.writestr("RUL_FD001.txt",self.labels)
            with self.assertRaisesRegex(ValueError,"SHA-256"):
                run_archive(path)


if __name__ == "__main__":
    unittest.main()
