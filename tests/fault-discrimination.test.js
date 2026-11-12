import test from 'node:test';
import assert from 'node:assert/strict';
import{differentialCases,validateDifferentialCase,createDifferentialSession,getDifferentialProbe,gradeDifferential,differentialTrace,differentialReport}from'../src/fault-discrimination.js';
const reasoning='Se observó primero una variable no discriminante y luego otra variable independiente, cuya diferencia entre las hipótesis identifica la causa sin descartar por intuición.';
test('tres casos y seis causas con una lectura idéntica y otra que las separa',()=>{
 assert.equal(differentialCases.length,3);
 assert.equal(new Set(differentialCases.map(c=>c.id)).size,3);
 for(const c of differentialCases){
  assert.equal(validateDifferentialCase(c),true);
  assert.equal(c.variants.length,2);
  const common=c.probes.find(p=>!p.discriminating&&!p.unsafe);
  assert.equal(getDifferentialProbe(c.id,0,common.id).reading,getDifferentialProbe(c.id,1,common.id).reading);
  const distinguish=c.probes.find(p=>p.discriminating);
  assert.notEqual(getDifferentialProbe(c.id,0,distinguish.id).reading,getDifferentialProbe(c.id,1,distinguish.id).reading);
 }
});
test('el caso RC demuestra una superposición exacta de curvas aunque fallen componentes distintos',()=>{
 const a=differentialTrace('di-rc',0),b=differentialTrace('di-rc',1);
 assert.deepEqual(a,b);assert(a[60].value>0&&a.at(-1).value<12);
});
test('mismo síntoma y voltaje no identifican causa sin otra medición',()=>{
 const c=differentialCases.find(x=>x.id==='di-wire');
 const p=getDifferentialProbe(c.id,0,'load-voltage'),other=getDifferentialProbe(c.id,1,'load-voltage');
 assert.equal(p.reading,other.reading);
 assert.notEqual(getDifferentialProbe(c.id,0,'current').reading,getDifferentialProbe(c.id,1,'current').reading);
});
test('la sesión es reproducible por semilla, sin falsear historial',()=>{
 for(const c of differentialCases)for(let seed=1;seed<=50;seed++){
  const a=createDifferentialSession(c.id,seed),b=createDifferentialSession(c.id,seed);
  assert.deepEqual(a,b);assert([0,1].includes(a.variantIndex));
 }
});
test('correcto solo con causa, medición discriminante, pronóstico y explicación',()=>{
 for(const c of differentialCases)for(let index=0;index<2;index++){
  const s=createDifferentialSession(c.id,index);s.variantIndex=index;
  s.initial=c.variants[(index+1)%2].id;s.final=c.variants[index].id;s.reasoning=reasoning;
  const p=c.probes.find(p=>p.discriminating);
  s.observations=[{id:p.id,prediction:p.classification}];
  const res=gradeDifferential(s);
  assert.equal(res.score,100);assert.equal(res.passed,true);assert.equal(res.textReviewed,false);
  const noProbe={...s,observations:[{id:c.probes.find(x=>!x.discriminating&&!x.unsafe).id,prediction:'abnormal'}]};
  assert.equal(gradeDifferential(noProbe).passed,false);
  const noPrediction={...s,observations:[{id:p.id,prediction:'normal'===p.classification?'abnormal':'normal'}]};
  assert.equal(gradeDifferential(noPrediction).passed,false);
  const unsafe={...s,observations:[...s.observations,{id:'unsafe',prediction:'unsafe'}]};
  assert.equal(gradeDifferential(unsafe).score,0);
 }
});
test('una conclusión acertada sin hipótesis inicial válida no recibe 100 ni aprueba',()=>{
 for(const c of differentialCases)for(let index=0;index<2;index++){
  const probe=c.probes.find(p=>p.discriminating&&!p.unsafe);
  const base=createDifferentialSession(c.id,index);
  base.variantIndex=index;
  base.final=c.variants[index].id;
  base.reasoning=reasoning;
  base.observations=[{id:probe.id,prediction:probe.classification}];
  for(const initial of ['', 'hipotesis-fabricada']){
   const grade=gradeDifferential({...base,initial});
   assert.equal(grade.initialRecorded,false);
   assert.equal(grade.passed,false);
   assert.equal(grade.score,50);
  }
  const valid=gradeDifferential({...base,initial:c.variants[1-index].id});
  assert.equal(valid.initialRecorded,true);
  assert.equal(valid.passed,true);
  assert.equal(valid.score,100);
 }
});
test('acertar una predicción ambigua no sustituye la discriminante',()=>{
 for(const c of differentialCases)for(let index=0;index<2;index++){
  const ambiguous=c.probes.find(p=>!p.discriminating&&!p.unsafe);
  const decisive=c.probes.find(p=>p.discriminating&&!p.unsafe);
  const s=createDifferentialSession(c.id,index);
  s.variantIndex=index;
  s.initial=c.variants[index].id;
  s.final=c.variants[index].id;
  s.reasoning=reasoning;
  s.observations=[
   {id:ambiguous.id,prediction:ambiguous.classification},
   {id:decisive.id,prediction:decisive.classification==='normal'?'abnormal':'normal'}
  ];
  const grade=gradeDifferential(s);
  assert.equal(grade.discriminated,true);
  assert.equal(grade.predicted,false);
  assert.equal(grade.passed,false);
  assert.equal(grade.score,90);
  s.observations[1].prediction=decisive.classification;
  assert.equal(gradeDifferential(s).passed,true);
 }
});
test('informe incluye predicción previa, respuesta, referencia y límites',()=>{
 const c=differentialCases[0],s=createDifferentialSession(c.id,0);
 s.initial=c.variants[1].id;s.final=c.variants[s.variantIndex].id;s.reasoning=reasoning;
 s.observations=[{id:'current',prediction:'abnormal'}];
 const text=differentialReport(s,gradeDifferential(s),new Date('2026-10-24T12:00:00Z'));
 assert.match(text,/Predicciones y mediciones/);assert.match(text,/texto no se ha evaluado semánticamente/);
 assert.match(text,/Semilla: 0/);
});
