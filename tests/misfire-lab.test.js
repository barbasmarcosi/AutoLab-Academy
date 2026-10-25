import test from 'node:test';
import assert from 'node:assert/strict';
import{MISFIRE_CASES,verifyMisfireCase,misfireFrame,misfireProbe,newMisfireSession,evaluateMisfire,misfireReport}from'../src/misfire-lab.js';
const reason='Comparé el monitor por cilindro a ralentí y en demanda, revisé una medición confirmatoria y otra independiente para descartar alternativas, y expliqué el diagnóstico del banco.';
test('cuatro casos con 4 cilindros, referencias, pruebas confirmatorias y de contraste',()=>{
 assert.equal(MISFIRE_CASES.length,4);
 assert.equal(new Set(MISFIRE_CASES.map(c=>c.id)).size,4);
 assert.equal(new Set(MISFIRE_CASES.map(c=>c.cause)).size,4);
 for(const c of MISFIRE_CASES){assert(verifyMisfireCase(c));assert.match(c.source,/^https:\/\//);}
});
test('monitores ficticios muestran distintos patrones sin inferir identificación OEM',()=>{
 assert.equal(misfireFrame('misfire-ignition','idle').misfires[1],18);
 assert.equal(misfireFrame('misfire-injector','load').misfires[2],38);
 const multiple=misfireFrame('misfire-multiple','idle');
 assert(multiple.misfires.filter(x=>x>=8).length===4);
 assert.throws(()=>misfireFrame('misfire-injector','road'));
 assert.throws(()=>misfireProbe('misfire-injector','not-a-probe'));
});
test('causa correcta, confirmación, contraste, regímenes, pronóstico y texto suman 100',()=>{
 for(const c of MISFIRE_CASES){
  const s=newMisfireSession(c.id),yes=c.probes.find(p=>p.confirm),no=c.probes.find(p=>p.crosscheck);
  Object.assign(s,{viewed:['idle','load'],observations:[{id:yes.id,prediction:yes.classify},{id:no.id,prediction:no.classify}],final:c.cause,reasoning:reason});
  const grade=evaluateMisfire(s);
  assert.equal(grade.score,100);assert.equal(grade.passed,true);assert.equal(grade.textReviewed,false);
 }
});
test('sin lectura de contraste o confirmación independiente no se aprueba',()=>{
 for(const c of MISFIRE_CASES){
  const s=newMisfireSession(c.id),yes=c.probes.find(p=>p.confirm),no=c.probes.find(p=>p.crosscheck);
  Object.assign(s,{viewed:['idle','load'],observations:[{id:yes.id,prediction:yes.classify}],final:c.cause,reasoning:reason});
  assert.equal(evaluateMisfire(s).passed,false);
  s.observations=[{id:no.id,prediction:no.classify}];
  assert.equal(evaluateMisfire(s).passed,false);
  s.observations=[{id:yes.id,prediction:yes.classify},{id:no.id,prediction:no.classify}];
  s.viewed=['idle'];assert.equal(evaluateMisfire(s).passed,false);
 }
});
test('acción insegura anula incluso una respuesta acertada',()=>{
 for(const c of MISFIRE_CASES){
  const s=newMisfireSession(c.id),yes=c.probes.find(p=>p.confirm),no=c.probes.find(p=>p.crosscheck),unsafe=c.probes.find(p=>p.unsafe);
  Object.assign(s,{viewed:['idle','load'],observations:[{id:yes.id,prediction:yes.classify},{id:no.id,prediction:no.classify},{id:unsafe.id,prediction:unsafe.classify}],final:c.cause,reasoning:reason});
  const g=evaluateMisfire(s);assert.equal(g.score,0);assert.equal(g.passed,false);
 }
});
test('el informe conserva referencia y datos con límites explícitos',()=>{
 const c=MISFIRE_CASES[0],s=newMisfireSession(c.id),p=c.probes[0];
 Object.assign(s,{initial:'injector-open',viewed:['idle','load'],observations:[{id:p.id,prediction:p.classify}],final:c.cause,reasoning:reason});
 const report=misfireReport(s,evaluateMisfire(s),new Date('2026-10-24T12:00:00Z'));
 assert.match(report,/Hipótesis inicial: injector-open/);assert.match(report,/contadores OEM/i);assert.match(report,/P0302/);
});
