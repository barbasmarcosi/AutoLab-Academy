import test from 'node:test';
import assert from 'node:assert/strict';
import {CASES,getCase,renderReading,makeSession,takeMeasurement,evaluate,explain,chooseCause} from '../diagnostico/engine.js';

test('all diagnoses have unique, comparable discriminating measurements',()=>{
 for(const c of CASES){
  assert.equal(c.choices.length,3);
  assert.equal(new Set(c.choices.map(x=>x.id)).size,3);
  for(const option of c.choices){
   const confirm=c.confirm[option.id],exclude=c.exclude[option.id];
   assert.ok(c.probes.some(p=>p.id===confirm),c.id+' missing confirm');
   assert.ok(c.probes.some(p=>p.id===exclude),c.id+' missing contrast');
   assert.equal(renderReading(c.id,option.id,confirm).abnormal,true,c.id+'/'+option.id);
  }
  const signatures=c.choices.map(f=>c.probes.map(p=>renderReading(c.id,f.id,p.id).value).join('|'));
  assert.equal(new Set(signatures).size,3,'variants should be distinguishable');
 }
});
test('ECT pull-up and sensor-disconnection evidence are physically coherent',()=>{
 for(const root of ['sensor','signal','ground']){
  assert.match(renderReading('ect',root,'ecu').value,/5,00 V/);
  assert.match(renderReading('ect',root,'sub').value,/2,51 V/);
 }
 assert.match(renderReading('ect','sensor','sensor').value,/OL/);
 assert.match(renderReading('ect','signal','sensor').value,/2,50 kΩ/);
 assert.match(renderReading('ect','signal','signal').value,/OL/);
 assert.match(renderReading('ect','ground','ground').value,/OL/);
});
test('ECU supply equation holds under load for all fault variants',()=>{
 for(const root of ['feed','ground','battery']){
  const read=id=>parseFloat(renderReading('ecu-power',root,id).value.split(' ')[0].replace(',','.'));
  const residual=Math.abs(read('battery')-read('feed')-read('ground')-read('ecu'));
  assert.ok(residual<0.02,root+' violates circuit voltage balance');
 }
});
test('measurements require a prior hypothesis and cannot repeat',()=>{
 const s=makeSession('ect','signal');
 assert.throws(()=>takeMeasurement(s,'signal'));
 const first=takeMeasurement({...s,hypothesis:'sensor'},'signal','anormal');
 assert.equal(first.measurements[0].predictionCorrect,true);
 assert.throws(()=>takeMeasurement(first,'signal'));
});
test('correct root without independent evidence cannot pass',()=>{
 const s={...makeSession('ect','sensor'),hypothesis:'sensor'};
 const result=evaluate(s,'sensor','Concluyo que el sensor falla porque la lectura está muy fría.');
 assert.equal(result.result.passed,false);
 assert.ok(result.result.score<=64);
});
test('every fault variant is solvable with decisive and contrast probes',()=>{
 for(const c of CASES)for(const f of c.choices){
  let s={...makeSession(c.id,f.id),hypothesis:f.id};
  s=takeMeasurement(s,c.confirm[f.id],'anormal');
  s=takeMeasurement(s,c.exclude[f.id],'nose');
  s=evaluate(s,f.id,'La prueba discriminante muestra la anomalía y el contraste permite descartar una causa alternativa.');
  assert.equal(s.status,'done');
  assert.equal(s.result.passed,true,c.id+'/'+f.id);
  assert.ok(s.result.score>=85);
  assert.equal(explain(s).cause,f.label);
  assert.throws(()=>takeMeasurement(s,c.probes[0].id));
 }
});
test('incorrect diagnosis cannot pass even with measurements',()=>{
 let s={...makeSession('injector','driver'),hypothesis:'coil'};
 s=takeMeasurement(s,'driver','anormal');
 s=takeMeasurement(s,'feed','normal');
 const result=evaluate(s,'coil','La carga virtual muestra un comportamiento que considero atribuible a la bobina.');
 assert.equal(result.result.passed,false);
 assert.ok(result.result.score<=64);
});
test('random variants are clamped to the available causes',()=>{
 assert.equal(chooseCause('ect',()=>0),'sensor');
 assert.equal(chooseCause('ect',()=>.5),'signal');
 assert.equal(chooseCause('ect',()=>1),'ground');
 assert.equal(getCase('ect').title,'Arranque en frío');
});
