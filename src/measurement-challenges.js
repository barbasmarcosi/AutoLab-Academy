/**
 * Synthetic quantitative diagnostics. Does not certify physical competence.
 * Numerical answers and choice of evidence are deterministic; free text is NOT semantically graded.
 */
const choose=(rand,list)=>list[Math.floor(rand()*list.length)];
function seeded(seed){
 if(!Number.isSafeInteger(seed))throw Error('Semilla inválida');
 let x=seed>>>0;
 return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};
}
const sources={
 electricidad:'https://www.picoauto.com/library/automotive-guided-tests/',
 motor:'https://www.csselectronics.com/pages/obd2-explained-simple-intro',
 senales:'https://www.picoauto.com/library/automotive-guided-tests/',
 redes:'https://kvaser.com/can-protocol-tutorial/',
 ev:'https://pybamm.org/'
};
function make(id,topic,title,prompt,expected,unit,tolerance,formula,evidence,wrong1,wrong2,assumption){
 return {id,topic,title,prompt,expected:Number(expected.toFixed(5)),unit,tolerance,formula,assumption,source:sources[topic],
  evidenceAnswer:'correct',measurementOptions:[{id:'correct',text:evidence},{id:'other',text:wrong1},{id:'unsafe',text:wrong2}]};
}
const templates={
 voltage(r){
  const i=choose(r,[20,30,40,50,60]),m=choose(r,[10,15,20,25,30]);
  return make('voltage','electricidad','Caída de tensión en retorno',
   'En un banco de 12 V circulan '+i+' A por un tramo de '+m+' mΩ. ¿Qué caída de tensión produce ese tramo? (V)',
   i*m/1000,'V',0.015,'ΔV = I × R. Convertí mΩ a Ω.',
   'Medir entre los extremos del retorno mientras circula la corriente indicada.',
   'Leer únicamente la tensión en vacío de la batería.',
   'Puentear el retorno sin protección.',
   'Circuito resistivo sintético a corriente constante; no representa un vehículo ni habilita maniobras.');
 },
 motor(r){
  const on=choose(r,[2,3,4,5,6,7]),period=choose(r,[20,25,40,50]);
  return make('duty','motor','Duty de un actuador',
   'En un banco un actuador está activo '+on+' ms cada '+period+' ms. ¿Cuál es su ciclo de trabajo? (%)',
   on/period*100,'%',0.05,'Duty = tiempo activo ÷ período × 100.',
   'Medir tiempo activo y período completo en un oscilograma del banco.',
   'Usar únicamente la tensión de la batería con el actuador apagado.',
   'Unir pines desconocidos para observar el comportamiento.',
   'Pulsos sintéticos periódicos; no inferir estrategia de inyección OEM.');
 },
 scope(r){
  const rpm=choose(r,[600,900,1200,1500,1800,2400]),hz=rpm*58/60;
  return make('ckp','senales','Frecuencia CKP y revoluciones',
   'Una rueda ficticia produce 58 pulsos por vuelta. Se observan '+Number(hz.toFixed(3))+' pulsos/s. ¿Qué RPM corresponde? (rpm)',
   rpm,'rpm',1,'RPM = pulsos/s ÷ 58 × 60.',
   'Comprobar frecuencia y 58 pulsos por revolución, descontando los dientes ausentes.',
   'Deducir RPM únicamente por la amplitud de la señal.',
   'Conectar la masa de un instrumento a un punto HV desconocido.',
   'Sensor didáctico de 58 pulsos/vuelta a velocidad constante.');
 },
 can(r){
  const fps=choose(r,[100,125,200,250,400]),bits=choose(r,[100,120,128]),rate=choose(r,[250,500]);
  return make('can-load','redes','Utilización aproximada de CAN',
   'CAN de banco a '+rate+' kbit/s transmite '+fps+' tramas/s de exactamente '+bits+' bits totales cada una. ¿Qué porcentaje de capacidad utiliza? (%)',
   fps*bits/(rate*1000)*100,'%',0.035,'Ocupación = tramas/s × bits/trama ÷ (kbps × 1000) × 100.',
   'Medir tasa de tramas y bitrate real con analizador pasivo.',
   'Inferir ocupación solo por el valor hexadecimal de los IDs.',
   'Inyectar tráfico de prueba en un vehículo en circulación.',
   'Modelo sintético con longitud total fijada; no representa bit stuffing ni errores variables.');
 },
 soc(r){
  const cap=choose(r,[40,50,60,80]),i=choose(r,[6,12,15,20]),min=choose(r,[30,45,60]),start=choose(r,[75,85,95]);
  return make('soc','ev','SOC por integración de corriente',
   'Batería virtual: '+cap+' Ah, SOC inicial '+start+'%, descarga '+i+' A durante '+min+' minutos. ¿Cuál es el SOC final estimado? (%)',
   start-i*min/60/cap*100,'%',0.055,'SOC final = SOC inicial − (I × horas ÷ Ah) × 100.',
   'Integrar la corriente calibrada y contrastar con una referencia independiente.',
   'Tratar un voltaje instantáneo de reposo como SOC exacto universal.',
   'Abrir un paquete de tracción real sin formación y procedimiento.',
   'Modelo didáctico de capacidad constante, sin química ni temperatura variables.');
 }
};
export const QUANTITATIVE_TOPICS=['electricidad','motor','senales','redes','ev'];
export function buildQuantitativeSession(seed=Date.now()){
 const rand=seeded(seed);
 const items=QUANTITATIVE_TOPICS.map(topic=>templates[topic==='electricidad'?'voltage':topic==='motor'?'motor':topic==='senales'?'scope':topic==='redes'?'can':'soc'](rand));
 for(const q of items)q.measurementOptions=q.measurementOptions.map(x=>({x,rank:rand()})).sort((a,b)=>a.rank-b.rank).map(o=>o.x);
 items.sort(()=>rand()-0.5);
 return {version:'quant-v1',seed,items};
}
export function parseNumericAnswer(value){
 if(typeof value!=='string'||value.length>32||!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim()))throw Error('Ingresá un número, usando punto o coma decimal.');
 const number=Number(value.trim().replace(',','.'));
 if(!Number.isFinite(number))throw Error('Número inválido.');
 return number;
}
export function gradeQuantitative(question,answer={}){
 let numeric=null,numericCorrect=false;
 try{numeric=parseNumericAnswer(answer.value);numericCorrect=Math.abs(numeric-question.expected)<=question.tolerance+1e-9;}catch{}
 const evidenceCorrect=answer.measurement===question.evidenceAnswer;
 const text=String(answer.reasoning||'').trim();
 const documented=text.length>=70&&text.length<=2000&&/[a-záéíóúñ]/i.test(text);
 const score=(numericCorrect?70:0)+(evidenceCorrect?30:0);
 return {id:question.id,score,numeric,numericCorrect,evidenceCorrect,documented,
  meetsAutomaticCriteria:numericCorrect&&evidenceCorrect&&documented,explanationReviewed:false,
  expected:question.expected,unit:question.unit,tolerance:question.tolerance};
}
export function formatQuantitativeReport(session,answers,results,now=new Date()){
 const lines=['# AutoLab Academy — Evaluación cuantitativa','','Fecha: '+now.toISOString(),'Semilla reproducible: '+session.seed,
  'Todos los datos son sintéticos. La explicación escrita no ha sido revisada técnicamente.',''];
 session.items.forEach((q,index)=>{
  const a=answers[q.id]||{},r=results[index];
  lines.push('## '+(index+1)+'. '+q.title,q.assumption,q.prompt,
   'Respuesta numérica: '+String(a.value||'—')+' '+q.unit,
   'Evidencia elegida: '+(q.measurementOptions.find(o=>o.id===a.measurement)?.text||'—'),
   'Justificación: '+String(a.reasoning||'—').slice(0,2000),
   'Resultado objetivo: '+r.score+'/100; criterio estructurado: '+(r.meetsAutomaticCriteria?'cumplido':'no cumplido'),
   'Valor esperado: '+q.expected+' '+q.unit+' ± '+q.tolerance,
   'Fórmula: '+q.formula,'Fuente contextual: '+q.source,'');
 });
 lines.push('Las justificaciones y competencias prácticas requieren revisión humana.');
 return lines.join('\n');
}
