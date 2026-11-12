/**
 * Diagnóstico diferencial de fallas sintéticas: dos causas plausibles pueden
 * compartir el mismo síntoma, lectura o forma de onda.
 * Sin acceso a vehículos, sin emulación OEM ni revisión semántica del texto.
 */
const round=(n,decimals=3)=>Number(n.toFixed(decimals));
const rcCurve=t=>round(12*(1-Math.exp(-t/.02)),3); // tau=20 ms para ambos defectos
const cableV=round(5*6/(1+6),3); // cable 1ohm, load 6ohm
export const differentialCases=[
 {id:'di-mosfet',topic:'motor',title:'Actuador inactivo con PWM correcto',
  symptom:'La entrada de puerta tiene PWM sintético de 5 V a 100 Hz. El actuador de 12 V no realiza trabajo. ¿Carga abierta o MOSFET de alta resistencia?',
  circuit:['+12 V','Carga 8 Ω','Drenador MOSFET','Fuente/masa'],
  variants:[
   {id:'load-open',label:'Circuito abierto en carga',reason:'La puerta conmuta, pero la carga abierta impide corriente. Una sola captura del mando no distingue carga de driver.'},
   {id:'driver-loss',label:'Resistencia de conducción elevada',reason:'La puerta sigue conmutando, pero la resistencia equivalente de 12 Ω produce caída VDS y menor corriente; no permite localizar defecto físico sin otras pruebas.'}
  ],
  probes:[
   {id:'gate',label:'Registrar PWM en puerta',classification:'normal',discriminating:false,values:['5 V; 100 Hz; duty 30%','5 V; 100 Hz; duty 30%'],unit:'onda lógica'},
   {id:'current',label:'Medir corriente de carga durante estado ON',classification:'abnormal',discriminating:true,values:['0 A',round(12/(8+12),3)+' A'],unit:'A'},
   {id:'vds',label:'Medir VDS en conducción durante estado ON',classification:'abnormal',discriminating:true,values:['0 V (sin corriente en la carga)',round(12*12/(8+12),3)+' V'],unit:'V'},
   {id:'unsafe',label:'Puenteo improvisado del transistor sin protección',classification:'unsafe',discriminating:false,values:['Maniobra bloqueada','Maniobra bloqueada'],unsafe:true}
  ],
  trace:{type:'pwm',duration:20,unit:'ms',title:'Puerta MOSFET: misma forma de onda en ambas fallas'},
  source:'https://www.picoauto.com/library/automotive-guided-tests/',
  limitation:'Modelo resistivo ideal en estado ON, sin dinámica de puerta, inductancia, temperatura ni saturación.'},
 {id:'di-rc',topic:'senales',title:'Misma curva RC, dos componentes distintos',
  symptom:'El filtro de entrada de 12 V responde más rápido que el nominal (τ=100 ms). La curva revela τ=20 ms, pero ¿falló R o C?',
  circuit:['Escalón 12 V','R serie','Nodo sensor','C a masa'],
  variants:[
   {id:'capacitance-low',label:'Capacitor reducido a 20 µF',reason:'La resistencia sigue siendo 1000 Ω; la capacidad bajó a 20 µF. El producto R×C es 20 ms.'},
   {id:'resistance-low',label:'Resistor reducido a 200 Ω',reason:'La capacitancia sigue siendo 100 µF; R bajó a 200 Ω. El mismo producto R×C genera la misma curva.'}
  ],
  probes:[
   {id:'waveform',label:'Capturar Vc a 20 y 100 ms',classification:'abnormal',discriminating:false,values:[
    rcCurve(.02)+' V / '+rcCurve(.1)+' V',rcCurve(.02)+' V / '+rcCurve(.1)+' V'],unit:'V'},
   {id:'resistance',label:'Medir R con el banco virtual desenergizado',classification:'abnormal',discriminating:true,values:['1000 Ω','200 Ω'],unit:'Ω'},
   {id:'capacitance',label:'Medir C en condiciones virtuales aisladas',classification:'abnormal',discriminating:true,values:['20 µF','100 µF'],unit:'µF'},
   {id:'unsafe',label:'Modificar la entrada de una ECU real alimentada',classification:'unsafe',discriminating:false,values:['Maniobra bloqueada','Maniobra bloqueada'],unsafe:true}
  ],
  trace:{type:'rc',duration:100,unit:'ms',title:'Curva Vc: superpuesta para ambas causas, no distingue R de C'},
  source:'https://www.picoauto.com/library/automotive-guided-tests/',
  limitation:'Cargas, fugas, tolerancias, resistencia de fuente y otros transitorios no modelados.'},
 {id:'di-wire',topic:'electricidad',title:'Misma tensión de carga, distintas corrientes',
  symptom:'Una carga resistiva virtual recibe solo 4,286 V desde una fuente ideal de 5 V. ¿Conexión serie resistiva o carga excesiva?',
  circuit:['Fuente 5 V','Cable / terminal','Resistencia de carga','Masa'],
  variants:[
   {id:'wire-high',label:'Cable de 10 Ω con carga de 60 Ω',reason:'El cable tiene resistencia elevada; I=5/(10+60)=0,0714 A y Vcarga≈4,286 V.'},
   {id:'overload',label:'Carga de 6 Ω con cable de 1 Ω',reason:'La carga bajó a 6 Ω; I=5/(1+6)=0,714 A y Vcarga≈4,286 V. La tensión sola no diferencia las causas.'}
  ],
  probes:[
   {id:'load-voltage',label:'Medir Vcarga respecto de masa',classification:'abnormal',discriminating:false,values:[cableV+' V',cableV+' V'],unit:'V'},
   {id:'current',label:'Medir corriente del ramal virtual',classification:'abnormal',discriminating:true,values:[round(5/70,4)+' A',round(5/7,4)+' A'],unit:'A'},
   {id:'cable-resistance',label:'Medir resistencia del tramo serie, banco apagado',classification:'abnormal',discriminating:true,values:['10 Ω','1 Ω'],unit:'Ω'},
   {id:'unsafe',label:'Puentear protección para aumentar corriente',classification:'unsafe',discriminating:false,values:['Maniobra bloqueada','Maniobra bloqueada'],unsafe:true}
  ],
  trace:{type:'voltage',duration:40,unit:'ms',title:'Vcarga constante: el mismo nivel para ambas causas'},
  source:'https://www.picoauto.com/library/automotive-guided-tests/',
  limitation:'Fuentes y resistores ideales. No implica que esos valores sean seguros para experimentar físicamente.'}
];
function findCase(id){const c=differentialCases.find(c=>c.id===id);if(!c)throw Error('Caso diferencial desconocido');return c;}
export function validateDifferentialCase(c){
 if(!/^di-[a-z0-9-]+$/.test(c?.id)||c.variants.length!==2||c.probes.length<3)throw Error('Caso diferencial inválido');
 if(new Set(c.variants.map(v=>v.id)).size!==2||new Set(c.probes.map(p=>p.id)).size!==c.probes.length)throw Error('IDs duplicados');
 if(!c.probes.some(p=>p.discriminating&&!p.unsafe)||!c.probes.some(p=>!p.discriminating&&!p.unsafe&&p.values[0]===p.values[1]))throw Error('Se necesitan observaciones ambiguas y discriminantes');
 if(!c.probes.some(p=>p.unsafe))throw Error('Falta control de acciones inseguras');
 for(const p of c.probes)if(p.values.length!==2||!p.label||!['normal','abnormal','unsafe'].includes(p.classification))throw Error('Instrumento inválido');
 return true;
}
export function createDifferentialSession(caseId,seed=Date.now()){
 const c=findCase(caseId);validateDifferentialCase(c);
 if(!Number.isSafeInteger(seed))throw Error('Semilla inválida');
 const variantIndex=(Math.imul(seed|0,1103515245)+12345>>>0)%2;
 return {caseId,seed,variantIndex,initial:'',observations:[],final:'',reasoning:''};
}
export function getDifferentialProbe(caseId,index,probeId){
 const c=findCase(caseId),p=c.probes.find(x=>x.id===probeId);
 if(!p||![0,1].includes(index))throw Error('Lectura virtual inválida');
 return {id:p.id,label:p.label,reading:p.values[index],classification:p.classification,discriminating:p.discriminating,unsafe:Boolean(p.unsafe)};
}
export function gradeDifferential(session){
 const c=findCase(session.caseId),correctId=c.variants[session.variantIndex]?.id;
 if(!correctId)throw Error('Sesión inválida');
 const observed=[...new Set((session.observations||[]).map(o=>o.id))].map(id=>getDifferentialProbe(c.id,session.variantIndex,id));
 const unsafe=observed.some(p=>p.unsafe);
 const discriminated=observed.some(p=>p.discriminating&&!p.unsafe);
 // Only a correct forecast for a discriminating, revealed observation counts.
 // Predicting a shared symptom (or an unsafe action) cannot validate a hypothesis.
 const predicted=observed.some(p=>{
  if(p.unsafe||!p.discriminating)return false;
  const o=(session.observations||[]).find(x=>x?.id===p.id);
  return o?.prediction===p.classification;
 });
 // The UI locks the initial hypothesis before measurement, but this pure
 // grader must also reject absent or forged values. It cannot prove timing.
 const initialRecorded=c.variants.some(v=>v.id===session.initial);
 const correct=session.final===correctId;
 const documented=String(session.reasoning||'').trim().length>=100&&String(session.reasoning||'').trim().length<=3000;
 const score=unsafe?0:(correct&&initialRecorded?50:0)+(discriminated?30:0)+(predicted?10:0)+(documented?10:0);
 return {score,passed:!unsafe&&initialRecorded&&correct&&discriminated&&predicted&&documented,
  initialRecorded,correct,discriminated,predicted,documented,unsafe,solution:correctId,textReviewed:false};
}
export function differentialTrace(caseId,index,count=240){
 const c=findCase(caseId);
 if(![0,1].includes(index)||!Number.isInteger(count)||count<20||count>1000)throw Error('Parámetros de curva inválidos');
 return Array.from({length:count},(_,i)=>{
  const t=i*c.trace.duration/(count-1);
  let value=0;
  if(c.trace.type==='rc')value=12*(1-Math.exp(-(t/1000)/.02));
  if(c.trace.type==='pwm')value=t%10<3?5:0;
  if(c.trace.type==='voltage')value=cableV;
  return {t,value};
 });
}
export function differentialReport(session,result,date=new Date()){
 const c=findCase(session.caseId),v=c.variants[session.variantIndex];
 const observations=(session.observations||[]).map(o=>({...getDifferentialProbe(c.id,session.variantIndex,o.id),prediction:o.prediction}));
 return ['# AutoLab Academy — Diagnóstico diferencial sintético','',
  'Fecha: '+date.toISOString(),'Caso: '+c.title,'Semilla: '+session.seed,'',
  'Síntoma común: '+c.symptom,'Hipótesis inicial: '+session.initial,
  '## Predicciones y mediciones',...observations.map(o=>'- '+o.label+' | previsto '+o.prediction+' | observado '+o.classification+' | '+o.reading),
  '## Conclusión',session.final,'Causa generada: '+v.label,
  '## Justificación',String(session.reasoning||'').slice(0,3000),
  '## Modelo',v.reason,c.limitation,
  'Puntaje: '+result.score+'/100; cumplimiento estructurado: '+result.passed,
  'Fuente contextual: '+c.source,
  'Los resultados son ficticios, el texto no se ha evaluado semánticamente y la práctica no acredita competencia profesional.',''].join('\n');
}
