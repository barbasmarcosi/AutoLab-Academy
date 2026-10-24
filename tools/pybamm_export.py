#!/usr/bin/env python3
"""Companion for AutoLab Academy E4. Uses upstream PyBaMM; no physics reimplementation.
Produces a minimal CSV consumable by the PWA BMS laboratory.

PyBaMM is NOT shipped with the PWA; run this Python program on your own PC.
No vehicle connection, no HV measurements. Simulation is not real-battery validation.
"""
from __future__ import annotations

import argparse
import csv
import math
from pathlib import Path


def extract_series(solution):
    """Adapt common PyBaMM 26.x processed variables into a documented CSV schema."""
    t = solution["Time [s]"].entries
    current = solution["Current [A]"].entries
    voltage = solution["Voltage [V]"].entries
    if min(len(t), len(current), len(voltage)) < 2:
        raise ValueError("PyBaMM no devolvió suficientes muestras")
    if len({len(t), len(current), len(voltage)}) != 1:
        raise ValueError("Dimensiones inconsistentes entre tiempo, corriente y tensión")
    rows = []
    for a, b, c in zip(t, current, voltage):
        values = (float(a), float(b), float(c))
        if not all(math.isfinite(x) for x in values) or values[0] < 0 or values[2] <= 0:
            raise ValueError("La simulación produjo números inválidos")
        rows.append(values)
    return rows


def export_csv(rows, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.writer(stream)
        writer.writerow(["t_s", "current_a", "voltage_v"])
        for t, i, v in rows:
            writer.writerow([f"{t:.6f}", f"{i:.9f}", f"{v:.9f}"])


def main() -> None:
    parser = argparse.ArgumentParser(description="Exportar curvas SPM/DFN de PyBaMM para AutoLab Academy")
    parser.add_argument("--model", choices=["spm", "dfn"], default="spm")
    parser.add_argument("--duration", type=float, default=1800, help="Duración máxima de simulación en segundos")
    parser.add_argument("--output", type=Path, default=Path("autolab-pybamm.csv"))
    args = parser.parse_args()
    if not 10 <= args.duration <= 3600:
        parser.error("--duration debe estar entre 10 y 3600 segundos")
    try:
        import pybamm
    except ImportError as exc:
        parser.error("Falta PyBaMM. Crear venv e instalar con: python -m pip install pybamm")
        raise exc  # pragma: no cover

    model = pybamm.lithium_ion.SPM() if args.model == "spm" else pybamm.lithium_ion.DFN()
    sim = pybamm.Simulation(model)
    solution = sim.solve([0, args.duration])
    rows = extract_series(solution)
    export_csv(rows, args.output)
    print(f"PyBaMM {pybamm.__version__} ({args.model.upper()}): {len(rows)} muestras exportadas a {args.output}")
    print("NO se exporta SOC de referencia: AutoLab lo estima con la capacidad y SOC inicial que indiques.")
    print("La corriente de PyBaMM se interpreta positiva en descarga; verificar convención si cambia la fuente.")


if __name__ == "__main__":
    main()
