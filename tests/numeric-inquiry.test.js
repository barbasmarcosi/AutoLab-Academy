import test from'node:test';
import assert from'node:assert/strict';
import{NUMERIC_BENCH_MODEL,NUMERIC_BENCHES,numericBenchFor,computeNumericBench,gradeNumericBench,numericBenchRecord,numericBenchSensitivity}from'../src/numeric-inquiry.js';
const explanation='El modelo usa unidades SI y conserva la fuente ideal. La predicción se basa en una relación calculada y debería revisarse si las condiciones de contorno no corresponden.';
const limitations='Esta evidencia no proviene de un instrumento. Hay errores de tolerancia, temperatura y conexiones que no se modelan ni demuestran aptitud física.';
const fixtures=[
 {lessonId:'voltage-dividers',variant:10,hypothesis:0,falsifier:0,predicted:5/3},
 {lessonId:'rc-input',variant:2,hypothesis:2,falsifier:1,predicted:0.2},
 {lessonId:'current-shunt',variant:12.5,hypothesis:0,falsifier:2,predicted:4},
 {lessonId:'pullups',variant:10,hypothesis:2,falsifier:1,predicted:2.5},
 {lessonId:'actuator-power',variant:50,hypothesis:1,falsifier:2,predicted:6},
 {lessonId:'can',variant:2,hypothesis:2,falsifier:1,predicted:60},
 {lessonId:'resistive-loss',variant:4,hypothesis:0,falsifier:1,predicted:4},
 {lessonId:'mosfet-control',variant:4,hypothesis:1,falsifier:2,predicted:0.8},
 {lessonId:'inductive-load',variant:4,hypothesis:0,falsifier:2,predicted:1.6},
 {lessonId:'ground-reference-network',variant:4,hypothesis:1,falsifier:2,predicted:0.2},
 {lessonId:'dcdc-switches',variant:50,hypothesis:1,falsifier:2,predicted:6}
];
test('eleven independent LV and CAN experiments produce reproducible model output, never instrument claims',()=>{
 assert.equal(NUMERIC_BENCHES.length,11);
 assert.equal(new Set(NUMERIC_BENCHES.map(x=>x.lessonId)).size,11);
 assert.equal(new Set(NUMERIC_BENCHES.map(x=>x.caseId)).size,11);
 assert.equal(numericBenchFor('does-not-exist'),null);
 for(const x of fixtures){
  assert.ok(numericBenchFor(x.lessonId));
  assert.equal(computeNumericBench(x.lessonId,x.variant),x.predicted);
  const args={...x,explanation,limitations};
  const a=gradeNumericBench(args),b=gradeNumericBench(args);
  assert.equal(a.model,NUMERIC_BENCH_MODEL);
  assert.deepEqual(a,b);
  assert.equal(a.score,100);assert.equal(a.passed,true);
  const record=numericBenchRecord(args,a);
  assert.equal(record.id,numericBenchFor(x.lessonId).caseId);
  assert.equal(record.passed,true);
  assert.match(record.report,/NO evaluad[oa] semánticamente/);
  assert.match(record.report,/Sensibilidad PARAMÉTRICA/);
  assert.match(record.report,/Fundamento físico-matemático/);
  assert.match(record.report,/Resultado CALCULADO del modelo/);
  assert.match(record.report,/No equivale a medición/i);
  assert.equal(gradeNumericBench({...args,hypothesis:(x.hypothesis+1)%3}).passed,false);
  assert.equal(gradeNumericBench({...args,falsifier:(x.falsifier+1)%3}).passed,false);
  assert.equal(gradeNumericBench({...args,predicted:x.predicted*1.5}).passed,false);
  assert.throws(()=>gradeNumericBench({...args,variant:-10}),RangeError);
  assert.throws(()=>gradeNumericBench({...args,predicted:NaN}),RangeError);
  assert.throws(()=>gradeNumericBench({...args,predicted:Infinity}),RangeError);
  assert.throws(()=>gradeNumericBench({...args,explanation:'insuficiente'}),RangeError);
  assert.throws(()=>gradeNumericBench({...args,limitations:'insuficiente'}),RangeError);
 }
 assert.throws(()=>computeNumericBench('invalid',10),RangeError);
 assert.throws(()=>numericBenchSensitivity('invalid'),RangeError);
 for(const bench of NUMERIC_BENCHES){
  const series=numericBenchSensitivity(bench.lessonId);
  assert.equal(series.length,3);
  assert.ok(series.every((x,i)=>x.value===bench.options[i].value&&Number.isFinite(x.result)&&x.units===bench.units));
  assert.equal(Object.isFrozen(series),true);
 }
});
test('parameter variation follows the declared ideal causal law for each bench',()=>{
 const d=[5,10,20].map(v=>computeNumericBench('voltage-dividers',v));
 assert.ok(d[0]<d[1]&&d[1]<d[2]&&d[2]<2.5);
 assert.deepEqual([1,2,4].map(v=>computeNumericBench('rc-input',v)),[0.1,0.2,0.4]);
 assert.deepEqual([12.5,20,25].map(v=>computeNumericBench('current-shunt',v)),[4,2.5,2]);
 assert.deepEqual([5,10,20].map(v=>computeNumericBench('pullups',v)),[5/3,2.5,10/3]);
 assert.deepEqual([25,50,75].map(v=>computeNumericBench('actuator-power',v)),[3,6,9]);
 assert.deepEqual([1,2,3].map(v=>computeNumericBench('can',v)),[120,60,40]);
 assert.deepEqual([2,4,6].map(v=>computeNumericBench('resistive-loss',v)),[1,4,9]);
 assert.deepEqual([2,4,6].map(v=>computeNumericBench('mosfet-control',v)),[0.2,0.8,1.8]);
 assert.deepEqual([2,4,6].map(v=>Number(computeNumericBench('inductive-load',v).toFixed(4))),[0.4,1.6,3.6]);
 assert.deepEqual([2,4,6].map(v=>computeNumericBench('ground-reference-network',v)),[0.1,0.2,0.30000000000000004]);
 assert.deepEqual([25,50,75].map(v=>computeNumericBench('dcdc-switches',v)),[3,6,9]);
 const single={lessonId:'can',variant:1,hypothesis:2,falsifier:1,predicted:120,explanation,limitations};
 assert.equal(gradeNumericBench(single).passed,true);
 assert.throws(()=>gradeNumericBench({...single,predicted:Infinity}),RangeError);
});
