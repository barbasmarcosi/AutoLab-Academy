"""MA00 R11 synthetic engine fixtures only; never actual NASA FD004 labels."""
import hashlib
import io
import tempfile
import unittest
import zipfile
from pathlib import Path

from tools import benchmark_cmapss_coverage_r11 as r11


def made_up_engines(count, *, truncated=False, regime_shift=0.0):
    lines=[]
    for uid in range(1,count+1):
        life=40+(uid%19)*3
        observed=max(21,int(life*.6)) if truncated else life
        regime=float((uid-1)%6)+regime_shift
        for cycle in range(1,observed+1):
            values=[
                uid,cycle,
                regime,regime*.15,100+regime,
            ]+[
                0.2*(life-cycle)+uid*.02+(j*.35)+regime*.12+(cycle%3)*.04
                for j in range(20)
            ]+[7.0]
            assert len(values)==26
            lines.append(" ".join(str(x) for x in values))
    return "\n".join(lines)+"\n"


class TestR11(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.train=made_up_engines(249)
        cls.test=made_up_engines(12,truncated=True)
        cls.labels="\n".join(str((40+(uid%19)*3)-max(21,int((40+(uid%19)*3)*.6)))
                             for uid in range(1,13))+"\n"

    def test_held_out_calibration_split_and_no_prior_test(self):
        out=r11.evaluate(self.train,self.test,self.labels)
        self.assertEqual(out["schema"],r11.SCHEMA)
        self.assertEqual(out["trainEngines"],249)
        self.assertEqual(out["testEngines"],12)
        self.assertTrue(out["fitAndCalibrationSeparatelyByEngine"])
        self.assertTrue(out["testLabelsReadOnlyAfterDecisions"])
        self.assertFalse(out["previousFD001FD002FD003TestsRead"])
        self.assertEqual(out["calibration"]["fitEngines"],199)
        self.assertEqual(out["calibration"]["noveltyCalibrationEngines"],25)
        self.assertEqual(out["calibration"]["riskCalibrationEngines"],25)
        self.assertEqual(out["calibration"]["variableMeasurementChannels"],20)
        self.assertEqual(out["calibration"]["ignoredNearlyConstantChannels"],1)
        self.assertFalse(out["physicalSensorUncertaintyValidated"])
        self.assertIsNone(out["actualAutomotiveWear"])
        counts=out["decisionCounts"]
        self.assertEqual(counts["sourceDomainAccepted"]+counts["domainAbstained"],12)
        self.assertEqual(counts["publishedPredictions"]+counts["totalAbstentions"],12)
        self.assertEqual(out["publishedOnly"]["engines"],counts["publishedPredictions"])
        self.assertEqual(out["withheldOnlyForAudit"]["engines"],counts["totalAbstentions"])
        self.assertTrue(out["publishedOnly"]["intervalAvailableForAllEngines"] or
                        out["publishedOnly"]["engines"]==0)
        if counts["totalAbstentions"]:
            self.assertIsNone(out["wholeCohortForAudit"]["intervalCoverageFraction"])
            self.assertFalse(out["wholeCohortForAudit"]["intervalAvailableForAllEngines"])

    def test_change_rul_does_not_change_calibration_or_decisions(self):
        a=r11.evaluate(self.train,self.test,self.labels)
        b=r11.evaluate(self.train,self.test,"1\n"*12)
        self.assertEqual(a["calibration"],b["calibration"])
        self.assertEqual(a["decisionCounts"],b["decisionCounts"])
        self.assertNotEqual(a["wholeCohortForAudit"],b["wholeCohortForAudit"])
        self.assertEqual(a["alphaFrozen"],20)
        self.assertEqual(a["sourceSha256Expected"],r11.SOURCE_SHA256)

    def test_out_of_regime_and_nonfinite_features_abstain(self):
        bad=r11.evaluate(self.train,made_up_engines(12,truncated=True,regime_shift=99),self.labels)
        self.assertEqual(bad["decisionCounts"]["operatingOOD"],12)
        self.assertEqual(bad["decisionCounts"]["publishedPredictions"],0)
        self.assertIsNone(bad["publishedOnly"]["ridgeMAEcycles"])
        self.assertIsNone(bad["publishedOnly"]["intervalCoverageFraction"])
        self.assertIsNone(bad["wholeCohortForAudit"]["intervalCoverageFraction"])
        self.assertFalse(bad["wholeCohortForAudit"]["intervalAvailableForAllEngines"])
        with self.assertRaisesRegex(ValueError,"Missing/nonfinite"):
            r11.novelty([float("nan")]*25,{"center":{4:0},"scale":{4:1},"operations":{1:(0,1)}})

    def test_split_rank_returns_infinite_for_too_few_engines(self):
        self.assertEqual(r11.quantile_rank([1,2,3,4],.5),3)
        self.assertEqual(r11.quantile_rank([1,2],.95),float("inf"))
        self.assertEqual(r11.quantile_rank([1,2,3,4,5],.8),5)
        with self.assertRaisesRegex(ValueError,"Independent calibration"):
            r11.quantile_rank([],.9)
        with self.assertRaisesRegex(ValueError,"Unexpected official"):
            r11.evaluate(self.train,self.test,self.labels,strict=True)
        with self.assertRaises(ValueError):
            r11.evaluate(self.train,self.test,"1\n"*11)

    def test_reader_ignores_consumed_tests_and_rejects_forgery(self):
        with tempfile.TemporaryDirectory() as dirname:
            p=Path(dirname)/"fake.zip"
            inner=io.BytesIO()
            with zipfile.ZipFile(inner,"w") as z:
                z.writestr("raw/train_FD004.txt",self.train)
                z.writestr("raw/test_FD004.txt",self.test)
                z.writestr("raw/RUL_FD004.txt",self.labels)
                for forbidden in ("test_FD001.txt","RUL_FD001.txt","test_FD002.txt",
                                  "RUL_FD002.txt","test_FD003.txt","RUL_FD003.txt"):
                    z.writestr(forbidden,b"\xff\xfe invalid by design")
            with zipfile.ZipFile(p,"w") as z:
                z.writestr("source.zip",inner.getvalue())
            digest=hashlib.sha256(p.read_bytes()).hexdigest()
            sha,files=r11.read_source(p,expected_sha=digest)
            self.assertEqual(sha,digest)
            self.assertEqual(set(files),set(r11.REQUIRED))
            with self.assertRaisesRegex(ValueError,"hash mismatch"):
                r11.read_source(p)
            with zipfile.ZipFile(p,"a") as z:
                z.writestr("test_FD004.txt",self.test)
            digest=hashlib.sha256(p.read_bytes()).hexdigest()
            with self.assertRaisesRegex(ValueError,"Duplicated"):
                r11.read_source(p,expected_sha=digest)


if __name__=="__main__":
    unittest.main()
