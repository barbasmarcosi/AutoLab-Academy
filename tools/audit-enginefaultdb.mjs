/**
 * Read-only evidence audit for EngineFaultDB.
 * Source: https://github.com/leoxthomas/EngineFaultDB
 * Pinned upstream commit c63f23ba048761d9c2a2c95d8fb4c0392a3c63d3
 * Blob SHA-1 f68678f7e08a6902ac2955d18d7fbb2624ae6b8a
 *
 * This is a fault-classification dataset measured on ONE experimental engine.
 * Never use its row-level holdouts as validation of generalization across cars.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export const ENGINEFAULT_SOURCE=Object.freeze({
 repository:'leoxthomas/EngineFaultDB',
 commit:'c63f23ba048761d9c2a2c95d8fb4c0392a3c63d3',
 path:'EngineFaultDB_Final.csv',
 blobSha:'f68678f7e08a6902ac2955d18d7fbb2624ae6b8a',
 expectedBytes:5334236,
 citation:'https://doi.org/10.1109/ACCESS.2023.3331316',
 license:'GPL-3.0 (repository LICENSE; check reuse scope before distributing)'
});
const HEADER=['Fault','MAP','TPS','Force','Power','RPM','Consumption L/H','Consumption L/100KM','Speed','CO','HC','CO2','O2','Lambda','AFR'];
const val=x=>{const n=Number(x);if(x.trim()===''||!Number.isFinite(n))throw RangeError('Non-finite CSV field');return n;};
export function gitBlobSha(raw){
 const b=Buffer.isBuffer(raw)?raw:Buffer.from(raw,'utf8');
 return createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
}
export function auditEngineFaultCsv(raw){
 const text=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
 if(typeof text!=='string'||text.length>10_000_000)throw RangeError('EngineFaultDB CSV too large or invalid');
 const lines=text.trimEnd().split(/\r?\n/);
 if(lines.length<2)throw RangeError('No data rows');
 const header=lines[0].replace(/^\uFEFF/,'').split(',');
 if(JSON.stringify(header)!==JSON.stringify(HEADER))throw RangeError('Unexpected EngineFaultDB schema');
 const cols=header.length;
 const seen=new Set(),classes=new Map();
 let duplicates=0,prev=null,segments=0,afrMeanAbsErr=0,afrMaxAbsErr=0;
 const tracked=['MAP','TPS','RPM','Power','Lambda','AFR','CO','HC'];
 for(let j=1;j<lines.length;j++){
  const cells=lines[j].split(',');
  if(cells.length!==cols)throw RangeError('Mismatched field count at line '+(j+1));
  const values=cells.map(val);
  const label=values[0];
  if(!Number.isInteger(label)||label<0||label>3)throw RangeError('Unexpected fault class');
  if(prev!==label){segments++;prev=label;}
  if(seen.has(lines[j]))duplicates++;else seen.add(lines[j]);
  if(!classes.has(label))classes.set(label,{n:0,sums:Object.fromEntries(tracked.map(x=>[x,0]))});
  const group=classes.get(label);group.n++;
  for(const key of tracked)group.sums[key]+=values[header.indexOf(key)];
  const residual=Math.abs(values[header.indexOf('AFR')]-14.7*values[header.indexOf('Lambda')]);
  afrMeanAbsErr+=residual;
  afrMaxAbsErr=Math.max(afrMaxAbsErr,residual);
 }
 const n=lines.length-1;
 return {
  schema:'MA00-enginefault-empirical-audit-v1',
  provenance:{...ENGINEFAULT_SOURCE,gitBlobSha:gitBlobSha(raw),bytes:Buffer.byteLength(text)},
  observationCount:n,columns:header,
  exactDuplicateRows:duplicates,
  faultClassCounts:Object.fromEntries([...classes].map(([label,g])=>[label,g.n])),
  faultClassMeans:Object.fromEntries([...classes].map(([label,g])=>[label,Object.fromEntries(tracked.map(k=>[k,Number((g.sums[k]/g.n).toFixed(3))]))])),
  contiguousLabelRuns:segments,
  afrLambdaMeanAbsResidual147:Number((afrMeanAbsErr/n).toFixed(6)),
  afrLambdaMaxAbsResidual147:Number(afrMaxAbsErr.toFixed(6)),
  independentVehicleIdentifiers:0,
  timestampColumnPresent:false,
  mileageColumnPresent:false,
  wearGroundTruthPresent:false,
  allowsUnseenVehicleEvaluation:false,
  allowsMechanicalAgeValidation:false,
  warning:'One instrumented engine, correlated observations, no vehicle IDs/time/odometer/wear ground truth. Fault labels are not aging labels. Random-row accuracy would not establish generalization.'
 };
}
export function verifyPinnedEngineFault(raw){
 const data=Buffer.isBuffer(raw)?raw:Buffer.from(raw,'utf8');
 if(data.length!==ENGINEFAULT_SOURCE.expectedBytes||gitBlobSha(data)!==ENGINEFAULT_SOURCE.blobSha){
  throw new Error('Pinned EngineFaultDB source integrity failed');
 }
 const audit=auditEngineFaultCsv(data);
 if(audit.observationCount!==55999||audit.contiguousLabelRuns!==4)throw Error('Unexpected pinned dataset content');
 return audit;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(process.argv.length!==3)throw Error('Usage: node tools/audit-enginefaultdb.mjs path/to/EngineFaultDB_Final.csv');
 const result=verifyPinnedEngineFault(readFileSync(process.argv[2]));
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
