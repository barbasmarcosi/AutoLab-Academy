import test from 'node:test';
import assert from 'node:assert/strict';
import {MECHANICAL_AGE_VERSION,PROTOCOL,evaluateMechanicalSnapshot,compareMechanicalSnapshots,syntheticServicePair} from '../src/mechanical-age-research.js';

const copy=x=>structuredClone(x);
test('MA v0: reproducible synthetic before/after windows; only functional deviation improves',()=>{
 const {before,after}=syntheticServicePair();
 const pair=compareMechanicalSnapshots(before,after);
 assert.equal(pair.model,MECHANICAL_AGE_VERSION);
 assert.equal(pair.comparable,true,JSON.stringify(pair.blockers));
 assert.equal(pair.before.status,'eligible');
 assert.equal(pair.after.status,'eligible');
 assert.ok(pair.before.deviationIndex>pair.after.deviationIndex);
 assert.ok(pair.deltaDeviationIndex<0);
 assert.equal(pair.before.mechanicalAgeEquivalentKm,null);
 assert.equal(pair.after.structuralWear,null);
 assert.equal(pair.mechanicalAgeChangeKm,null);
 assert.equal(pair.structuralRejuvenationClaim,false);
 assert.deepEqual(syntheticServicePair(),{before,after});
 assert.equal(PROTOCOL,'warm-idle-fixed-load-v0');
});
test('MA v0: no mutation of observational input and all data labeled by provenance',()=>{
 const {before}=syntheticServicePair(),original=copy(before);
 const a=evaluateMechanicalSnapshot(before);
 assert.deepEqual(before,original);
 assert.equal(a.provenance,'synthetic');
 assert.equal(a.remainingUsefulLife,null);
 assert.match(a.indexMeaning,/NO porcentaje/);
});
test('MA v0: rejects incomplete, reordered and implausible observations without silent cleaning',()=>{
 const {before}=syntheticServicePair();
 const changed=f=>{const x=copy(before);f(x);return x;};
 for(const sample of [
  changed(x=>x.samples[4].rpm=NaN),
  changed(x=>x.samples[4].rpm=18000),
  changed(x=>x.samples[4].timeMs=x.samples[3].timeMs),
  changed(x=>x.samples[4].ectC=170),
  changed(x=>delete x.samples[4].stftPct),
  changed(x=>x.samples=x.samples.slice(0,5)),
  changed(x=>x.source='real_obd_verified'),
  changed(x=>x.protocol='custom'),
 ]){
  assert.throws(()=>evaluateMechanicalSnapshot(sample),{name:'RangeError'});
 }
});
test('MA v0: no invented age and no score without trim channels',()=>{
 const {before}=syntheticServicePair();
 const diesel=copy(before);diesel.samples.forEach(s=>{delete s.stftPct;delete s.ltftPct;});
 const x=evaluateMechanicalSnapshot(diesel);
 assert.equal(x.status,'inconclusive');
 assert.equal(x.deviationIndex,null);
 assert.equal(x.mechanicalAgeEquivalentKm,null);
 assert.match(x.exclusion.join(' '),/Faltan STFT/);
});
test('MA v0: protocol rejects off-state snapshots and refuses non comparable pairs',()=>{
 const {before,after}=syntheticServicePair();
 const hot=copy(before);hot.samples.forEach(s=>s.ectC+=30);
 assert.equal(evaluateMechanicalSnapshot(hot).status,'inconclusive');
 assert.equal(evaluateMechanicalSnapshot(hot).deviationIndex,null);
 const different=copy(after);different.vehicleAlias='another-car';
 assert.match(compareMechanicalSnapshots(before,different).blockers.join(' '),/mismo vehículo/);
 const wrong=copy(after);wrong.engineFamily='other-v6';
 const p=compareMechanicalSnapshots(before,wrong);
 assert.equal(p.comparable,false);
 assert.equal(p.deltaDeviationIndex,null);
 assert.match(p.blockers.join(' '),/Familias/);
 const mismatch=copy(after);mismatch.samples.forEach(s=>s.iatC+=15);
 assert.match(compareMechanicalSnapshots(before,mismatch).blockers.join(' '),/admisión/);
 const reverse=compareMechanicalSnapshots(after,before);
 assert.equal(reverse.comparable,false);
});
test('MA v0: local measurement features are not global wear measurements',()=>{
 const {before}=syntheticServicePair();
 const a=evaluateMechanicalSnapshot(before);
 assert.equal(a.sampleCount,40);
 assert.ok(a.elapsedSec>=19);
 assert.ok(a.features.medianCombinedTrimPct>15);
 assert.ok(a.features.rpmRobustSigma>0);
 assert.ok(a.deviationIndex>=0&&a.deviationIndex<=100);
 assert.equal(a.structuralWear,null);
 assert.equal(a.remainingUsefulLife,null);
});
