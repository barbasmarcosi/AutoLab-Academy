import test from'node:test';
import assert from'node:assert/strict';
import{geometryResearch,geometrySweep,RESEARCH_BENCH_VERSION}from'../src/rotary-research.js';
test('P1b sensibilidad del volumen-proxy: A/B repetible bajo condiciones idénticas',()=>{
 const low=geometryResearch(10),high=geometryResearch(18);
 assert.equal(low.model,RESEARCH_BENCH_VERSION);
 assert.equal(low.direction,'disminuye');
 assert.equal(high.direction,'aumenta');
 assert.equal(low.baseline.swingCm3,high.baseline.swingCm3);
 assert.equal(high.controlled.Rmm,low.controlled.Rmm);
 assert.equal(high.controlled.widthMm,low.controlled.widthMm);
 assert.deepEqual(geometryResearch(18),geometryResearch(18));
});
test('P1b numérica finita y rechazo fail-closed de geometría inviable',()=>{
 const x=geometryResearch(18);
 assert.ok(x.baseline.swingCm3>0&&x.candidate.swingCm3>0);
 assert.ok(x.numericalConvergencePct<1);
 assert.equal(x.candidate.samples.length,73);
 assert.ok(x.candidate.samples.every(s=>Number.isFinite(s.proxyCm3)));
 assert.throws(()=>geometryResearch(NaN),RangeError);
 assert.throws(()=>geometryResearch(100),RangeError);
 assert.throws(()=>geometrySweep(-2),RangeError);
 assert.throws(()=>geometrySweep(35),RangeError);
 assert.throws(()=>geometrySweep(18,4),RangeError);
});
