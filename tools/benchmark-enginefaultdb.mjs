/**
 * MA00 pre-physical falsification: coarsened operational-regime matching.
 *
 * DATA: one experimental engine, four contiguous fault blocks, no timestamps,
 * odometer, longitudinal wear reference, or independent vehicle IDs.
 *
 * Matching by RPM/MAP/TPS is DESCRIPTIVE. It does not isolate causal fault
 * effects, establish genuine independent units, or calibrate mechanical age.
 * CLI verifies immutable EngineFaultDB source before using it.
 */
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {verifyPinnedEngineFault} from './audit-enginefaultdb.mjs';

export const BENCHMARK_VERSION='MA00-enginefault-regime-overlap-v1';
const FIELDS=['CO','HC','Lambda'];
const CONTEXT=['RPM','MAP','TPS'];
const LIMIT=100000;
const rounded=x=>x===null?null:(Math.abs(x)<0.000005?0:Number(x.toFixed(5)));
const mean=(sum,n)=>n?sum/n:null;
function quantileCuts(values,parts){
 const sorted=[...values].sort((a,b)=>a-b);
 const cuts=[];
 for(let k=1;k<parts;k++){
  const v=sorted[Math.floor(sorted.length*k/parts)];
  if(!cuts.length||v>cuts[cuts.length-1])cuts.push(v);
 }
 return cuts;
}
function bin(v,cuts){
 let i=0;
 while(i<cuts.length&&v>=cuts[i])i++;
 return i;
}
function summarize(rows,group){
 const subset=rows.filter(r=>r.Fault===group),n=subset.length;
 const sums=Object.fromEntries(FIELDS.map(m=>[m,subset.reduce((s,r)=>s+r[m],0)]));
 return {n,means:Object.fromEntries(FIELDS.map(m=>[m,rounded(mean(sums[m],n))]))};
}
export function analyzeRegimeOverlap(rows,{bins=4,minPerArm=20}={}){
 if(!Array.isArray(rows)||rows.length<8||rows.length>LIMIT)throw RangeError('Se necesitan de 8 a 100000 observaciones');
 if(!Number.isInteger(bins)||bins<2||bins>8||!Number.isInteger(minPerArm)||minPerArm<1||minPerArm>1000)throw RangeError('Configuración de grilla inválida');
 const labels=new Map();
 for(const r of rows){
  if(!r||typeof r!=='object'||!Number.isInteger(r.Fault)||r.Fault<0||r.Fault>3)throw RangeError('Fault fuera de 0..3');
  for(const f of [...FIELDS,...CONTEXT])if(typeof r[f]!=='number'||!Number.isFinite(r[f]))throw RangeError('Variable no numérica: '+f);
  labels.set(r.Fault,(labels.get(r.Fault)||0)+1);
 }
 if(!labels.has(0))throw RangeError('Falta grupo normal');
 const cuts=Object.fromEntries(CONTEXT.map(k=>[k,quantileCuts(rows.map(r=>r[k]),bins)]));
 const groups=new Map();
 for(const row of rows){
  const key=CONTEXT.map(k=>bin(row[k],cuts[k])).join(':');
  let byLabel=groups.get(key);
  if(!byLabel){byLabel=new Map();groups.set(key,byLabel);}
  let g=byLabel.get(row.Fault);
  if(!g){g={n:0,sums:Object.fromEntries(FIELDS.map(m=>[m,0]))};byLabel.set(row.Fault,g);}
  g.n++;
  for(const m of FIELDS)g.sums[m]+=row[m];
 }
 const normal=summarize(rows,0),comparisons={};
 for(const label of [...labels.keys()].sort().filter(x=>x!==0)){
  const fault=summarize(rows,label),stats={overlapCells:0,weight:0,eligibleNormalRows:0,eligibleFaultRows:0,delta:Object.fromEntries(FIELDS.map(f=>[f,0]))};
  for(const byLabel of groups.values()){
   const a=byLabel.get(0),b=byLabel.get(label);
   if(!a||!b||a.n<minPerArm||b.n<minPerArm)continue;
   const w=Math.min(a.n,b.n);
   stats.overlapCells++;stats.weight+=w;
   stats.eligibleNormalRows+=a.n;stats.eligibleFaultRows+=b.n;
   for(const m of FIELDS)stats.delta[m]+=w*(b.sums[m]/b.n-a.sums[m]/a.n);
  }
  const overlap=stats.weight>0;
  const coverage=Math.min(stats.weight/normal.n,stats.weight/fault.n);
  comparisons[label]={
   label:Number(label),normalRows:normal.n,faultRows:fault.n,overlapCells:stats.overlapCells,
   matchedWeight:stats.weight,matchedWeightFractionOfSmallerGroup:rounded(stats.weight/Math.min(normal.n,fault.n)),
   eligibleNormalRowFraction:rounded(stats.eligibleNormalRows/normal.n),
   eligibleFaultRowFraction:rounded(stats.eligibleFaultRows/fault.n),
   rawMeanDelta:Object.fromEntries(FIELDS.map(m=>[m,rounded(fault.means[m]-normal.means[m])])),
   matchedRegimeDelta:overlap?Object.fromEntries(FIELDS.map(m=>[m,rounded(stats.delta[m]/stats.weight)])):null,
   interpretationAllowed:overlap&&coverage>=0.1&&stats.overlapCells>=2,
   importantLimitation:'Binning no ajusta confusores no medidos; filas correlacionadas de un único motor'
  };
 }
 return {
  version:BENCHMARK_VERSION,design:'descriptive_operating_regime_overlap',
  rowCount:rows.length,independentEngineCount:1,labels:Object.fromEntries(labels),
  grouping:CONTEXT,cutPoints:cuts,requestedBins:bins,minPerArm,normal,
  comparisons,supervisedValidationAllowed:false,engineAgeKm:null,structuralWear:null,
  causalIdentification:false,pValues:null,confidenceIntervals:null,
  warnings:[
   'Una sola unidad motriz y cuatro bloques de clases: sin validación entre motores o periodos independientes',
   'Las diferencias son descriptivas de señales de escape en condiciones observadas; ni siquiera igualar RPM/MAP/TPS controla todos los factores de confusión',
   'Las celdas fuera de soporte común se excluyen, no extrapolar resultados a otros regímenes',
   'Sin etiqueta de desgaste ni ciclos de vida: edad mecánica, salud y vida remanente no identificables'
  ]
 };
}
export function parseEngineFaultForOverlap(raw){
 const str=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
 if(typeof str!=='string'||str.length>10000000)throw RangeError('CSV inválido');
 const lines=str.trimEnd().split(/\r?\n/);
 const header=lines.shift()?.replace(/^\uFEFF/,'').split(',');
 const needed=['Fault',...CONTEXT,...FIELDS];
 if(!header||needed.some(k=>!header.includes(k)))throw RangeError('Columnas obligatorias ausentes');
 const index=Object.fromEntries(needed.map(k=>[k,header.indexOf(k)]));
 return lines.map((line,i)=>{
  const cells=line.split(',');
  if(cells.length!==header.length)throw RangeError('CSV no rectangular en línea '+(i+2));
  const r={};
  for(const k of needed){
   const value=cells[index[k]];
   if(value===''||!Number.isFinite(Number(value)))throw RangeError('Campo inválido '+k+' en línea '+(i+2));
   r[k]=Number(value);
  }
  return r;
 });
}
export function runPinnedEngineFaultBenchmark(raw){
 const audit=verifyPinnedEngineFault(raw);
 const rows=parseEngineFaultForOverlap(raw);
 const studies=[3,4,5].map(bins=>analyzeRegimeOverlap(rows,{bins,minPerArm:20}));
 return {
  schema:BENCHMARK_VERSION,
  sourceCommit:audit.provenance.commit,sourceBlob:audit.provenance.gitBlobSha,
  sourceRowCount:audit.observationCount,contiguousLabelRuns:audit.contiguousLabelRuns,
  hasWearGroundTruth:audit.wearGroundTruthPresent,
  sensitivityGrid:studies,
  externalValidationAcrossEngines:false,mechanicalAgeIdentified:false,
  conclusion:'Cambios en CO/HC/lambda antes y después de igualar groseramente RPM/MAP/TPS: auditoría descriptiva de confusión operativa, NO rendimiento predictivo ni evidencia de envejecimiento.'
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(process.argv.length!==3)throw Error('Usage: node tools/benchmark-enginefaultdb.mjs path/to/pinned.csv');
 process.stdout.write(JSON.stringify(runPinnedEngineFaultBenchmark(readFileSync(process.argv[2])),null,2)+'\n');
}
