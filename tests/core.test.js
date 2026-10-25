import test from 'node:test';import assert from 'node:assert/strict';import{emptyProgress,gradeQuestion,scoreExam,scheduleReview,dueReviews,validateBackup,serializeBackup,parseBackup,calculateCase}from'../src/core.js';
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
