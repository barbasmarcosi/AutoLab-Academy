import test from 'node:test';
import assert from 'node:assert/strict';
import{TRACE_CASES,TRACE_WINDOWS,TRACE_CHANNELS,createTraceSession,generateTrace,traceSummary,gradeTraceSession,traceReport}from'../src/temporal-trace-lab.js';
const why='Comparé una ventana sana con otra donde aparece una discontinuidad temporal, correlacioné ambos canales y descarté hipótesis usando evidencia independiente.';
test('cuatro casos, cada uno con un par de canales distinto y fuente contextual',()=>{
 assert.equal(TRACE_CASES.length,4);
 assert.equal(new Set(TRACE_CASES.map(c=>c.id)).size,4);
 for(const c of TRACE_CASES){assert.equal(c.evidence.length,2);assert.equal(c.causes.length,4);
  assert(c.causes.some(x=>x[0]===c.cause));assert.match(c.source,/^https:\/\//);}
 assert.equal(TRACE_CHANNELS.length,5);
});
test('semillas reproducibles y fallas no aparecen siempre en la primera ventana',()=>{
 for(const c of TRACE_CASES)for(let seed=0;seed<200;seed++){
  const s=createTraceSession(c.id,seed);
  assert.deepEqual(createTraceSession(c.id,seed),s);
  assert(s.eventWindow>0&&s.eventWindow<TRACE_WINDOWS-1);
  const healthy=generateTrace(c.id,s.eventWindow,0,481);
  const intermittent=generateTrace(c.id,s.eventWindow,s.eventWindow,481);
  assert.equal(healthy.length,481);assert.equal(intermittent.length,481);
  assert(healthy.every((p,i)=>p.t>=0&&(!i||p.t>healthy[i-1].t)));
  assert.notDeepEqual(healthy,intermittent);
 }
});
test('CKP con evento: CMP y fuente permanecen, solo desaparece tramo CKP',()=>{
 const s=createTraceSession('trace-ckp',42);
 const normal=generateTrace(s.caseId,s.eventWindow,0);
 const event=generateTrace(s.caseId,s.eventWindow,s.eventWindow);
 assert(normal.some((x,i)=>x.t>=46&&x.t<61&&x.ckp!==event[i].ckp));
 assert(normal.every((x,i)=>x.cmp===event[i].cmp&&x.supply===event[i].supply));
});
test('CMP desplazado con CKP estable',()=>{
 const s=createTraceSession('trace-cmp',4);
 const a=generateTrace(s.caseId,s.eventWindow,0),b=generateTrace(s.caseId,s.eventWindow,s.eventWindow);
 assert(a.every((p,i)=>p.ckp===b[i].ckp));
 assert(a.some((p,i)=>p.cmp!==b[i].cmp));
});
test('mando de inyección presente y corriente ausente solo en la ventana de evento',()=>{
 const s=createTraceSession('trace-injector',3);
 const a=generateTrace(s.caseId,s.eventWindow,0),b=generateTrace(s.caseId,s.eventWindow,s.eventWindow);
 assert(a.some(x=>x.current>1));
 assert(b.every(x=>x.current===0));
 assert(a.every((x,i)=>x.command===b[i].command));
});
test('caída local de alimentación coincidente con pérdida de mando',()=>{
 const s=createTraceSession('trace-supply',14);
 const b=generateTrace(s.caseId,s.eventWindow,s.eventWindow);
 assert(b.some(x=>x.supply===8.2&&x.command===0));
 assert(b.every(x=>x.ckp>=0&&x.ckp<=5));
});
test('sólo aprueba con causa, ventana, dos canales y comparación normal/anómala',()=>{
 for(const c of TRACE_CASES){
  const s=createTraceSession(c.id,13);
  s.inspected=[0,s.eventWindow];s.selectedWindow=s.eventWindow;s.selectedCause=c.cause;s.evidence=[...c.evidence];s.reasoning=why;
  const grade=gradeTraceSession(s);
  assert.equal(grade.score,100);assert.equal(grade.passed,true);assert.equal(grade.reviewedText,false);
  assert.equal(gradeTraceSession({...s,inspected:[s.eventWindow]}).passed,false);
  assert.equal(gradeTraceSession({...s,selectedWindow:0}).passed,false);
  assert.equal(gradeTraceSession({...s,evidence:[c.evidence[0]]}).passed,false);
 }
});
test('resumen y reporte conservan semilla, ventana y evidencias auditables',()=>{
 const s=createTraceSession('trace-ckp',22),m=traceSummary(s.caseId,s.eventWindow,s.eventWindow);
 assert(m.ckp.max<=5&&m.supply.min===12.4);
 s.inspected=[0,s.eventWindow];s.selectedWindow=s.eventWindow;s.evidence=['ckp','cmp'];s.selectedCause='ckp-wire';s.reasoning=why;
 const txt=traceReport(s,gradeTraceSession(s),new Date('2026-10-24T12:00:00Z'));
 assert.match(txt,/Semilla reproducible: 22/);assert.match(txt,/revisión humana/);assert.match(txt,/Canales utilizados: ckp, cmp/);
});
