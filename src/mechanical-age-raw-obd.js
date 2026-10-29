/**
 * MA00 raw service-01 PID receipts. No hardware connection in this module.
 * Timestamps mark HOST RECEIPT, NOT sensor acquisition or PID simultaneity.
 * Descriptive A-A is the only supported comparison: no service, wear or age.
 */
import {auditSerialTrace} from './mechanical-age-serial-integrity.js';
import {assertMA00Report} from './mechanical-age-r13-claims.js';
import {assessMA00Observability} from './mechanical-age-r13-observability.js';
export const RAW_OBD_VERSION='ma00-raw-pid-receipts-v1';
const PID=Object.freeze({
 '0103':{channel:'fuelSystem1Status',unit:'enum',min:0,max:16},
 '010C':{channel:'rpm',unit:'rpm',min:0,max:16383.75},
 '0105':{channel:'ectC',unit:'C',min:-40,max:215},
 '0104':{channel:'loadPct',unit:'%',min:0,max:100},
 '0106':{channel:'stftPct',unit:'%',min:-100,max:99.22},
 '0107':{channel:'ltftPct',unit:'%',min:-100,max:99.22},
 '010F':{channel:'iatC',unit:'C',min:-40,max:215}
});
export const RAW_PID_DICTIONARY=PID;
const sortedMedian=x=>{if(!x.length)return null;const a=[...x].sort((p,q)=>p-q),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const id=x=>typeof x==='string'&&/^[A-Za-z0-9][\w.-]{2,79}$/.test(x);
const named=x=>typeof x==='string'&&x.trim().length>=3&&x.length<=120;
const time=x=>{
 if(typeof x!=='string')return false;
 const parts=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.\d+)?(Z|[+-]\d\d:\d\d)$/.exec(x);
 if(!parts)return false;
 const [_,y,mo,day,h,mi,s,zone]=parts;
 const year=Number(y),month=Number(mo),d=Number(day);
 const leap=year%4===0&&(year%100!==0||year%400===0);
 const maxDays=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
 if(month<1||month>12||d<1||d>maxDays[month-1]||Number(h)>23||Number(mi)>59||Number(s)>59)return false;
 if(zone!=='Z'){
  const zh=Number(zone.slice(1,3)),zm=Number(zone.slice(4,6));
  if(zh>14||zm>59||(zh===14&&zm!==0))return false;
 }
 return Number.isFinite(Date.parse(x));
};
const medianDifference=(a,b)=>Number((b-a).toFixed(4));

export function auditRawObdSession(session){
 if(!session||typeof session!=='object'||Array.isArray(session))throw TypeError('Sesión OBD inválida');
 const {sessionId,vehicleAlias,engineFamily,adapterModel,softwareVersion,source,capturedAt,clock,events}=session;
 if(!id(sessionId)||!id(vehicleAlias)||!named(engineFamily)||!named(adapterModel)||!named(softwareVersion))throw RangeError('Identificadores anónimos y versión de instrumento requeridos');
 if(!['synthetic','provided_obd_unverified'].includes(source)||clock!=='host_monotonic_receive')throw RangeError('Procedencia o reloj no reconocidos');
 if(!time(capturedAt))throw RangeError('Hora de inicio con zona horaria requerida');
 if(!Array.isArray(events)||events.length===0||events.length>20000)throw RangeError('Eventos OBD: 1 a 20000');
 const traceIntegrity=auditSerialTrace(session);
 if(traceIntegrity.applies&&!traceIntegrity.internallyConsistent)throw RangeError('Traza serial inconsistente: '+traceIntegrity.errors.join('; '));
 const grouped=Object.fromEntries(Object.entries(PID).map(([pid,def])=>[pid,{...def,attempts:0,success:0,failures:0,values:[],receiptTimes:[],roundTripMs:[],undocumentedLatency:0}]));
 let last=-Infinity,requestUnknown=0;
 for(const [i,e] of events.entries()){
  if(!e||typeof e!=='object'||Array.isArray(e)||!Object.hasOwn(PID,e.pid))throw RangeError('PID no autorizado en evento '+i);
  const g=grouped[e.pid];
  if(!finite(e.receivedAtMs)||e.receivedAtMs<0||e.receivedAtMs<last||e.receivedAtMs>86400000)throw RangeError('Reloj host fuera de orden/rango en evento '+i);
  last=e.receivedAtMs;
  if(!['ok','timeout','error'].includes(e.status))throw RangeError('Estado no reconocido en evento '+i);
  if(e.unit!==g.unit)throw RangeError('Unidad incompatible con '+e.pid);
  if(e.requestAtMs!==undefined&&(!finite(e.requestAtMs)||e.requestAtMs<0||e.requestAtMs>e.receivedAtMs))throw RangeError('Marca de solicitud inválida');
  if(e.status==='ok'){
   if(!finite(e.value)||e.value<g.min||e.value>g.max)throw RangeError('Valor PID fuera de rango en evento '+i);
   g.values.push(e.value);g.receiptTimes.push(e.receivedAtMs);g.success++;
  }else{
   if(Object.hasOwn(e,'value')&&e.value!==null)throw RangeError('Falla OBD no puede contener un valor medido');
   g.failures++;
  }
  if(e.requestAtMs!==undefined)g.roundTripMs.push(e.receivedAtMs-e.requestAtMs);
  else{requestUnknown++;g.undocumentedLatency++;}
  g.attempts++;
 }
 const channels={},warnings=[];
 for(const [pid,g] of Object.entries(grouped)){
  if(!g.attempts)continue;
  const median=g.values.length?sortedMedian(g.values):null;
  const medianAbsoluteDeviation=g.values.length?sortedMedian(g.values.map(v=>Math.abs(v-median))):null;
  const receiptGaps=g.receiptTimes.slice(1).map((v,i)=>v-g.receiptTimes[i]);
  let maxIdenticalRun=g.values.length?1:0,streak=maxIdenticalRun;
  for(let i=1;i<g.values.length;i++){
   streak=Object.is(g.values[i],g.values[i-1])?streak+1:1;
   maxIdenticalRun=Math.max(maxIdenticalRun,streak);
  }
  const possibleStaleOrStable=g.values.length>=20&&maxIdenticalRun/g.values.length>=0.8;
  const failFraction=g.failures/g.attempts;
  if(possibleStaleOrStable)warnings.push(pid+': meseta prolongada; canal estable, cuantizado o potencialmente congelado (no identificable)');
  if(failFraction>0.2)warnings.push(pid+': más del 20 % de respuestas fallidas; cobertura insuficiente para protocolo experimental');
  channels[pid]={
   channel:g.channel,unit:g.unit,attempts:g.attempts,success:g.success,
   failures:g.failures,failFraction,median,medianAbsoluteDeviation,
   distinctValues:new Set(g.values).size,maxIdenticalRun,possibleStaleOrStable,
   observedSpan:g.values.length?Math.max(...g.values)-Math.min(...g.values):null,
   medianReceiptGapMs:sortedMedian(receiptGaps),maxReceiptGapMs:receiptGaps.length?Math.max(...receiptGaps):null,
   medianHostRoundTripMs:sortedMedian(g.roundTripMs),unmeasuredRoundTripCount:g.undocumentedLatency
  };
 }
 const observability=assessMA00Observability({
  powertrain:session.powertrain??'unknown',fuel:session.fuel??'unknown',
  control:session.conditions?.fuelControl??'unknown',
  availablePids:Object.entries(channels).filter(([,stats])=>stats.success>0).map(([pid])=>pid)
 });
 return assertMA00Report({
  version:RAW_OBD_VERSION,sessionId,vehicleAlias,engineFamily,adapterModel,softwareVersion,
  source,capturedAt,clock,eventCount:events.length,elapsedHostReceiptMs:events.at(-1).receivedAtMs-events[0].receivedAtMs,
  channels,warnings,requestTimeMissingCount:requestUnknown,traceIntegrity,observability,
  hostReceiptTimePresent:true,sensorAcquisitionTimeKnown:false,simultaneityVerified:false,
  estimatedAgeKm:null,structuralWear:null,remainingUsefulLife:null,
  caveat:'Las marcas host son de RECEPCIÓN, no de muestreo en ECU. Latencia host/ECU no está validada.'
 },'raw_session',{source});
}

function gateAA(audits,sessions){
 const blockers=[];
 if(new Set(audits.map(a=>a.vehicleAlias)).size!==1)blockers.push('Vehículos distintos');
 if(new Set(audits.map(a=>a.engineFamily)).size!==1)blockers.push('Familias de motor distintas');
 if(new Set(audits.map(a=>a.adapterModel)).size!==1||new Set(audits.map(a=>a.softwareVersion)).size!==1)blockers.push('Capturador distinto/no equivalente');
 if(new Set(audits.map(a=>a.source)).size!==1)blockers.push('Proveniencia no uniforme');
 if(new Set(audits.map(a=>a.sessionId)).size!==audits.length)blockers.push('ID de sesión reutilizado');
 const times=audits.map(a=>Date.parse(a.capturedAt));
 for(let i=1;i<times.length;i++)if(times[i]<=times[i-1])blockers.push('Fechas de captura no ordenadas/distintas');
 if(sessions.some(x=>x.captureAborted===true))blockers.push('Captura interrumpida o desincronizada: no valida para A–A');
 if(sessions.some(x=>x.instrumentClaims?.testOnlyFakeTransport===true))blockers.push('Transporte simulado; prohibido presentarlo como sesiones físicas independientes');
 const contexts=sessions.map(x=>x.conditions);
 if(contexts.some(c=>!c||typeof c!=='object'||c.intervention!=='none'||c.fuelControl!=='closed_loop_observed'||c.ac!=='off_observed'||c.coolingFan!=='stable_observed'||c.electricalLoads!=='stable_observed'||!finite(c.ambientC)||c.ambientC< -40||c.ambientC>60)){
  blockers.push('Sin evidencia documental de A–A sin intervención y condiciones estables');
 }else{
  if(Math.max(...contexts.map(c=>c.ambientC))-Math.min(...contexts.map(c=>c.ambientC))>5)blockers.push('Temperaturas ambiente no comparables');
 }
 const required=['010C','0105','0104','0106','0107'];
 for(const [i,a] of audits.entries()){
  if(a.elapsedHostReceiptMs<19000)blockers.push('Duración host de A–A inferior a 19 s en sesión '+(i+1));
  if(sessions[i].schema==='ma00-local-serial-receipts-v1'){
   const states=sessions[i].events.filter(e=>e.pid==='0103');
   if(states.length<10||states.some(e=>e.status!=='ok'||e.value!==2||![0,2].includes(e.fuelSystem2Status)))
    blockers.push('Lazo cerrado no corroborado en todos los ciclos por PID 0103, sesión '+(i+1));
   if(!a.channels['0103']||a.channels['0103'].failFraction>0.2)
    blockers.push('Cobertura insuficiente de PID 0103 en sesión '+(i+1));
  }
  for(const pid of required){
   const c=a.channels[pid];
   if(!c||c.success<10||c.failFraction>0.2)blockers.push('Cobertura por PID insuficiente en sesión '+(i+1)+': '+pid);
   if(c&&(c.medianReceiptGapMs===null||c.medianReceiptGapMs<100||c.medianReceiptGapMs>5000||c.maxReceiptGapMs>10000))blockers.push('Cadencia PID con huecos o fuera del protocolo de sesión '+(i+1)+': '+pid);
  }
  const rpm=a.channels['010C'],ect=a.channels['0105'],load=a.channels['0104'];
  if(rpm?.median!==null&&rpm?.median!==undefined&&(rpm.median<550||rpm.median>1150))blockers.push('RPM fuera de rango educativo de ralentí en sesión '+(i+1));
  if(ect?.median!==null&&ect?.median!==undefined&&(ect.median<75||ect.median>110||ect.observedSpan>5))blockers.push('ECT fuera de régimen térmico estable en sesión '+(i+1));
  if(load?.median!==null&&load?.median!==undefined&&(load.median>35||load.observedSpan>10))blockers.push('Carga fuera de condición estable de ralentí en sesión '+(i+1));
  if(a.requestTimeMissingCount)blockers.push('Intervalos petición-respuesta ausentes: sesión '+(i+1));
 }
 const wireSignatures=sessions.map(x=>JSON.stringify(x.events.map(({pid,status,value,unit})=>({pid,status,value,unit}))));
 if(new Set(wireSignatures).size!==wireSignatures.length)blockers.push('Secuencia de señales reproducida con otros timestamps; independencia no acreditada');
 for(const pid of ['010C','0105','0104']){
  const vals=audits.map(a=>a.channels[pid]?.median);
  if(vals.every(finite)){
   const diff=Math.max(...vals)-Math.min(...vals);
   if((pid==='010C'&&diff>80)||(pid==='0105'&&diff>5)||(pid==='0104'&&diff>5))blockers.push('Condiciones de funcionamiento no comparables: '+pid);
  }
 }
 return blockers;
}
export function evaluateAAWithoutService(sessions){
 if(!Array.isArray(sessions)||sessions.length<2||sessions.length>12)throw RangeError('A–A requiere 2–12 sesiones completas');
 const audits=sessions.map(auditRawObdSession);
 const blockers=gateAA(audits,sessions);
 const comparable=blockers.length===0;
 const first=audits[0],last=audits[audits.length-1];
 const changes=comparable?Object.fromEntries(
  Object.keys(first.channels).filter(pid=>pid!=='0103'&&audits.every(a=>finite(a.channels[pid]?.median))).map(pid=>[
   pid,{unit:first.channels[pid].unit,firstMedian:first.channels[pid].median,
    lastMedian:last.channels[pid].median,
    lastMinusFirst:medianDifference(first.channels[pid].median,last.channels[pid].median),
    maxMinusMin:medianDifference(Math.min(...audits.map(a=>a.channels[pid].median)),Math.max(...audits.map(a=>a.channels[pid].median)))}
  ])
 ):null;
 return assertMA00Report({
  version:RAW_OBD_VERSION,design:'AA_without_intervention_descriptive',sessionCount:sessions.length,
  dataUnit:'session_not_obd_row',comparable,blockers,sessionAudits:audits,
  observedChanges:changes,confidenceInterval:null,noiseThresholdCalibrated:false,
  verifiedIndependence:false,causalEffect:null,healthScore:null,mechanicalAgeKm:null,wear:null,
  caveat:'Solo evidencia descriptiva A–A declarada. Dos sesiones no determinan repetibilidad poblacional, sincronía ECU ni incertidumbre causal.'
 },'aa',{source:audits.every(a=>a.source==='synthetic')?'synthetic':'provided_obd_unverified'});
}
export function syntheticAAReceiptPair(){
 const pids=['010C','0105','0104','0106','0107','010F'];
 const sessions=[];
 for(let k=0;k<2;k++){
  const events=[];
  for(let i=0;i<32;i++)for(let p=0;p<pids.length;p++){
   const pid=pids[p];
   const value={
    '010C':800+6*Math.sin(i*.5+k*.15),
    '0105':90+0.5*Math.sin(i*.2+k*.1),
    '0104':18+0.25*Math.sin(i*.3+k*.1),
    '0106':2+0.4*Math.sin(i*.6+k*.2),
    '0107':3+0.2*Math.sin(i*.2+k*.1),
    '010F':31+.2*Math.sin(i*.15+k*.2)
   }[pid];
   const receivedAtMs=i*1000+p*70+20;
   events.push({pid,status:'ok',unit:PID[pid].unit,value,requestAtMs:receivedAtMs-15,receivedAtMs});
  }
  sessions.push({
   sessionId:'aa-session-'+(k+1),vehicleAlias:'demo-unit-001',
   engineFamily:'demo-gasoline-inline4',adapterModel:'SIMULATED HOST BRIDGE',
   softwareVersion:'MA00 synthetic v1',source:'synthetic',
   clock:'host_monotonic_receive',capturedAt:'2026-10-'+String(27+k).padStart(2,'0')+'T13:00:00Z',
   conditions:{intervention:'none',fuelControl:'closed_loop_observed',ac:'off_observed',
    coolingFan:'stable_observed',electricalLoads:'stable_observed',ambientC:20+k},
   events
  });
 }
 return sessions;
}
