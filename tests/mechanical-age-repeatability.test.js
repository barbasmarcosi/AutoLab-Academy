import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateReplicatedMeasurements,syntheticReplicatedServiceCase,REPLICATES_VERSION} from '../src/mechanical-age-repeatability.js';
const copy=x=>structuredClone(x);
test('MA00: four distinct synthetic sessions report variability instead of false confidence from OBD rows',()=>{
 const sessions=syntheticReplicatedServiceCase();
 const r=evaluateReplicatedMeasurements(sessions);
 assert.equal(r.version,REPLICATES_VERSION);
 assert.equal(r.comparable,true,JSON.stringify(r.blockers));
 assert.equal(r.sessionUnitCount,4);
 assert.deepEqual(r.phases,{before:2,after:2});
 assert.ok(r.baseline.rpmRobustSigma.range>=0);
 assert.ok(r.observedDifferences.syntheticDeviationIndex<0);
 assert.equal(r.confidenceInterval,null);
 assert.equal(r.causalMaintenanceEffect,null);
 assert.equal(r.structuralWear,null);
 assert.equal(r.mechanicalAgeEquivalentKm,null);
 assert.match(r.verdict,/NO prueba causalidad/);
});
test('MA00: repeated observations from the same session cannot masquerade as independent replication',()=>{
 const s=syntheticReplicatedServiceCase();
 const same=copy(s);same[1].snapshot.samples=copy(same[0].snapshot.samples);
 assert.throws(()=>evaluateReplicatedMeasurements(same),/idénticas señales/);
 const replay=copy(s);
 replay[1].snapshot.samples=replay[0].snapshot.samples.map(x=>({...x,timeMs:x.timeMs+120000}));
 assert.throws(()=>evaluateReplicatedMeasurements(replay),/idénticas señales/);
 const sameId=copy(s);sameId[1].sessionId=same[0].sessionId;
 assert.throws(()=>evaluateReplicatedMeasurements(sameId),/Sesión duplicada/);
 assert.throws(()=>evaluateReplicatedMeasurements(s.slice(0,3)),RangeError);
});
test('MA00: no comparable result across different engines or uncontrolled temperatures',()=>{
 const s=syntheticReplicatedServiceCase();
 const other=copy(s);other[3].snapshot.vehicleAlias='unit-2';
 assert.match(evaluateReplicatedMeasurements(other).blockers.join(' '),/Múltiples vehículos/);
 const hotter=copy(s);hotter[3].snapshot.samples.forEach(x=>x.ectC+=7);
 assert.match(evaluateReplicatedMeasurements(hotter).blockers.join(' '),/condiciones|protocolo/i);
});
test('MA00: external replicated sessions without acquisition evidence must abstain',()=>{
 const s=syntheticReplicatedServiceCase();
 for(const item of s)item.snapshot.source='provided_obd_unverified';
 const r=evaluateReplicatedMeasurements(s);
 assert.equal(r.comparable,false);
 assert.equal(r.observedDifferences,null);
 assert.equal(r.baseline,null);
 assert.equal(r.causalMaintenanceEffect,null);
 assert.equal(r.evidenceLevel,'operator_assertions_only');
 assert.match(r.blockers.join(' '),/contextos de adquisición/);
});

test('MA00: complete operator claims permit descriptive repeatability, still not wear inference',()=>{
 const s=syntheticReplicatedServiceCase();
 for(let i=0;i<s.length;i++){
  const item=s[i];
  item.snapshot.source='provided_obd_unverified';
  item.snapshot.measurementContext={
   sessionId:item.sessionId,
   capturedAt:new Date(Date.UTC(2026,9,1+(i<2?0:1),11,i%2*20,0)).toISOString(),
   adapterModel:'Research logger v1',softwareVersion:'MA00 capture v1',
   serviceEventId:'service-001',ambientC:21,clock:'monotonic_observed',
   fuelControl:'closed_loop_observed',ac:'off_observed',
   coolingFan:'stable_observed',electricalLoads:'stable_observed'
  };
 }
 const r=evaluateReplicatedMeasurements(s);
 assert.equal(r.comparable,true,JSON.stringify(r.blockers));
 assert.equal(r.evidenceLevel,'operator_assertions_only');
 assert.equal(r.observedDifferences.syntheticDeviationIndex,null);
 assert.equal(r.baseline.experimentalDeviationIndex,null);
 assert.equal(r.after.experimentalDeviationIndex,null);
 assert.equal(r.causalMaintenanceEffect,null);
 assert.equal(r.confidenceInterval,null);
 assert.ok(Number.isFinite(r.observedDifferences.medianCombinedFuelTrim));
 s[2].snapshot.measurementContext.ac='on_observed';
 const compromised=evaluateReplicatedMeasurements(s);
 assert.equal(compromised.comparable,false);
 assert.equal(compromised.observedDifferences,null);
});
