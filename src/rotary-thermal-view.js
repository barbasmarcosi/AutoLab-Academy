import{thermalExercise,gradeThermalExercise,thermalReport,THERMAL_SOURCE}from'./rotary-thermal-research.js';
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const choices=(id,label,options,current)=>'<label for="'+id+'">'+label+'</label><select id="'+id+'" class="field">'+options.map(([v,l])=>'<option value="'+v+'" '+(String(v)===String(current)?'selected':'')+'>'+safe(l)+'</option>').join('')+'</select>';
export function thermalShell(){
 return '<section class="stack"><div class="eyebrow">ROTARY ENGINEERING · RW2/RW3</div><h1>Thermodynamics Research Bench</h1><p>Separá el ciclo termodinámico ideal, la arquitectura Wankel y el balance energético medido o simulado. Pronosticá resultados antes de conocer los números.</p><div id="rotary-thermal-explorer"></div></section>';
}
export function mountThermalLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW2/3 requiere guardar evidencia');
 const state={ratioA:8,ratioB:10,gamma:1.35,heatInputKw:100,
  idealPrediction:'',residualPrediction:'',realEnginePrediction:'',reasoning:'',limits:'',
  frozen:false,result:null,grading:null,saving:false,saved:false,error:''};
 const N=(v,d=3)=>Number(v).toFixed(d);
 function render(){
  const s=state;
  let html='<div class="panel stack"><h2>Contrato de validez</h2><p role="note"><strong>Dos modelos independientes.</strong> RW2 usa el ciclo Otto ideal con aire estándar, γ constante, procesos ideales y una compresión hipotética. <strong>Otto describe un ciclo, Wankel describe una arquitectura.</strong> RW3 contabiliza flujos energéticos <em>inventados</em>; no los deduce de RW2 ni de la geometría RW1. Ni el laboratorio ni su nota predicen eficiencia, sellado, portado, potencia o emisiones de un motor real.</p><p>RW2: η = 1 − 1/r<sup>γ−1</sup> ; T₂/T₁=r<sup>γ−1</sup>; p₂/p₁=r<sup>γ</sup>. RW3: entrada = eje + escape + refrigerante + resto sin asignar. El resto no se identifica automáticamente con fricción.</p><p>Base científica conceptual: <a href="'+THERMAL_SOURCE+'" target="_blank" rel="noopener noreferrer">NASA Glenn — Engine Thermodynamic Analysis</a>. Las cifras de RW3 son ficticias.</p></div>';
  html+='<div class="panel stack"><h2>Investigación RW2/RW3</h2>';
  if(!s.frozen){
   html+='<p>Condición controlada: mismo γ y mismo flujo de entrada; la comparación aumenta la relación de compresión hipotética. No cambiamos geometría ni material de un motor específico.</p>';
   html+=choices('rt-a','Relación de compresión inicial rA',[[6,'6:1'],[8,'8:1'],[10,'10:1']],s.ratioA);
   html+=choices('rt-b','Relación de compresión candidata rB',[[9,'9:1'],[10,'10:1'],[12,'12:1']],s.ratioB);
   html+=choices('rt-gamma','Coeficiente de calores específicos γ constante',[[1.3,'1,30'],[1.35,'1,35'],[1.4,'1,40']],s.gamma);
   html+=choices('rt-q','Flujo térmico de entrada hipotético',[[50,'50 kW'],[100,'100 kW'],[200,'200 kW']],s.heatInputKw);
   html+=choices('rt-ideal','Predicción: eficiencia del ciclo Otto ideal al aumentar r',[
    ['','Elegí…'],['aumenta','Aumenta'],['disminuye','Disminuye'],['igual','No cambia']],s.idealPrediction);
   html+=choices('rt-residual','Predicción: ¿qué significa energía no asignada?',[
    ['','Elegí…'],['resto','Un residuo que requiere investigación'],['friccion','Solo pérdidas por fricción'],['cero','Debe ser siempre cero']],s.residualPrediction);
   html+=choices('rt-real','¿El cálculo ideal prueba una mejora de eficiencia de un Wankel real?',[
    ['','Elegí…'],['si','Sí, sin más ensayos'],['no','No, faltan modelos y ensayos físicos']],s.realEnginePrediction);
   html+='<button class="button" type="button" data-rt="reveal">Congelar hipótesis y contrastar</button>';
  }else{
   const e=s.result,a=e.otto.baseline,b=e.otto.candidate,l=e.ledger;
   html+='<p>Predicciones congeladas: eficiencia '+safe(s.idealPrediction)+'; residuo '+safe(s.residualPrediction)+'; conclusión sobre motor real '+safe(s.realEnginePrediction)+'.</p>';
   html+='<table class="rw-table" style="width:100%"><caption>Ciclo ideal Otto de aire estándar, no simulación de Wankel real</caption><thead><tr><th scope="col">Magnitud</th><th scope="col">Base</th><th scope="col">Alternativa</th></tr></thead><tbody>'+
    [['Relación de compresión r',a.compressionRatio,b.compressionRatio],['η teórica (%)',100*a.idealEfficiency,100*b.idealEfficiency],['T₂/T₁',a.temperatureRatio,b.temperatureRatio],['p₂/p₁',a.pressureRatio,b.pressureRatio],['Trabajo neto ideal (kW, flujo fijo)',a.idealWorkKw,b.idealWorkKw]]
      .map(([label,v1,v2])=>'<tr><th scope="row">'+safe(label)+'</th><td>'+N(v1)+'</td><td>'+N(v2)+'</td></tr>').join('')+'</tbody></table>';
   html+='<p><strong>Cambio ideal de eficiencia:</strong> '+N(e.otto.gainPercentagePoints)+' puntos porcentuales. No es una mejora real predicha.</p>';
   html+='<table class="rw-table" style="width:100%"><caption>RW3 — Balance ficticio de potencia y conservación</caption><thead><tr><th scope="col">Canal de energía</th><th scope="col">Potencia (kW)</th></tr></thead><tbody>'+
    [['Entrada ficticia',l.inputKw],['Trabajo al eje arbitrario',l.brakeKw],['Escape arbitrario',l.exhaustKw],['Refrigerante arbitrario',l.coolantKw],['Otros o sin asignar',l.unassignedKw],['Error de cierre',l.closureErrorKw]]
      .map(([label,v])=>'<tr><th scope="row">'+safe(label)+'</th><td>'+N(v)+'</td></tr>').join('')+'</tbody></table>';
   html+='<p>El trabajo al eje representa un reparto asumido del 27 % de la entrada, <strong>no calculado desde Otto</strong>. El 12 % sin asignar puede esconder diferentes flujos y errores: no es una medición de fricción.</p>';
   if(!s.grading){
    html+='<label for="rt-reason">Interpretá el cambio de ciclo, el balance y qué medición faltaría (mín. 80 caracteres)</label><textarea id="rt-reason" class="field" rows="4" maxlength="2500">'+safe(s.reasoning)+'</textarea>';
    html+='<label for="rt-limits">Límites y supuestos; diferencias entre modelo ideal, simulación y ensayo físico (mín. 60 caracteres)</label><textarea id="rt-limits" class="field" rows="3" maxlength="2000">'+safe(s.limits)+'</textarea>';
    html+='<button class="button" type="button" data-rt="grade">Evaluar informe RW2/RW3</button>';
   }else{
    html+='<p role="status"><strong>Resultado:</strong> '+s.grading.score+'/100 · '+(s.grading.passed?'Cumple las reglas objetivas.':'No alcanza todos los criterios automáticos.')+'</p><p>'+safe(s.grading.warning)+'</p>';
    html+='<button class="button" type="button" data-rt="save" '+(s.saving||s.saved?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar expediente RW2/RW3')+'</button>';
   }
  }
  html+='<button class="button alt" type="button" data-rt="reset">Nuevo experimento</button></div><p role="status" aria-live="polite">'+safe(s.error)+'</p>';
  root.innerHTML=html;
 }
 root.addEventListener('input',ev=>{
  const map={'rt-a':'ratioA','rt-b':'ratioB','rt-gamma':'gamma','rt-q':'heatInputKw',
   'rt-ideal':'idealPrediction','rt-residual':'residualPrediction','rt-real':'realEnginePrediction',
   'rt-reason':'reasoning','rt-limits':'limits'};
  const field=map[ev.target.id];if(!field||state.frozen&&['ratioA','ratioB','gamma','heatInputKw','idealPrediction','residualPrediction','realEnginePrediction'].includes(field))return;
  state[field]=['ratioA','ratioB','gamma','heatInputKw'].includes(field)?Number(ev.target.value):ev.target.value;
 });
 root.addEventListener('click',async ev=>{
  const action=ev.target.closest('[data-rt]')?.dataset.rt;if(!action)return;
  state.error='';
  if(action==='reset'){Object.assign(state,{frozen:false,idealPrediction:'',residualPrediction:'',realEnginePrediction:'',reasoning:'',limits:'',result:null,grading:null,saving:false,saved:false});render();return;}
  if(action==='reveal'){
   if(!state.idealPrediction||!state.residualPrediction||!state.realEnginePrediction){state.error='Completá las tres predicciones antes de revelar.';render();return;}
   try{state.result=thermalExercise(state);state.frozen=true;}
   catch(error){state.error='Configuración inválida: la alternativa debe tener r superior al valor inicial y los parámetros deben respetar los rangos.';}
   render();return;
  }
  if(action==='grade'){
   if(!state.frozen||!state.result){state.error='Primero congelá hipótesis y calculá los resultados.';render();return;}
   try{state.grading=gradeThermalExercise(state);}
   catch(error){state.error='Datos incompletos para evaluar.';}
   render();return;
  }
  if(action==='save'){
   if(!state.grading||state.saved||state.saving)return;
   state.saving=true;
   try{
    const entry={id:'lab-rotary-thermal-v1',at:new Date().toISOString(),
     score:state.grading.score,passed:state.grading.passed,
     hypothesis:state.idealPrediction,conclusion:'Ciclo ideal no demuestra eficiencia real',
     used:['otto-ideal','energy-ledger','closure'],reasoning:state.reasoning,
     report:thermalReport(state,state.grading)};
    await record(entry);state.saved=true;
   }catch(error){state.error='El almacenamiento IndexedDB no confirmó el registro. Reintentá.';}
   finally{state.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
