import test from 'node:test';
import assert from 'node:assert/strict';
import {runMechanicalAgeFalsification,FALSIFICATION_VERSION} from '../src/mechanical-age-falsification.js';

test('MA00 adversarial controls: synthetic instrumentation can move score without structural wear',()=>{
 const result=runMechanicalAgeFalsification();
 assert.equal(result.version,FALSIFICATION_VERSION);
 assert.equal(result.source,'synthetic_negative_controls');
 assert.equal(result.controls.length,5);
 assert.equal(result.mechanicalAgeInferenceAllowed,false);
 assert.equal(result.passedBehaviorChecks,true,JSON.stringify(result.controls));
 const byId=Object.fromEntries(result.controls.map(x=>[x.id,x]));
 assert.equal(byId.null_control.delta,0);
 assert.ok(byId.trim_bias.delta>0);
 assert.equal(byId.trim_bias.comparisonAllowed,true);
 assert.equal(byId.opposing_trims.delta,0);
 assert.equal(byId.opposing_trims.baselineTrims,byId.opposing_trims.alteredTrims);
 for(const id of ['temperature_confounder','load_confounder']){
  assert.equal(byId[id].comparisonAllowed,false);
  assert.equal(byId[id].delta,null);
 }
 for(const row of result.controls){
  assert.equal(row.structuralWearGroundTruth,null);
  assert.equal(row.causalServiceEffect,null);
  assert.equal(row.behaviorObserved,true);
 }
 assert.match(result.conclusion,/no es identificable/);
});

test('MA00 falsification is reproducible and never returns wear or lifetime',()=>{
 assert.deepEqual(runMechanicalAgeFalsification(),runMechanicalAgeFalsification());
 const text=JSON.stringify(runMechanicalAgeFalsification());
 assert.doesNotMatch(text,/"remainingUsefulLife":\d/);
 assert.doesNotMatch(text,/"mechanicalAgeEquivalentKm":\d/);
});
