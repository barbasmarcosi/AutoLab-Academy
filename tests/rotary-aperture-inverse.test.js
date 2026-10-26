import test from'node:test';import assert from'node:assert/strict';
import{circularApertureFraction}from'../src/rotary-aperture.js';
import{inverseCircularApertureFraction,recoverOpeningInterval,normalizedApertureSensitivity,
 inverseApertureStudy,gradeInverseAperture,inverseApertureReport}from'../src/rotary-aperture-inverse.js';
const reasoning='La apertura circular parcial no es lineal, de modo que un mismo margen de error de área da un intervalo de apertura más ancho cuando el borde está casi cerrado y la sensibilidad geométrica es muy baja.';
const limits='El intervalo es una cota determinista inventada y no un presupuesto GUM ni una medición física. No existe relación calibrada con la posición angular del rotor.';
test('RW6++ exact inverse recovers 997 forward geometric fractions, with boundaries',()=>{
 assert.equal(inverseCircularApertureFraction(0),0);
 assert.equal(inverseCircularApertureFraction(1),1);
 for(let i=2;i<=998;i++){
  const u=i/1000;
  const inv=inverseCircularApertureFraction(circularApertureFraction(u));
  assert.ok(Math.abs(inv-u)<3e-11,'inverse at u='+u+' -> '+inv);
 }
});
test('RW6++ bounded area intervals contain their nominal estimate and scale with radius squared',()=>{
 for(const r of [10,20,40]){
  const full=Math.PI*r*r;
  for(const u of [.05,.25,.5,.75,.95]){
   const m=circularApertureFraction(u)*full;
   const x=recoverOpeningInterval({radiusMm:r,observedAreaMm2:m,toleranceMm2:.02*full});
   assert.ok(x.lowerOpeningFraction<=u+1e-12&&u<=x.upperOpeningFraction+1e-12);
   assert.ok(Math.abs(x.inferredFraction-u)<1e-10);
   assert.ok(x.openingIntervalWidth>0&&x.openingIntervalWidth<=1);
  }
 }
 const a=inverseApertureStudy({radiusMm:10}),b=inverseApertureStudy({radiusMm:20});
 assert.ok(Math.abs(a.inferredFraction-b.inferredFraction)<1e-12);
 assert.ok(Math.abs(4*a.observedAreaMm2-b.observedAreaMm2)<1e-10);
});
test('RW6++ synthetic bias exceeding assumed tolerance invalidates coverage, fail closed',()=>{
 const covered=inverseApertureStudy({trueOpeningFraction:.25,biasFraction:.01,toleranceFraction:.02});
 const missed=inverseApertureStudy({trueOpeningFraction:.25,biasFraction:.04,toleranceFraction:.02});
 assert.equal(covered.coverage,true);assert.equal(missed.coverage,false);
 assert.ok(covered.nearEdgeIntervalWidth>covered.centerIntervalWidth);
 assert.ok(normalizedApertureSensitivity(.05)<normalizedApertureSensitivity(.5));
 assert.equal(normalizedApertureSensitivity(0),0);
 assert.equal(normalizedApertureSensitivity(1),0);
 const inp={radiusMm:20,trueOpeningFraction:.25,biasFraction:.04,toleranceFraction:.02,
  predictedCoverage:'no',predictedSensitivity:'borde',predictedPhysical:'no',reasoning,limits};
 const grade=gradeInverseAperture(inp);
 assert.equal(grade.score,100);assert.equal(grade.passed,true);
 assert.match(inverseApertureReport(inp,grade),/synthetic_deterministic_inverse_interval/);
 assert.equal(gradeInverseAperture({...inp,predictedCoverage:'si'}).passed,false);
 assert.equal(gradeInverseAperture({...inp,predictedSensitivity:'centro'}).passed,false);
 assert.equal(gradeInverseAperture({...inp,predictedPhysical:'si'}).passed,false);
 assert.equal(gradeInverseAperture({...inp,reasoning:''}).passed,false);
});
test('RW6++ corrupted geometries, impossible measurements and invalid hypotheses are rejected',()=>{
 assert.throws(()=>inverseCircularApertureFraction(-.1),RangeError);
 assert.throws(()=>inverseCircularApertureFraction(NaN),RangeError);
 assert.throws(()=>inverseCircularApertureFraction(.5,8),RangeError);
 assert.throws(()=>recoverOpeningInterval({radiusMm:20,observedAreaMm2:99999,toleranceMm2:0}),RangeError);
 assert.throws(()=>recoverOpeningInterval({radiusMm:20,observedAreaMm2:20,toleranceMm2:-1}),RangeError);
 assert.throws(()=>recoverOpeningInterval({radiusMm:20,observedAreaMm2:20,toleranceMm2:999}),RangeError);
 assert.throws(()=>inverseApertureStudy({radiusMm:20,trueOpeningFraction:1.2}),RangeError);
 assert.throws(()=>gradeInverseAperture({predictedCoverage:'?',predictedSensitivity:'?',predictedPhysical:'?'}),RangeError);
});
