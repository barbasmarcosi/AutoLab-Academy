import test from'node:test';import assert from'node:assert/strict';
import{convectiveHeatRate,compareConvectiveSurfaces,gradeConvection,convectionReport}from'../src/rotary-heat-transfer.js';
const reason='Q es proporcional al área y al coeficiente convectivo manteniendo constante la diferencia de temperatura, de modo que una menor superficie no asegura menor calor transferido.';
const limits='El coeficiente h y la temperatura son ficticios y uniformes; CFD y mediciones físicas serían necesarias para un motor Wankel real.';
test('RW5 dimensional energy balance and monotonic invariants for 100 synthetic cases',()=>{
 for(const area of [.01,.1,.2,.5,1]){
  for(const h of [10,50,100,200,500]){
   for(const dT of [0,10,100,400]){
    const s=convectiveHeatRate({surfaceM2:area,coefficientWm2K:h,deltaKelvin:dT});
    assert.ok(Math.abs(s.heatWatts-h*area*dT)<1e-8);
    assert.ok(Math.abs(s.heatKw-s.heatWatts/1000)<1e-12);
    assert.equal(s.provenance,'derived_from_lumped_heat_transfer');
   }
  }
 }
});
test('RW5 demonstrates h can reverse surface-area-only prediction',()=>{
 const low=compareConvectiveSurfaces(200),high=compareConvectiveSurfaces(400);
 assert.equal(low.baseline.heatKw,9);assert.equal(low.candidate.heatKw,6);
 assert.equal(high.candidate.heatKw,12);
 assert.equal(low.direction,'disminuye');assert.equal(high.direction,'aumenta');
 assert.ok(low.areaChangePct<0&&high.areaChangePct<0);
 assert.ok(Math.abs(low.changePct+100/3)<1e-10);
 assert.ok(Math.abs(high.changePct-100/3)<1e-10);
});
test('RW5 negative tests, forced uncertainty and report provenance',()=>{
 assert.throws(()=>compareConvectiveSurfaces(300),RangeError);
 assert.throws(()=>convectiveHeatRate({surfaceM2:0,coefficientWm2K:1,deltaKelvin:0}),RangeError);
 assert.throws(()=>convectiveHeatRate({surfaceM2:1,coefficientWm2K:NaN,deltaKelvin:10}),RangeError);
 const base={candidateCoefficient:400,prediction:'aumenta',realEnginePrediction:'no',reasoning:reason,limits};
 const g=gradeConvection(base);
 assert.equal(g.score,100);assert.equal(g.passed,true);
 assert.match(convectionReport(base,g),/derived_from_lumped_heat_transfer/);
 assert.equal(gradeConvection({...base,realEnginePrediction:'si'}).passed,false);
 assert.equal(gradeConvection({...base,prediction:'disminuye'}).passed,false);
 assert.equal(gradeConvection({...base,limits:'no'}).passed,false);
});
