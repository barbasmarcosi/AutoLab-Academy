/**
 * Nonvisual evidence for charts. Values are measured only from the provided
 * synthetic or user-supplied series, never inferred from pixel positions.
 * Sampling controls output length; min/max always inspect every observation.
 */
export function chartEvidence(points,timeKey,series,maxRows=9){
 if(!Array.isArray(points)||!Array.isArray(series)||!series.length)throw Error('Gráfico incompatible');
 const columns=series.filter(s=>s&&typeof s.key==='string'&&typeof s.label==='string');
 const valid=points.filter(p=>p&&typeof p==='object'&&Number.isFinite(p[timeKey]));
 const limit=Math.max(2,Math.min(20,Number.isInteger(maxRows)?maxRows:9));
 const count=Math.min(valid.length,limit);
 const positions=count===1?[0]:Array.from({length:count},(_,i)=>Math.round(i*(valid.length-1)/(count-1)));
 const samples=positions.map(i=>valid[i]);
 const stats=columns.map(({key,label,unit=''})=>{
  const values=valid.map(p=>p[key]).filter(Number.isFinite);
  return {key,label,unit,count:values.length,
   min:values.length?Math.min(...values):null,
   max:values.length?Math.max(...values):null};
 });
 return {count:valid.length,total:points.length,timeKey,samples,stats,
  firstTime:valid.length?valid[0][timeKey]:null,
  lastTime:valid.length?valid.at(-1)[timeKey]:null};
}
