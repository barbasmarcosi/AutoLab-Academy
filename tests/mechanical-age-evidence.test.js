import test from 'node:test';
import assert from 'node:assert/strict';
import {auditMeasurementEvidence,compareMeasurementEvidence,EVIDENCE_VERSION} from '../src/mechanical-age-evidence.js';
import {compareMechanicalSnapshots,syntheticServicePair} from '../src/mechanical-age-research.js';

const context=(phase)=>({
 sessionId:phase==='before_service'?'obs-before-001':'obs-after-002',
 capturedAt:phase==='before_service'?'2026-10-01T11:00:00-03:00':'2026-10-02T11:00:00-03:00',
 adapterModel:'Generic research logger',softwareVersion:'MA00 capture v1',
 serviceEventId:'service-event-001',ambientC:20,
 clock:'monotonic_observed',fuelControl:'closed_loop_observed',
 ac:'off_observed',coolingFan:'stable_observed',electricalLoads:'stable_observed'
});
const observed=()=>{
 const {before,after}=syntheticServicePair();
 for(const x of [before,after]){
  x.source='provided_obd_unverified';
  x.measurementContext=context(x.phase);
 }
 return {before,after};
};
test('MA00 observational metadata only provides documented operator claims, not wear evidence',()=>{
 const {before,after}=observed();
 const a=auditMeasurementEvidence(before);
 assert.equal(a.version,EVIDENCE_VERSION);
 assert.equal(a.completeness,'documented_operator_claims');
 assert.equal(a.documented,true);
 assert.equal(a.independentlyVerified,false);
 assert.equal(a.allowedToInferWear,false);
 const pair=compareMechanicalSnapshots(before,after);
 assert.equal(pair.comparable,true);
 assert.equal(pair.measurementEvidence.documented,true);
 assert.equal(pair.measurementEvidence.independentlyVerified,false);
 assert.equal(pair.deltaDeviationIndex,null);
 assert.equal(pair.before.deviationIndex,null);
 assert.equal(pair.after.deviationIndex,null);
 assert.equal(pair.before.structuralWear,null);
 assert.equal(pair.before.mechanicalAgeEquivalentKm,null);
});
test('MA00 missing metadata blocks real comparisons while preserving descriptive signal features',()=>{
 const {before,after}=observed();
 delete before.measurementContext;
 const pair=compareMechanicalSnapshots(before,after);
 assert.equal(pair.comparable,false);
 assert.equal(pair.deltaDeviationIndex,null);
 assert.equal(pair.before.measurementEvidence.completeness,'missing_metadata');
 assert.ok(Number.isFinite(pair.before.features.medianRpm));
 assert.match(pair.blockers.join(' '),/measurementContext/);
});
test('MA00 deliberate metadata contradictions and confounders cause abstention',()=>{
 const mutators=[
  (a,b)=>b.measurementContext.sessionId=a.measurementContext.sessionId,
  (a,b)=>b.measurementContext.capturedAt=a.measurementContext.capturedAt,
  (a,b)=>b.measurementContext.serviceEventId='different-service',
  (a,b)=>b.measurementContext.adapterModel='Unknown competitor adapter',
  (a,b)=>b.measurementContext.softwareVersion='Different logger version',
  (a,b)=>b.measurementContext.ambientC=31,
  (a,b)=>b.measurementContext.ac='on_observed',
  (a,b)=>b.measurementContext.electricalLoads='changing_observed',
  (a,b)=>b.measurementContext.coolingFan='cycling_observed',
  (a,b)=>b.measurementContext.fuelControl='open_loop_observed',
  (a,b)=>b.measurementContext.clock='unknown',
  (a,b)=>b.measurementContext.capturedAt='2026-10-02',
  (a,b)=>b.measurementContext.capturedAt='2026-02-30T11:00:00Z',
  (a,b)=>b.measurementContext.capturedAt='2026-10-02T11:00:00+15:00',
  (a,b)=>b.measurementContext.capturedAt='2026-10-02T25:00:00Z',
  (a,b)=>b.measurementContext.serviceEventId='invalid space',
 ];
 for(const change of mutators){
  const {before,after}=observed();change(before,after);
  const pair=compareMechanicalSnapshots(before,after);
  assert.equal(pair.comparable,false,JSON.stringify(change));
  assert.equal(pair.deltaDeviationIndex,null);
  assert.ok(pair.blockers.length>0);
  assert.equal(pair.mechanicalAgeChangeKm,null);
 }
});
test('MA00 metadata can never self-assert independent proof, even with invented verified flag',()=>{
 const {before,after}=observed();
 before.measurementContext.independentlyVerified=true;
 after.measurementContext.independentlyVerified=true;
 before.measurementContext.calibration='certified';
 const pair=compareMechanicalSnapshots(before,after);
 assert.equal(pair.measurementEvidence.independentlyVerified,false);
 assert.equal(pair.before.measurementEvidence.independentlyVerified,false);
 assert.equal(pair.after.measurementEvidence.allowedToInferWear,false);
});
test('MA00 synthetic examples remain synthetic-only and cannot provide physical inference',()=>{
 const pair=syntheticServicePair();
 const e=compareMeasurementEvidence(pair.before,pair.after);
 assert.equal(e.documented,true);
 assert.equal(e.independentlyVerified,false);
 assert.match(e.label,/sintética/);
});
