import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyProgress,serializeBackup,parseBackup} from '../src/core.js';
import {portfolioSnapshot,portfolioMarkdown} from '../src/portfolio.js';
import {lessons} from '../src/content.js';
test('portafolio vacío no inventa experiencia ni horas',()=>{
 const snap=portfolioSnapshot(emptyProgress(),lessons);
 assert.equal(snap.totals.practices,0);assert.equal(snap.totals.exams,0);assert.equal(snap.totals.studyMinutes,0);
 assert.match(portfolioMarkdown(emptyProgress(),lessons),/NO acredita competencias/);
});
test('agrega exámenes, talleres, multifalla y lecturas, ordenados por fecha',()=>{
 const p=emptyProgress();p.attempts.push({id:'exam-1',topic:'redes',at:'2026-10-20T00:00:00Z',percentage:90});
 p.cases.push({id:'mf-ground-ckp',at:'2026-10-22T00:00:00Z',score:100,used:['ground-drop','ecu-wave'],reasoning:'Una explicación registrada',conclusion:'ground,ckp-open',hypothesis:'multi-fault',passed:true});
 p.notes['lesson-'+lessons[0].id]='2026-10-21T00:00:00Z';
 const snap=portfolioSnapshot(p,lessons);
 assert.deepEqual([snap.totals.exams,snap.totals.practices,snap.totals.completedLessons],[1,1,1]);
 assert.equal(snap.events[0].kind,'multifault');
 assert.equal(snap.events[0].evidence.length,2);
 assert.match(portfolioMarkdown(p,lessons),/ground-drop/);
});
test('es estable tras exportación e importación del respaldo sin alterar datos',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-wave-pwm-v1',score:100,at:'2026-10-24T00:00:00Z',conclusion:'25',used:['pwm'],reasoning:'Prueba simulada',passed:true});
 const before=portfolioSnapshot(p,lessons),after=portfolioSnapshot(parseBackup(serializeBackup(p)),lessons);
 assert.deepEqual(after,before);
});
test('portafolio usa vista recortada sin mutar el respaldo local',()=>{
 const p=emptyProgress();
 for(let i=0;i<510;i++)p.cases.push({id:'lab-wave-pwm-v1',score:0,at:'2026-10-24T00:00:00Z',conclusion:'',used:[],reasoning:''});
 const s=portfolioSnapshot(p,lessons);
 assert.equal(s.events.length,500);assert.equal(p.cases.length,510);
 assert.equal(s.totals.practices,510);
});


test('historial diferencial conserva hipótesis y medición tras restaurar JSON',()=>{
 const p=emptyProgress();
 p.cases.push({id:'di-rc',score:100,at:'2026-10-25T12:00:00.000Z',
  conclusion:'capacitance-low',hypothesis:'resistance-low',
  used:['waveform','capacitance'],reasoning:'La onda sola no identifica el componente. Una medida independiente de C diferencia las dos explicaciones de tau.',passed:true});
 const recovered=parseBackup(serializeBackup(p));
 const portfolio=portfolioSnapshot(recovered,lessons);
 assert.equal(portfolio.events[0].kind,'differential');
 assert.equal(portfolio.events[0].title,'Misma curva RC, dos componentes distintos');
 assert.equal(portfolio.events[0].hypothesis,'resistance-low');
 assert.deepEqual(portfolio.events[0].evidence,['waveform','capacitance']);
 const report=portfolioMarkdown(recovered,lessons);
 assert.match(report,/Misma curva RC/);
 assert.match(report,/capacitance-low/);
});


test('el caso temporal conserva hipótesis, canales y título tras restauración JSON',()=>{
 const p=emptyProgress();
 p.cases.push({id:'trace-ckp',at:'2026-10-25T12:00:00Z',score:100,
  hypothesis:'cmp-wire',conclusion:'ckp-wire',used:['ckp','cmp'],
  reasoning:'Se compararon capturas de CKP y CMP con marcas temporales y se identificó un evento limitado a una ventana.',passed:true});
 const loaded=parseBackup(serializeBackup(p));
 const snap=portfolioSnapshot(loaded,lessons);
 assert.equal(snap.events[0].kind,'temporal');
 assert.equal(snap.events[0].title,'Pérdida esporádica de CKP');
 assert.equal(snap.events[0].hypothesis,'cmp-wire');
 assert.deepEqual(snap.events[0].evidence,['ckp','cmp']);
 assert.match(portfolioMarkdown(loaded,lessons),/Pérdida esporádica de CKP/);
});


test('inyección: respaldo JSON conserva hipótesis y prueba independiente en portafolio',()=>{
 const p=emptyProgress();
 p.cases.push({id:'fuel-air-leak',at:'2026-10-24T22:00:00Z',score:100,
  hypothesis:'pressure',conclusion:'air',used:['isolate','pressure'],
  reasoning:'Contrasté ralentí y crucero, añadí una prueba independiente y descarté presión baja en el banco.',passed:true});
 const recovered=parseBackup(serializeBackup(p));
 const snap=portfolioSnapshot(recovered,lessons);
 assert.equal(snap.events[0].kind,'injection');
 assert.equal(snap.events[0].title,'Correcciones elevadas al ralentí');
 assert.equal(snap.events[0].hypothesis,'pressure');
 assert.deepEqual(snap.events[0].evidence,['isolate','pressure']);
 assert.match(portfolioMarkdown(recovered,lessons),/Correcciones elevadas al ralentí/);
});


test('misfire por cilindro conserva hipótesis, evidencia y conclusión en respaldo',()=>{
 const p=emptyProgress();
 p.cases.push({id:'misfire-ignition',at:'2026-10-25T12:00:00Z',score:100,
  hypothesis:'injector-open',conclusion:'coil-feed',used:['coil','injector'],
  reasoning:'Comparé la corriente primaria de la bobina con otra carga y verifiqué la corriente del inyector para descartar una alternativa.',passed:true});
 const snap=portfolioSnapshot(parseBackup(serializeBackup(p)),lessons);
 assert.equal(snap.events[0].kind,'combustion');
 assert.equal(snap.events[0].title,'Falla repetida del cilindro 2: mando sin corriente primaria');
 assert.equal(snap.events[0].hypothesis,'injector-open');
 assert.deepEqual(snap.events[0].evidence,['coil','injector']);
 assert.match(portfolioMarkdown(parseBackup(serializeBackup(p)),lessons),/Falla repetida del cilindro 2/);
});
