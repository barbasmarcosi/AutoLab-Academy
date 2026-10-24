/**
 * BMS educational analysis only: coulomb counting and elementary QA.
 * NOT a battery electrochemistry simulator and NOT a real vehicle SOH estimator.
 * Physics-based simulations are delegated to PyBaMM (Python companion).
 */
export const MAX_BMS_FILE_BYTES=500_000;
export const MAX_BMS_ROWS=2000;
export const BMS_SCENARIOS=[
 {id:'nominal',title:'Descarga nominal',description:'Celda de prueba virtual: 60 Ah de referencia y 12 A durante una hora.',capacityAh:60,trueCapacityAh:60,biasA:0,expected:'nominal'},
 {id:'bias',title:'Sensor de corriente descalibrado',description:'El estimador recibe 12,6 A cuando la corriente real simulada es 12 A.',capacityAh:60,trueCapacityAh:60,biasA:0.6,expected:'bias'},
 {id:'aged',title:'Capacidad útil reducida',description:'La batería sintética entrega 48 Ah efectivos; el estimador aún usa 60 Ah.',capacityAh:60,trueCapacityAh:48,biasA:0,expected:'capacity'}
];
const columns=['t_s','current_a','voltage_v'];
function bounded(value,min,max,name){const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)throw Error('Valor inválido de '+name+'; rango '+min+'–'+max+'.');return n;}
export function generateSyntheticBms(id='nominal'){
 const scenario=BMS_SCENARIOS.find(s=>s.id===id);
 if(!scenario)throw Error('Escenario desconocido');
 const rows=[];
 for(let i=0;i<=120;i++){
  const t=i*30,elapsedHours=t/3600,actualCurrent=12,usedAh=actualCurrent*elapsedHours;
  const soc=Math.max(0,100-100*usedAh/scenario.trueCapacityAh);
  // Algebraic mock voltage, not a chemistry-based or fitted battery model.
  const voltage=4.1-0.9*(1-soc/100)-actualCurrent*0.004;
  rows.push({t_s:t,current_a:actualCurrent+scenario.biasA,voltage_v:voltage,soc_reference_pct:soc});
 }
 return {rows,source:'AutoLab deterministic synthetic illustration',scenarioId:id};
}
export function parseBmsCsv(text){
 if(typeof text!=='string'||text.length>MAX_BMS_FILE_BYTES)throw Error('CSV demasiado grande o inválido (máximo 500 KB).');
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);
 if(lines.length<3||lines.length>MAX_BMS_ROWS+1)throw Error('CSV: se requieren 2–2000 muestras.');
 const fields=lines[0].split(',').map(x=>x.trim().toLowerCase());
 for(const key of columns)if(!fields.includes(key))throw Error('CSV: falta columna '+key+'.');
 const allowed=new Set([...columns,'soc_reference_pct']);
 if(fields.some(x=>!allowed.has(x))||new Set(fields).size!==fields.length)throw Error('Columnas no reconocidas o duplicadas.');
 const rows=lines.slice(1).map((line,index)=>{
  const bits=line.split(',').map(x=>x.trim());
  if(bits.length!==fields.length||bits.some(x=>x===''))throw Error('Fila '+(index+2)+': cantidad de columnas/valores inválida.');
  const raw=Object.fromEntries(fields.map((key,i)=>[key,bits[i]]));
  const row={
   t_s:bounded(raw.t_s,0,1e8,'t_s'),
   current_a:bounded(raw.current_a,-1500,1500,'current_a'),
   voltage_v:bounded(raw.voltage_v,0.01,1500,'voltage_v')
  };
  if('soc_reference_pct'in raw)row.soc_reference_pct=bounded(raw.soc_reference_pct,0,100,'soc_reference_pct');
  return row;
 });
 for(let i=1;i<rows.length;i++)if(rows[i].t_s<=rows[i-1].t_s)throw Error('El tiempo debe crecer estrictamente en la fila '+(i+2)+'.');
 return {rows,source:'Archivo CSV importado; parámetros y procedencia no verificados',scenarioId:null};
}
export function formatBmsCsv(rows){
 if(!Array.isArray(rows)||!rows.length)throw Error('No hay muestras para exportar.');
 const withReference=rows.every(row=>Number.isFinite(row.soc_reference_pct));
 const header=columns.concat(withReference?['soc_reference_pct']:[]);
 return [header.join(','),...rows.map(row=>header.map(key=>Number(row[key]).toFixed(6)).join(','))].join('\n')+'\n';
}
export function analyzeBms(rows,options={}){
 if(!Array.isArray(rows)||rows.length<2||rows.length>MAX_BMS_ROWS)throw Error('Se requieren 2–2000 muestras.');
 const capacityAh=bounded(options.capacityAh??60,0.1,2000,'capacidad Ah');
 const initialSocPct=bounded(options.initialSocPct??100,0,100,'SOC inicial');
 const effectiveBiasA=bounded(options.biasCorrectionA??0,-50,50,'corrección de sesgo');
 const series=[],warnings=[];
 let cumulativeAh=0,positiveAh=0,negativeAh=0;
 for(let i=0;i<rows.length;i++){
  const row=rows[i];
  for(const key of columns)if(!Number.isFinite(row[key]))throw Error('Muestra inválida: '+key);
  if(i>0){
   const prior=rows[i-1],seconds=row.t_s-prior.t_s;
   if(seconds<=0)throw Error('Marcas de tiempo no crecientes.');
   const amperes=(row.current_a+prior.current_a)/2-effectiveBiasA;
   const ah=amperes*seconds/3600;
   cumulativeAh+=ah;if(ah>=0)positiveAh+=ah;else negativeAh-=ah;
  }
  const unboundedSoc=initialSocPct-100*cumulativeAh/capacityAh;
  series.push({
   t_s:row.t_s,current_a:row.current_a,voltage_v:row.voltage_v,
   soc_est_pct:Math.min(100,Math.max(0,unboundedSoc)),
   soc_unclipped_pct:unboundedSoc,
   soc_reference_pct:Number.isFinite(row.soc_reference_pct)?row.soc_reference_pct:null
  });
 }
 const durationH=(rows.at(-1).t_s-rows[0].t_s)/3600;
 const end=series.at(-1);
 if(series.some(x=>x.soc_unclipped_pct<0||x.soc_unclipped_pct>100))warnings.push('El SOC estimado excede 0–100%; revisá capacidad, SOC inicial y sensor. La curva visible se limita a ese rango.');
 if(rows.some(x=>x.voltage_v>=60))warnings.push('La captura incluye tensión alta. La aplicación NO indica cómo medir físicamente el sistema.');
 const reference=end.soc_reference_pct;
 return {
  series,capacityAh,initialSocPct,correctedBiasA:effectiveBiasA,
  durationH,dischargeAh:positiveAh,chargeAh:negativeAh,netDischargeAh:cumulativeAh,
  finalSocPct:end.soc_est_pct,
  referenceSocPct:reference,
  finalErrorPp:reference===null?null:end.soc_est_pct-reference,
  warnings
 };
}
/** Only valid for independently established and comparable full usable-capacity tests. */
export function capacitySohPct(measuredFullAh,baselineFullAh){
 const actual=bounded(measuredFullAh,0.01,2000,'capacidad medida');
 const baseline=bounded(baselineFullAh,0.01,2000,'capacidad de referencia');
 return 100*actual/baseline;
}
/** Fixed pedagogical cases; no validation of actual HV state is implied. */
export function bmsQuestion(scenarioId){
 if(scenarioId==='bias')return {prompt:'La referencia disminuye 20 puntos, pero el SOC estimado desciende 21. ¿Qué explica mejor la divergencia?',options:[['bias','Un sesgo positivo sostenido en la medición de corriente'],['voltage','Que la tensión sin carga siempre mide SOC exactamente'],['inverter','Falla comprobada del inversor']],answer:'bias',explanation:'Un sesgo constante en la corriente acumula error durante la integración: 0,6 A × 1 h = 0,6 Ah, equivalentes a 1 punto de una capacidad supuesta de 60 Ah.'};
 if(scenarioId==='aged')return {prompt:'La batería virtual perdió capacidad útil, pero el algoritmo mantiene el valor nominal. ¿Cuál es la hipótesis principal?',options:[['capacity','Capacidad efectiva inferior a la utilizada en el estimador'],['bias','Sesgo de corriente obligatoriamente positivo'],['network','Falla comprobada del bus CAN']],answer:'capacity',explanation:'Con la misma descarga de 12 Ah, un modelo de 60 Ah estima 80%, mientras la referencia sintética de 48 Ah termina en 75%. La diferencia no basta para certificar SOH real.'};
 return {prompt:'En el caso nominal, una descarga de 12 Ah desde 100% y capacidad de 60 Ah debería terminar aproximadamente en:',options:[['80','80%'],['20','20%'],['60','60%']],answer:'80',explanation:'SOC = 100 − (12 Ah / 60 Ah) × 100 = 80%. Supone capacidad y referencia inicial correctas.'};
}
