import test from 'node:test';
import assert from 'node:assert/strict';
import{TRANSFER_CASES,TRANSFER_TOPICS,buildTransferSession,parseTransferNumber,gradeTransfer,evaluateTransferSession,transferReport}from'../src/transfer-exercises.js';
const why='Mediría las dos magnitudes del banco bajo la misma condición, cuidaría la conversión de unidades y contrastaría la relación matemática con una fuente independiente.';
test('200 semillas: reproducibilidad y dos formulaciones para 5 especialidades',()=>{
 const seen=new Set();
 for(let seed=1;seed<=200;seed++){
  const a=buildTransferSession(seed),b=buildTransferSession(seed);
  assert.deepEqual(a,b);assert.equal(a.pairs.length,5);
  assert.deepEqual(new Set(a.pairs.map(p=>p.topic)),new Set(TRANSFER_TOPICS));
  for(const p of a.pairs){
   assert.equal(p.steps.length,2);assert.equal(p.steps[0].phase,'guided');assert.equal(p.steps[1].phase,'transfer');
   assert.notEqual(p.steps[0].unit,p.steps[1].unit);
   for(const item of p.steps){
    assert(item.expected>0&&Number.isFinite(item.expected));
    assert.equal(item.evidenceOptions.length,3);
    assert.equal(new Set(item.evidenceOptions.map(x=>x.id)).size,3);
    assert.match(item.source,/^https:\/\//);
    const grade=gradeTransfer(item,{value:String(item.expected).replace('.',','),evidence:'relevant',reasoning:why});
    assert.equal(grade.score,100);assert.equal(grade.meetsAutomaticCriteria,true);assert.equal(grade.textReviewed,false);
    seen.add(item.id+':'+item.expected);
   }
  }
 }
 assert(seen.size>100);assert.equal(TRANSFER_CASES.length,5);
});
test('un acierto numérico sin elección de evidencia no aprueba',()=>{
 const q=buildTransferSession(12).pairs[0].steps[1];
 const g=gradeTransfer(q,{value:String(q.expected),evidence:'other',reasoning:'insuficiente'});
 assert.equal(g.score,70);assert.equal(g.meetsAutomaticCriteria,false);
});
test('instrumento acertado no convierte error de cálculo en acierto y se rechazan datos inválidos',()=>{
 const q=buildTransferSession(20).pairs[0].steps[1];
 assert.equal(gradeTransfer(q,{value:'-999999',evidence:'relevant',reasoning:why}).score,30);
 for(const v of ['Infinity','NaN','1e6','0,1,2','--1','', '3 kg'])assert.throws(()=>parseTransferNumber(v));
 assert.equal(parseTransferNumber('1,25'),1.25);
});
test('aprobar la práctica guiada no implica aprobar la transferencia',()=>{
 const s=buildTransferSession(13),answers={};
 for(const p of s.pairs){
  answers[p.steps[0].id]={value:String(p.steps[0].expected),evidence:'relevant',reasoning:why};
  answers[p.steps[1].id]={value:'-1',evidence:'relevant',reasoning:why};
 }
 assert.equal(evaluateTransferSession(s,answers).guidedPassed,5);
 assert.equal(evaluateTransferSession(s,answers).transferPassed,0);
 for(const p of s.pairs)answers[p.steps[1].id]={value:String(p.steps[1].expected),evidence:'relevant',reasoning:why};
 assert.equal(evaluateTransferSession(s,answers).transferPassed,5);
});
test('reporte enumera semilla, fórmulas, evidencia y limitación de alcance',()=>{
 const s=buildTransferSession(44),answers={};
 for(const p of s.pairs)for(const i of p.steps)answers[i.id]={value:String(i.expected),evidence:'relevant',reasoning:why};
 const result=evaluateTransferSession(s,answers);
 const text=transferReport(s,answers,result,new Date('2026-10-25T12:00:00Z'));
 assert.match(text,/Semilla reproducible: 44/);assert.match(text,/Nueva situación/);
 assert.match(text,/No hay certificación/);assert.match(text,/5\/5/);
});
