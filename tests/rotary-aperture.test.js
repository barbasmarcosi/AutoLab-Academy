import test from'node:test';import assert from'node:assert/strict';
import{circularApertureFraction,apertureArea,circularAreaMidpoint,apertureStudy,gradeAperture,apertureReport}from'../src/rotary-aperture.js';
const reasoning='Las áreas máximas nominales de círculo y rectángulo son idénticas, pero al descubrir un borde recto sus secciones abiertas siguen relaciones distintas. La comparación controla área total y evalúa exclusivamente geometría bidimensional.';
const limits='No hay rotor ni portado Wankel real, movimiento angular calibrado, gases compresibles o diferencial de presión. El modelo bidimensional no infiere potencia ni eficiencia.';
test('RW6+ circle segment exact boundaries, symmetry and quarter aperture predictions',()=>{
 for(let i=0;i<=1000;i++){
  const u=i/1000,f=circularApertureFraction(u);
  assert.ok(f>=0&&f<=1,'bounds at '+u);
  assert.ok(Math.abs(f+circularApertureFraction(1-u)-1)<1e-12);
  if(i)assert.ok(f>=circularApertureFraction((i-1)/1000));
 }
 assert.equal(circularApertureFraction(0),0);
 assert.equal(circularApertureFraction(1),1);
 assert.equal(circularApertureFraction(.5),.5);
 assert.equal(apertureStudy({openFraction:.25}).prediction,'rectangular');
 assert.equal(apertureStudy({openFraction:.75}).prediction,'circular');
 assert.equal(apertureStudy({openFraction:.5}).prediction,'igual');
});
test('RW6+ units, common full area, numerical convergence at port edges',()=>{
 for(const r of [5,20,60]){
  for(const u of [.05,.2,.25,.5,.75,.95]){
   const a=apertureStudy({radiusMm:r,openFraction:u,steps:128});
   assert.ok(Math.abs(a.circular.fullAreaMm2-a.rectangle.fullAreaMm2)<1e-10);
   assert.ok(Math.abs(a.circular.openAreaMm2+a.circular.closedAreaMm2-a.circular.fullAreaMm2)<1e-9);
   assert.ok(a.refinedErrorMm2<a.absoluteErrorMm2);
   assert.ok(a.refinedErrorMm2/a.circular.fullAreaMm2 <.0003);
  }
 }
 const a=apertureStudy({radiusMm:20,openFraction:.25});
 const scaled=apertureStudy({radiusMm:40,openFraction:.25});
 assert.ok(Math.abs(scaled.circular.openAreaMm2-4*a.circular.openAreaMm2)<1e-8);
 assert.ok(Math.abs(scaled.rectangle.openAreaMm2-4*a.rectangle.openAreaMm2)<1e-8);
});
test('RW6+ invalid geometry, quadrature, false claims and evidence guard fail-closed',()=>{
 for(const params of [{radiusMm:0,openFraction:.5},{radiusMm:20,openFraction:-.1},{radiusMm:20,openFraction:2},{radiusMm:Infinity,openFraction:.5},{radiusMm:20,openFraction:.5,shape:'unknown'}]){
  assert.throws(()=>apertureArea(params),RangeError);
 }
 assert.throws(()=>circularAreaMidpoint({radiusMm:20,openFraction:.25,steps:7}),RangeError);
 assert.throws(()=>circularAreaMidpoint({radiusMm:20,openFraction:.25,steps:100000}),RangeError);
 const s={radiusMm:20,openFraction:.25,steps:256,predictedArea:'rectangular',predictedPhysical:'no',reasoning,limits};
 const grade=gradeAperture(s);
 assert.equal(grade.score,100);assert.equal(grade.passed,true);
 assert.match(apertureReport(s,grade),/analytical_2d_occlusion_geometry/);
 assert.equal(gradeAperture({...s,predictedPhysical:'si'}).passed,false);
 assert.equal(gradeAperture({...s,predictedArea:'circular'}).passed,false);
 assert.equal(gradeAperture({...s,reasoning:''}).passed,false);
 assert.throws(()=>gradeAperture({...s,predictedArea:'unexpected'}),RangeError);
});
