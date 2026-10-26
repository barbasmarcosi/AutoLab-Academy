import test from'node:test';import assert from'node:assert/strict';
import{circularApertureFraction}from'../src/rotary-aperture.js';
import{radiusOpeningEnvelope,radiusAmbiguityStudy,radiusAmbiguityReport,RADIUS_MODEL}from'../src/rotary-aperture-radius.js';
import{recoverOpeningInterval}from'../src/rotary-aperture-inverse.js';
test('RW6+++ zero radius band reproduces the one-radius inverse exactly',()=>{
 for(const r of [10,20,40])for(const u of [0,.001,.05,.25,.5,.75,.95,.999,1]){
  const full=Math.PI*r*r,observed=full*circularApertureFraction(u),tol=.015*full;
  const y=radiusOpeningEnvelope({radiusMm:r,relativeRadiusBound:0,observedAreaMm2:observed,toleranceMm2:tol});
  const x=recoverOpeningInterval({radiusMm:r,observedAreaMm2:observed,toleranceMm2:tol});
  assert.equal(y.failClosed,false);
  assert.ok(Math.abs(y.lowerOpeningFraction-x.lowerOpeningFraction)<1e-11);
  assert.ok(Math.abs(y.upperOpeningFraction-x.upperOpeningFraction)<1e-11);
 }
});
test('RW6+++ radius interval is an exact, conservative superset and widens monotonically',()=>{
 for(const r of [10,20,40])for(const u of [.01,.25,.5,.75,.99]){
  const a=Math.PI*r*r*circularApertureFraction(u),tol=.02*Math.PI*r*r;
  const envelopes=[0,.02,.05,.1,.2].map(relativeRadiusBound=>
   radiusOpeningEnvelope({radiusMm:r,relativeRadiusBound,observedAreaMm2:a,toleranceMm2:tol}));
  for(let i=1;i<envelopes.length;i++){
   const prev=envelopes[i-1],next=envelopes[i];
   assert.ok(next.lowerOpeningFraction<=prev.lowerOpeningFraction+1e-12);
   assert.ok(next.upperOpeningFraction>=prev.upperOpeningFraction-1e-12);
   assert.ok(next.openingIntervalWidth>=prev.openingIntervalWidth-1e-12);
   assert.ok(next.lowerOpeningFraction<=u+1e-12&&next.upperOpeningFraction>=u-1e-12);
  }
 }
});
test('RW6+++ rectangle grid points physically satisfying area bounds lie in projected interval',()=>{
 const r0=20,area=Math.PI*r0*r0*circularApertureFraction(.4),tolerance=25;
 const y=radiusOpeningEnvelope({radiusMm:r0,relativeRadiusBound:.15,observedAreaMm2:area,toleranceMm2:tolerance});
 let count=0;
 for(let ri=0;ri<=80;ri++)for(let ui=0;ui<=100;ui++){
  const r=17+ri*(6/80),u=ui/100,observation=Math.PI*r*r*circularApertureFraction(u);
  if(Math.abs(observation-area)<=tolerance+1e-9){
   count++;
   assert.ok(u>=y.lowerOpeningFraction-1e-12&&u<=y.upperOpeningFraction+1e-12);
  }
 }
 assert.ok(count>20);
});
test('RW6+++ impossible observations fail closed rather than silently saturating',()=>{
 const x=radiusOpeningEnvelope({radiusMm:20,relativeRadiusBound:.05,observedAreaMm2:1900,toleranceMm2:5});
 assert.equal(x.failClosed,true);assert.equal(x.feasible,false);assert.equal(x.lowerOpeningFraction,null);
 assert.equal(x.upperOpeningFraction,null);
 assert.equal(radiusAmbiguityStudy().contradict.failClosed,true);
});
test('RW6+++ synthetic bias, scenario report and parameter validation',()=>{
 const s=radiusAmbiguityStudy();
 assert.equal(s.model,RADIUS_MODEL);
 assert.equal(s.truthCovered,true); // Unknown radius can absorb a biased observation; this is not evidence of calibration.
 assert.equal(radiusAmbiguityStudy({radiusBandFraction:.01}).truthCovered,false);
 assert.ok(s.boundedRadius.openingIntervalWidth>=s.fixed.openingIntervalWidth);
 assert.ok(s.widened.openingIntervalWidth>=s.boundedRadius.openingIntervalWidth);
 assert.match(radiusAmbiguityReport({radiusMm:20,radiusBandFraction:.05,trueOpeningFraction:.25,biasFraction:.04,toleranceFraction:.02}),/failClosed=true/);
 for(const invalid of [
  {radiusMm:0,relativeRadiusBound:0,observedAreaMm2:4,toleranceMm2:1},
  {radiusMm:20,relativeRadiusBound:-.01,observedAreaMm2:4,toleranceMm2:1},
  {radiusMm:20,relativeRadiusBound:.21,observedAreaMm2:4,toleranceMm2:1},
  {radiusMm:20,relativeRadiusBound:0,observedAreaMm2:NaN,toleranceMm2:1},
  {radiusMm:20,relativeRadiusBound:0,observedAreaMm2:4,toleranceMm2:-1},
  {radiusMm:20,relativeRadiusBound:0,observedAreaMm2:4,toleranceMm2:999}
 ])assert.throws(()=>radiusOpeningEnvelope(invalid),RangeError);
});
