"""MA00 NASA FD001 zero-dependency baselines: synthetic fixture NOT NASA evidence."""
import io
import tempfile
import unittest
import zipfile
from pathlib import Path
from tools.benchmark_cmapss_fd001 import (
    evaluate_fd001, load_trajectories, parse_test_rul, unpack_fd001, run_archive,
)


def rows(lengths):
    result = []
    for uid, size in enumerate(lengths, 1):
        for cycle in range(1, size + 1):
            result.append(" ".join([str(uid), str(cycle)] + ["0.25", "0.0", "100.0"] +
                                   [str(0.01 * cycle + uid) for _ in range(21)]))
    return "\n".join(result) + "\n"


class TestCmapss(unittest.TestCase):
    def test_train_only_prior_and_entire_engine_evaluation(self):
        train, test, labels = rows([20, 40, 60]), rows([15, 20, 25]), "5\n20\n35\n"
        original = (train, test, labels)
        r = evaluate_fd001(train, test, labels)
        self.assertEqual(r["trainEngines"], 3)
        self.assertEqual(r["testEngines"], 3)
        self.assertEqual(r["trainRows"], 120)
        self.assertEqual(r["testRows"], 60)
        self.assertEqual(r["trainingMedianFullLifeCycles"], 40)
        self.assertEqual(r["baselineMetrics"]["train_engine_life_median_minus_observed_cycle"]["MAEcycles"], 13.333)
        self.assertFalse(r["automotiveWearValidation"])
        self.assertIsNone(r["mechanicalAgeKm"])
        self.assertTrue(r["testRulUsedOnlyForScoring"])
        self.assertEqual((train, test, labels), original)

    def test_test_labels_do_not_change_fitted_prior(self):
        train, test = rows([20, 40, 60]), rows([15, 20, 25])
        a = evaluate_fd001(train, test, "5\n20\n35")
        b = evaluate_fd001(train, test, "50\n200\n350")
        self.assertEqual(a["trainingMedianFullLifeCycles"], b["trainingMedianFullLifeCycles"])
        self.assertEqual(a["trainingRowMedianRulCycles"], b["trainingRowMedianRulCycles"])
        self.assertNotEqual(a["baselineMetrics"], b["baselineMetrics"])

    def test_duplicate_nonmonotonic_cycles_and_bad_labels_refused(self):
        good = rows([3, 4])
        for broken in (
            good.replace("1 2 ", "1 1 ", 1),
            good.replace("2 2 ", "2 5 ", 1),
            good.replace("1 1 ", "3 1 ", 1),
            good.replace("1.01", "nan", 1),
            "1 1 2 3",
        ):
            with self.subTest(broken=broken[:30]), self.assertRaises(ValueError):
                load_trajectories(broken, "train")
        for bad in ("-1\n2", "nan\n2", "1.5\n2", "7", "1 2\n2"):
            with self.subTest(rul=bad), self.assertRaises(ValueError):
                parse_test_rul(bad, 2)
        with self.assertRaises(ValueError):
            evaluate_fd001(rows([20]), rows([10]), "0", strict_nasa_counts=True)

    def test_official_style_nested_archive_is_not_extracted_to_disk(self):
        with tempfile.TemporaryDirectory() as tmp:
            original = io.BytesIO()
            with zipfile.ZipFile(original, "w") as nested:
                nested.writestr("CMAPSSData/train_FD001.txt", rows([20, 40]))
                nested.writestr("CMAPSSData/test_FD001.txt", rows([10, 20]))
                nested.writestr("CMAPSSData/RUL_FD001.txt", "3\n7\n")
            top = Path(tmp) / "NASA-original-container.zip"
            with zipfile.ZipFile(top, "w") as outer:
                outer.writestr("CMAPSSData.zip", original.getvalue())
                outer.writestr("README.txt", "Simulated NASA fixture only")
            digest, data = unpack_fd001(top)
            self.assertEqual(len(digest), 64)
            self.assertEqual(len(data), 3)
            self.assertFalse((Path(tmp) / "CMAPSSData").exists())

    def test_zip_bounded_no_extract_and_missing_source_detection(self):
        with tempfile.TemporaryDirectory() as temp:
            p = Path(temp) / "fake-nasa.zip"
            with zipfile.ZipFile(p, "w") as z:
                z.writestr("CMAPSSData/train_FD001.txt", rows([20, 40]))
                z.writestr("CMAPSSData/test_FD001.txt", rows([10, 20]))
                z.writestr("CMAPSSData/RUL_FD001.txt", "3\n7\n")
                z.writestr("../../not-to-extract.txt", "never materialize")
            digest, extracted = unpack_fd001(p)
            self.assertEqual(len(digest), 64)
            self.assertEqual(set(extracted), {"train_FD001.txt","test_FD001.txt","RUL_FD001.txt"})
            with self.assertRaisesRegex(ValueError, "Unexpected published FD001"):
                run_archive(p)
            with zipfile.ZipFile(p, "a") as z:
                z.writestr("train_FD001.txt", rows([2]))
            with self.assertRaisesRegex(ValueError, "duplicate NASA"):
                unpack_fd001(p)


if __name__ == "__main__":
    unittest.main()
