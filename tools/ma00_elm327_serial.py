#!/usr/bin/env python3
"""MA00 opt-in local ELM327 / pySerial passive Mode 01 acquisition.

No scanner is opened during import/tests. Only hard-coded ELM presentation
configuration and six OBD Service 01 read-only PIDs are sent. Timestamps are
HOST pre-write and full-prompt receive, never ECU acquisition timestamps.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

VERSION = "ma00-elm327-serial-v1"
# SAE J1979 Mode 01. PID, channel name, unit and response length.
PIDS = {
    "010C": ("rpm", "rpm", 2),
    "0105": ("ectC", "C", 1),
    "0104": ("loadPct", "%", 1),
    "0106": ("stftPct", "%", 1),
    "0107": ("ltftPct", "%", 1),
    "010F": ("iatC", "C", 1),
}
ORDER = ("010C", "0105", "0104", "0106", "0107", "010F")
# Adapter presentation/protocol negotiation. Never writes to ECU via service 02+.
SETUP = ("ATE0", "ATL0", "ATS0", "ATH0", "ATSP0")
UNITS = {pid: entry[1] for pid, entry in PIDS.items()}
LOCAL_PORT = re.compile(
    r"(?:COM[1-9]\d{0,2}|/dev/(?:ttyUSB\d{1,3}|ttyACM\d{1,3}|rfcomm\d{1,3}|cu\.[A-Za-z0-9._-]{1,100}))",
    re.IGNORECASE,
)
ALIAS = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{2,79}")


class ProtocolError(ValueError):
    """Communication frame not sufficiently trustworthy to decode."""


def decode_mode01(pid: str, response: bytes) -> float:
    """Fail closed on no data, multiple ECUs, wrong PID, headers and noise."""
    if pid not in PIDS:
        raise ProtocolError("PID not allowlisted")
    if not response.endswith(b">"):
        raise ProtocolError("ELM prompt absent: incomplete response")
    if len(response) > 1024:
        raise ProtocolError("Frame too large")
    try:
        body = response[:-1].decode("ascii").upper()
    except UnicodeDecodeError as exc:
        raise ProtocolError("Non-ASCII adapter response") from exc
    lines = [line.strip() for line in body.replace("\n", "\r").split("\r") if line.strip()]
    lines = [line for line in lines if re.sub(r"\s+", "", line) != pid]
    if len(lines) != 1:
        raise ProtocolError("Ambiguous or empty ECU response (possibly multiple ECUs)")
    line = re.sub(r"\s+", "", lines[0])
    if not re.fullmatch(r"[0-9A-F]+", line) or len(line) % 2:
        raise ProtocolError("Adapter error, header or malformed HEX")
    data = bytes.fromhex(line)
    expected = bytes.fromhex("41" + pid[2:])
    if data[:2] != expected or len(data) != 2 + PIDS[pid][2]:
        raise ProtocolError("Incorrect PID, response service or payload length")
    a = data[2]
    if pid == "010C":
        value = (a * 256 + data[3]) / 4
    elif pid in ("0105", "010F"):
        value = a - 40
    elif pid == "0104":
        value = a * 100 / 255
    else:
        value = (a - 128) * 100 / 128
    if not math.isfinite(value):
        raise ProtocolError("Non-finite conversion")
    return value


def _reply(serial_port, command: str, monotonic: Callable[[], float],
           timeout_s: float) -> tuple[bytes, float, float, str]:
    """Deadline and byte cap prevent unbounded reads/false complete frames."""
    if command not in SETUP and command not in PIDS:
        raise ProtocolError("Transmitted command not allowlisted")
    started = monotonic()
    packet = (command + "\r").encode("ascii")
    if serial_port.write(packet) != len(packet):
        raise ProtocolError("Partial serial write")
    serial_port.flush()
    buffer = bytearray()
    deadline = started + timeout_s
    status = "timeout"
    while len(buffer) < 1024 and monotonic() < deadline:
        chunk = serial_port.read(1)
        if not chunk:
            continue
        if not isinstance(chunk, bytes) or len(chunk) != 1:
            raise ProtocolError("Invalid serial byte")
        buffer.extend(chunk)
        if chunk == b">":
            status = "received"
            break
    finished = monotonic()
    if len(buffer) >= 1024 and status != "received":
        raise ProtocolError("Adapter reply exceeded 1024 bytes")
    return bytes(buffer), started, finished, status


def _setup_adapter(serial_port, monotonic, timeout_s: float):
    for command in SETUP:
        raw, _, _, status = _reply(serial_port, command, monotonic, timeout_s)
        if status != "received":
            raise ProtocolError("Adapter handshake timed out: " + command)
        try:
            lines = raw[:-1].decode("ascii").upper().splitlines()
        except UnicodeDecodeError as exc:
            raise ProtocolError("Invalid adapter handshake text") from exc
        # Echo may still be on during ATE0; adapter must explicitly say OK.
        normalized = [x.strip() for x in lines if x.strip()]
        if "OK" not in normalized or any(
            x not in ("OK", command) for x in normalized
        ):
            raise ProtocolError("Adapter configuration not acknowledged: " + command)


def capture_mode01(
    serial_port, *, session_id: str, vehicle_alias: str, engine_family: str,
    adapter_model: str, cycles: int = 32, timeout_s: float = 1.5,
    monotonic: Callable[[], float] = time.monotonic,
    now: Callable[[], datetime] = lambda: datetime.now(timezone.utc),
) -> dict:
    """Acquire at most 200 cycles, no driver creation, no ECU modifications."""
    if not all(ALIAS.fullmatch(x or "") for x in (session_id, vehicle_alias)):
        raise ValueError("Anonymous session and vehicle aliases required")
    if not isinstance(engine_family, str) or not 3 <= len(engine_family) <= 120:
        raise ValueError("Engine family required")
    if not isinstance(adapter_model, str) or not 3 <= len(adapter_model) <= 120:
        raise ValueError("Adapter name required")
    if not isinstance(cycles, int) or not 1 <= cycles <= 100:
        raise ValueError("Cycles must be 1–100")
    if not isinstance(timeout_s, (float, int)) or not 0.2 <= timeout_s <= 3:
        raise ValueError("Timeout must be 0.2–3 seconds")

    # Capture start is BEFORE handshake; mono relative origin is shared.
    start = monotonic()
    wall = now().isoformat()
    _setup_adapter(serial_port, monotonic, timeout_s)
    events = []
    for _ in range(cycles):
        for pid in ORDER:
            raw, before, after, state = _reply(serial_port, pid, monotonic, timeout_s)
            event = {
                "pid": pid, "unit": UNITS[pid],
                "requestAtMs": round((before - start) * 1000, 4),
                "receivedAtMs": round((after - start) * 1000, 4),
            }
            if state != "received":
                event["status"] = "timeout"
            else:
                try:
                    event["value"] = decode_mode01(pid, raw)
                    event["status"] = "ok"
                except ProtocolError:
                    event["status"] = "error"
            events.append(event)
    return {
        "schema": "ma00-local-serial-receipts-v1", "sessionId": session_id,
        "vehicleAlias": vehicle_alias, "engineFamily": engine_family,
        "adapterModel": adapter_model, "softwareVersion": VERSION,
        "capturedAt": wall, "source": "provided_obd_unverified",
        "clock": "host_monotonic_receive", "conditions": None, "events": events,
        "instrumentClaims": {
            "hostRequestTimestamp": "before_serial_write",
            "hostReceiptTimestamp": "after_elm_prompt",
            "ecuAcquisitionTimestampKnown": False,
            "transportLatencyCalibrated": False,
            "protocol": "ELM327 ATSP0 auto, service 01 only",
            "serviceCommandsSent": list(ORDER),
        },
        "independentMechanicalReference": None,
        "warning": "Only host-side timestamps; ECU acquisition time unknown. "
                   "NO DATA, malformed and multi-ECU replies are errors, never values. "
                   "Context null until independently documented by operator."
    }


def _port_name(port: str) -> str:
    if not LOCAL_PORT.fullmatch(port):
        raise ValueError("Only explicit local COM, ttyUSB, ttyACM, rfcomm or cu.* ports")
    return port


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="MA00 ELM327 passive service-01 capture")
    parser.add_argument("--port", required=True, help="Explicit local port, e.g. COM3 or /dev/ttyUSB0")
    parser.add_argument("--baud", type=int, choices=(9600, 38400, 115200), default=38400)
    parser.add_argument("--session", required=True)
    parser.add_argument("--vehicle", required=True)
    parser.add_argument("--engine", required=True)
    parser.add_argument("--adapter", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--cycles", type=int, default=32)
    parser.add_argument("--timeout", type=float, default=1.5)
    args = parser.parse_args(argv)
    _port_name(args.port)
    # No arbitrary command, remote URL, environment port scan, ECU writes, or action on import.
    try:
        import serial  # pyserial, deliberately optional; never required for unit tests
    except ImportError as exc:
        raise SystemExit("pyserial required for physical capture: pip install pyserial==3.5") from exc
    with serial.Serial(
        port=args.port, baudrate=args.baud, timeout=0.05,
        write_timeout=0.7, rtscts=False, xonxoff=False, dsrdtr=False
    ) as device:
        record = capture_mode01(
            device, session_id=args.session, vehicle_alias=args.vehicle,
            engine_family=args.engine, adapter_model=args.adapter,
            cycles=args.cycles, timeout_s=args.timeout,
        )
    # Refuse overwrite, permissions restrictive. Avoid network uploads or VIN.
    path = Path(args.out)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w", encoding="utf8") as stream:
        json.dump(record, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    print(json.dumps({
        "saved_to": str(path), "events": len(record["events"]),
        "errors": sum(x["status"] != "ok" for x in record["events"]),
        "mechanical_age_calculated": False
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
