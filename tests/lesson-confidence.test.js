import test from'node:test';import assert from'node:assert/strict';
import{CONFIDENCE_MODEL,auditDecisionConfidence,confidenceReport}from'../src/lesson-confidence.js';
test('complete four-choice metacognitive audit uses strictly predeclared levels and gives deterministic squared-error',()=>{
 const rows=[{correct:true,confidence:.95},{correct:false,confidence:.95},{correct:true,confidence:.75},{correct:false,confidence:.5}];
 const a=auditDecisionConfidence(rows);
 assert.equal(a.model,CONFIDENCE_MODEL);
 assert.equal(a.declared,4);assert.equal(a.complete,true);
 assert.equal(a.overconfidentErrors,1);
 assert.ok(Math.abs(a.meanSquaredError-(.05**2+.95**2+.25**2+.5**2)/4)<1e-12);
 assert.match(confidenceReport(a),/95 %/);
 assert.match(confidenceReport(a),/no una estimación fiable/);
 assert.deepEqual(auditDecisionConfidence(rows),a);
});
test('missing confidence is honest and cannot silently become 0.5 or a calibration value',()=>{
 const incomplete=auditDecisionConfidence([
  {correct:true,confidence:null},{correct:false,confidence:.75},{correct:true,confidence:null},{correct:false,confidence:.5}]);
 assert.equal(incomplete.declared,2);assert.equal(incomplete.complete,false);assert.equal(incomplete.meanSquaredError,null);
 assert.equal(incomplete.rows[0].squaredError,null);
 assert.match(confidenceReport(incomplete),/NO CALCULADO/);
 for(const values of [
  [{correct:true,confidence:.95}],Array(4).fill({correct:true,confidence:0}),
  Array(4).fill({correct:true,confidence:NaN}),Array(4).fill({correct:1,confidence:.95}),
  Array(4).fill({correct:true,confidence:'0.95'}),Array(4).fill(null)
 ]) assert.throws(()=>auditDecisionConfidence(values),RangeError);
 assert.throws(()=>confidenceReport({}),RangeError);
});
