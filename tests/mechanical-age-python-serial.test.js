import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {auditSerialTrace} from '../src/mechanical-age-serial-integrity.js';
import {auditRawObdSession,evaluateAAWithoutService} from '../src/mechanical-age-raw-obd.js';

const copy=x=>structuredClone(x);
function fixture(variant=0){
 const text=execFileSync('python3',['tests/science/ma00_fake_serial_fixture.py',String(variant)],{
  encoding:'utf8',maxBuffer:4*1024*1024,timeout:30000
 });
 return JSON.parse(text);
}
test('MA00 Python physical-driver output round-trips to offline JavaScript without claiming wear',()=>{
 const original=fixture();
 const prior=copy(original);
 assert.equal(original.schema,'ma00-local-serial-receipts-v1');
 assert.equal(original.source,'provided_obd_unverified');
 assert.equal(original.instrumentClaims.ecuAcquisitionTimestampKnown,false);
 assert.equal(original.instrumentClaims.testOnlyFakeTransport,true);
 assert.equal(original.events.length,192);
 assert.equal(original.plannedCycles,32);
 assert.equal(original.expectedEventCount,192);
 const trace=auditSerialTrace(original);
 assert.equal(trace.applies,true);
 assert.equal(trace.internallyConsistent,true,JSON.stringify(trace.errors));
 assert.equal(trace.expectedEventCount,192);
 assert.equal(trace.independentlyAuthenticated,false);
 assert.equal(trace.wearInferenceAllowed,false);
 const report=auditRawObdSession(original);
 assert.equal(report.traceIntegrity.internallyConsistent,true);
 assert.equal(report.channels['010C'].success,32);
 assert.ok(report.channels['010C'].median>550);
 assert.ok(report.elapsedHostReceiptMs>19000);
 assert.equal(report.structuralWear,null);
 assert.equal(report.estimatedAgeKm,null);
 assert.deepEqual(original,prior);
});

test('MA00 byte/value mismatch, tampering and misleading completion fail closed',()=>{
 const original=fixture();
 const attacks=[
  x=>{x.events[0].value+=25;},
  x=>{x.events[0].rawResponseHex='34313043303030303E';},
  x=>{x.events[0].rawFrameSizeBytes=3;},
  x=>{x.events[0].pid='0105';},
  x=>{x.events[0].status='error';delete x.events[0].value;},
  x=>{x.events[0].requestAtMs=x.events[0].receivedAtMs+1;},
  x=>{x.supportedPidMaskRawHex='3431303030303030303030303E';},
  x=>{x.supportedPids=[];},
  x=>{x.events.pop();},
  x=>{x.plannedCycles=99;},
  x=>{x.expectedEventCount=0;},
  x=>{x.captureAborted=true;},
  x=>{x.instrumentClaims.ecuAcquisitionTimestampKnown=true;}
 ];
 for(const change of attacks){
  const modified=copy(original);
  change(modified);
  const result=auditSerialTrace(modified);
  assert.equal(result.internallyConsistent,false,JSON.stringify(change));
  assert.ok(result.errors.length>0);
  assert.throws(()=>auditRawObdSession(modified),/Traza serial inconsistente|Tiempos inválidos/);
 }
});

test('MA00 fake transport is never independent empirical proof even if fields are supplied',()=>{
 const a=fixture(0),b=fixture(1);
 for(const s of [a,b]){
  s.conditions={intervention:'none',fuelControl:'closed_loop_observed',
   ac:'off_observed',coolingFan:'stable_observed',
   electricalLoads:'stable_observed',ambientC:20};
 }
 const result=evaluateAAWithoutService([a,b]);
 assert.equal(result.comparable,false);
 assert.equal(result.observedChanges,null);
 assert.equal(result.mechanicalAgeKm,null);
 assert.equal(result.verifiedIndependence,false);
 assert.match(result.blockers.join(' '),/Transporte simulado/);
});

test('MA00 a coherent aborted raw serial frame remains auditable but unusable for A-A',()=>{
 const a=fixture(0);
 // Retain only a failed last packet, preserving a truncated original frame.
 const e=a.events[191];
 e.status='timeout';delete e.value;e.rawResponseHex='343130433141';
 e.rawFrameSizeBytes=6;
 a.captureAborted=true;
 a.abortReason='Prompt timeout in mock transport';
 const trace=auditSerialTrace(a);
 assert.equal(trace.internallyConsistent,true,JSON.stringify(trace.errors));
 const report=auditRawObdSession(a);
 assert.equal(report.channels['010F'].failures,1);
 const b=fixture(1);
 for(const s of [a,b])s.conditions={intervention:'none',fuelControl:'closed_loop_observed',ac:'off_observed',
  coolingFan:'stable_observed',electricalLoads:'stable_observed',ambientC:20};
 const study=evaluateAAWithoutService([a,b]);
 assert.equal(study.comparable,false);
 assert.match(study.blockers.join(' '),/Captura interrumpida/);
});
