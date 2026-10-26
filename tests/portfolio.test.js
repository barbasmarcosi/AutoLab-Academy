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


test('v1.5: report de cuatro fuentes queda íntegro en portafolio tras restauración JSON',async()=>{
 const {INTEGRATIVE_CASES,startIntegrativeCase,evaluateIntegrativeCase,buildIntegrativeReport,EVIDENCE_KINDS}=await import('../src/integrative-lab.js');
 const c=INTEGRATIVE_CASES[0],s=startIntegrativeCase(c.id);
 s.initial='fuel-delivery';s.final=c.cause;
 s.reasoning='Se contrastaron OBD, oscilogramas, contexto de demanda y caída de voltaje medida en un circuito de referencia para localizar el origen del fallo simulado.';
 s.uncertainty='Los valores de instrumento y de las tolerancias OEM no fueron medidos y no acreditan el diagnóstico sobre un vehículo real.';
 const checks=[...EVIDENCE_KINDS.map(k=>c.readings.find(r=>r.kind===k&&!r.unsafe)),c.readings.find(r=>r.confirm),c.readings.find(r=>r.exclude)];
 s.observations=[...new Map(checks.map(r=>[r.id,{id:r.id,prediction:r.classification}])).values()];
 const score=evaluateIntegrativeCase(s),report=buildIntegrativeReport(s,score,new Date('2026-10-25T04:00:00Z'));
 const p=emptyProgress();
 p.cases.push({id:c.id,score:score.score,at:'2026-10-25T04:00:00Z',conclusion:s.final,hypothesis:s.initial,
  used:s.observations.map(o=>o.id),reasoning:s.reasoning,report,passed:score.passed});
 const recovered=parseBackup(serializeBackup(p));
 const snap=portfolioSnapshot(recovered,lessons);
 assert.equal(snap.events[0].kind,'integrative');
 assert.equal(snap.events[0].title,c.title);
 assert.equal(snap.events[0].report,report);
 assert.match(snap.events[0].report,/Procedencia:/);
 assert.match(portfolioMarkdown(recovered,lessons),/Informe completo de expediente/);
 assert.match(portfolioMarkdown(recovered,lessons),/Incertidumbres/);
});


test('v1.8: práctica de transferencia conserva informe de dos representaciones tras respaldo',async()=>{
 const{TRANSFER_CASES,buildTransferSession,evaluateTransferSession,transferReport}=await import('../src/transfer-exercises.js');
 const session=buildTransferSession(44),pair=session.pairs[0],answers={},why='Mediría los parámetros que figuran en el banco bajo la misma condición de carga y compararía las dos formulaciones del principio con sus respectivas unidades.';
 for(const item of pair.steps)answers[item.id]={value:String(item.expected),evidence:'relevant',reasoning:why};
 const results=evaluateTransferSession({...session,pairs:[pair]},answers);
 const report=transferReport({...session,pairs:[pair]},answers,results,new Date('2026-10-25T12:00:00Z'));
 const p=emptyProgress();
 p.cases.push({id:'transfer-'+pair.topic,score:100,at:'2026-10-25T12:00:00Z',
  hypothesis:'relevant',conclusion:String(pair.steps[1].expected),used:pair.steps.map(x=>x.id),
  reasoning:why,passed:true,report});
 const restored=parseBackup(serializeBackup(p)),snap=portfolioSnapshot(restored,lessons);
 assert.equal(snap.events[0].kind,'transfer');
 assert.equal(snap.events[0].title,TRANSFER_CASES.find(x=>x.topic===pair.topic).title);
 assert.equal(snap.events[0].report,report);
 assert.match(portfolioMarkdown(restored,lessons),/Informe completo de expediente/);
 assert.match(portfolioMarkdown(restored,lessons),/Semilla reproducible/);
});


test('v1.9: diagnóstico por evidencia conserva hipótesis, descartes e informe después de importar backup',async()=>{
 const {buildDiagnosticTransfer,gradeDiagnosticTransfer,diagnosticTransferReport,DIAGNOSTIC_TRANSFER_CASES}=await import('../src/diagnostic-transfer.js');
 const s=buildDiagnosticTransfer(291),c=s.cases[0];
 const initial=c.options.find(x=>x[0]!==c.cause)[0],reasoning='Elegí una prueba confirmatoria y otra de descarte con el mismo contexto; comparé lecturas ficticias independientes y evité inferir una pieza física desde el síntoma.';
 const limits='No conozco especificaciones del fabricante, pruebas en vehículo ni tolerancias reales de estos instrumentos simulados.';
 const a={initial,final:c.cause,reasoning,limits,
  probes:c.probes.filter(p=>!p.unsafe).map(p=>({id:p.id,prediction:p.outcome}))};
 const score=gradeDiagnosticTransfer(c,a),report=diagnosticTransferReport({scenario:{...s,cases:[c]},answers:{[c.id]:a}},new Date('2026-10-25T16:00:00Z'));
 const p=emptyProgress();
 p.cases.push({id:c.id,at:'2026-10-25T16:00:00Z',score:score.score,passed:score.passed,
  hypothesis:a.initial,conclusion:a.final,reasoning,used:a.probes.map(x=>x.id),report});
 const restored=parseBackup(serializeBackup(p)),snapshot=portfolioSnapshot(restored,lessons);
 assert.equal(snapshot.events[0].kind,'diagnostic-transfer');
 assert.equal(snapshot.events[0].title,DIAGNOSTIC_TRANSFER_CASES.find(x=>x.id===c.id).title);
 assert.equal(snapshot.events[0].report,report);
 assert.deepEqual(snapshot.events[0].evidence,a.probes.map(x=>x.id));
 assert.match(portfolioMarkdown(restored,lessons),/Semilla reproducible: 291/);
 assert.match(portfolioMarkdown(restored,lessons),/Puntuación: 100\/100/);
});


test('RW1: evidencia geométrica y procedencia se conservan en backup y Portafolio',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-rotary-geometry-v1',at:'2026-10-26T03:00:00Z',score:100,passed:true,hypothesis:'aumenta',conclusion:'aumenta',used:['geometry-a'],reasoning:'Predicción registrada con modelo cinemático; no es metrología ni un resultado real.',report:'# RW1\nModelo: rw1-epitrochoid-straight-flanks v1\nProcedencia: derived_from_geometry'});
 const recovered=parseBackup(serializeBackup(p)),snap=portfolioSnapshot(recovered,lessons),report=portfolioMarkdown(recovered,lessons);
 assert.equal(snap.events[0].title,'RW1 — Rotary Geometry Explorer');
 assert.equal(snap.events[0].hypothesis,'aumenta');
 assert.equal(snap.events[0].report,p.cases[0].report);
 assert.match(report,/derived_from_geometry/);
});


test('RW4: portafolio y respaldo conservan hipótesis, dos pruebas y procedencia del modelo',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-rotary-sealing-v1',score:100,passed:true,at:'2026-10-26T04:00:00.000Z',hypothesis:'ignition',conclusion:'sealing',used:['retention','primary'],reasoning:'Dos índices sintéticos distinguen las hipótesis sin mediciones físicas.',report:'# RW4\nProcedencia: synthetic_model\nSemilla: 42'});
 const restored=parseBackup(serializeBackup(p)),snap=portfolioSnapshot(restored,lessons),md=portfolioMarkdown(restored,lessons);
 assert.equal(snap.events[0].title,'RW4 — Diagnóstico diferencial rotativo');
 assert.deepEqual(snap.events[0].evidence,['retention','primary']);
 assert.match(md,/synthetic_model/);assert.match(md,/Semilla: 42/);
});

test('MC01: experiment preserves metrology evidence through backup and portfolio',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-metrology-uncertainty-v1',at:'2026-10-26T04:00:00Z',score:100,passed:true,hypothesis:'resolvable',conclusion:'resolvable',used:['micro','repeatability','resolution'],reasoning:'Comparé la diferencia con dos incertidumbres estándar combinadas.',report:'# MC01\nModelo: mc01-uncertainty-rd-v1\nProcedencia: synthetic_measurement\nSemilla: 42'});
 const restored=parseBackup(serializeBackup(p)),s=portfolioSnapshot(restored,lessons);
 assert.equal(s.events[0].title,'MC01 — Metrología e incertidumbre');
 assert.deepEqual(s.events[0].evidence,['micro','repeatability','resolution']);
 assert.match(portfolioMarkdown(restored,lessons),/synthetic_measurement/);
});

test('RW4+: a biased instrument investigation survives JSON export and recovery',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-rotary-instrument-v1',at:'2026-10-26T05:00:00Z',score:100,passed:true,hypothesis:'sealing',conclusion:'instrument',used:['zero','independent'],reasoning:'La referencia del instrumento está desviada, se descarta la hipótesis de estanqueidad al verificar una fuente independiente.',report:'# RW4+\nSemilla: 111\nModelo: rw4-instrument-adversarial-synthetic-v1'});
 const recovered=parseBackup(serializeBackup(p)),snapshot=portfolioSnapshot(recovered,lessons),md=portfolioMarkdown(recovered,lessons);
 assert.equal(snapshot.events[0].title,'RW4+ — Verificación instrumental adversarial');
 assert.deepEqual(snapshot.events[0].evidence,['zero','independent']);
 assert.match(md,/rw4-instrument-adversarial-synthetic-v1/);
});

test('MC08 ideal brakes: portfolio evidence survives backup round-trip',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-brake-energy-v1',at:'2026-10-26T05:00:00Z',score:100,passed:true,hypothesis:'quadruple',conclusion:'ideal friction model',used:['energy','mu','reaction-distance'],reasoning:'La energía es proporcional a v cuadrado.',report:'# MC08\nModelo mc08-energy-friction-ideal-v1\nProcedencia: derived_from_ideal_physics'});
 const recovered=parseBackup(serializeBackup(p));const snap=portfolioSnapshot(recovered,lessons);
 assert.equal(snap.events[0].title,'MC08 — Investigación de energía de frenado');
 assert.match(portfolioMarkdown(recovered,lessons),/derived_from_ideal_physics/);
});

test('RW2/RW3: thermodynamics report round-trip through backup and portfolio',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-rotary-thermal-v1',at:'2026-10-26T05:00:00Z',score:100,passed:true,hypothesis:'aumenta',conclusion:'ideal not real',used:['otto-ideal','energy-ledger'],reasoning:'Diferencio el ciclo termodinámico ideal de la arquitectura rotativa.',report:'# RW2/RW3\nModelo: rw2-rw3-ideal-cycle-synthetic-balance-v1\nProcedencia: synthetic_energy_allocation'});
 const recovered=parseBackup(serializeBackup(p));const snap=portfolioSnapshot(recovered,lessons);
 assert.equal(snap.events[0].title,'RW2/RW3 — Termodinámica y balance energético');
 assert.match(portfolioMarkdown(recovered,lessons),/synthetic_energy_allocation/);
});

test('RW5: convection evidence survives JSON export and portfolio recovery',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-rotary-convection-v1',at:'2026-10-26T06:00:00Z',score:100,passed:true,hypothesis:'aumenta',conclusion:'aumenta',used:['assumed-area','assumed-convective-coefficient'],reasoning:'Área menor pero coeficiente convectivo mayor.',report:'# RW5\nModelo: rw5-lumped-convection-sensitivity-v1\nProcedencia: derived_from_lumped_heat_transfer'});
 const recovered=parseBackup(serializeBackup(p)),s=portfolioSnapshot(recovered,lessons);
 assert.equal(s.events[0].title,'RW5 — Sensibilidad de transferencia térmica');
 assert.match(portfolioMarkdown(recovered,lessons),/derived_from_lumped_heat_transfer/);
});

test('RW6/RW7: reports survive JSON backup round-trip and portfolio metadata',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-rotary-port-burn-v1',at:'2026-10-26T07:00:00Z',score:100,passed:true,hypothesis:'aumenta / disminuye',conclusion:'Ventanas ficticias y Wiebe',used:['cyclic-port-window','normalized-wiebe-shape'],reasoning:'Grados de apertura no determinan rendimiento ni emisiones.',report:'# RW6/RW7\nModelo: rw6-rw7-disconnected-conceptual-v1\nProcedencia: synthetic_ports_and_assumed_heat_release'});
 const restored=parseBackup(serializeBackup(p));const snapshot=portfolioSnapshot(restored,lessons);
 assert.equal(snapshot.events[0].title,'RW6/RW7 — Puertos y combustión conceptual');
 assert.match(portfolioMarkdown(restored,lessons),/synthetic_ports_and_assumed_heat_release/);
});

test('RW8: constrained profile research survives backup and portfolio export',()=>{
 const p=emptyProgress();p.cases.push({id:'lab-ecu-optimization-v1',at:'2026-10-26T07:00:00Z',score:100,passed:true,hypothesis:'DAILY',conclusion:'DAILY',used:['thermal-constraint','emissions-constraint','knock-constraint'],reasoning:'No ignoro riesgos aunque la respuesta parezca alta.',report:'# RW8\nModelo: rw8-constrained-synthetic-profiles-v1\nProveniencia: synthetic_discrete_constraint_catalog'});
 const x=parseBackup(serializeBackup(p));const snap=portfolioSnapshot(x,lessons);
 assert.equal(snap.events[0].title,'RW8 — Optimización ECU restringida');
 assert.match(portfolioMarkdown(x,lessons),/synthetic_discrete_constraint_catalog/);
});
