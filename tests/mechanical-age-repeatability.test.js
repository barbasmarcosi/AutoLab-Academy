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
 assert.throws(()=>evaluateReplicatedMeasurements(same),/idénticos registros/);
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
test('MA00: externally provided observational sessions remain unscored and noncausal',()=>{
 const s=syntheticReplicatedServiceCase();
 for(const item of s)item.snapshot.source='provided_obd_unverified';
 const r=evaluateReplicatedMeasurements(s);
 assert.equal(r.comparable,true);
 assert.equal(r.observedDifferences.syntheticDeviationIndex,null);
 assert.equal(r.baseline.experimentalDeviationIndex,null);
 assert.equal(r.after.experimentalDeviationIndex,null);
 assert.equal(r.causalMaintenanceEffect,null);
 assert.ok(Number.isFinite(r.observedDifferences.medianCombinedFuelTrim));
});
