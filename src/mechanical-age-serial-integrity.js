/**
 * MA00 serial trace consistency gate.
 * Recovers the stored Service 01 measurement from bounded ELM bytes and
 * checks it against numeric fields. This checks an UNAUTHENTICATED FILE,
 * not sensor calibration, ECU provenance, physical accuracy or wear.
 * No Node APIs: also works in the offline PWA.
 */
export const SERIAL_TRACE_VERSION='ma00-raw-serial-integrity-v1';
const specs=Object.freeze({
 '010C':{length:2,unit:'rpm',decode:b=>(b[0]*256+b[1])/4},
 '0105':{length:1,unit:'C',decode:b=>b[0]-40},
 '0104':{length:1,unit:'%',decode:b=>b[0]*100/255},
 '0106':{length:1,unit:'%',decode:b=>(b[0]-128)*100/128},
 '0107':{length:1,unit:'%',decode:b=>(b[0]-128)*100/128},
 '010F':{length:1,unit:'C',decode:b=>b[0]-40}
});
const has=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
function rawText(hex){
 if(typeof hex!=='string'||hex.length>2048||hex.length%2||!/^[0-9a-fA-F]*$/.test(hex))throw RangeError('Raw serial HEX incorrecto o excesivo');
 let text='';
 for(let i=0;i<hex.length;i+=2){
  const n=parseInt(hex.slice(i,i+2),16);
  if(n>127)throw RangeError('Respuesta serial contiene bytes no ASCII');
  text+=String.fromCharCode(n);
 }
 return text;
}
function oneLine(text,echo){
 if(!text.endsWith('>'))throw RangeError('Respuesta sin prompt completo');
 const lines=text.slice(0,-1).toUpperCase().replace(/\n/g,'\r').split('\r')
  .map(s=>s.replace(/\s+/g,'')).filter(Boolean).filter(s=>s!==echo);
 if(lines.length!==1)throw RangeError('Respuesta serial ambigua o multitrama');
 return lines[0];
}
function decodePid(pid,hex){
 const spec=specs[pid];
 if(!spec)throw RangeError('PID fuera del contrato MA00');
 const line=oneLine(rawText(hex),pid);
 if(!/^[0-9A-F]+$/.test(line)||line.length!==4+spec.length*2||!line.startsWith('41'+pid.slice(2)))throw RangeError('Respuesta no corresponde al PID esperado');
 const bytes=Array.from({length:spec.length},(_,i)=>parseInt(line.slice(4+i*2,6+i*2),16));
 return spec.decode(bytes);
}
function decodeMask(hex){
 const line=oneLine(rawText(hex),'0100');
 if(!/^4100[0-9A-F]{8}$/.test(line))throw RangeError('Bitmap de soporte ambiguo');
 const bitmap=Number.parseInt(line.slice(4),16)>>>0;
 return Array.from({length:32},(_,i)=>i+1).filter(p=>(bitmap & (1 << (32-p)))!==0).map(p=>'01'+p.toString(16).toUpperCase().padStart(2,'0'));
}
export function auditSerialTrace(session){
 if(session?.schema!=='ma00-local-serial-receipts-v1')return {
  version:SERIAL_TRACE_VERSION,applies:false,internallyConsistent:null,
  errors:[],independentlyAuthenticated:false,wearInferenceAllowed:false
 };
 const errors=[],add=m=>errors.push(m);
 const events=session.events;
 if(!Array.isArray(events)||events.length<1||events.length>20000){
  add('Eventos de captura vacíos o excesivos');
  return {version:SERIAL_TRACE_VERSION,applies:true,internallyConsistent:false,
   errors,independentlyAuthenticated:false,wearInferenceAllowed:false};
 }
 let support=[];
 try{support=decodeMask(session.supportedPidMaskRawHex);}
 catch(e){add('Bitmap de compatibilidad: '+e.message);}
 if(!Array.isArray(session.supportedPids)||JSON.stringify(session.supportedPids)!==JSON.stringify(support))add('Lista de PIDs no coincide con bitmap original');
 if(!Number.isInteger(session.plannedCycles)||session.plannedCycles<1||session.plannedCycles>100)add('Ciclos planificados ausentes o inválidos');
 const active=Object.keys(specs).filter(pid=>support.includes(pid));
 const expected=session.plannedCycles*active.length;
 if(session.expectedEventCount!==expected)add('Número esperado de eventos incompatible con la captura');
 if(typeof session.captureAborted!=='boolean')add('Estado de finalización no declarado');
 if(session.captureAborted===true&&typeof session.abortReason!=='string')add('Motivo de aborto ausente');
 if(session.captureAborted===false&&session.abortReason!==null)add('Motivo de aborto contradictorio');
 const claims=session.instrumentClaims;
 if(!claims||claims.ecuAcquisitionTimestampKnown!==false||claims.transportLatencyCalibrated!==false)add('Afirmaciones instrumentales no reconocidas');
 let firstFailure=-1;
 for(let i=0;i<events.length;i++){
  const e=events[i];
  if(!e||typeof e!=='object'||!has(specs,e.pid)){add('PID inválido en evento '+i);continue;}
  if(!support.includes(e.pid))add('PID no anunciado en el bitmap en evento '+i);
  if(e.unit!==specs[e.pid].unit)add('Unidad incorrecta en evento '+i);
  if(typeof e.rawFrameSizeBytes!=='number'||e.rawFrameSizeBytes!==e.rawResponseHex?.length/2)add('Longitud RAW no coincide en evento '+i);
  if(typeof e.requestAtMs!=='number'||!Number.isFinite(e.requestAtMs)||typeof e.receivedAtMs!=='number'||!Number.isFinite(e.receivedAtMs)||e.requestAtMs<0||e.receivedAtMs<e.requestAtMs)add('Marcas de tiempo inválidas en evento '+i);
  try{
   const raw=rawText(e.rawResponseHex);
   if(e.status==='ok'){
    const decoded=decodePid(e.pid,e.rawResponseHex);
    if(typeof e.value!=='number'||!Number.isFinite(e.value)||Math.abs(e.value-decoded)>1e-8)add('Valor numérico no corresponde a bytes originales en evento '+i);
   }else if(e.status==='error'||e.status==='timeout'){
    if(has(e,'value')&&e.value!==null)add('Fallo con valor no autorizado en evento '+i);
    if(e.status==='timeout'&&raw.endsWith('>'))add('Timeout contradictorio con prompt completo en evento '+i);
    if(e.status==='error'){
     if(typeof e.parseError!=='string'||e.parseError.length<3)add('Error de parser sin explicación en evento '+i);
     try{decodePid(e.pid,e.rawResponseHex);add('Error reportado para trama decodificable en evento '+i);}
     catch{/* error verdaderamente no decodificable */}
    }
    if(firstFailure<0)firstFailure=i;
   }else add('Estado de evento inválido en '+i);
  }catch(error){add('Trama RAW inválida en evento '+i+': '+error.message);}
 }
 if(firstFailure>=0&&firstFailure!==events.length-1)add('La captura continuó después de una trama no confiable');
 if((firstFailure>=0)!==(session.captureAborted===true))add('Indicador de aborto contradictorio con fallos de captura');
 if(session.captureAborted===false&&events.length!==expected)add('Captura terminada prematuramente sin marca de aborto');
 if(session.captureAborted===true&&events.length>expected)add('Aborto con eventos excedentes');
 return {
  version:SERIAL_TRACE_VERSION,applies:true,internallyConsistent:errors.length===0,
  errors,activePids:active,expectedEventCount:expected,observedEventCount:events.length,
  independentlyAuthenticated:false,wearInferenceAllowed:false,
  caveat:'Consistencia de un archivo NO autentica ECU/sensor/vehículo, ni prueba precisión o desgaste.'
 };
}
