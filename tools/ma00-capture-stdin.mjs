#!/usr/bin/env node
/**
 * MA00 experimental receive-side bridge. Reads NDJSON from stdin, writes a
 * non-overwriting local JSON receipt record. NO OBD hardware access and NO
 * ECU timestamp: clock starts when THIS PROCESS sees the request line.
 *
 * Protocol:
 * {"kind":"request","requestId":"q-001","pid":"010C"}
 * {"kind":"response","requestId":"q-001","pid":"010C","status":"ok","value":850,"unit":"rpm"}
 * Also status: "timeout" | "error" without value.
 */
import {createInterface} from 'node:readline';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {pathToFileURL} from 'node:url';
import {auditRawObdSession,RAW_PID_DICTIONARY} from '../src/mechanical-age-raw-obd.js';

const validId=x=>typeof x==='string'&&/^[A-Za-z0-9][\w.-]{2,79}$/.test(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const time=()=>new Date().toISOString();
export async function captureBridgeStdin(lines,{sessionId,vehicleAlias,engineFamily,adapterModel,softwareVersion,out}){
 if(!validId(sessionId)||!validId(vehicleAlias)||typeof engineFamily!=='string'||engineFamily.trim().length<3||typeof adapterModel!=='string'||adapterModel.trim().length<3||typeof softwareVersion!=='string'||softwareVersion.trim().length<3||typeof out!=='string'||!out.trim())throw RangeError('Requiere session, vehicle alias, engine, adapter, software y ruta de salida');
 const pending=new Map(),start=performance.now(),events=[];
 const capturedAt=time();
 const stamp=()=>Number((performance.now()-start).toFixed(4));
 for await(const raw of lines){
  if(!raw.trim())continue;
  if(raw.length>8192)throw RangeError('Línea NDJSON excesiva');
  const packet=JSON.parse(raw),arrival=stamp();
  if(!packet||typeof packet!=='object'||Array.isArray(packet)||typeof packet.requestId!=='string'||!validId(packet.requestId)||!Object.hasOwn(RAW_PID_DICTIONARY,packet.pid))throw RangeError('Trama de puente inválida');
  if(packet.kind==='request'){
   if(pending.has(packet.requestId))throw RangeError('requestId duplicado sin respuesta');
   pending.set(packet.requestId,{pid:packet.pid,arrivedAtMs:arrival});
  }else if(packet.kind==='response'){
   const original=pending.get(packet.requestId);
   if(!original||original.pid!==packet.pid)throw RangeError('Respuesta sin solicitud verificable');
   pending.delete(packet.requestId);
   if(!['ok','timeout','error'].includes(packet.status))throw RangeError('Estado inválido');
   const expected=RAW_PID_DICTIONARY[packet.pid];
   if(packet.unit!==expected.unit)throw RangeError('Unidad distinta a PID');
   if(packet.status==='ok'&&!finite(packet.value))throw RangeError('Valor no numérico');
   if(packet.status!=='ok'&&packet.value!==undefined&&packet.value!==null)throw RangeError('Error no puede incluir valor');
   const event={pid:packet.pid,status:packet.status,unit:packet.unit,
    requestAtMs:original.arrivedAtMs,receivedAtMs:arrival};
   if(packet.status==='ok')event.value=packet.value;
   events.push(event);
   if(events.length>20000)throw RangeError('Límite de eventos excedido');
  }else throw RangeError('kind no reconocido');
 }
 if(pending.size)throw RangeError('Solicitudes pendientes al cerrar el puente (no fabricar timeouts)');
 if(!events.length)throw RangeError('Captura sin respuestas');
 const record={schema:'ma00-bridge-receipts-v1',sessionId,vehicleAlias,engineFamily,adapterModel,softwareVersion,
  capturedAt,source:'provided_obd_unverified',clock:'host_monotonic_receive',
  conditions:null,events,
  warning:'requestAtMs y receivedAtMs son ARRIBOS al bridge Node, no tiempos de ECU ni transmisión: intervalo incluye scheduling de proceso y no permite atribuir latencia a la ECU',
  independentMechanicalReference:null};
 const audit=auditRawObdSession(record);
 writeFileSync(out,JSON.stringify(record,null,2)+'\n',{encoding:'utf8',flag:'wx',mode:0o600});
 return {path:out,eventCount:audit.eventCount,unmeasuredRoundTrip:audit.requestTimeMissingCount,
  sensorAcquisitionTimeKnown:audit.sensorAcquisitionTimeKnown,qualityWarnings:audit.warnings,
  physicalWearEstimated:false};
}
function parseArgs(args){
 const parsed={};
 for(let i=0;i<args.length;i+=2){
  const key=args[i],v=args[i+1];
  if(!key?.startsWith('--')||!v)throw Error('Uso: --session ID --vehicle ALIAS --engine FAMILIA --adapter MODELO --software VERSION --out RUTA');
  parsed[key.slice(2)]=v;
 }
 return {sessionId:parsed.session,vehicleAlias:parsed.vehicle,engineFamily:parsed.engine,
  adapterModel:parsed.adapter,softwareVersion:parsed.software,out:parsed.out};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const result=await captureBridgeStdin(createInterface({input:process.stdin,crlfDelay:Infinity}),parseArgs(process.argv.slice(2)));
  process.stdout.write(JSON.stringify(result)+'\n');
 }catch(err){
  process.stderr.write('MA00 bridge: '+err.message+'\n');
  process.exitCode=1;
 }
}
