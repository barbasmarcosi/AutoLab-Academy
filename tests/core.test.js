import test from 'node:test';import assert from 'node:assert/strict';import{emptyProgress,gradeQuestion,scoreExam,scheduleReview,dueReviews,validateBackup,serializeBackup,parseBackup,calculateCase,MAX_BACKUP_PAYLOAD_CHARS,MAX_BACKUP_IMPORT_CHARS,MAX_BACKUP_FILE_BYTES}from'../src/core.js';
const q=[{id:'a',answer:1},{id:'b',answer:0}];
test('califica sin dar crédito a respuestas omitidas',()=>{assert.equal(gradeQuestion(q[0],undefined),false);assert.deepEqual(scoreExam(q,[1,undefined]).percentage,50)});
test('repaso adelantado tras acierto y reiniciado tras fallo',()=>{const now=new Date('2026-10-24T12:00:00Z');const good=scheduleReview(null,true,now);assert.equal(good.level,1);assert.equal(dueReviews({reviews:{a:good}},now).length,0);const bad=scheduleReview(good,false,now);assert.equal(bad.level,0)});
test('respaldo restaura una copia válida y rechaza datos malformados',()=>{const p=emptyProgress();p.notes.can='Repasar señales';p.attempts.push({id:'1',topic:'CAN',percentage:90,at:'2026-10-24'});assert.deepEqual(parseBackup(serializeBackup(p)),p);assert.throws(()=>validateBackup({schema:99,attempts:[]}))});
test('caso no se aprueba por adivinar sin pruebas',()=>{const c={solution:'ground',probes:[{id:'test',critical:true},{id:'visual',critical:false}]};assert.equal(calculateCase(c,[], 'ground').score,65);assert.equal(calculateCase(c,['test'],'ground').score,90);assert.equal(calculateCase(c,['visual'],'wrong').score,0)});

test('E2: backup mantiene hipótesis, pruebas y explicación para revisión externa',()=>{
  const p=emptyProgress();
  p.cases.push({id:'case-can',score:95,at:'2026-10-24T10:00:00Z',conclusion:'wiring',hypothesis:'ecu',used:['supply','fuse'],reasoning:'La causa fue verificada con mediciones sintéticas y revisión de hipótesis.',passed:true});
  const restored=parseBackup(serializeBackup(p));
  assert.deepEqual(restored.cases[0],p.cases[0]);
});


test('E1 FSRS: backup JSON round-trips versioned card, timestamps and ratings',async()=>{
 const {recordReview}=await import('../src/repetition.js');
 const p=emptyProgress();
 p.reviews.e01=recordReview(null,true,'high',new Date('2026-10-24T09:00:00Z'));
 const recovered=parseBackup(serializeBackup(p));
 assert.deepEqual(recovered.reviews.e01,p.reviews.e01);
 const second=recordReview(recovered.reviews.e01,false,'high',new Date('2026-10-25T09:00:00Z'));
 assert.equal(second.history.length,2);
 assert.equal(second.history[1].correct,false);
});
test('E1 FSRS: legacy schedule survives backup and remains due on original date',()=>{
 const p=emptyProgress();
 p.reviews.e01={level:3,due:'2026-11-01T10:00:00.000Z',last:'2026-10-20T10:00:00.000Z',correct:true};
 const loaded=parseBackup(serializeBackup(p));
 assert.deepEqual(loaded.reviews.e01,p.reviews.e01);
 assert.deepEqual(dueReviews(loaded,new Date('2026-10-31T10:00:00.000Z')),[]);
 assert.deepEqual(dueReviews(loaded,new Date('2026-11-02T10:00:00.000Z')),['e01']);
});
test('E1 FSRS: malformed engine card fails closed rather than silently discarding it',()=>{
 const p=emptyProgress();
 p.reviews.e01={algorithm:'ts-fsrs-5',due:'2026-10-24T12:00:00Z',card:{state:2,stability:'bad'}};
 assert.throws(()=>validateBackup(p),/FSRS incompatible/);
});


test('v1.5: reporte de expediente extenso se conserva al respaldar y se limita el tamaño',()=>{
 const progress=emptyProgress();
 const report='# Informe con trazabilidad\n'+'Dato de banco ficticio, referencia y límite.\n'.repeat(45);
 progress.cases.push({id:'integral-power',score:100,at:'2026-10-25T03:00:00Z',conclusion:'ecu-supply',
  hypothesis:'fuel-delivery',used:['power-obd','power-supply','power-fuel','power-wave','power-context'],
  reasoning:'Se utilizaron varias fuentes y una prueba que descarta una explicación alternativa.',
  report,passed:true});
 const after=parseBackup(serializeBackup(progress));
 assert.equal(after.cases[0].report,report);
 assert.deepEqual(validateBackup(after).cases[0],after.cases[0]);
 progress.cases[0].report='x'.repeat(15000);
 assert.equal(validateBackup(progress).cases[0].report.length,10000);
});
test('v1.5: respaldos antiguos sin report son compatibles y no se inventan informes',()=>{
 const p=emptyProgress();
 p.cases.push({id:'case-simple',score:50,at:'2026-10-24T00:00:00Z',conclusion:'unknown',hypothesis:'unknown',
  used:[],reasoning:'',passed:false});
 const restored=parseBackup(serializeBackup(p));
 assert.deepEqual(restored.cases[0],p.cases[0]);
 assert.equal('report' in restored.cases[0],false);
});


test('v1.7: persiste evidencia por pregunta sin alterar intentos históricos ni esquema',()=>{
 const p=emptyProgress();
 p.attempts.push({id:'old',topic:'all',percentage:60,at:'2025-01-01'});
 p.attempts.push({id:'new',topic:'cumulative',percentage:50,at:'2026-10-25T14:00:00Z',
  details:[{id:'fuel-q-motor-1',selected:2,correct:false,confidence:'high'},
   {id:'integral-q-senales-1',selected:0,correct:true,confidence:'low'}]});
 const restored=parseBackup(serializeBackup(p));
 assert.equal(restored.schema,1);
 assert.equal(restored.attempts[0].details,undefined);
 assert.deepEqual(restored.attempts[1].details,p.attempts[1].details);
});
test('v1.7: las respuestas se validan por longitud, ID, selección y confianza',()=>{
 const p=emptyProgress();
 p.attempts.push({id:'adversarial',topic:'motor',at:'2026-10-25',percentage:33,
  details:[{id:'safe-id',selected:5,correct:false,confidence:'unknown',extra:'ignored'},
   {id:'BAD ID!',selected:0,correct:true,confidence:'high'},
   {id:'okay',selected:1,correct:false,confidence:'normal'}]});
 const saved=validateBackup(p);
 assert.deepEqual(saved.attempts[0].details,[
  {id:'safe-id',selected:null,correct:false,confidence:'normal'},
  {id:'okay',selected:1,correct:false,confidence:'normal'}
 ]);
 assert.equal(saved.attempts[0].details.length,2);
});


test('v1.9.2: borrador de investigación compatible con backup, evidencia válida únicamente',async()=>{
 const {createDiagnosticTransferSession}=await import('../src/diagnostic-transfer.js');
 const {captureDiagnosticDraft,restoreDiagnosticDraft}=await import('../src/diagnostic-draft.js');
 const session=createDiagnosticTransferSession(291),item=session.scenario.cases[0];
 const valid=item.probes.find(p=>!p.unsafe);
 session.answers[item.id]={initial:item.options[0][0],locked:true,observations:[
  {id:'inventada',prediction:'normal'},
  {id:valid.id,prediction:valid.outcome},
  {id:valid.id,prediction:valid.outcome}
 ],pending:'inventada',prediction:'peligrosa',final:item.cause,
 reasoning:'Texto de razonamiento técnico incompleto',limits:'Aún falta evidencia física'};
 const p=emptyProgress();p.diagnosticDraft=captureDiagnosticDraft(session);
 const raw=serializeBackup(p),loaded=parseBackup(raw),restored=restoreDiagnosticDraft(loaded.diagnosticDraft);
 assert.equal(restored.scenario.seed,291);
 assert.equal(restored.scenario.cases[0].id,item.id);
 assert.deepEqual(restored.answers[item.id].observations,[{id:valid.id,prediction:valid.outcome}]);
 assert.equal(restored.answers[item.id].pending,'');
 assert.equal(restored.answers[item.id].final,item.cause);
 assert.equal(restored.index,0);
 const old=emptyProgress();delete old.diagnosticDraft;
 assert.equal(validateBackup(old).diagnosticDraft,null);
 const invalid=emptyProgress();invalid.diagnosticDraft={seed:'incorrecto',index:0,answers:{}};
 assert.throws(()=>validateBackup(invalid),/borrador diagnóstico incompatible/);
});


test('v1.9.4: 500 expedientes completos exportan, importan y conservan informes',()=>{
 assert.equal(MAX_BACKUP_PAYLOAD_CHARS,12_000_000);
 assert.equal(MAX_BACKUP_IMPORT_CHARS,16_000_000);
 assert.equal(MAX_BACKUP_FILE_BYTES,24_000_000);
 const p=emptyProgress();
 const report='# Evidencia sintética; SIN captura física\n'+'Prueba ficticia y límite de interpretación.\n'.repeat(190);
 for(let i=0;i<500;i++)p.cases.push({id:'diagnostic-control',at:'2026-10-25T06:00:00Z',
  score:95,passed:true,used:['context','confirm','exclude'],report,
  hypothesis:'alternative',conclusion:'cause',reasoning:'Registro de ejemplo'});
 const json=serializeBackup(p);
 assert(json.length>2_000_000,'El portfolio debe exceder el antiguo límite');
 const restored=parseBackup(json);
 assert.equal(restored.cases.length,500);
 assert.equal(restored.cases[499].report,report.slice(0,10000));
 assert.equal(restored.cases[0].hypothesis,'alternative');
});
test('v1.9.4: entradas sobredimensionadas siguen rechazadas',()=>{
 const p=emptyProgress();
 p.notes.general='x'.repeat(12_000_010);
 assert.throws(()=>validateBackup(p),/límites de seguridad/);
 assert.throws(()=>parseBackup('x'.repeat(16_000_001)),/demasiado grande/);
});
