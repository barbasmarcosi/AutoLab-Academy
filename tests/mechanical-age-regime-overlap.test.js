import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeRegimeOverlap,parseEngineFaultForOverlap,runPinnedEngineFaultBenchmark} from '../tools/benchmark-enginefaultdb.mjs';
const simulated=(effect=0)=>{
 const rows=[];
 for(const [label,low,high] of [[0,80,20],[1,20,80]]){
  for(const [state,n] of [[0,low],[1,high]]){
   for(let i=0;i<n;i++)rows.push({
    Fault:label,RPM:state?2250:850,MAP:state?80:35,TPS:state?55:10,
    CO:2+state*10+(label?effect:0),
    HC:100+state*50+(label?effect:0),
    Lambda:1+state*.1+(label?effect/100:0)
   });
  }
 }
 return rows;
};
test('MA00 raw mean differences disappear after matching the operating regime',()=>{
 const rows=simulated();
 const prior=structuredClone(rows);
 const analysis=analyzeRegimeOverlap(rows,{bins:2,minPerArm:10});
 assert.equal(analysis.rowCount,200);
 assert.equal(analysis.independentEngineCount,1);
 assert.equal(analysis.structuralWear,null);
 assert.equal(analysis.engineAgeKm,null);
 assert.equal(analysis.causalIdentification,false);
 assert.equal(analysis.confidenceIntervals,null);
 const c=analysis.comparisons[1];
 assert.equal(c.rawMeanDelta.CO,6);
 assert.equal(c.matchedRegimeDelta.CO,0);
 assert.equal(c.matchedRegimeDelta.HC,0);
 assert.equal(c.matchedRegimeDelta.Lambda,0);
 assert.equal(c.overlapCells,2);
 assert.equal(c.matchedWeight,40);
 assert.equal(c.interpretationAllowed,true);
 assert.deepEqual(rows,prior);
});
test('MA00 preserves simulated within-regime difference but never claims effect or mechanical wear',()=>{
 const x=analyzeRegimeOverlap(simulated(3),{bins:2,minPerArm:10});
 assert.equal(x.comparisons[1].matchedRegimeDelta.CO,3);
 assert.equal(x.comparisons[1].matchedRegimeDelta.HC,3);
 assert.equal(x.externalValidationAcrossEngines,undefined);
 assert.equal(x.engineAgeKm,null);
 assert.equal(x.pValues,null);
});
test('MA00 unshared operating regimes cannot support interpolation or causal confidence',()=>{
 const rows=simulated();
 rows.filter(x=>x.Fault===1).forEach(x=>{x.RPM+=800;x.MAP+=100;x.TPS+=100;});
 const x=analyzeRegimeOverlap(rows,{bins:2,minPerArm:10});
 assert.equal(x.comparisons[1].matchedRegimeDelta,null);
 assert.equal(x.comparisons[1].matchedWeight,0);
 assert.equal(x.comparisons[1].interpretationAllowed,false);
});
test('MA00 format and numeric guards refuse damaged empirical inputs',()=>{
 assert.throws(()=>parseEngineFaultForOverlap('Fault,RPM,MAP,TPS,CO,HC,Lambda\n0,800,30,10,NaN,4,1'),/Campo inválido/);
 assert.throws(()=>parseEngineFaultForOverlap('RPM,MAP\n800,30'),/Columnas obligatorias/);
 assert.throws(()=>analyzeRegimeOverlap(simulated().slice(0,4)),/8 a 100000/);
 assert.throws(()=>analyzeRegimeOverlap(simulated(),{bins:1}),/Configuración/);
 assert.throws(()=>analyzeRegimeOverlap(simulated().map(x=>({...x,CO:Infinity}))),/no numérica/);
 assert.throws(()=>runPinnedEngineFaultBenchmark('invented.csv'),/source integrity failed/);
});
