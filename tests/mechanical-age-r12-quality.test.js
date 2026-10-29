import test from 'node:test';
import assert from 'node:assert/strict';
import {
 R12_VERSION,R12_REQUIRED_PIDS,assessObdMultiSessionRepeatability,
 syntheticR12ReceiptSeries
} from '../src/mechanical-age-r12-quality.js';

const clone=x=>structuredClone(x);
const fixture=()=>syntheticR12ReceiptSeries();
test('MA00 R12: six synthetic captures yield separate calibration/holdout, no wear conclusion',()=>{
 const s=fixture(),before=clone(s);
 const r=assessObdMultiSessionRepeatability(s);
 assert.deepEqual(s,before);
 assert.equal(r.version,R12_VERSION);
 assert.equal(r.status,'descriptive_only',JSON.stringify(r.blockers));
 assert.equal(r.sessionCount,6);
 assert.equal(r.calibrationSessionCount,4);
 assert.equal(r.holdoutSessionCount,2);
 assert.equal(r.evidenceGrade,'synthetic_demonstration');
 assert.equal(r.summary.sampleUnit,'session_not_obd_sample');
 assert.equal(r.qa.totalEvents,6*192);
 assert.equal(r.qa.ecuAcquisitionTimingKnown,false);
 assert.equal(r.verifiedSessionIndependence,false);
 assert.equal(r.physicalAccuracyValidated,false);
 assert.equal(r.predictedFailure,null);
 assert.equal(r.structuralWear,null);
 assert.equal(r.mechanicalAgeKm,null);
 assert.equal(r.calibratedWearThreshold,false);
 assert.deepEqual(Object.keys(r.pidReports).filter(p=>R12_REQUIRED_PIDS.includes(p)),R12_REQUIRED_PIDS);
 assert.equal(r.pidReports['010C'].holdoutSessions,2);
 assert.equal(r.pidReports['010C'].referenceSessions,4);
 assert.equal(r.pidReports['010C'].nominalPidReadoutStep,.25);
 assert.equal(r.pidReports['0106'].nominalPidReadoutStep,Number((100/128).toFixed(4)));
 assert.match(r.pidReports['0106'].thresholdMeaning,/NOT_a_fault_threshold/);
});
test('MA00 R12: observational deviation is reported, NOT fault/wear diagnosis',()=>{
 const s=fixture();
 for(const session of s.slice(4)){
  for(const e of session.events)if(e.pid==='0106')e.value+=7;
 }
 const r=assessObdMultiSessionRepeatability(s);
 assert.equal(r.status,'descriptive_only',JSON.stringify(r.blockers));
 assert.equal(r.pidReports['0106'].anyOutsideObservedReferenceBand,true);
 assert.equal(r.pidReports['0106'].sessionsOutsideObservedReferenceBand,2);
 assert.ok(r.summary.channelsWithObservedShift.includes('0106'));
 assert.equal(r.summary.functionalDiagnosisSupported,false);
 assert.equal(r.mechanicalAgeKm,null);
});
test('MA00 R12: fewer than six independent sessions cannot calibrate a reference band',()=>{
 const s=fixture();
 for(const n of [2,3,5]){
  const x=assessObdMultiSessionRepeatability(s.slice(0,n));
  assert.equal(x.status,'abstain');
  assert.equal(x.pidReports,null);
  assert.match(x.blockers.join(' '),/4 sesiones/);
  assert.equal(x.summary,null);
  assert.equal(x.structuralWear,null);
 }
 for(const n of [0,1,13]){
  const array=Array.from({length:n},()=>clone(s[0]));
  assert.throws(()=>assessObdMultiSessionRepeatability(array),RangeError);
 }
});
test('MA00 R12: replay, reused IDs, and short separation fail closed',()=>{
 const s=fixture();
 const reused=clone(s);reused[5].sessionId=reused[0].sessionId;
 const a=assessObdMultiSessionRepeatability(reused);
 assert.equal(a.status,'abstain');
 assert.match(a.blockers.join(' '),/ID de sesión/);
 const short=clone(s);short[2].capturedAt='2026-10-23T12:01:00Z';
 const b=assessObdMultiSessionRepeatability(short);
 assert.equal(b.status,'abstain');
 assert.match(b.blockers.join(' '),/Separación temporal/);
 const replay=clone(s);
 replay[5].events=replay[0].events.map(e=>({...e}));
 const c=assessObdMultiSessionRepeatability(replay);
 assert.equal(c.status,'abstain');
 assert.match(c.blockers.join(' '),/Secuencia de señales reproducida/);
});
test('MA00 R12: external JSON without original serial receipts cannot assert physical replication',()=>{
 const s=fixture();
 for(const session of s)session.source='provided_obd_unverified';
 const r=assessObdMultiSessionRepeatability(s);
 assert.equal(r.status,'abstain');
 assert.match(r.blockers.join(' '),/Falta expediente serial Mode 01/);
 assert.equal(r.pidReports,null);
 assert.equal(r.physicalAccuracyValidated,false);
});
test('MA00 R12: blocking missing PID, broken operating regime and aborted acquisition',()=>{
 const missing=fixture();
 missing[4].events=missing[4].events.filter(e=>e.pid!=='0107');
 const a=assessObdMultiSessionRepeatability(missing);
 assert.equal(a.status,'abstain');
 assert.match(a.blockers.join(' '),/0107/);
 const different=fixture();different[5].conditions.intervention='oil_change';
 const b=assessObdMultiSessionRepeatability(different);
 assert.equal(b.status,'abstain');
 assert.match(b.blockers.join(' '),/Sin evidencia documental/);
 const aborted=fixture();aborted[5].captureAborted=true;
 const c=assessObdMultiSessionRepeatability(aborted);
 assert.equal(c.status,'abstain');
 assert.match(c.blockers.join(' '),/Captura interrumpida/);
});
test('MA00 R12: never fabricate missing optional IAT or accept partial IAT coverage',()=>{
 const noIat=fixture();
 for(const session of noIat)session.events=session.events.filter(e=>e.pid!=='010F');
 const result=assessObdMultiSessionRepeatability(noIat);
 assert.equal(result.status,'descriptive_only',JSON.stringify(result.blockers));
 assert.equal(result.pidReports['010F'],undefined);
 const partial=fixture();
 partial[5].events=partial[5].events.filter(e=>e.pid!=='010F');
 const invalid=assessObdMultiSessionRepeatability(partial);
 assert.equal(invalid.status,'abstain');
 assert.match(invalid.blockers.join(' '),/010F/);
});
