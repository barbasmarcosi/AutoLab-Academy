#!/usr/bin/env python3
"""Cross-runtime contract fixture. Fake byte transport, NOT an ELM327 or vehicle."""
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

# Works when executed as a file from the repository root, without pip install.
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.ma00_elm327_serial import ORDER, SETUP, capture_mode01


class Clock:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        self.t += 0.02
        return self.t


def reply(pid, i, variant):
    if pid == "0103":
        return b"41030200\r>"  # closed-loop fuel system 1, second absent
    if pid == "010C":
        return f"410C{(800 + ((i + variant) % 3) * 2) * 4:04X}\r>".encode()
    if pid == "0105":
        return b"410582\r>"  # 90 C
    if pid == "0104":
        return b"41042E\r>"  # 18.04 %
    if pid == "0106":
        return f"4106{(132 + ((i + variant) % 2)):02X}\r>".encode()
    if pid == "0107":
        return b"410783\r>"
    if pid == "010F":
        return b"410F46\r>"
    raise AssertionError("PID not expected")


class FakeTransport:
    def __init__(self, variant):
        self.responses = iter(
            [b"\rOK\r>" for _ in SETUP] + [b"4100FFFFFFFF\r>"] +
            [reply(pid, i, variant) for i in range(32) for pid in ORDER]
        )
        self.active = bytearray()

    def reset_input_buffer(self):
        self.active.clear()

    def write(self, packet):
        self.active.extend(next(self.responses))
        return len(packet)

    def flush(self):
        pass

    def read(self, count=1):
        if not self.active:
            return b""
        result = bytes(self.active[:count])
        del self.active[:count]
        return result


def main():
    variant = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    if variant not in (0, 1):
        raise ValueError("Test fixture variant must be 0 or 1")
    record = capture_mode01(
        FakeTransport(variant),
        session_id=f"fixture-aa-{variant + 1:03}",
        vehicle_alias="fixture-vehicle-001",
        engine_family="fixture-petrol-engine",
        adapter_model="FAKE ELM327 transport no real hardware",
        cycles=32, monotonic=Clock(),
        now=lambda: datetime(2026, 10, 27 + variant, 13, 0, tzinfo=timezone.utc),
    )
    record["instrumentClaims"]["testOnlyFakeTransport"] = True
    print(json.dumps(record, ensure_ascii=False))


if __name__ == "__main__":
    main()
