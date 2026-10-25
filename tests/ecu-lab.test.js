import test from 'node:test';
import assert from 'node:assert/strict';
import {ecuCases,validateEcuCase,evaluateEcu,ecuReport} from '../src/ecu-lab.js';
const reasoning='Analicé un síntoma con medición de banco y comparé cada hipótesis con una predicción comprobable, sin condenar un controlador por su código aislado.';
test('cinco ejercicios ECU con identificadores y tópicos únicos',()=>{
 assert.equal(ecuCases.length,5);
 assert.equal(new Set(ecuCases.map(x=>x.topic)).size,5);
 assert.equal(new Set(ecuCases.map(x=>x.id)).size,5);
 for(const c of ecuCases){assert.equal(validateEcuCase(c),true);assert.match(c.source,/^https:\/\//);}
});
test('hipótesis acertada + prueba confirmatoria + predicción + explicación dan 100',()=>{
 for(const c of ecuCases){
  const p=c.probes.find(x=>x.supports.includes(c.solution));
  const result=evaluateEcu(c,{initial:c.solution,final:c.solution,observations:[{id:p.id,prediction:p.observed}],reasoning});
  assert.equal(result.score,100);assert.equal(result.passed,true);assert.equal(result.reasoningReviewed,false);
 }
});
test('sin evidencia confirmatoria, la hipótesis acertada no aprueba',()=>{
 for(const c of ecuCases){
  const p=c.probes.find(x=>!x.unsafe&&!x.supports.length);
  const r=evaluateEcu(c,{final:c.solution,observations:[{id:p.id,prediction:p.observed}],reasoning});
  assert.equal(r.evidence,false);assert.equal(r.passed,false);
 }
});
test('una acción insegura invalida hasta un diagnóstico bien fundamentado',()=>{
 for(const c of ecuCases){
  const p=c.probes.find(x=>x.supports.includes(c.solution));
  const r=evaluateEcu(c,{final:c.solution,observations:[{id:p.id,prediction:p.observed},{id:'unsafe',prediction:'normal'}],reasoning});
  assert.equal(r.score,0);assert.equal(r.passed,false);
 }
});
test('informe documenta predicción, observación, fuente y limitación',()=>{
 const c=ecuCases[0],p=c.probes.find(x=>x.supports.includes(c.solution));
 const s={initial:c.solution,final:c.solution,observations:[{id:p.id,prediction:p.observed}],reasoning};
 const t=ecuReport(c,s,evaluateEcu(c,s),new Date('2026-10-24T12:00:00Z'));
 assert.match(t,/previsto abnormal/);assert.match(t,/revisión humana/);assert.match(t,/sintéticos/);
});
