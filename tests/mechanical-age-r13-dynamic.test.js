import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DYNAMIC_FIELD_CONTRACTS,auditDynamicMA00Structure,MODE01_PIDS}
 from '../src/mechanical-age-r13-structure.js';
import {assertMA00Report} from '../src/mechanical-age-r13-claims.js';
import {auditRawObdSession,evaluateAAWithoutService,syntheticAAReceiptPair}
 from '../src/mechanical-age-raw-obd.js';
import {syntheticR12ReceiptSeries,assessObdMultiSessionRepeatability}
 from '../src/mechanical-age-r12-quality.js';
import {evaluateReplicatedMeasurements,syntheticReplicatedServiceCase}
 from '../src/mechanical-age-repeatability.js';
import {runMechanicalAgeFalsification}
 from '../src/mechanical-age-falsification.js';
const copy=x=>structuredClone(x);

test('R13.1: seven dynamic evidence schema classes match source-controlled manifest',()=>{
 const r=JSON.parse(readFileSync(new URL('../docs/ma00/claims.json',import.meta.url),'utf8'));
 assert.deepEqual(Object.keys(DYNAMIC_FIELD_CONTRACTS).sort(),Object.keys(r.dynamicContracts).sort());
 for(const [kind,fields] of Object.entries(DYNAMIC_FIELD_CONTRACTS))
  assert.deepEqual(r.dynamicContracts[kind],fields,kind);
 assert.deepEqual(MODE01_PIDS,['0103','0104','0105','0106','0107','010C','010F']);
});
test('R13.1: every raw PID channel traces to original host event indices; no ECU authentication claimed',()=>{
 const sample=syntheticAAReceiptPair()[0];
 const raw=auditRawObdSession(sample);
 assert.equal(raw.sourceTrace.eventCount,sample.events.length);
 assert.equal(raw.sourceTrace.sessionReference,'session:'+sample.sessionId);
 assert.equal(raw.sourceTrace.independentlyAuthenticated,false);
 assert.equal(raw.sourceTrace.eventIndexIsNotAcquisitionTimestamp,true);
 assert.deepEqual(raw.sourceTrace.pidEventIndexes['010C'],
  sample.events.flatMap((e,i)=>e.pid==='010C'?[i]:[]));
 assert.equal(auditDynamicMA00Structure(raw,'raw_session').length,0);
 assert.equal(raw.evidenceContract.complete,true);
 assert.equal(raw.sensorAcquisitionTimeKnown,false);
});
test('R13.1: tampered per-PID counts, injected physical fields and truncated lineage fail closed',()=>{
 const src=auditRawObdSession(syntheticAAReceiptPair()[0]);
 const edits=[
  x=>x.channels['010C'].healthScore=88,
  x=>x.channels['0106'].attempts=999,
  x=>x.channels['0107'].failFraction=3,
  x=>x.sourceTrace.pidEventIndexes['0104'].pop(),
  x=>x.sourceTrace.pidEventIndexes['0105'][0]=999999,
  x=>x.sourceTrace.independentlyAuthenticated=true,
  x=>x.traceIntegrity.independentlyAuthenticated=true,
  x=>x.traceIntegrity.fakeECU='verified',
  x=>x.warnings.push({diagnosis:'compression_failure'}),
  x=>x.sourceTrace.pidEventIndexes['0220']=[0],
 ];
 for(const change of edits){
  const x=copy(src);change(x);
  assert.throws(()=>assertMA00Report(x,'raw_session',{source:'synthetic'}),/R13 afirmación no sustentada/);
 }
});
test('R13.1: A-A and R12 deltas cite ordered independent (asserted) sessions, not individual rows as independent engines',()=>{
 const s=syntheticAAReceiptPair(),aa=evaluateAAWithoutService(s);
 assert.equal(aa.comparable,true,aa.blockers.join('; '));
 const r=aa.observedChanges['010C'];
 assert.deepEqual(r.sourceSessionRefs,s.map(x=>'session:'+x.sessionId));
 assert.equal(aa.evidenceContract.complete,true);
 const corrupt=copy(aa);
 corrupt.observedChanges['010C'].sourceSessionRefs.pop();
 assert.throws(()=>assertMA00Report(corrupt,'aa',{source:'synthetic'}),/R13 afirmación no sustentada/);
 const r12=assessObdMultiSessionRepeatability(syntheticR12ReceiptSeries());
 assert.equal(r12.status,'descriptive_only');
 const p=r12.pidReports['0106'];
 assert.equal(p.sourceSessionRefs.length,6);
 assert.deepEqual(p.sourceSessionRefs,syntheticR12ReceiptSeries().map(x=>'session:'+x.sessionId));
 const spoof=copy(r12);
 spoof.pidReports['0106'].structuralWear=47;
 assert.throws(()=>assertMA00Report(spoof,'r12',{source:'synthetic'}),/R13 afirmación no sustentada/);
 const dup=copy(r12);
 dup.pidReports['0106'].sourceSessionRefs[5]=dup.pidReports['0106'].sourceSessionRefs[0];
 assert.throws(()=>assertMA00Report(dup,'r12',{source:'synthetic'}),/R13 afirmación no sustentada/);
});
test('R13.1: repeated-sessions and falsification subsidiary claims cannot gain physical ground truth',()=>{
 const repeats=evaluateReplicatedMeasurements(syntheticReplicatedServiceCase());
 assert.equal(repeats.evidenceContract.complete,true);
 const x=copy(repeats);x.after.rpm.predictedFailure=10;
 assert.throws(()=>assertMA00Report(x,'replicates',{source:'synthetic'}),/R13 afirmación no sustentada/);
 const f=runMechanicalAgeFalsification();
 assert.equal(f.evidenceContract.complete,true);
 const g=copy(f);g.controls[1].structuralWearGroundTruth=98;
 assert.throws(()=>assertMA00Report(g,'falsification',{source:'synthetic'}),/R13 afirmación no sustentada/);
 const h=copy(f);h.controls[0].secretVerifiedDiagnosis='sensor failed';
 assert.throws(()=>assertMA00Report(h,'falsification',{source:'synthetic'}),/R13 afirmación no sustentada/);
});


test('R13.1: input schemas reject unrecognized OBD claims even before building a report',()=>{
 const edits=[
  x=>{x.events[3].healthScore=95;},
  x=>{x.events[1].rawWear=true;},
  x=>{x.conditions.structuralWear=0;},
  x=>{x.instrumentClaims={ecuAcquisitionTimestampKnown:false,transportLatencyCalibrated:false,confirmedDiagnosis:'mechanical_fatigue'};},
 ];
 for(const edit of edits){
  const x=syntheticAAReceiptPair()[0];edit(x);
  assert.throws(()=>auditRawObdSession(x),{name:'RangeError'});
 }
});
test('R13.1: unknown or mismatched powertrains cannot silently compare gasoline trims',()=>{
 const variants=[
  ['diesel_ice','diesel'],['gasoline_ice','gnc'],
  ['hybrid','mixed'],['battery_electric','electric'],['unknown','unknown']
 ];
 for(const [powertrain,fuel] of variants){
  const data=syntheticAAReceiptPair();
  for(const s of data){s.powertrain=powertrain;s.fuel=fuel;}
  const r=evaluateAAWithoutService(data);
  assert.equal(r.comparable,false,powertrain);
  assert.equal(r.observedChanges,null,powertrain);
  assert.match(r.blockers.join(' '),/Tecnología|combustible|observabilidad/);
  assert.equal(r.mechanicalAgeKm,null);
 }
 const missing=syntheticAAReceiptPair();
 delete missing[1].powertrain;
 assert.equal(evaluateAAWithoutService(missing).comparable,false);
});
