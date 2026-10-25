/** Paired synthetic problems. Textual reasoning is retained, never semantically graded. */
export const TRANSFER_TOPICS=['electricidad','motor','senales','redes','ev'];
export const TRANSFER_CASES=[
{id:'transfer-electricidad',topic:'electricidad',title:'Ley de Ohm: caída y resistencia máxima'},
{id:'transfer-motor',topic:'motor',title:'PWM: duty y duración del pulso'},
{id:'transfer-senales',topic:'senales',title:'CKP: frecuencia y revoluciones'},
{id:'transfer-redes',topic:'redes',title:'CAN: ocupación y capacidad'},
{id:'transfer-ev',topic:'ev',title:'SOC: carga consumida y autonomía ideal'}];
const sources={
 electricidad:'https://www.picoauto.com/library/automotive-guided-tests/',
 motor:'https://www.picoauto.com/library/automotive-guided-tests/',
 senales:'https://www.picoauto.com/library/application-notes/cam-and-crank-correlation',
 redes:'https://kvaser.com/can-protocol-tutorial/',ev:'https://pybamm.org/'};
const pick=(rng,arr)=>arr[Math.floor(rng()*arr.length)];
function seeded(seed){
 if(!Number.isSafeInteger(seed))throw Error('Semilla inválida');
 let x=seed>>>0;
 return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296};
}
function shuffle(items,r){const x=[...items];for(let i=x.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function task(topic,phase,prompt,expected,unit,tolerance,formula,assumption,evidence,irrelevant,r){
 return {id:topic+'-'+phase,topic,phase,prompt,expected:Number(expected.toFixed(5)),unit,tolerance,formula,assumption,
  evidenceAnswer:'relevant',source:sources[topic],evidenceOptions:shuffle([
   {id:'relevant',text:evidence},{id:'other',text:irrelevant},
   {id:'unsafe',text:'Improvisar conexiones de prueba sobre un sistema real energizado o desconocido.'}],r)};
}
const families={
 electricidad(r){
  const i=pick(r,[15,20,25,30,40]),m=pick(r,[10,16,20,25,30]);
  const limit=pick(r,[.2,.3,.4,.5,.6]),other=pick(r,[12,20,25,30,40]);
  return [
   task('electricidad','guided','Resistencia ficticia de '+m+' mΩ con '+i+' A. Calculá la caída de tensión en V.',i*m/1000,'V',.02,
    'ΔV = I × R; 1000 mΩ = 1 Ω.','Circuito virtual resistivo, sin límites OEM.',
    'Medir la caída entre extremos del tramo bajo carga.','Medir solo la tensión en vacío de la batería.',r),
   task('electricidad','transfer','Otro circuito admite como máximo '+limit+' V de caída con '+other+' A. ¿Qué resistencia máxima en mΩ permite?',limit/other*1000,'mΩ',.05,
    'R máxima (mΩ) = ΔV máxima ÷ I × 1000.','Problema inverso sin aplicación a instalaciones reales.',
    'Medir corriente y caída del tramo comparándolas con el límite del banco.','Leer resistencia de un ramal no relacionado.',r)];
 },
 motor(r){
  const on=pick(r,[3,4,5,6,7]),period=pick(r,[20,25,40,50]),freq=pick(r,[20,25,40,50]),duty=pick(r,[20,30,40,60,70]);
  return [
   task('motor','guided','PWM sintético activo '+on+' ms cada '+period+' ms. Calculá duty en %.',on/period*100,'%',.04,
    'Duty = tiempo activo ÷ período × 100.','PWM ideal; no determina torque, corriente o estrategia OEM.',
    'Medir período y tiempo activo en el mismo oscilograma.','Inferir duty por amplitud de la señal.',r),
   task('motor','transfer','PWM diferente a '+freq+' Hz y '+duty+'% duty. ¿Cuántos ms dura el pulso activo?',1000/freq*duty/100,'ms',.04,
    'Período (ms)=1000/frecuencia; activo=período×duty/100.','Se despeja tiempo con frecuencia y porcentaje.',
    'Contrastar frecuencia y ancho del pulso con escala temporal.','Medir batería sin escala de tiempo.',r)];
 },
 senales(r){
  const teeth=pick(r,[36,48,58]),rpm=pick(r,[600,900,1200,1500,1800]);
  const otherTeeth=pick(r,[24,36,48,58]),otherRpm=pick(r,[720,1000,1200,1800,2400]);
  return [
   task('senales','guided','Generador CKP ficticio de '+teeth+' pulsos observados/vuelta emite '+(rpm*teeth/60).toFixed(3)+' pulsos/s. ¿Qué RPM corresponde?',rpm,'rpm',1,
    'RPM = Hz × 60 ÷ pulsos observados/vuelta.','Sin RPM variable ni sincronización OEM.',
    'Comparar frecuencia y pulsos por vuelta con referencia temporal.','Inferir RPM solo por amplitud CKP.',r),
   task('senales','transfer','Otro CKP genera '+otherTeeth+' pulsos observados/vuelta y gira a '+otherRpm+' RPM. ¿Qué frecuencia de pulsos en Hz entrega?',otherRpm*otherTeeth/60,'Hz',.06,
    'Hz = RPM × pulsos observados/vuelta ÷ 60.','Generador distinto con magnitud despejada inversa.',
    'Medir pulsos por segundo y comparar con RPM conocida del banco.','Usar solamente la amplitud del sensor.',r)];
 },
 redes(r){
  const rate=pick(r,[250,500]),fps=pick(r,[100,150,200,250]),bits=pick(r,[100,120,128]);
  const otherRate=pick(r,[250,500]),otherBits=pick(r,[100,120,125]),target=pick(r,[15,20,25,30]);
  return [
   task('redes','guided','Bus CAN ficticio de '+rate+' kbit/s, '+fps+' tramas/s de '+bits+' bits totales. ¿Qué ocupación en % presenta?',fps*bits/(rate*1000)*100,'%',.04,
    'Ocupación = tramas/s × bits/trama ÷ bits/s × 100.','Se fija longitud total; no se simulan retransmisiones ni stuffing.',
    'Registrar bitrate y tasa de tramas con analizador pasivo.','Dedicar ID hexadecimal de una sola trama a calcular carga.',r),
   task('redes','transfer','Otro bus de '+otherRate+' kbit/s admite hasta '+target+'% de ocupación. Tramas de '+otherBits+' bits totales. ¿Cuántas tramas/s caben teóricamente?',otherRate*1000*target/100/otherBits,'tramas/s',.06,
    'tramas/s = bits/s × (ocupación/100) ÷ bits/trama.','Es una estimación, no un servicio garantizado del bus real.',
    'Comparar ocupación y tramas/s capturadas pasivamente.','Usar un solo ID para inferir capacidad.',r)];
 },
 ev(r){
  const cap=pick(r,[40,50,60,80]),soc=pick(r,[70,80,90]),current=pick(r,[8,12,15,20]),minutes=pick(r,[30,45,60]);
  const otherCap=pick(r,[40,50,60,80]),start=pick(r,[65,75,85]),floor=pick(r,[25,30,40]),discharge=pick(r,[10,12,15,20]);
  return [
   task('ev','guided','Batería ficticia '+cap+' Ah, SOC '+soc+'%, descarga '+current+' A por '+minutes+' min. ¿Qué SOC final ideal en %?',soc-current*minutes/60/cap*100,'%',.06,
    'SOC final = inicial − (A × horas ÷ Ah) × 100.','Sin química, temperaturas, envejecimiento ni pack HV real.',
    'Integrar corriente conocida en un intervalo con capacidad de referencia.','Tratar voltaje instantáneo como SOC exacto.',r),
   task('ev','transfer','Otra batería de '+otherCap+' Ah está en '+start+'% SOC. Descarga '+discharge+' A hasta el mínimo '+floor+'%. ¿Cuántos minutos ideales restan?',(start-floor)/100*otherCap/discharge*60,'min',.06,
    'min = (SOC inicial − piso)/100 × Ah ÷ A × 60.','Estimación matemática sin protección ni mediciones reales.',
    'Integrar corriente y contrastar con capacidad y piso del modelo.','Usar únicamente voltaje instantáneo como autonomía.',r)];
 }
};
export function buildTransferSession(seed=Date.now()){
 const r=seeded(seed);
 const pairs=shuffle(TRANSFER_TOPICS.map(topic=>({topic,
  title:TRANSFER_CASES.find(c=>c.topic===topic).title,steps:families[topic](r)})),r);
 return {version:'transfer-v1',seed,pairs};
}
export function parseTransferNumber(input){
 if(typeof input!=='string'||input.trim().length>32||!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(input.trim()))
  throw Error('Ingresá un número válido usando coma o punto decimal.');
 const n=Number(input.trim().replace(',','.'));
 if(!Number.isFinite(n))throw Error('Número fuera de rango.');
 return n;
}
export function gradeTransfer(item,answer={}){
 let value=null;try{value=parseTransferNumber(answer.value);}catch{}
 const numericCorrect=value!==null&&Math.abs(value-item.expected)<=item.tolerance+1e-9;
 const evidenceCorrect=answer.evidence===item.evidenceAnswer;
 const length=String(answer.reasoning||'').trim().length,documented=length>=70&&length<=2000;
 return {value,numericCorrect,evidenceCorrect,documented,
  score:(numericCorrect?70:0)+(evidenceCorrect?30:0),
  meetsAutomaticCriteria:numericCorrect&&evidenceCorrect&&documented,
  textReviewed:false,expected:item.expected,unit:item.unit};
}
export function evaluateTransferSession(session,answers){
 const pairs=session.pairs.map(p=>{
  const guided=gradeTransfer(p.steps[0],answers[p.steps[0].id]);
  const transfer=gradeTransfer(p.steps[1],answers[p.steps[1].id]);
  return {topic:p.topic,guided,transfer,transferPassed:transfer.meetsAutomaticCriteria};
 });
 return {pairs,guidedPassed:pairs.filter(p=>p.guided.meetsAutomaticCriteria).length,
  transferPassed:pairs.filter(p=>p.transferPassed).length,reasoningReviewed:false};
}
export function transferReport(session,answers,summary,date=new Date()){
 const lines=['# AutoLab Academy — Transferencia entre problemas sintéticos','',
  'Fecha: '+date.toISOString(),'Semilla reproducible: '+session.seed,
  'Transferencias con criterios objetivos completos: '+summary.transferPassed+'/'+session.pairs.length,
  'Nuevas formulaciones de relaciones conocidas; no prueba transferencia a vehículos reales.',''];
 session.pairs.forEach((pair,i)=>{
  lines.push('## '+(i+1)+'. '+pair.title);
  pair.steps.forEach((item,j)=>{
   const a=answers[item.id]||{},grade=j?summary.pairs[i].transfer:summary.pairs[i].guided;
   lines.push('### '+(j?'Nueva situación: incógnita distinta':'Problema guiado'),
    item.prompt,'Supuestos: '+item.assumption,
    'Ingresado: '+String(a.value??'—')+' '+item.unit,
    'Medición elegida: '+(item.evidenceOptions.find(x=>x.id===a.evidence)?.text||'—'),
    'Razonamiento no revisado: '+String(a.reasoning||'—').slice(0,2000),
    'Resultado esperado: '+item.expected+' '+item.unit+' ± '+item.tolerance,
    'Fórmula: '+item.formula,'Puntaje estructurado: '+grade.score+'/100; cumple: '+grade.meetsAutomaticCriteria,
    'Fuente contextual: '+item.source,'');
  });
 });
 lines.push('El texto necesita revisión humana. No hay certificación, datos OEM ni acceso a hardware.');
 return lines.join('\n');
}
