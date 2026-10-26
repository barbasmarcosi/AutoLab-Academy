import{ECU_SCENARIOS,ECU_PROFILES,evaluateECUScenario,gradeECUScenario,ecuScenarioReport,
 ECU_RESEARCH_SOURCE,ECU_OPTIMIZATION_SOURCE}from'./ecu-optimization.js';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const dropdown=(id,label,items,value,blank)=>'<label for="'+id+'">'+e(label)+'</label><select id="'+id+'" class="field">'+(blank?'<option value="">'+e(blank)+'</option>':'')+
 items.map(([id,title])=>'<option value="'+id+'" '+(id===value?'selected':'')+'>'+e(title)+'</option>').join('')+'</select>';
const names={response:'Respuesta solicitada',fuelProxy:'Índice de consumo',thermalProxy:'Índice térmico',emissionsProxy:'Índice ambiental',knockProxy:'Índice de detonación',observability:'Observabilidad'};
const reasons={response_below_minimum:'Respuesta inferior al mínimo',thermal_over_limit:'Índice térmico excedido',
 emissions_over_limit:'Índice ambiental excedido',knock_over_limit:'Índice de detonación excedido',
 observability_below_minimum:'Observabilidad insuficiente'};
export function ecuOptimizationShell(){
 return '<section class="stack"><div class="eyebrow">AUTOMOTIVE ENGINEERING · RW8</div><h1>ECU Optimization Research Lab</h1><p>Elegí una estrategia bajo restricciones simultáneas. Ningún perfil contiene parámetros para programar un vehículo.</p><div id="ecu-optimization-explorer"></div></section>';
}
export function mountECUOptimization(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW8 requiere persistencia segura');
 const state={scenarioId:'daily',predicted:'',realCalibrationPrediction:'',reasoning:'',limits:'',revealed:null,grade:null,saved:false,saving:false,error:''};
 function render(){
  const s=state;
  let html='<div class="panel stack"><h2>Alcance del experimento</h2><p role="note"><strong>Catálogo ficticio, no calibración ECU.</strong> Los índices de respuesta, consumo, carga térmica, emisión y detonación son números adimensionales inventados. No equivalen a Nm, rpm, temperatura, AFR, lambda, grados de chispa, mapas de inyección, contaminantes ni valores medidos. Ninguna operación escribe CAN/UDS, flashea ECUs o consulta un vehículo.</p><p>Las restricciones son <strong>obligatorias</strong>: una estrategia que incumpla cualquiera queda descartada. Si ninguna es viable, el optimizador informa ausencia de solución, sin aflojar límites.</p><p>Fundamento: <a href="'+ECU_RESEARCH_SOURCE+'" target="_blank" rel="noopener noreferrer">Bosch: gestión ECU</a> y <a href="'+ECU_OPTIMIZATION_SOURCE+'" target="_blank" rel="noopener noreferrer">SAE: calibración basada en modelos y restricciones</a>.</p></div>';
  html+='<div class="panel stack"><h2>RW8 · Investigación de perfiles ECO/DAILY/SPORT/DIAGNOSTIC</h2>';
  if(!s.revealed){
   html+=dropdown('er-scenario','Objetivo experimental',
    ECU_SCENARIOS.map(x=>[x.id,x.name]),s.scenarioId);
   const cfg=ECU_SCENARIOS.find(x=>x.id===s.scenarioId);
   html+='<p>'+e(cfg.description)+'</p><p>El propósito no es maximizar una sola cifra ignorando límites; la solución debe satisfacer todos los techos y mínimos del escenario.</p>';
   html+=dropdown('er-predicted','Predicción: única estrategia compatible con los límites',
    ECU_PROFILES.map(x=>[x.id,x.id]),s.predicted,'Elegí antes de calcular…');
   html+=dropdown('er-real','¿Puede aplicarse esta estrategia directamente a un motor/ECU real?',
    [['si','Sí, sin pruebas'],['no','No, es un ejercicio sintético']],s.realCalibrationPrediction,'Elegí antes de calcular…');
   html+='<button class="button" type="button" data-er="reveal">Congelar hipótesis y optimizar</button>';
  }else{
   const cfg=s.revealed;
   html+='<p><strong>Objetivo:</strong> '+e(cfg.name)+' — '+e(cfg.description)+'</p><p>Predicción previa congelada: '+e(s.predicted)+'; aplicabilidad real: '+e(s.realCalibrationPrediction)+'.</p>';
   html+='<table class="rw-table" style="width:100%"><caption>Comparativa sintética de perfiles: índices sin unidad, no límites de motor real</caption><thead><tr><th scope="col">Perfil</th><th scope="col">Respuesta</th><th scope="col">Térmico</th><th scope="col">Emisiones</th><th scope="col">Detonación</th><th scope="col">Admisible</th></tr></thead><tbody>';
   for(const p of cfg.profiles){
    const result=cfg.feasibility.find(x=>x.id===p.id);
    html+='<tr><th scope="row">'+e(p.id)+'</th><td>'+p.response.toFixed(2)+'</td><td>'+p.thermalProxy.toFixed(2)+'</td><td>'+p.emissionsProxy.toFixed(2)+'</td><td>'+p.knockProxy.toFixed(2)+'</td><td>'+(result.feasible?'Sí':'No')+'</td></tr>';
   }
   html+='</tbody></table><p><strong>Restricciones del escenario:</strong> respuesta ≥'+cfg.limits.minResponse.toFixed(2)+', térmico ≤'+cfg.limits.maxThermal.toFixed(2)+', emisiones ≤'+cfg.limits.maxEmissions.toFixed(2)+', detonación ≤'+cfg.limits.maxKnock.toFixed(2)+', observabilidad ≥'+cfg.limits.minObservability.toFixed(2)+'.</p>';
   html+='<h3>Descarte documentado</h3><ul>'+cfg.feasibility.map(x=>'<li><strong>'+e(x.id)+':</strong> '+(x.feasible?'Cumple todos los límites':x.violations.map(k=>e(reasons[k])).join('; '))+'</li>').join('')+'</ul>';
   html+='<p><strong>Opción seleccionada por el optimizador:</strong> '+e(cfg.chosen??'NINGUNA — restricciones incompatibles')+'.</p><p class="muted">Las cifras no tienen procedencia física; el objetivo ordena las alternativas <em>solamente después</em> de verificar todas las restricciones. La tabla omite consumo y observabilidad por espacio, pero figuran en el expediente exportable.</p>';
   if(!s.grade){
    html+='<label for="er-reason">Justificá por qué se excluyen las estrategias incompatibles y cuál es el objetivo de optimización (mín. 100 caracteres)</label><textarea id="er-reason" class="field" rows="4" maxlength="3200">'+e(s.reasoning)+'</textarea>';
    html+='<label for="er-limits">Limitaciones de índices, seguridad, homologación y ensayos necesarios (mín. 70 caracteres)</label><textarea id="er-limits" class="field" rows="3" maxlength="2400">'+e(s.limits)+'</textarea>';
    html+='<button class="button" data-er="grade" type="button">Evaluar investigación RW8</button>';
   }else{
    html+='<p role="status"><strong>Resultado:</strong> '+s.grade.score+'/100 · '+(s.grade.passed?'Criterios del laboratorio alcanzados.':'Falta seleccionar una opción válida o declarar límites suficientes.')+'</p><p class="muted">'+e(s.grade.warning)+'</p>';
    html+='<button class="button" data-er="save" type="button" '+(s.saved||s.saving?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar expediente RW8')+'</button>';
   }
  }
  html+='</div><div class="panel"><button class="button alt" data-er="reset" type="button">Nuevo escenario RW8</button></div><p role="status" aria-live="polite">'+e(s.error)+'</p>';
  root.innerHTML=html;
 }
 root.addEventListener('input',ev=>{
  const map={'er-scenario':'scenarioId','er-predicted':'predicted','er-real':'realCalibrationPrediction',
   'er-reason':'reasoning','er-limits':'limits'};
  if(state.revealed&&['scenarioId','predicted','realCalibrationPrediction'].includes(map[ev.target.id]))return;
  if(map[ev.target.id])state[map[ev.target.id]]=ev.target.value;
  if(ev.target.id==='er-scenario'&&!state.revealed)render();
 });
 root.addEventListener('click',async ev=>{
  const action=ev.target.closest('[data-er]')?.dataset.er;if(!action)return;
  state.error='';
  if(action==='reset'){Object.assign(state,{predicted:'',realCalibrationPrediction:'',reasoning:'',limits:'',revealed:null,grade:null,saved:false,saving:false});render();return;}
  if(action==='reveal'){
   if(!state.predicted||!state.realCalibrationPrediction){state.error='Primero congelá una estrategia y declará el límite de aplicación real.';render();return;}
   try{state.revealed=evaluateECUScenario(state.scenarioId);}
   catch(error){state.error='Escenario o restricciones inválidos.';}
   render();return;
  }
  if(action==='grade'){
   if(!state.revealed){state.error='Primero ejecutá la comparación.';render();return;}
   try{state.grade=gradeECUScenario(state);}catch(error){state.error='Faltan datos de evaluación válidos.';}
   render();return;
  }
  if(action==='save'){
   if(!state.grade||state.saving||state.saved)return;state.saving=true;
   try{await record({id:'lab-ecu-optimization-v1',at:new Date().toISOString(),score:state.grade.score,
    passed:state.grade.passed,hypothesis:state.predicted,conclusion:state.revealed.chosen??'Sin solución factible',
    used:['response-limit','thermal-constraint','emissions-constraint','knock-constraint','observability'],
    reasoning:state.reasoning,report:ecuScenarioReport(state,state.grade)});state.saved=true;}
   catch(error){state.error='No se confirmó el guardado en IndexedDB; reintentá sin perder esta investigación.';}
   finally{state.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
