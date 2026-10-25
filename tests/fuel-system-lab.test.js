import test from 'node:test';
import assert from 'node:assert/strict';
import{FUEL_CASES,validateFuelCase,createFuelSession,fuelFrame,fuelProbe,gradeFuelSession,fuelReport}from'../src/fuel-system-lab.js';
const reasoning='Contrasté ralentí y crucero y sus correcciones, elegí una medición independiente para discriminar la causa y descarté alternativas con el resultado de esa prueba.';
test('cuatro escenarios de lazo cerrado con un test confirmatorio',()=>{
 assert.equal(FUEL_CASES.length,4);
 assert.equal(new Set(FUEL_CASES.map(c=>c.id)).size,4);
 assert.equal(new Set(FUEL_CASES.map(c=>c.cause)).size,4);
 for(const c of FUEL_CASES){assert.equal(validateFuelCase(c),true);assert.match(c.source,/^https:\/\//);}
});
test('STFT y LTFT registran reacción, no prueba de pieza',()=>{
 assert(fuelFrame('fuel-air-leak','idle').stftPct>0);
 assert(fuelFrame('fuel-rich','idle').stftPct<0);
 for(const c of FUEL_CASES)for(const f of c.frames){assert.equal(f.loop,'closed');assert(f.lambda>.95&&f.lambda<1.06);}
});
test('completar cuatro criterios de evidencia alcanza puntuación',()=>{
 for(const c of FUEL_CASES){
  const s=createFuelSession(c.id),p=c.probes.find(x=>x.confirm);
  Object.assign(s,{initial:'air',opened:['idle','cruise'],probes:[{id:p.id,prediction:p.classification}],final:c.cause,reasoning});
  const result=gradeFuelSession(s);
  assert.equal(result.score,100);assert.equal(result.passed,true);assert.equal(result.textReviewed,false);
 }
});
test('sin contraste idle-cruise ni prueba independiente no aprueba',()=>{
 for(const c of FUEL_CASES){
  const s=createFuelSession(c.id),p=c.probes.find(x=>x.confirm);
  Object.assign(s,{opened:['idle'],probes:[{id:p.id,prediction:p.classification}],final:c.cause,reasoning});
  assert.equal(gradeFuelSession(s).passed,false);
  s.opened=['idle','cruise'];s.probes=[{id:c.probes.find(x=>!x.confirm&&!x.unsafe).id,prediction:'normal'}];
  assert.equal(gradeFuelSession(s).passed,false);
 }
});
test('una prueba insegura invalida la sesión',()=>{
 for(const c of FUEL_CASES){
  const s=createFuelSession(c.id),p=c.probes.find(x=>x.confirm),u=c.probes.find(x=>x.unsafe);
  Object.assign(s,{opened:['idle','cruise'],probes:[{id:p.id,prediction:p.classification},{id:u.id,prediction:u.classification}],final:c.cause,reasoning});
  assert.equal(gradeFuelSession(s).score,0);assert.equal(gradeFuelSession(s).passed,false);
 }
});
test('informe mantiene hipótesis, trims y origen ficticio',()=>{
 assert.throws(()=>fuelFrame('fuel-air-leak','nope'));assert.throws(()=>fuelProbe('fuel-air-leak','nope'));
 const s=createFuelSession('fuel-air-leak'),p=FUEL_CASES[0].probes[0];
 Object.assign(s,{initial:'pressure',opened:['idle','cruise'],probes:[{id:p.id,prediction:p.classification}],final:'air',reasoning});
 const report=fuelReport(s,gradeFuelSession(s),new Date('2026-10-24T12:00:00Z'));
 assert.match(report,/STFT 28%/);assert.match(report,/Hipótesis inicial: pressure/);
 assert.match(report,/no son PIDs universales ni datos OEM/);
});
