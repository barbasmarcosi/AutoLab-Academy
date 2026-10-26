import{RW8_ROBUST_SCENARIOS,robustAnalysis,thermalSensitivity,gradeRobustExercise,robustResearchReport,
 PARETO_REFERENCE,UNCERTAINTY_REFERENCE}from'./ecu-robust-analysis.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const chooser=(id,label,options,current)=>'<label for="'+id+'">'+esc(label)+'</label><select class="field" id="'+id+'"><option value="">Seleccioná…</option>'+options.map(([v,l])=>'<option value="'+v+'" '+(String(v)===String(current)?'selected':'')+'>'+esc(l)+'</option>').join('')+'</select>';
const counts=[0,1,2,3,4].map(n=>[String(n),String(n)+' perfil'+(n===1?'':'es')]);
const rules={response_worst_below_min:'Respuesta mínima no garantizada',
 thermal_worst_above_max:'Techo térmico no garantizado',
 emissions_worst_above_max:'Techo ambiental no garantizado',
 knock_worst_above_max:'Límite simulado de detonación no garantizado',
 observability_worst_below_min:'Observabilidad mínima no garantizada'};
export function robustResearchShell(){
 return '<section class="stack"><div class="eyebrow">RW8+ · INGENIERÍA EXPERIMENTAL</div><h1>Robust Optimization Research Lab</h1><p>Distinguí elegibilidad nominal, límites bajo intervalos adversos y soluciones no dominadas en varios objetivos ficticios.</p><div id="ecu-robust-explorer"></div></section>';
}
export function mountRobustResearch(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW8+ exige registrador de evidencia');
 const state={scenarioId:'edge',predictedNominal:null,predictedRobust:null,predictedFrontier:null,
  realWorldPrediction:'',criticalEvidence:'',paretoEvidence:'',reasoning:'',limits:'',result:null,grade:null,saved:false,saving:false,error:''};
 const readPrediction=x=>x===''?null:Number(x);
 function render(){
  const s=state;
  let html='<div class="panel stack"><h2>Objetivo y validez</h2><p role="note"><strong>Todos los índices y semianchos ±0,03 son inventados, sin unidades ni interpretación estadística.</strong> No son errores de sensores medidos, intervalos de confianza, datos de emisiones, mapas reales ni umbrales OEM. El catálogo no puede escribirse a un vehículo.</p>'+
  '<p>Un candidato debe cumplir primero las cinco restricciones. La comprobación robusta usa el extremo desfavorable de un intervalo rectangular en cada indicador; si falla uno, el candidato se excluye. Solo después se determina la frontera de Pareto entre candidatos robustamente elegibles. Ningún resultado demuestra eficiencia o seguridad real.</p>'+
  '<p>Lecturas: <a href="'+PARETO_REFERENCE+'" target="_blank" rel="noopener noreferrer">concepto de Pareto</a> y <a href="'+UNCERTAINTY_REFERENCE+'" target="_blank" rel="noopener noreferrer">incertidumbre en medición (NIST)</a>. No atribuimos los números inventados a esas referencias.</p></div>';
  html+='<div class="panel stack"><h2>Escenario de incertidumbre</h2>';
  if(!s.result){
   html+=chooser('eb-scenario','Escenario de investigación',RW8_ROBUST_SCENARIOS.map(x=>[x.id,x.title]),s.scenarioId);
   const sc=RW8_ROBUST_SCENARIOS.find(x=>x.id===s.scenarioId);
   html+='<p>'+esc(sc?.description)+'</p>';
   html+='<p><strong>Restricciones ficticias:</strong> respuesta ≥'+sc.limits.minResponse.toFixed(2)+
    ', térmico ≤'+sc.limits.maxThermal.toFixed(2)+', emisiones ≤'+sc.limits.maxEmissions.toFixed(2)+
    ', detonación ≤'+sc.limits.maxKnock.toFixed(2)+', observabilidad ≥'+sc.limits.minObservability.toFixed(2)+'.</p>';
   html+=chooser('eb-nominal','Pronóstico: perfiles admisibles nominalmente',counts,s.predictedNominal);
   html+=chooser('eb-robust','Pronóstico: perfiles admisibles con margen adverso',counts,s.predictedRobust);
   html+=chooser('eb-frontier','Pronóstico: perfiles en la frontera de Pareto robusta',counts,s.predictedFrontier);
   html+=chooser('eb-real','¿Se pueden trasladar directamente estos límites a una ECU real?',
    [['si','Sí, calibrar sin más ensayos'],['no','No, los índices carecen de validación física']],s.realWorldPrediction);
   html+='<button class="button" type="button" data-eb="reveal">Congelar pronósticos y comparar</button>';
  }else{
   const a=s.result;
   html+='<p><strong>Predicción congelada:</strong> nominal '+s.predictedNominal+', robusta '+s.predictedRobust+', Pareto '+s.predictedFrontier+'; aplicabilidad real '+esc(s.realWorldPrediction)+'.</p>';
   html+='<table class="rw-table" style="width:100%"><caption>Factibilidad adimensional nominal y ante límites adversos ±0,03</caption><thead><tr><th scope="col">Perfil</th><th scope="col">Nominal</th><th scope="col">Robusto</th><th scope="col">No dominado</th></tr></thead><tbody>';
   for(const row of a.rows){
    html+='<tr><th scope="row">'+esc(row.id)+'</th><td>'+(row.nominal.feasible?'Sí':'No')+
     '</td><td>'+(row.robust.feasible?'Sí':'No')+'</td><td>'+(a.frontierIds.includes(row.id)?'Sí':'No')+'</td></tr>';
   }
   html+='</tbody></table>';
   html+='<p><strong>Cantidad:</strong> nominal '+a.nominalCount+', robusta '+a.robustCount+
    ', frontera '+a.frontierCount+'. '+(a.failClosed?'Sin opción robustamente admisible. Ningún límite fue relajado.':'Hay candidatos robustamente factibles.')+'</p>';
   html+='<h3>Razones de descarte</h3><ul>'+a.rows.map(row=>'<li><strong>'+esc(row.id)+':</strong> '+
    (row.robust.feasible?'Cumple cinco restricciones con intervalos asumidos':row.robust.violations.map(k=>esc(rules[k]||k)).join('; '))+'</li>').join('')+'</ul>';
   html+='<h3>Sensibilidad del techo térmico (solo el techo cambia)</h3>';
   html+='<table class="rw-table" style="width:100%"><caption>RW8+: barrido de techo térmico ±0,04 en índice ficticio</caption><thead><tr><th scope="col">Cambio en techo</th><th scope="col">Nominales</th><th scope="col">Robustos</th><th scope="col">Pareto</th></tr></thead><tbody>';
   for(const row of thermalSensitivity(s.scenarioId)){
    html+='<tr><th scope="row">'+(row.thermalShift>0?'+':'')+row.thermalShift.toFixed(2)+'</th><td>'+row.nominalCount+
     '</td><td>'+row.robustCount+'</td><td>'+row.frontierCount+'</td></tr>';
   }
   html+='</tbody></table><p>El frente de Pareto usa seis objetivos en su valor nominal, exclusivamente dentro del conjunto robustamente factible; no se considera incertidumbre de objetivos ni probabilidades.</p>';
   if(!s.grade){
    html+=chooser('eb-critical','Evidencia discriminante: ¿qué causa el resultado en este escenario?',[
      ['margin','Un único perfil conserva margen frente a los intervalos'],
      ['thermal','Una opción nominal se descarta porque el peor caso térmico rompe el límite'],
      ['tradeoffs','Varias opciones robustas mejoran métricas distintas sin dominarse entre sí']],s.criticalEvidence);
    html+=chooser('eb-pareto','¿Cómo se determina aquí la frontera de Pareto?',[
      ['feasible-set','Solo entre candidatos robustamente factibles, según todos los objetivos'],
      ['best-response','El perfil con mayor respuesta, incluso si viola límites'],
      ['full-catalog','Todos los perfiles del catálogo, aunque no sean factibles']],s.paretoEvidence);
    html+='<label for="eb-reason">Explicá por qué la factibilidad nominal puede no resistir una desviación y qué significa no dominancia (mín. 100 caracteres)</label><textarea id="eb-reason" class="field" rows="4" maxlength="3200">'+esc(s.reasoning)+'</textarea>';
    html+='<label for="eb-limits">Limitaciones: incertidumbre real, correlaciones, fuentes y ensayos necesarios (mín. 75 caracteres)</label><textarea id="eb-limits" class="field" rows="3" maxlength="2400">'+esc(s.limits)+'</textarea>';
    html+='<button class="button" type="button" data-eb="grade">Evaluar investigación robusta</button>';
   }else{
    html+='<p role="status"><strong>Resultado:</strong> '+s.grade.score+'/100 · '+(s.grade.passed?'Criterios objetivos completos.':'No se cumplen todos los criterios.')+'</p>';
    html+='<p class="muted">'+esc(s.grade.warning)+'</p><button class="button" type="button" data-eb="save" '+
     (s.saved||s.saving?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar expediente RW8+')+'</button>';
   }
  }
  html+='</div><div class="panel"><button class="button alt" type="button" data-eb="reset">Nuevo experimento robusto</button></div><p role="status" aria-live="polite">'+esc(s.error)+'</p>';
  root.innerHTML=html;
 }
 root.addEventListener('input',ev=>{
  const id=ev.target.id;
  if(!state.result&&id==='eb-scenario'){
   state.scenarioId=ev.target.value;state.predictedNominal=null;state.predictedRobust=null;state.predictedFrontier=null;state.realWorldPrediction='';render();return;
  }
  if(state.result&&['eb-nominal','eb-robust','eb-frontier','eb-real'].includes(id))return;
  if(id==='eb-nominal')state.predictedNominal=readPrediction(ev.target.value);
  if(id==='eb-robust')state.predictedRobust=readPrediction(ev.target.value);
  if(id==='eb-frontier')state.predictedFrontier=readPrediction(ev.target.value);
  if(id==='eb-real')state.realWorldPrediction=ev.target.value;
  if(id==='eb-critical')state.criticalEvidence=ev.target.value;
  if(id==='eb-pareto')state.paretoEvidence=ev.target.value;
  if(id==='eb-reason')state.reasoning=ev.target.value;
  if(id==='eb-limits')state.limits=ev.target.value;
 });
 root.addEventListener('click',async ev=>{
  const act=ev.target.closest('[data-eb]')?.dataset.eb;if(!act)return;state.error='';
  if(act==='reset'){Object.assign(state,{predictedNominal:null,predictedRobust:null,predictedFrontier:null,realWorldPrediction:'',criticalEvidence:'',paretoEvidence:'',
   reasoning:'',limits:'',result:null,grade:null,saved:false,saving:false});render();return;}
  if(act==='reveal'){
   if([state.predictedNominal,state.predictedRobust,state.predictedFrontier].some(x=>!Number.isInteger(x))||
    !state.realWorldPrediction){state.error='Antes de revelar, completá cuatro predicciones.';render();return;}
   try{state.result=robustAnalysis(state.scenarioId);}catch(error){state.error='Escenario o dominio inválido.';}
   render();return;
  }
  if(act==='grade'){
   if(!state.result){state.error='No hay experimento revelado.';render();return;}
   try{state.grade=gradeRobustExercise(state);}catch(error){state.error='Pronósticos o límites incompletos.';}render();return;
  }
  if(act==='save'){
   if(!state.grade||state.saving||state.saved)return;state.saving=true;
   try{await record({id:'lab-ecu-robust-v1',at:new Date().toISOString(),score:state.grade.score,passed:state.grade.passed,
     hypothesis:'nominal='+state.predictedNominal+'; robusto='+state.predictedRobust+'; pareto='+state.predictedFrontier,
     conclusion:state.result.failClosed?'Sin solución robustamente viable':'Frontera '+state.result.frontierIds.join(', '),
     used:['worst-case-interval','multiobjective-pareto','thermal-sensitivity','no-ecu-write'],
     reasoning:state.reasoning,report:robustResearchReport(state,state.grade)});state.saved=true;}
   catch(error){state.error='El almacenamiento no confirmó el guardado; podés reintentar.';}
   finally{state.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
