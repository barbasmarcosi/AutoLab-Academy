import test from 'node:test';
import assert from 'node:assert/strict';
import {cases} from '../src/content.js';
import {additionalCases} from '../src/cases-advanced.js';
import {assessCase,caseReport,validateScenario} from '../src/workshop-engine.js';
const all=[...cases,...additionalCases];
test('E2: 15 escenarios únicos y estructurados',()=>{
  assert.equal(all.length,15);
  assert.equal(new Set(all.map(x=>x.id)).size,all.length);
  for(const c of all) assert.equal(validateScenario(c),true);
  for(const c of additionalCases) assert.match(c.source,/^https:\/\//);
});
test('E2: acertar sin evidencia o sin justificar no aprueba',()=>{
  const c=all[0];
  const noEvidence=assessCase(c,{hypothesis:c.solution,diagnosis:c.solution,used:[],reasoning:'A'.repeat(80)});
  assert.equal(noEvidence.passed,false);
  assert(noEvidence.score<85);
  const confirmed=assessCase(c,{hypothesis:c.solution,diagnosis:c.solution,used:[c.probes.find(p=>p.critical).id],reasoning:'La evidencia observada bajo las condiciones del laboratorio sintético confirma la causa seleccionada y descarta alternativas.'});
  assert.equal(confirmed.passed,true);
  assert.equal(confirmed.score,100);
});
test('E2: intervención insegura bloquea aprobación',()=>{
  const c=additionalCases[0];
  const r=assessCase(c,{hypothesis:c.solution,diagnosis:c.solution,used:[c.probes.find(p=>p.critical).id,c.probes.find(p=>p.unsafe).id],reasoning:'La simulación coincide con la hipótesis principal y registra evidencia confirmatoria, pero la maniobra elegida era insegura.'});
  assert.equal(r.score,0);
  assert.equal(r.passed,false);
});
test('E2: informe descargable reconoce límites de simulación',()=>{
  const c=additionalCases[0],s={used:[c.probes[0].id],hypothesis:c.solution,diagnosis:c.solution,reasoning:'Prueba hecha en banco virtual.'};
  const r=caseReport(c,s,assessCase(c,s),new Date('2026-10-24T00:00:00Z'));
  assert.match(r,/escenario sintético/);
  assert.match(r,/Pruebas realizadas/);
  assert.match(r,/revisión humana/);
});
