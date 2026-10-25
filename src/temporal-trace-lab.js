/**
 * AutoLab multichannel timeline practice.
 * Every value is synthetic and normalized by channel for graph display.
 * No oscilloscope/device connection, OEM trace, physical diagnosis or HV procedure.
 */
export const TRACE_VERSION='intermittent-v1';
export const TRACE_CHANNELS=[
 {id:'ckp',label:'CKP Hall ficticio',unit:'V',max:5.5},
 {id:'cmp',label:'CMP Hall ficticio',unit:'V',max:5.5},
 {id:'command',label:'Mando de inyector ficticio',unit:'V',max:5.5},
 {id:'current',label:'Corriente de inyector ficticia',unit:'A',max:2.4},
 {id:'supply',label:'Alimentación ECU ficticia',unit:'V',max:15}
];
const variants=[
 {id:'trace-ckp',title:'Pérdida esporádica de CKP',topic:'senales',
  symptom:'Un tren CKP desaparece durante un instante, mientras CMP y alimentación permanecen observables.',
  cause:'ckp-wire',evidence:['ckp','cmp'],
  explanation:'La discontinuidad selectiva en CKP, con CMP estable, es compatible con una interrupción de esa rama del banco. No identifica un cable real ni garantiza una causa OEM.',
  causes:[['ckp-wire','Interrupción temporal en la rama CKP'],['cmp-wire','Interrupción temporal CMP'],['injector-open','Bobina de inyector abierta'],['ecu-power','Baja tensión en alimentación ECU']],
  cue:'Buscá una interrupción en una señal sin perder la referencia temporal de la otra.',
  source:'https://www.picoauto.com/library/application-notes/cam-and-crank-correlation'},
 {id:'trace-cmp',title:'Desfase de CMP durante una ventana',topic:'senales',
  symptom:'El flanco CMP pierde correlación con el patrón CKP únicamente en un tramo de adquisición.',
  cause:'cmp-shift',evidence:['ckp','cmp'],
  explanation:'En el banco ficticio se desplazó temporalmente el flanco CMP 14 ms respecto del CKP. La correlación temporal se interpreta con un patrón de referencia, sin atribuir automáticamente causa mecánica.',
  causes:[['cmp-shift','Flanco CMP desplazado temporalmente'],['ckp-wire','CKP sin alimentación'],['injector-open','Circuito de inyector abierto'],['ecu-power','Reinicio de ECU por fuente']],
  cue:'Una amplitud normal no prueba sincronización: compará la posición del flanco.',
  source:'https://www.picoauto.com/library/application-notes/cam-and-crank-correlation'},
 {id:'trace-injector',title:'Orden de inyección sin corriente',topic:'motor',
  symptom:'Un pulso de mando permanece visible; la corriente de la carga desaparece en una ventana.',
  cause:'injector-open',evidence:['command','current'],
  explanation:'Existe una orden lógica en el banco mientras no circula corriente; esto discrimina una carga abierta ideal de una orden ausente. No se extrapolan rampas a inyectores piezo/GDI.',
  causes:[['injector-open','Apertura ficticia de la carga del inyector'],['driver-command','Ausencia del pulso de mando ECU'],['ckp-wire','Falla CKP como única causa confirmada'],['ecu-power','Baja tensión como única causa confirmada']],
  cue:'Compará simultáneamente mando y corriente: no son la misma magnitud.',
  source:'https://www.picoauto.com/library/automotive-guided-tests/actuators/injector-%28gasoline%29/AGT-382-mpi-injector-voltage/'},
 {id:'trace-supply',title:'Caída de alimentación y pulso ausente',topic:'electricidad',
  symptom:'La alimentación de la ECU cae durante una ventana, en coincidencia con la omisión de la orden ficticia del inyector.',
  cause:'ecu-power',evidence:['supply','command'],
  explanation:'La fuente local cae a 8,2 V simultáneamente a la ausencia del pulso en el modelo; esa correlación apoya un problema de alimentación del banco, sin demostrar causalidad física general.',
  causes:[['ecu-power','Caída temporal de la alimentación local'],['injector-open','Bobina de inyector abierta como única causa'],['cmp-shift','Flanco CMP desplazado'],['ckp-wire','Rama CKP abierta']],
  cue:'Una lectura aislada de corriente no basta; correlacioná alimentación y salida ECU.',
  source:'https://www.picoauto.com/library/automotive-guided-tests/'}
];
export const TRACE_CASES=variants;
export const TRACE_WINDOWS=6;
export const TRACE_DURATION_MS=120;
function definition(id){const c=TRACE_CASES.find(c=>c.id===id);if(!c)throw Error('Caso temporal inexistente');return c;}
function safeIndex(index){if(!Number.isInteger(index)||index<0||index>=TRACE_WINDOWS)throw Error('Ventana fuera del rango');return index;}
export function createTraceSession(caseId,seed=Date.now()){
 definition(caseId);
 if(!Number.isSafeInteger(seed))throw Error('Semilla no válida');
 const eventWindow=1+(Math.imul(seed|0,1664525)+1013904223>>>0)%(TRACE_WINDOWS-2);
 return {caseId,seed,eventWindow,inspected:[],active:null,evidence:[],selectedWindow:null,selectedCause:'',reasoning:''};
}
/**
 * 0..120ms; 60-2 digital CKP, isolated CMP pulse, simulated command and current.
 * 720-degree mechanical interpretation is intentionally NOT modeled.
 */
export function generateTrace(caseId,eventWindow,index,count=481){
 const c=definition(caseId);safeIndex(eventWindow);safeIndex(index);
 if(!Number.isInteger(count)||count<241||count>1201)throw Error('Cantidad de muestras fuera del límite');
 const fault=index===eventWindow;
 return Array.from({length:count},(_,i)=>{
  const t=i*TRACE_DURATION_MS/(count-1);
  const tooth=(t/100*60)%60,position=Math.floor(tooth);
  let ckp=position<58&&(tooth-position)<.48?5:0;
  let cmp=t>=20&&t<42?5:0;
  let command=t>=70&&t<76?5:0;
  let current=command?Math.min(1.8,(t-70)*.45):0;
  let supply=12.4;
  if(fault){
   if(c.id==='trace-ckp'&&t>=46&&t<61)ckp=0;
   if(c.id==='trace-cmp')cmp=t>=34&&t<56?5:0;
   if(c.id==='trace-injector')current=0;
   if(c.id==='trace-supply'&&t>=67&&t<84){supply=8.2;command=0;current=0;}
  }
  return {t,ckp,cmp,command,current,supply};
 });
}
export function traceSummary(caseId,eventWindow,index){
 const points=generateTrace(caseId,eventWindow,index);
 const result={};
 for(const ch of TRACE_CHANNELS){
  const values=points.map(p=>p[ch.id]);
  const rising=values.filter((v,i)=>i>0&&v>values[i-1]+.1).length;
  result[ch.id]={min:Math.min(...values),max:Math.max(...values),rising};
 }
 return result;
}
export function gradeTraceSession(session){
 const c=definition(session?.caseId);
 safeIndex(session.eventWindow);
 const inspected=[...new Set(session.inspected||[])].filter(i=>Number.isInteger(i)&&i>=0&&i<TRACE_WINDOWS);
 const compared=inspected.includes(session.eventWindow)&&inspected.some(i=>i!==session.eventWindow);
 const correctWindow=session.selectedWindow===session.eventWindow;
 const correctCause=session.selectedCause===c.cause;
 const evidence=[...new Set(session.evidence||[])];
 const correctEvidence=evidence.length===2&&c.evidence.every(id=>evidence.includes(id));
 const documented=String(session.reasoning||'').trim().length>=100&&String(session.reasoning||'').trim().length<=3000;
 const score=(correctCause?40:0)+(correctWindow?25:0)+(correctEvidence&&compared?25:0)+(documented?10:0);
 return {score,passed:correctCause&&correctWindow&&correctEvidence&&compared&&documented,
  correctCause,correctWindow,correctEvidence,compared,documented,reviewedText:false,
  expectedCause:c.cause,expectedWindow:session.eventWindow,expectedEvidence:[...c.evidence]};
}
export function traceReport(session,result,date=new Date()){
 const c=definition(session.caseId);
 return ['# AutoLab Academy — Correlación temporal sintética','','Fecha: '+date.toISOString(),
  'Caso: '+c.title,'Semilla reproducible: '+session.seed,
  'Ventanas de 120 ms: '+TRACE_WINDOWS,
  'Ventanas realmente inspeccionadas: '+(session.inspected||[]).map(i=>i+1).join(', '),
  'Ventana identificada: '+(session.selectedWindow===null?'No registrada':session.selectedWindow+1),
  'Causa seleccionada: '+session.selectedCause,
  'Canales utilizados: '+(session.evidence||[]).join(', '),
  '## Justificación no revisada',String(session.reasoning||'').slice(0,3000),
  '## Respuesta de referencia',c.explanation,
  'Ventana con evento: '+(session.eventWindow+1),'Causa del generador: '+c.cause,
  'Par discriminante: '+c.evidence.join(' + '),
  'Calificación estructurada: '+result.score+'/100; superó criterios: '+result.passed,
  'Fuente contextual: '+c.source,
  'Modelos matemáticos, valores sintéticos, sin datos OEM ni conexión física. La explicación requiere revisión humana.',''].join('\n');
}
