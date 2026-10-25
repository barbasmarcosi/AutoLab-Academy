import test from 'node:test';
import assert from 'node:assert/strict';
import{INVESTIGATION_TOPICS,buildDiagnosticTransfer,createDiagnosticTransferSession,getDiagnosticProbe,gradeDiagnosticTransfer,diagnosticTransferReport}from'../src/diagnostic-transfer.js';
const reason='Contrasté la medición confirmatoria con una prueba independiente que excluye una alternativa dentro de este emulador, y usé el contexto operativo para no atribuir la causa al código.';
const limits='Faltan pruebas físicas, esquema OEM y tolerancias de fabricante, de modo que no puedo afirmar que una pieza real esté dañada.';
const good=c=>({initial:c.options.find(x=>x[0]!==c.cause)[0],final:c.cause,reasoning:reason,limits,
 probes:c.probes.filter(x=>!x.unsafe).map(x=>({id:x.id,prediction:x.outcome}))});
test('400 semillas reproducibles: 5 dominios, 2 mecanismos y presentaciones diferentes',()=>{
 const variants=new Map(INVESTIGATION_TOPICS.map(t=>[t,new Set()]));
 for(let seed=1;seed<=400;seed++){
  const s=buildDiagnosticTransfer(seed);assert.deepEqual(s,buildDiagnosticTransfer(seed));
  assert.equal(s.cases.length,5);assert.equal(new Set(s.cases.map(c=>c.topic)).size,5);
  for(const c of s.cases){
   variants.get(c.topic).add(c.cause+':'+c.scenario);
   assert.equal(c.options.length,2);assert.equal(c.probes.length,4);
   assert.equal(c.probes.filter(p=>p.role==='confirm').length,1);
   assert.equal(c.probes.filter(p=>p.role==='exclude').length,1);
   assert.equal(c.probes.filter(p=>p.role==='context').length,1);
   assert.equal(c.probes.filter(p=>p.unsafe).length,1);
   assert(c.probes.every(p=>p.provenance&&p.finding&&p.label));
   assert.match(c.source,/^https:\/\//);
   assert.equal(gradeDiagnosticTransfer(c,good(c)).score,100);
   assert.equal(gradeDiagnosticTransfer(c,good(c)).passed,true);
  }
 }
 for(const [,set] of variants)assert.equal(set.size,4);
});
test('hipótesis equivocada incluso con todas las mediciones no aprueba',()=>{
 for(const c of buildDiagnosticTransfer(17).cases){
  const answer=good(c);answer.final=c.options.find(x=>x[0]!==c.cause)[0];
  const grade=gradeDiagnosticTransfer(c,answer);
  assert.equal(grade.score,60);assert.equal(grade.passed,false);
 }
});
test('sin confirmación, descarte o contexto no aprueba',()=>{
 for(const c of buildDiagnosticTransfer(42).cases){
  for(const role of ['confirm','exclude','context']){
   const a=good(c);a.probes=a.probes.filter(x=>getDiagnosticProbe(c,x.id).role!==role);
   assert.equal(gradeDiagnosticTransfer(c,a).passed,false);
  }
 }
});
test('una prueba insegura anula el resultado',()=>{
 for(const c of buildDiagnosticTransfer(41).cases){
  const a=good(c);a.probes.push({id:'unsafe',prediction:'peligrosa'});
  assert.equal(gradeDiagnosticTransfer(c,a).score,0);
  assert.equal(gradeDiagnosticTransfer(c,a).passed,false);
 }
});
test('texto de evidencia se registra, pero no se revisa semánticamente',()=>{
 const c=buildDiagnosticTransfer(45).cases[0],a=good(c);
 assert.equal(gradeDiagnosticTransfer(c,a).explanationReviewed,false);
 a.reasoning='breve';assert.equal(gradeDiagnosticTransfer(c,a).passed,false);
 a.reasoning=reason;a.limits='sin límites';assert.equal(gradeDiagnosticTransfer(c,a).passed,false);
});
test('se puede reproducir reporte de las variantes con semilla y límites explícitos',()=>{
 const s=createDiagnosticTransferSession(320);
 s.scenario.cases.forEach(c=>{s.answers[c.id]=good(c)});
 const out=diagnosticTransferReport(s,new Date('2026-10-25T20:00:00Z'));
 assert.match(out,/Semilla reproducible: 320/);assert.match(out,/NO evaluada semánticamente/);
 assert.match(out,/Medición sintética/);assert.match(out,/Ninguna conclusión acredita/);
 assert.throws(()=>getDiagnosticProbe(s.scenario.cases[0],'fake'));
});
