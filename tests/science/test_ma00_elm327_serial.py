"""MA00 physical-transport protocol QA — fake byte stream; NO hardware tests."""
import unittest

from tools.ma00_elm327_serial import (
    ORDER, SETUP, ProtocolError, _port_name,
    capture_mode01, decode_mode01, decode_supported_pids, _reply,
)


class FakeSerial:
    def __init__(self, replies):
        self._replies = list(replies)
        self._read = bytearray()
        self.sent = []

    def write(self, data):
        command = data.decode("ascii").rstrip("\r")
        self.sent.append(command)
        if not self._replies:
            raise AssertionError(f"unexpected command {command}")
        self._read.extend(self._replies.pop(0))
        return len(data)

    def read(self, size=1):
        if not self._read:
            return b""
        first = bytes(self._read[:size])
        del self._read[:size]
        return first

    def flush(self):
        pass

    def reset_input_buffer(self):
        self._read.clear()


def good_serial():
    return FakeSerial([
        b"\rOK\r>" for _ in SETUP
    ] + [b"41 00 FF FF FF FF\r>"] + [
        b"41 0C 1A F8\r>",
        b"41 05 7D\r>",
        b"41 04 80\r>",
        b"41 06 90\r>",
        b"41 07 80\r>",
        b"41 0F 46\r>",
    ])


def capture(dev):
    return capture_mode01(
        dev, session_id="test-aa-001", vehicle_alias="test-unit-001",
        engine_family="gasoline-4cyl", adapter_model="ELM327 serial mock",
        cycles=1, timeout_s=0.2,
    )


class TestMode01(unittest.TestCase):
    def test_literal_pids_and_rounding(self):
        self.assertEqual(decode_mode01("010C", b"410C1AF8\r>"), 1726)
        self.assertEqual(decode_mode01("010C", b"010C\r41 0C 1A F8\r>"), 1726)
        self.assertEqual(decode_mode01("0105", b"41057D\r>"), 85)
        self.assertAlmostEqual(decode_mode01("0104", b"410480\r>"), 128 * 100 / 255)
        self.assertEqual(decode_mode01("0106", b"410690\r>"), 12.5)
        self.assertEqual(decode_mode01("0107", b"410780\r>"), 0)
        self.assertEqual(decode_mode01("010F", b"410F46\r>"), 30)
        self.assertEqual(tuple(ORDER), ("010C", "0105", "0104", "0106", "0107", "010F"))

    def test_ambiguous_and_untrustworthy_frames_fail_closed(self):
        cases = (
            b"410C1AF8",                         # missing completion prompt
            b"NO DATA\r>",
            b"SEARCHING...\r410C1AF8\r>",
            b"410C1AF8\r410C1AF8\r>",            # multiple responders
            b"41051AF8\r>",                      # different PID
            b"7E804410C1AF8\r>",                 # header-format mismatch
            b"410C1AF8FF\r>",                    # extra payload
            b"410C1A\r>",                        # incomplete payload
            b"?\r>",
            b"\xff\r>",
            b"410CXYZ\r>",
        )
        for frame in cases:
            with self.subTest(frame=frame):
                with self.assertRaises(ProtocolError):
                    decode_mode01("010C", frame)
        with self.assertRaises(ProtocolError):
            decode_mode01("0100", b"410000000000\r>")

    def test_fake_serial_capture_and_time_provenance(self):
        port = good_serial()
        data = capture(port)
        self.assertEqual(port.sent, list(SETUP) + ["0100"] + list(ORDER))
        self.assertTrue(all(x in SETUP or x in ORDER or x == "0100" for x in port.sent))
        self.assertEqual(data["schema"], "ma00-local-serial-receipts-v1")
        self.assertEqual(data["source"], "provided_obd_unverified")
        self.assertEqual(data["clock"], "host_monotonic_receive")
        self.assertIsNone(data["conditions"])
        self.assertIsNone(data["independentMechanicalReference"])
        self.assertFalse(data["instrumentClaims"]["ecuAcquisitionTimestampKnown"])
        self.assertFalse(data["captureAborted"])
        self.assertIsNone(data["abortReason"])
        self.assertIn("010C", data["supportedPids"])
        self.assertEqual(data["supportedPidMaskRawHex"], b"41 00 FF FF FF FF\r>".hex().upper())
        self.assertEqual(len(data["events"]), 6)
        self.assertTrue(all(e["status"] == "ok" for e in data["events"]))
        self.assertTrue(all(e["receivedAtMs"] >= e["requestAtMs"] for e in data["events"]))
        self.assertEqual(data["events"][0]["value"], 1726)
        self.assertEqual(data["events"][0]["rawResponseHex"], b"41 0C 1A F8\r>".hex().upper())
        self.assertGreater(data["events"][0]["rawFrameSizeBytes"], 0)
        self.assertFalse("mechanicalAgeKm" in data)
        self.assertFalse("healthScore" in data)

    def test_partial_reply_is_not_a_valid_measurement(self):
        responses = [b"\rOK\r>" for _ in SETUP] + [b"41 00 FF FF FF FF\r>"] + [
            b"NO DATA\r>",  # real returned nonvalue
            b"41057D\r>", b"410480\r>", b"410690\r>",
            b"410780\r>", b"410F46\r>"
        ]
        port = FakeSerial(responses)
        data = capture(port)
        self.assertEqual(data["events"][0]["status"], "error")
        self.assertNotIn("value", data["events"][0])
        self.assertIn("parseError", data["events"][0])
        self.assertEqual(data["events"][0]["rawResponseHex"], b"NO DATA\r>".hex().upper())
        self.assertTrue(all(e["status"] == "ok" for e in data["events"][1:]))

    def test_rejects_fake_setup_ack(self):
        responses = [b"ELM327 v1.5\r>"] + [b"\rOK\r>" for _ in SETUP[1:]]
        with self.assertRaises(ProtocolError):
            capture(FakeSerial(responses))

    def test_strict_port_and_transmit_whitelist(self):
        for valid in ("COM3", "/dev/ttyUSB0", "/dev/ttyACM1", "/dev/rfcomm0", "/dev/cu.usbserial-1"):
            self.assertEqual(_port_name(valid), valid)
        for invalid in ("socket://10.0.0.1", "rfc2217://remote:2323", "/dev/ttyS0",
                        "COM0", "../dev/ttyUSB0", "COM3;rm -rf /"):
            with self.assertRaises(ValueError):
                _port_name(invalid)
        with self.assertRaises(ProtocolError):
            _reply(FakeSerial([]), "04", __import__("time").monotonic, 0.2)

    def test_supported_pid_mask_rejects_missing_and_ambiguous_ecu_data(self):
        expected = decode_supported_pids(b"41 00 FF FF FF FF\r>")
        self.assertTrue(set(ORDER).issubset(expected))
        self.assertEqual(decode_supported_pids(b"0100\r41 00 FF FF FF FF\r>"), expected)
        for bad in (
            b"NO DATA\r>", b"41 00 FF FF FF FF",
            b"4100FFFFFFFF\r4100FFFFFFFF\r>", b"4100FFFFFFFFFF\r>",
            b"7E804100FFFFFFFF\r>", b"\xff\r>"
        ):
            with self.subTest(frame=bad), self.assertRaises(ProtocolError):
                decode_supported_pids(bad)
        missing = FakeSerial([b"\rOK\r>" for _ in SETUP] + [b"410000000000\r>"])
        with self.assertRaisesRegex(ProtocolError, "unsupported"):
            capture(missing)
        self.assertEqual(missing.sent, list(SETUP) + ["0100"])

    def test_optional_iat_not_queried_if_bitmap_does_not_advertise_support(self):
        mask = 0xFFFFFFFF & ~(1 << (32 - 15))
        no_iat = FakeSerial([b"\rOK\r>" for _ in SETUP] +
                            [("4100%08X\r>" % mask).encode("ascii")] +
                            [b"410C1AF8\r>", b"41057D\r>", b"410480\r>",
                             b"410690\r>", b"410780\r>"])
        data = capture(no_iat)
        self.assertFalse(data["captureAborted"])
        self.assertNotIn("010F", no_iat.sent)
        self.assertEqual(len(data["events"]), 5)

    def test_partial_response_aborts_before_another_pid_can_be_misattributed(self):
        port = FakeSerial([b"\rOK\r>" for _ in SETUP] +
                          [b"4100FFFFFFFF\r>"] + [b"410C1A"])
        data = capture(port)
        self.assertTrue(data["captureAborted"])
        self.assertEqual(data["events"][0]["status"], "timeout")
        self.assertEqual(data["events"][0]["rawResponseHex"], b"410C1A".hex().upper())
        self.assertEqual(len(data["events"]), 1)
        self.assertEqual(port.sent, list(SETUP) + ["0100", "010C"])
        self.assertNotIn("0105", port.sent)

    def test_cannot_mutate_pid_allowlist_or_induce_actuator_commands(self):
        data = capture(good_serial())
        self.assertEqual(data["instrumentClaims"]["serviceCommandsSent"], ["0100"] + list(ORDER))
        self.assertNotIn("03", data["instrumentClaims"]["serviceCommandsSent"])
        self.assertNotIn("04", data["instrumentClaims"]["serviceCommandsSent"])
        for bad in ("03", "04", "08", "2F", "0101", "0902", "ATMA", "ATSH", "ATZ"):
            with self.assertRaises(ProtocolError):
                _reply(FakeSerial([]), bad, __import__("time").monotonic, 0.2)


if __name__ == "__main__":
    unittest.main()
