"""Genuine upstream PyBaMM smoke tests, separately from free static Pages deploy.
These verify numerical/transport sanity; they do not validate a real battery.
"""
from __future__ import annotations
import csv
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "tools" / "pybamm_export.py"


class PyBaMMContract(unittest.TestCase):
    def export(self, model: str):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        destination = Path(folder.name) / f"{model}.csv"
        proc = subprocess.run(
            [sys.executable, str(SCRIPT), "--model", model,
             "--duration", "180", "--output", str(destination)],
            cwd=ROOT, text=True, capture_output=True, timeout=150,
            env={**os.environ, "PYBAMM_DISABLE_TELEMETRY": "true"},
            check=False
        )
        self.assertEqual(proc.returncode, 0, f"{model}: {proc.stdout}\n{proc.stderr}")
        self.assertTrue(destination.is_file())
        with destination.open(encoding="utf-8", newline="") as stream:
            reader = csv.DictReader(stream)
            self.assertEqual(reader.fieldnames, ["t_s", "current_a", "voltage_v"])
            rows = [{k: float(v) for k, v in row.items()} for row in reader]
        self.assertGreater(len(rows), 2)
        self.assertLessEqual(len(rows), 2000, "PWA CSV import limit")
        for idx, row in enumerate(rows):
            self.assertTrue(all(math.isfinite(v) for v in row.values()))
            self.assertTrue(0 < row["voltage_v"] < 6, "single-cell plausibility, not a verified OEM spec")
            if idx:
                self.assertGreater(row["t_s"], rows[idx-1]["t_s"])
        self.assertAlmostEqual(rows[0]["t_s"], 0, places=3)
        self.assertAlmostEqual(rows[-1]["t_s"], 180, places=3)
        self.assertGreater(rows[-1]["voltage_v"], 2.5)
        self.assertGreater(max(row["current_a"] for row in rows), 0)
        return destination, rows

    def compare_with_pwa_importer(self, filename):
        js = (
            "import fs from 'node:fs';"
            "import {parseBmsCsv,analyzeBms} from './src/bms-lab.js';"
            "const capture=parseBmsCsv(fs.readFileSync(process.argv[1],'utf8'));"
            "const result=analyzeBms(capture.rows,{capacityAh:5,initialSocPct:90});"
            "console.log(JSON.stringify({n:capture.rows.length,dt:result.durationH,"
            "discharge:result.dischargeAh,net:result.netDischargeAh}));"
        )
        completed = subprocess.run(
            ["node", "--input-type=module", "-e", js, str(filename)],
            cwd=ROOT, text=True, capture_output=True, timeout=30, check=False
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        return json.loads(completed.stdout.strip())

    def test_single_particle_model(self):
        file, rows = self.export("spm")
        parsed = self.compare_with_pwa_importer(file)
        self.assertEqual(parsed["n"], len(rows))
        self.assertGreater(parsed["dt"], 0)
        self.assertGreater(parsed["net"], 0)

    def test_doyle_fuller_newman_model(self):
        file, rows = self.export("dfn")
        parsed = self.compare_with_pwa_importer(file)
        self.assertEqual(parsed["n"], len(rows))
        self.assertGreater(parsed["dt"], 0)
        self.assertGreater(parsed["net"], 0)

    def test_bogus_duration_is_rejected(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--duration", "7200"],
            cwd=ROOT, capture_output=True, text=True, timeout=15, check=False
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("--duration", result.stderr)


if __name__ == "__main__":
    unittest.main()
