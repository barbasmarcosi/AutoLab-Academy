import test from 'node:test';
import assert from 'node:assert/strict';
import{buildQuantitativeSession,gradeQuantitative,parseNumericAnswer,formatQuantitativeReport,QUANTITATIVE_TOPICS}from'../src/measurement-challenges.js';
const reason='La medición confirma la hipótesis bajo las condiciones del banco didáctico, con instrumento adecuado y trazabilidad en el registro.';
test('200 semillas generan 5 áreas equilibradas y variantes estables',()=>{
 const seen=new Set();
 for(let seed=1;seed<=200;seed++){
  const a=buildQuantitativeSession(seed);
  assert.deepEqual(a,buildQuantitativeSession(seed));
  assert.equal(a.items.length,5);
  assert.deepEqual([...new Set(a.items.map(q=>q.topic))].sort(),[...QUANTITATIVE_TOPICS].sort());
  assert.equal(new Set(a.items.map(q=>q.id)).size,5);
  for(const q of a.items){
   assert(Number.isFinite(q.expected));
   assert.equal(q.measurementOptions.length,3);
   assert.equal(new Set(q.measurementOptions.map(x=>x.id)).size,3);
   assert.match(q.source,/^https:\/\//);
   const g=gradeQuantitative(q,{value:String(q.expected).replace('.',','),measurement:q.evidenceAnswer,reasoning:reason});
   assert.equal(g.score,100);
   assert.equal(g.meetsAutomaticCriteria,true);
   assert.equal(g.explanationReviewed,false);
   seen.add(q.id+':'+q.expected);
  }
 }
 assert(seen.size>45);
});
test('respuesta numérica correcta sin evidencia no aprueba',()=>{
 const q=buildQuantitativeSession(55).items[0];
 const g=gradeQuantitative(q,{value:String(q.expected),measurement:'other',reasoning:reason});
 assert.equal(g.score,70);assert.equal(g.meetsAutomaticCriteria,false);
});
test('evidencia elegida correcta no compensa un cálculo incorrecto',()=>{
 const q=buildQuantitativeSession(55).items[0];
 const g=gradeQuantitative(q,{value:'no calculado',measurement:q.evidenceAnswer,reasoning:reason});
 assert.equal(g.score,30);assert.equal(g.meetsAutomaticCriteria,false);
});
test('explicación corta no se considera documentación suficiente',()=>{
 const q=buildQuantitativeSession(55).items[0];
 const g=gradeQuantitative(q,{value:String(q.expected),measurement:q.evidenceAnswer,reasoning:'a'});
 assert.equal(g.score,100);assert.equal(g.meetsAutomaticCriteria,false);
});
test('rechaza entradas no finitas, notación científica y separadores ambiguos',()=>{
 for(const input of ['','NaN','Infinity','1e6','12.000,5','1,2.3','3/4'])assert.throws(()=>parseNumericAnswer(input));
 assert.equal(parseNumericAnswer(' 12,5 '),12.5);
 assert.equal(parseNumericAnswer('-.5'),-0.5);
});
test('no se acepta una cifra fuera de la tolerancia publicada',()=>{
 const q=buildQuantitativeSession(12).items[0];
 assert.equal(gradeQuantitative(q,{value:String(q.expected+q.tolerance*2),measurement:q.evidenceAnswer,reasoning:reason}).numericCorrect,false);
});
test('informe conserva semilla y marca revisión humana pendiente',()=>{
 const s=buildQuantitativeSession(42);
 const a=Object.fromEntries(s.items.map(q=>[q.id,{value:String(q.expected),measurement:q.evidenceAnswer,reasoning:reason}]));
 const g=s.items.map(q=>gradeQuantitative(q,a[q.id]));
 const report=formatQuantitativeReport(s,a,g,new Date('2026-10-24T12:00:00Z'));
 assert.match(report,/Semilla reproducible: 42/);
 assert.match(report,/revisión humana/);
 assert.match(report,/Valor esperado/);
});
