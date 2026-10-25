import test from 'node:test';
import assert from 'node:assert/strict';
import{multiFaultCases,verifyMultiFaultCase,evaluateMultiFault,multiFaultReport}from'../src/differential-lab.js';
const reasoning='Las dos anomalías requieren mediciones confirmatorias independientes, ya que una sola hipótesis no explicaría ambos síntomas del banco.';
test('tres casos con dos causas y dos pruebas independientes',()=>{
 assert.equal(multiFaultCases.length,3);
 assert.equal(new Set(multiFaultCases.map(c=>c.id)).size,3);
 for(const c of multiFaultCases)assert.equal(verifyMultiFaultCase(c),true);
});
test('respuesta completa con ambas evidencias logra 100',()=>{
 for(const c of multiFaultCases){
  const used=c.solutions.map(id=>c.probes.find(p=>p.supports.includes(id)).id);
  const r=evaluateMultiFault(c,{selected:c.solutions,used,reasoning});
  assert.equal(r.score,100);assert.equal(r.passed,true);assert.equal(r.evaluatedText,false);
 }
});
test('adivinar ambas causas con una sola medición no aprueba',()=>{
 for(const c of multiFaultCases){
  const r=evaluateMultiFault(c,{selected:c.solutions,used:[c.probes.find(p=>p.supports.includes(c.solutions[0])).id],reasoning});
  assert.equal(r.passed,false);assert.equal(r.score,80);
 }
});
test('elegir una sola causa no aprueba y acción insegura bloquea',()=>{
 for(const c of multiFaultCases){
  const used=c.solutions.map(id=>c.probes.find(p=>p.supports.includes(id)).id);
  assert.equal(evaluateMultiFault(c,{selected:[c.solutions[0]],used,reasoning}).passed,false);
  const unsafe=evaluateMultiFault(c,{selected:c.solutions,used:[...used,'unsafe'],reasoning});
  assert.equal(unsafe.score,0);assert.equal(unsafe.passed,false);
 }
});
test('informe explicita naturaleza sintética y revisión humana',()=>{
 const c=multiFaultCases[0],used=c.solutions.map(id=>c.probes.find(p=>p.supports.includes(id)).id);
 const s={selected:c.solutions,used,reasoning},t=multiFaultReport(c,s,evaluateMultiFault(c,s),new Date('2026-10-24T12:00:00Z'));
 assert.match(t,/revisión humana/);assert(t.includes(c.probes[1].result));assert.match(t,/sintético/);
});
