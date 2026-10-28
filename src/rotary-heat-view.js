import{compareConvectiveSurfaces,gradeConvection,convectionReport,HEAT_TRANSFER_SOURCE}from'./rotary-heat-transfer.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
export function heatTransferShell(){
 return '<section class="stack"><div class="eyebrow">ROTARY ENGINEERING · RW5</div><h1>Rotary Heat Transfer Lab</h1><p>¿Menos superficie implica menos calor transferido? Contrastá hipótesis bajo un modelo convectivo de tres variables controladas.</p><div id="rotary-heat-explorer"></div></section>';
}
export function mountHeatTransfer(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW5 requiere registrador local');
 const s={candidateCoefficient:200,prediction:'',realEnginePrediction:'',reasoning:'',limits:'',result:null,grade:null,saving:false,saved:false,error:''};
 const dropdown=(id,label,choices,value)=>'<label for="'+id+'">'+label+'</label><select class="field" id="'+id+'">'+choices.map(([v,t])=>'<option value="'+v+'" '+(String(v)===String(value)?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select>';
 const trend=[['','Elegí…'],['aumenta','Aumenta'],['disminuye','Disminuye'],['igual','Se mantiene']];
 const reality=[['','Elegí…'],['si','Sí, demuestra rendimiento Wankel real'],['no','No: faltan mediciones y modelos físicos']];
 function render(){
  let html='<div class="panel stack"><h2>Modelo y validez</h2><p role="note"><strong>Simulación lumped hipotética:</strong> Q̇ = h · A · ΔT. Se toma ΔT = 150 K constante y valores de área, h y flujo inventados. No es una simulación CFD, no calcula el coeficiente Nusselt, temperatura de pared ni rendimiento de un Wankel. El coeficiente convectivo real depende del flujo y de condiciones experimentales.</p><p>Motivación de la investigación: <a target="_blank" rel="noopener noreferrer" href="'+HEAT_TRANSFER_SOURCE+'">estudio SAE sobre superficie/volumen e intercambio térmico en Wankel (2025)</a>. No atribuimos a ese estudio los números del ejercicio.</p></div>';
  html+='<div class="panel stack"><h2>RW5 · Comparativa A/B</h2><p>Base asumida: A = 0,24 m², h = 250 W/(m²·K). Alternativa: A = 0,20 m², misma ΔT. Solo cambia h además del área. Para aislar causas, compará dos alternativas posibles de h.</p>';
  if(!s.result){
   html+=dropdown('rh-h','Coeficiente candidato h (hipotético)',[[200,'200 W/(m²·K)'],[400,'400 W/(m²·K)']],s.candidateCoefficient);
   html+=dropdown('rh-prediction','Hipótesis: flujo térmico alternativo respecto de base',trend,s.prediction);
   html+=dropdown('rh-real','¿El cálculo prueba menores pérdidas o mayor eficiencia de un motor Wankel real?',reality,s.realEnginePrediction);
   html+='<button class="button" data-rh="reveal" type="button">Congelar hipótesis y revelar</button>';
  }else{
   const x=s.result;
   html+='<p><strong>Predicción congelada:</strong> '+esc(s.prediction)+'; atribución al motor real: '+esc(s.realEnginePrediction)+'.</p>';
   html+='<table class="rw-table" style="width:100%"><caption>Convección ideal uniforme: valores sintéticos y dimensionalmente consistentes</caption><thead><tr><th scope="col">Magnitud</th><th scope="col">Base</th><th scope="col">Alternativa</th></tr></thead><tbody>';
   for(const [name,key,unit] of [['Área','surfaceM2','m²'],['Coeficiente h','coefficientWm2K','W/(m²·K)'],['Diferencia ΔT','deltaKelvin','K'],['Calor transferido','heatKw','kW']]){
    html+='<tr><th scope="row">'+esc(name+' ('+unit+')')+'</th><td>'+x.baseline[key].toFixed(3)+'</td><td>'+x.candidate[key].toFixed(3)+'</td></tr>';
   }
   html+='</tbody></table><p><strong>Cambio geométrico:</strong> '+x.areaChangePct.toFixed(2)+' %; cambio h: '+x.coefficientChangePct.toFixed(2)+' %; cambio de calor: '+x.changePct.toFixed(2)+' %. Tendencia del modelo: '+esc(x.direction)+'.</p><p>'+esc(x.warning)+'</p>';
   if(!s.grade){
    html+='<label for="rh-reason">Explicá cómo el cambio de h puede contrarrestar la reducción de área (mín. 80 caracteres)</label><textarea id="rh-reason" class="field" rows="4" maxlength="2500">'+esc(s.reasoning)+'</textarea>';
    html+='<label for="rh-limits">Instrumentos, incertidumbre, CFD o pruebas faltantes para un motor real (mín. 60 caracteres)</label><textarea id="rh-limits" class="field" rows="3" maxlength="2000">'+esc(s.limits)+'</textarea>';
    html+='<button class="button" data-rh="grade" type="button">Cerrar investigación RW5</button>';
   }else{
    html+='<p role="status"><strong>Resultado:</strong> '+s.grade.score+'/100 · '+(s.grade.passed?'Criterios educativos completos.':'Resultado insuficiente para los criterios objetivos.')+'</p>';
    html+='<button class="button" data-rh="save" type="button" '+(s.saved||s.saving?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar investigación RW5')+'</button>';
   }
  }
  html+='<button class="button alt" data-rh="reset" type="button">Nuevo experimento RW5</button></div><p role="status" aria-live="polite">'+esc(s.error)+'</p>';
  root.innerHTML=html;
 }
 root.addEventListener('input',e=>{
  if(e.target.id==='rh-h')s.candidateCoefficient=Number(e.target.value);
  if(e.target.id==='rh-prediction')s.prediction=e.target.value;
  if(e.target.id==='rh-real')s.realEnginePrediction=e.target.value;
  if(e.target.id==='rh-reason')s.reasoning=e.target.value;
  if(e.target.id==='rh-limits')s.limits=e.target.value;
 });
 root.addEventListener('click',async e=>{
  const act=e.target.closest('[data-rh]')?.dataset.rh;if(!act)return;s.error='';
  if(act==='reset'){Object.assign(s,{result:null,grade:null,prediction:'',realEnginePrediction:'',reasoning:'',limits:'',saving:false,saved:false});render();return;}
  if(act==='reveal'){
   if(!s.prediction||!s.realEnginePrediction){s.error='Primero formulá las dos predicciones.';render();return;}
   try{s.result=compareConvectiveSurfaces(s.candidateCoefficient);}catch(error){s.error='Experimento fuera del rango documentado.';}
   render();return;
  }
  if(act==='grade'){
   try{s.grade=gradeConvection(s);}catch(error){s.error='Faltan predicciones válidas.';}
   render();return;
  }
  if(act==='save'){
   if(!s.grade||s.saved||s.saving)return;s.saving=true;
   try{await record({id:'lab-rotary-convection-v1',at:new Date().toISOString(),score:s.grade.score,
    passed:s.grade.passed,hypothesis:s.prediction,conclusion:s.result.direction,
    used:['assumed-area','assumed-convective-coefficient','controlled-temperature'],
    reasoning:s.reasoning,report:convectionReport(s,s.grade)});s.saved=true;}
   catch(error){s.error='Guardado local no confirmado; no se atribuye evidencia y podés reintentar.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
