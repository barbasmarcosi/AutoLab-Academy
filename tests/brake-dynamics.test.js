import test from'node:test';import assert from'node:assert/strict';
import{idealBrakeCase,compareIdealBraking,gradeBrakeInvestigation,brakeResearchReport}from'../src/brake-dynamics.js';
const params={massKg:1500,speedKmh:60,mu:.6,reactionSeconds:1};
const reasoning='La energía y la distancia ideal de frenado son proporcionales al cuadrado de la velocidad, mientras el límite ideal por adherencia elimina el término de masa.';
const limitations='Modelo ideal sin ABS, pendiente, carga dinámica, temperatura, neumáticos reales o incertidumbre de reacción humana.';
test('MC08: SI exacto, 100 combinaciones de masa y velocidad, relaciones 4:1 y 2:1',()=>{
 for(const massKg of [600,850,1100,1500,2000,2800,3500]){
  for(const speedKmh of [10,20,30,40,60,80,90]){
   for(const mu of [.2,.5,.8,1.2]){
    const p={massKg,speedKmh,mu,reactionSeconds:1.2},x=compareIdealBraking(p);
    assert.ok(Math.abs(x.energyRatio-4)<1e-11);
    assert.ok(Math.abs(x.idealBrakingRatio-4)<1e-11);
    assert.ok(Math.abs(x.reactionRatio-2)<1e-11);
    assert.ok(Math.abs(x.baseline.idealDecelerationMs2-mu*9.80665)<1e-12);
   }
  }
 }
});
test('MC08: masa no cambia distancia ideal a μ fijo, sí energía',()=>{
 const a=idealBrakeCase({...params,massKg:900}),b=idealBrakeCase({...params,massKg:1800});
 assert.equal(a.idealBrakingM,b.idealBrakingM);
 assert.equal(b.energyJ/a.energyJ,2);
});
test('MC08: prerequisitos, evaluación y reporte sin confundir seguridad real',()=>{
 const c={params,energyPrediction:'quadruple',distancePrediction:'quadruple',massPrediction:'same',reasoning,limitations};
 const g=gradeBrakeInvestigation(c);assert.equal(g.score,100);assert.equal(g.passed,true);
 assert.match(brakeResearchReport(c,g),/derived_from_ideal_physics/);
 assert.equal(gradeBrakeInvestigation({...c,distancePrediction:'same'}).passed,false);
 assert.equal(gradeBrakeInvestigation({...c,reasoning:'no'}).passed,false);
 for(const x of [{...params,mu:0},{...params,massKg:0},{...params,speedKmh:200},{...params,reactionSeconds:Infinity}])assert.throws(()=>idealBrakeCase(x),RangeError);
 assert.throws(()=>compareIdealBraking({...params,speedKmh:120}),RangeError);
});

test('MC08 tiempo de reacción cero no genera razón numérica espuria',()=>{
 const c=compareIdealBraking({...params,reactionSeconds:0});
 assert.equal(c.baseline.reactionM,0);assert.equal(c.reactionRatio,null);
});
