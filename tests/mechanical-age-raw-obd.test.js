import test from 'node:test';
import assert from 'node:assert/strict';
import {auditRawObdSession,evaluateAAWithoutService,syntheticAAReceiptPair,RAW_PID_DICTIONARY,RAW_OBD_VERSION} from '../src/mechanical-age-raw-obd.js';
const clone=x=>structuredClone(x);
const setup=()=>syntheticAAReceiptPair();

test('MA00 A-A: no maintenance, per-PID event timestamps retained and no health claim',()=>{
 const sessions=setup(),previous=clone(sessions);
 const aa=evaluateAAWithoutService(sessions);
 assert.equal(aa.version,RAW_OBD_VERSION);
 assert.equal(aa.design,'AA_without_intervention_descriptive');
 assert.equal(aa.dataUnit,'session_not_obd_row');
 assert.equal(aa.sessionCount,2);
 assert.equal(aa.comparable,true,JSON.stringify(aa.blockers));
 assert.equal(aa.verifiedIndependence,false);
 assert.equal(aa.confidenceInterval,null);
 assert.equal(aa.noiseThresholdCalibrated,false);
 assert.equal(aa.healthScore,null);
 assert.equal(aa.mechanicalAgeKm,null);
 assert.equal(aa.wear,null);
 assert.equal(aa.causalEffect,null);
 assert.ok(Math.abs(aa.observedChanges['010C'].lastMinusFirst)<5);
 const per=aa.sessionAudits[0];
 assert.equal(per.eventCount,192);
 assert.equal(per.channels['010C'].success,32);
 assert.equal(per.channels['010C'].medianHostRoundTripMs,15);
 assert.equal(per.channels['010C'].medianReceiptGapMs,1000);
 assert.equal(per.sensorAcquisitionTimeKnown,false);
 assert.equal(per.simultaneityVerified,false);
 assert.equal(per.estimatedAgeKm,null);
 assert.deepEqual(sessions,previous);
 assert.equal(RAW_PID_DICTIONARY['010C'].unit,'rpm');
});
test('MA00 raw gate: no silently fabricated request timestamps',()=>{
 const s=setup()[0];
 delete s.events[2].requestAtMs;
 const a=auditRawObdSession(s);
 assert.equal(a.requestTimeMissingCount,1);
 const pair=setup();delete pair[0].events[2].requestAtMs;
 const result=evaluateAAWithoutService(pair);
 assert.equal(result.comparable,false);
 assert.match(result.blockers.join(';'),/Intervalos/);
});
test('MA00 raw gate: timeout cannot be stored as an actual sensor reading',()=>{
 const s=setup()[0];
 s.events[10].status='timeout';
 s.events[10].value=null;
 const a=auditRawObdSession(s);
 const pid=s.events[10].pid;
 assert.equal(a.channels[pid].failures,1);
 assert.equal(a.channels[pid].success,31);
 const forgery=setup()[0];forgery.events[10].status='timeout';
 assert.throws(()=>auditRawObdSession(forgery),/Falla OBD/);
});
test('MA00 raw gate: rejects bad units, unrecognized PIDs, bad physical range and backwards times',()=>{
 const mutations=[
  s=>s.events[3].unit='rpm',
  s=>s.events[0].pid='0902',
  s=>s.events[0].value=-120,
  s=>s.events[1].receivedAtMs=s.events[0].receivedAtMs-1,
  s=>s.events[1].requestAtMs=s.events[1].receivedAtMs+1,
  s=>s.events[2].status='bogus',
  s=>s.clock='ecm_measured_time',
  s=>s.events.push({...s.events.at(-1),receivedAtMs:-1}),
  s=>s.events=[],
  s=>s.sessionId='VIN:NOT_ALLOWED',
 ];
 for(const change of mutations){const s=setup()[0];change(s);assert.throws(()=>auditRawObdSession(s),{name:'RangeError'});}
});
test('MA00 A-A: prohibits falsely attributing change without no-intervention evidence',()=>{
 const variations=[
  s=>s[1].conditions.intervention='oil_change',
  s=>s[1].conditions.ac='on_observed',
  s=>s[1].conditions.electricalLoads='changing_observed',
  s=>s[1].conditions.ambientC=40,
  s=>s[1].adapterModel='Different Adapter',
  s=>s[1].sessionId=s[0].sessionId,
  s=>s[1].capturedAt=s[0].capturedAt,
  s=>s[1].vehicleAlias='another-unit',
  s=>s[1].events=s[0].events.map(e=>({...e,receivedAtMs:e.receivedAtMs+10000,requestAtMs:e.requestAtMs+10000})),
 ];
 for(const change of variations){
  const s=setup();change(s);
  const res=evaluateAAWithoutService(s);
  assert.equal(res.comparable,false,JSON.stringify(change));
  assert.equal(res.observedChanges,null);
  assert.ok(res.blockers.length>0);
  assert.equal(res.mechanicalAgeKm,null);
 }
});
test('MA00 A-A: requires coverage for EACH PID and does not fill missing sensor channels',()=>{
 const s=setup();
 s[1].events=s[1].events.filter(x=>x.pid!=='0107');
 const a=evaluateAAWithoutService(s);
 assert.equal(a.comparable,false);
 assert.equal(a.observedChanges,null);
 assert.match(a.blockers.join(' '),/0107/);
 const withOnlyOne=setup();
 withOnlyOne[0].events=withOnlyOne[0].events.filter(x=>x.pid==='010C');
 assert.equal(auditRawObdSession(withOnlyOne[0]).channels['0107'],undefined);
});
test('MA00 raw quality: a plateau is ambiguous, not a fault or mechanical age',()=>{
 const s=setup()[0];
 for(const event of s.events)if(event.pid==='010C')event.value=800;
 const r=auditRawObdSession(s);
 assert.equal(r.channels['010C'].possibleStaleOrStable,true);
 assert.ok(r.warnings.some(w=>w.includes('meseta prolongada')));
 assert.equal(r.sensorAcquisitionTimeKnown,false);
 assert.equal(r.structuralWear,null);
});


test('MA00 A-A cannot claim repeatability from brief burst or large per-PID acquisition gaps',()=>{
 const short=setup();
 for(const session of short)for(const e of session.events){
  e.requestAtMs/=20;e.receivedAtMs/=20;
 }
 const a=evaluateAAWithoutService(short);
 assert.equal(a.comparable,false);
 assert.match(a.blockers.join(' '),/Duración|Cadencia/);
 assert.equal(a.observedChanges,null);

 const stalled=setup();
 for(const e of stalled[1].events){
  if(e.receivedAtMs>=15500){
   e.receivedAtMs+=20000;e.requestAtMs+=20000;
  }
 }
 const b=evaluateAAWithoutService(stalled);
 assert.equal(b.comparable,false);
 assert.match(b.blockers.join(' '),/Cadencia/);
});


test('MA00 refuses repeatability inference from an aborted serial acquisition, even with full PID coverage',()=>{
 const sessions=setup();
 sessions[1].captureAborted=true;
 sessions[1].abortReason='ELM timeout after enough samples';
 const study=evaluateAAWithoutService(sessions);
 assert.equal(study.comparable,false);
 assert.equal(study.observedChanges,null);
 assert.equal(study.mechanicalAgeKm,null);
 assert.match(study.blockers.join('; '),/Captura interrumpida/);
});


test('MA00 A-A absolute warm-idle gates reject comparable-looking but invalid physical regimes',()=>{
 const examples=[
  {pid:'010C',change:e=>e.value+=1700,reason:/RPM fuera de rango/},
  {pid:'0105',change:e=>e.value-=30,reason:/ECT fuera de régimen/},
  {pid:'0104',change:e=>e.value+=45,reason:/Carga fuera de condición/},
  {pid:'0105',change:(e,i)=>{if(i%2)e.value+=8;},reason:/ECT fuera de régimen/}
 ];
 for(const {pid,change,reason} of examples){
  const sessions=setup();
  for(const session of sessions){
   let idx=0;
   for(const e of session.events)if(e.pid===pid)change(e,idx++);
  }
  const r=evaluateAAWithoutService(sessions);
  assert.equal(r.comparable,false,JSON.stringify({pid,reason:String(reason)}));
  assert.equal(r.observedChanges,null);
  assert.match(r.blockers.join(' '),reason);
 }
});
