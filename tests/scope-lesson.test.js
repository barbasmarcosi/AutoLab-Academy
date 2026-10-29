import test from'node:test';import assert from'node:assert/strict';
import{SCOPE_BASELINE,evaluateScopeBaseline,scopeDisplayModel,scopeTheoryIllustration}from'../src/scope-lesson.js';
test('lesson 3: a complete ungraded prerequisite diagnosis has specific misconceptions and feedback',()=>{
 assert.equal(SCOPE_BASELINE.length,4);
 const good=Object.fromEntries(SCOPE_BASELINE.map(q=>[q.id,q.answer]));
 assert.equal(evaluateScopeBaseline(good).filter(x=>x.correct).length,4);
 const poor=Object.fromEntries(SCOPE_BASELINE.map(q=>[q.id,(q.answer+1)%3]));
 assert.equal(evaluateScopeBaseline(poor).filter(x=>x.correct).length,0);
 assert.throws(()=>evaluateScopeBaseline({}),RangeError);
 assert.throws(()=>evaluateScopeBaseline({...good,period:99}),RangeError);
 assert.match(scopeTheoryIllustration(),/200 Hz/);
 assert.match(scopeTheoryIllustration(),/masa/);
});
test('lesson 3: scope display calibration alters on-screen divisions, never the synthetic signal',()=>{
 const root=scopeDisplayModel();
 assert.equal(root.frequencyHz,200);assert.equal(root.periodMs,5);
 assert.equal(root.peakToPeakV,2.4);assert.equal(root.periodDiv,5);
 assert.equal(root.amplitudeDiv,2.4);assert.equal(root.offsetV,2.5);
 for(const timeDiv of [0.5,1,2]){
  for(const voltsDiv of [0.5,1,2]){
   for(const referenceOffset of [-1,0,1]){
    for(const trigger of ['stable','free']){
     const m=scopeDisplayModel({timeDiv,voltsDiv,referenceOffset,trigger});
     assert.equal(m.periodMs,root.periodMs);
     assert.equal(m.frequencyHz,root.frequencyHz);
     assert.equal(m.peakToPeakV,root.peakToPeakV);
     assert.equal(m.periodDiv,5/timeDiv);
     assert.equal(m.amplitudeDiv,2.4/voltsDiv);
     assert.equal(m.offsetV,2.5+referenceOffset);
     assert.equal(m.triggerStable,trigger==='stable');
     assert.match(m.warning,/no implica/i);
     assert.equal(Object.isFrozen(m),true);
    }
   }
  }
 }
 for(const settings of [{timeDiv:0},{voltsDiv:-1},{trigger:'bad'},{referenceOffset:1.5}]){
  assert.throws(()=>scopeDisplayModel(settings),RangeError);
 }
});
