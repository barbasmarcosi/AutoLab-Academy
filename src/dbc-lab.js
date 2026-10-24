/**
 * Adapter over Candied (third-party DBC parser/decoder).
 * Does not reinvent DBC bit extraction. No CAN transmission/encoding controls.
 */
import {Dbc,Can} from 'candied';
export const MAX_DBC_BYTES = 600_000;
export function loadDbc(text){
 if(typeof text!=='string'||!text.trim()||text.length>MAX_DBC_BYTES)throw Error('DBC inválido, vacío o mayor a 600 KB.');
 if(!text.includes('BO_')||!text.includes('SG_'))throw Error('DBC no contiene mensajes y señales.');
 const dbc=new Dbc();
 let database;
 try {database=dbc.load(text);} catch(e){throw Error('No se pudo analizar DBC: '+String(e?.message||e).slice(0,250));}
 if(!database)throw Error('El parser no devolvió una base de datos.');
 const decoder=new Can();
 decoder.database=database;
 return {dbc,database,decoder};
}
export function decodeFramesWithDbc(loaded,frames,limit=400){
 if(!loaded?.decoder||!Array.isArray(frames))throw Error('Cargá primero una captura CAN y su DBC.');
 const decoded=[],errors=[],missing=new Set();
 for(const frame of frames.slice(0,Math.max(0,Math.min(limit,400)))){
  try{
   const raw=loaded.decoder.createFrame(frame.idNumber,frame.bytes);
   const msg=loaded.decoder.decode(raw);
   if(!msg){missing.add('0x'+frame.id);continue;}
   let signals=msg.signals;
   if(signals instanceof Map)signals=[...signals.entries()];
   else if(signals&&typeof signals==='object')signals=Object.entries(signals);
   else signals=[];
   decoded.push({time:frame.time,id:frame.id,message:String(msg.name||'Mensaje CAN'),signals:signals.slice(0,48).map(([name,s])=>({name:String(name),value:s?.value??s?.rawValue??null,physical:String(s?.physValue??s?.value??'—')}))});
  }catch(error){errors.push({id:frame.id,message:String(error?.message||error).slice(0,150)});}
 }
 return {decoded,errors:errors.slice(0,10),errorCount:errors.length,missing:[...missing].sort(),examined:Math.min(frames.length,limit,400)};
}
