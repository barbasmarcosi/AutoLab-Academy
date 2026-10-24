/**
 * Adapter for can-utils candump log text. Not a CAN stack or DBC decoder.
 * Parses classic data frames in "log format", never transmits messages.
 * No OEM signal meaning is inferred from arbitration IDs.
 */
const FRAME=/^(?:\((\d+(?:\.\d+)?)\)\s+)?([a-zA-Z][\w.:-]{0,31})\s+([0-9a-fA-F]{3}|[0-9a-fA-F]{8})#([0-9a-fA-F]{0,16})$/;
export const MAX_CAN_INPUT=1_000_000;
export const MAX_CAN_LINES=12000;
export function parseCandump(text){
 if(typeof text!=='string'||text.length>MAX_CAN_INPUT)throw Error('Archivo no válido o mayor a 1 MB.');
 const lines=text.split(/\r?\n/);
 if(lines.length>MAX_CAN_LINES)throw Error('La captura supera las 12.000 líneas admitidas. Seleccioná un fragmento.');
 const frames=[];let skipped=0;let empty=0;
 for(let i=0;i<lines.length;i++){
  const raw=lines[i].trim();
  if(!raw||raw.startsWith('//')){empty++;continue;}
  const m=FRAME.exec(raw);
  if(!m){skipped++;continue;}
  const idNum=parseInt(m[3],16),extended=m[3].length===8;
  if((extended?idNum>0x1fffffff:idNum>0x7ff)||m[4].length%2!==0){skipped++;continue;}
  frames.push({line:i+1,time:m[1]===undefined?null:Number(m[1]),interface:m[2],id:m[3].toUpperCase(),idNumber:idNum,extended,bytes:m[4].match(/../g)?.map(byte=>parseInt(byte,16))||[]});
 }
 return {frames,skipped,empty,lines:lines.length,timestamps:frames.some(f=>f.time!==null),format:'candump-classic'};
}
function median(values){const v=[...values].sort((a,b)=>a-b),n=v.length;return n?n%2?v[(n-1)/2]:(v[n/2-1]+v[n/2])/2:null;}
export function analyzeCanFrames(frames){
 const groups=new Map();
 for(const frame of frames){
  const k=frame.id;
  if(!groups.has(k))groups.set(k,[]);
  groups.get(k).push(frame);
 }
 const ids=[...groups].map(([id,rows])=>{
  const ordered=rows.filter(f=>Number.isFinite(f.time)).sort((a,b)=>a.time-b.time);
  const gaps=[];
  for(let i=1;i<ordered.length;i++){
   const ms=(ordered[i].time-ordered[i-1].time)*1000;
   if(ms>0)gaps.push(ms);
  }
  const period=median(gaps);
  const maxGap=gaps.length?Math.max(...gaps):null;
  const distinctPayloads=new Set(rows.map(r=>r.bytes.map(b=>b.toString(16).padStart(2,'0')).join(''))).size;
  return {id,extended:rows[0].extended,count:rows.length,dlcs:[...new Set(rows.map(r=>r.bytes.length))].sort((a,b)=>a-b),distinctPayloads,medianGapMs:period,maxGapMs:maxGap,gapCandidate:period!==null&&gaps.length>=4&&maxGap>=2.5*period&&maxGap>period+5};
 }).sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id));
 const times=frames.filter(f=>f.time!==null).map(f=>f.time);
 return {frameCount:frames.length,uniqueIds:ids.length,ids,durationSeconds:times.length>=2?Math.max(...times)-Math.min(...times):null,observedInterfaces:[...new Set(frames.map(f=>f.interface))],suspectedGaps:ids.filter(x=>x.gapCandidate).length};
}
/** Deterministic, exclusively simulated 0x120 RPM and 0x220 temperature messages. */
export function sampleCandump(){
 const base=1761320000;
 const lines=[];
 for(let i=0;i<36;i++){
  const t=base+(i+(i>=19?3:0))*.020;
  const rpm=780+(i%8)*15;
  const raw=Math.round(rpm/0.25);
  const rpmBytes=[raw&255,(raw>>8)&255,i&255,0,0,0,0,0];
  const temp=90+(i%4);
  lines.push('('+t.toFixed(6)+') vcan0 120#'+rpmBytes.map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase());
  if(i%2===0)lines.push('('+(t+.005).toFixed(6)+') vcan0 220#'+(temp+40).toString(16).padStart(2,'0').toUpperCase()+'00');
 }
 return lines.join('\n');
}
/** ONLY use this decoder when the user selected our synthetic sample, not arbitrary CAN logs. */
export function decodeSyntheticSample(frames){
 return frames.filter(f=>f.id==='120'&&f.bytes.length>=2).map(f=>({time:f.time,rpm:(f.bytes[0]+256*f.bytes[1])*0.25}));
}
