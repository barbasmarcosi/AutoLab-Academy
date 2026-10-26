import test from'node:test';import assert from'node:assert/strict';
import{idealOtto,compareIdealOtto,syntheticHeatLedger,thermalExercise,gradeThermalExercise,thermalReport}from'../src/rotary-thermal-research.js';
const reasoning='Un ciclo Otto ideal con la misma gamma tiene eta mayor a compresión superior; el balance sintético es una contabilidad distinta y no predice potencia de un motor Wankel.';
const limits='No hay medición física ni fricción, puertos, combustión, refrigeración real u OEM; se necesita ensayo comparativo independiente.';
test('RW2 propiedades ideales en rangos de r y gamma y energía conservada para 132 casos',()=>{
 for(const gamma of [1.2,1.25,1.3,1.35,1.4,1.45]){
  let previous=0;
  for(let r=5;r<=16;r++){
   const x=idealOtto({compressionRatio:r,gamma,heatInputKw:100});
   assert.ok(x.idealEfficiency>previous&&x.idealEfficiency<1);
   assert.ok(Math.abs(x.idealWorkKw+x.idealRejectedKw-100)<1e-10);
   assert.ok(Math.abs(x.compressedKelvin/300-Math.pow(r,gamma-1))<1e-11);
   assert.ok(Math.abs(x.compressedKpa/101.325-Math.pow(r,gamma))<1e-11);
   previous=x.idealEfficiency;
  }
 }
});
test('RW2 compression comparison is ideal only and range-gated',()=>{
 const x=compareIdealOtto({ratioA:8,ratioB:10,gamma:1.35,heatInputKw:120});
 assert.ok(x.gainPercentagePoints>0);assert.ok(x.idealWorkDifferenceKw>0);
 for(const inp of [{ratioA:10,ratioB:8},{ratioA:8,ratioB:8},{ratioA:4,ratioB:10},{gamma:1}])
  assert.throws(()=>compareIdealOtto(inp),RangeError);
 assert.throws(()=>idealOtto({compressionRatio:8,gamma:Infinity}),RangeError);
});
test('RW3 synthetic ledger conserves exact energy; fails closed on impossible flows',()=>{
 for(const inputKw of [20,100,250,500]){
  for(const n of [0,.1,.27,.7]){
   const l=syntheticHeatLedger({inputKw,brakeKw:inputKw*n,exhaustKw:inputKw*.2,coolantKw:0});
   assert.ok(Math.abs(l.accountedKw-inputKw)<1e-8);
   assert.ok(Math.abs(Object.values(l.shares).reduce((s,x)=>s+x,0)-1)<1e-10);
   assert.equal(l.brakeEfficiency,n);
  }
 }
 const l=syntheticHeatLedger();
 assert.equal(l.unassignedKw,12);
 assert.throws(()=>syntheticHeatLedger({inputKw:100,brakeKw:80,exhaustKw:50,coolantKw:10}),RangeError);
 assert.throws(()=>syntheticHeatLedger({inputKw:100,brakeKw:NaN}),RangeError);
 assert.throws(()=>syntheticHeatLedger({inputKw:-1}),RangeError);
});
test('RW2/RW3 hypothesis prior, semantic limitations, and report provenance',()=>{
 const base={ratioA:8,ratioB:10,gamma:1.35,heatInputKw:100,
  idealPrediction:'aumenta',residualPrediction:'resto',realEnginePrediction:'no',reasoning,limits};
 const exp=thermalExercise(base),grade=gradeThermalExercise(base);
 assert.equal(exp.ledger.unassignedKw,12);
 assert.equal(grade.score,100);assert.equal(grade.passed,true);
 assert.match(thermalReport(base,grade),/synthetic_energy_allocation/);
 assert.match(thermalReport(base,grade),/NO ganancia real/);
 assert.equal(gradeThermalExercise({...base,realEnginePrediction:'si'}).passed,false);
 assert.equal(gradeThermalExercise({...base,reasoning:''}).passed,false);
 assert.throws(()=>gradeThermalExercise({...base,idealPrediction:'unknown'}),RangeError);
});
