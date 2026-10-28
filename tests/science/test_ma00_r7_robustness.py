"""MA00 R7 fake turbofans only. Tests must not read FD001 TEST labels."""
import unittest
from tools.audit_cmapss_robustness_r7 import (
    SCHEMA, ALPHAS, MODES, CHECKPOINTS, LEVELS,
    analyze_train_only, weighted_sensor_stats, correlations, fold_points,
    _noise_sensitive, _engine_errors,
)
from tools.benchmark_cmapss_sensors import (
    read_sensor_trajectories, samples, fit_ridge, select_features,
)


def training_fixture():
    lines=[]
    # Ten independent, synthetic engines; repeatable simulated degradation.
    for uid in range(1,11):
        n=160+uid*3
        for cycle in range(1,n+1):
            remain=n-cycle
            # 3 operating settings, 21 channels. Keep channel 21 constant to
            # guarantee that no noise is injected into truly constant signals.
            sensors=[remain*0.01 + uid*0.015 + j*0.4 + (cycle%3)*0.008
                     for j in range(20)] + [9.0]
            row=[uid,cycle,0.0,0.0,100.0]+sensors
            assert len(row)==26
            lines.append(" ".join(str(v) for v in row))
    return "\n".join(lines)+"\n"


class MA00R7Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw=training_fixture()
        cls.engines=read_sensor_trajectories(cls.raw)

    def test_only_training_engines_exposes_no_automotive_age(self):
        original=self.raw
        result=analyze_train_only(self.raw)
        self.assertEqual(result["schema"],SCHEMA)
        self.assertEqual(result["trainEngines"],10)
        self.assertFalse(result["simulatedEngineTestTouched"])
        self.assertFalse(result["rulTestLabelsRead"])
        self.assertFalse(result["hyperparametersSelectedOnHeldOutResults"])
        self.assertIsNone(result["mechanicalAgeKm"])
        self.assertFalse(result["automotiveWearValidated"])
        self.assertEqual(set(result["groups"]),set(MODES))
        self.assertEqual(result["noiseLevelsRelativeToTrainMeasuredSensorSD"],list(LEVELS))
        for mode in MODES:
            self.assertEqual(len(result["groups"][mode]),len(ALPHAS))
            for outcome in result["groups"][mode].values():
                for level in LEVELS:
                    score=outcome["noiseByTrainStandardDeviation"][str(level)]
                    self.assertEqual(score["independentEngines"],10)
                    self.assertEqual(score["engineCount"],10) # not 50 for five seeds
                    self.assertGreater(score["uniqueEngineCheckpointCount"],0)
                    self.assertEqual(score["perturbedPredictionCount"],score["uniqueEngineCheckpointCount"] * (5 if level else 1))
                    self.assertGreaterEqual(score["engineBalancedMAE"],0)
        self.assertEqual(original,self.raw)

    def test_measurement_and_operating_groups_do_not_overlap(self):
        x=[float(j) for j in range(25)]
        self.assertEqual(select_features(x,"cycle"),[0.0])
        self.assertEqual(select_features(x,"cycle_operating"),[0.,1.,2.,3.])
        self.assertEqual(select_features(x,"cycle_measurements"),[0.]+x[4:])
        self.assertEqual(select_features(x,"cycle_sensors"),x)
        self.assertEqual(set(range(1,4)) & set(range(4,25)),set())

    def test_constant_signal_is_skipped_during_noise_stress(self):
        records=samples(self.engines)
        stats=weighted_sensor_stats(records)
        self.assertEqual(len(stats),21)
        # The final of the 21 sensor channels is genuinely constant.
        self.assertAlmostEqual(stats[-1]["span"],0)
        self.assertAlmostEqual(stats[-1]["sd"],0)
        measurement_sd={s["index"]:(s["sd"] if s["span"]>1e-8 and s["sd"]>1e-8 else 0.0)
                        for s in stats}
        model=fit_ridge(records,"cycle_sensors",200)
        held=fold_points({1:self.engines[1]})
        left=_noise_sensitive(model,measurement_sd,held,seed=7,level=0)
        right=_noise_sensitive(model,measurement_sd,held,seed=7,level=.1)
        self.assertEqual(len(left[1]),len(right[1]))
        # Noise is deterministic; does not falsify the entire output structure.
        self.assertEqual(right,_noise_sensitive(model,measurement_sd,held,seed=7,level=.1))
        self.assertEqual(right[1][0][0],50)
        self.assertTrue(all(x[2]>=0 for x in right[1]))

    def test_seeds_do_not_count_as_independent_engines(self):
        repeated={
          (1,7):[(50,10,15)],
          (1,29):[(50,10,25)],
          (2,7):[(50,20,20)],
          (2,29):[(50,20,30)],
        }
        result=_engine_errors(repeated)
        self.assertEqual(result["engineCount"],2)
        self.assertEqual(result["uniqueEngineCheckpointCount"],2)
        self.assertEqual(result["perturbedPredictionCount"],4)
        self.assertEqual(result["byObservedCycle"]["50"]["engines"],2)
        self.assertEqual(result["engineBalancedMAE"],7.5)

    def test_rejects_too_few_engines_and_damaged_columns(self):
        with self.assertRaisesRegex(ValueError,"At least 10"):
            analyze_train_only("\n".join(self.raw.splitlines()[:40]))
        with self.assertRaises(ValueError):
            analyze_train_only(self.raw.replace("1 1 ", "1 0 ", 1))
        with self.assertRaisesRegex(ValueError,"Unexpected original"):
            analyze_train_only(self.raw,strict_counts=True)
        diag=correlations(samples(self.engines))
        self.assertIn(21,diag["nearConstantMeasurements"])
        self.assertGreater(diag["highCorrelationPairCount"],0)


if __name__=="__main__":
    unittest.main()
