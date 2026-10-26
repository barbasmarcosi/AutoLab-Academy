import test from'node:test';
import assert from'node:assert/strict';
import{publicMetrologyCase,simulateMetrology,evaluateMetrology,metrologyReport}from'../src/metrology-research.js';
const reasoning='Las dos series comparten el mismo instrumento y el sesgo calibrado es correlacionado; comparo B menos A frente a dos incertidumbres combinadas sin sobrecontarlo.';
const limits='Son datos simulados sin trazabilidad ni calibración física; k igual a dos no prueba cobertura exacta con solo cinco repeticiones.';
test('MC01: estabilidad numérica, incertidumbre tipo A y B, sesgo compartido para 500 semillas',()=>{
 for(let seed=1;seed<=500;seed++){
  assert.equal(publicMetrologyCase(seed).seed,seed);
  for(const inst of ['dial','micro']){
   const v=simulateMetrology(seed,inst);
   assert.deepEqual(v,simulateMetrology(seed,inst));
   assert.equal(v.seriesA.length,5);
   assert.equal(v.seriesB.length,5);
   assert.ok(v.uAA>=0&&v.uAB>=0&&v.uResolution>0&&v.uCalibration>0);
   assert.ok(v.uSingleA>=v.uCalibration&&v.uSingleB>=v.uCalibration);
   assert.ok(Math.abs(v.uDifference-Math.hypot(v.uAA,v.uAB,v.uResolution,v.uResolution))<1e-12);
   assert.ok(Math.abs(v.difference-(v.meanB-v.meanA))<1e-12);
   const session={seed,instrumentId:inst,prediction:v.conclusion,decision:v.conclusion,reasoning,limits};
   const e=evaluateMetrology(session);
   assert.equal(e.passed,true);assert.equal(e.score,100);
   assert.match(metrologyReport(session,e),/synthetic_measurement/);
  }
 }
});
test('MC01: instrumento afecta detectabilidad; umbral k=2 no se atribuye a confianza',()=>{
 let differing=0;
 for(let seed=2;seed<=200;seed+=2){
  const coarse=simulateMetrology(seed,'dial'),fine=simulateMetrology(seed,'micro');
  if(coarse.conclusion!==fine.conclusion)differing++;
 }
 assert.ok(differing>5);
 assert.match(simulateMetrology(2,'dial').limits,/no nivel de confianza/);
});
test('MC01: fallas cerradas e incompleto no aprueba',()=>{
 assert.throws(()=>simulateMetrology(0,'dial'),RangeError);
 assert.throws(()=>simulateMetrology(1,'wrong'),RangeError);
 assert.throws(()=>simulateMetrology(NaN,'dial'),RangeError);
 assert.throws(()=>evaluateMetrology({seed:1,instrumentId:'dial',prediction:'foo',decision:'inconclusive',reasoning,limits}),RangeError);
 const x=simulateMetrology(1,'dial');
 const session={seed:1,instrumentId:'dial',prediction:x.conclusion,decision:x.conclusion,reasoning:'nada',limits};
 assert.equal(evaluateMetrology(session).passed,false);
 assert.equal(evaluateMetrology({...session,reasoning,decision:x.conclusion==='resolvable'?'inconclusive':'resolvable'}).passed,false);
});
