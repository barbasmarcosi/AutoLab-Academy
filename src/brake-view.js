import{compareIdealBraking,gradeBrakeInvestigation,brakeResearchReport,BRAKE_MODEL}from'./brake-dynamics.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
export function brakesShell(){
 return '<section class="stack"><div class="eyebrow">AUTOMOTIVE MECHANICS · MC08</div><h1>Brake Energy Research Lab</h1><p>Probá cómo cambian energía cinética y distancia de frenado bajo un modelo de fricción constante. Escribí predicciones antes de mostrar resultados.</p><div id="brake-explorer"></div></section>';
}
export function mountBrakeLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('MC08 requiere guardar evidencia');
 const s={params:{massKg:1500,speedKmh:60,mu:.6,reactionSeconds:1},energyPrediction:'',distancePrediction:'',massPrediction:'',reasoning:'',limitations:'',comparison:null,grade:null,saving:false,saved:false,error:''};
 const selects=(id,options)=>'<select id="'+id+'" class="field">'+options.map(([value,label])=>'<option value="'+value+'">'+esc(label)+'</option>').join('')+'</select>';
 const choices=(id,values)=>'<select id="'+id+'" class="field"><option value="">Elegí antes de revelar…</option>'+values.map(([v,label])=>'<option value="'+v+'">'+esc(label)+'</option>').join('')+'</select>';
 const predicted=[['double','Se duplica'],['quadruple','Se cuadruplica'],['same','No cambia']];
 function render(){
  let html='<div class="panel stack"><h2>MC08 · Contrato científico</h2><p role="note"><strong>Modelo ideal y exclusivamente educativo.</strong> Supone suelo horizontal, adherencia μ constante, desaceleración uniforme a=μg, sin variaciones térmicas, ABS real, pendientes, carga dinámica, neumáticos específicos ni distribución real de tiempos de reacción. Las cifras <strong>no sirven</strong> para decidir distancias seguras, validar frenos ni conducir.</p><p>Fuerza límite ideal F=μmg; energía cinética E=½mv²; frenado bajo desaceleración uniforme d=v²/(2μg); recorrido durante reacción d=v·t. Se presentan por separado para no confundir respuesta humana con la fase de frenado.</p></div>';
  html+='<div class="panel stack"><h2>Ensayo hipotético: duplicar velocidad</h2>';
  if(!s.comparison){
   html+='<label for="br-mass">Masa del vehículo ficticio</label>'+selects('br-mass',[[1000,'1000 kg'],[1500,'1500 kg'],[2500,'2500 kg']]);
   html+='<label for="br-speed">Velocidad inicial</label>'+selects('br-speed',[[30,'30 km/h'],[60,'60 km/h'],[80,'80 km/h']]);
   html+='<label for="br-mu">Coeficiente de fricción hipotético μ</label>'+selects('br-mu',[[.3,'0,3'],[.6,'0,6'],[.9,'0,9']]);
   html+='<label for="br-reaction">Tiempo de reacción supuesto</label>'+selects('br-reaction',[[.8,'0,8 s'],[1,'1,0 s'],[1.3,'1,3 s']]);
   html+='<label for="br-energy">Si se duplica la velocidad, la energía cinética…</label>'+choices('br-energy',predicted);
   html+='<label for="br-distance">Si se duplica la velocidad, la distancia ideal de frenado…</label>'+choices('br-distance',predicted);
   html+='<label for="br-mass-effect">Si solo se duplica la masa a la misma velocidad y μ, la distancia ideal de frenado…</label>'+choices('br-mass-effect',[['same','No cambia'],['changes','Cambia']]);
   html+='<button class="button" type="button" data-br="measure">Congelar hipótesis y simular</button>';
  }else{
   const c=s.comparison;
   html+='<p>Velocidad inicial '+c.baseline.speedKmh+' km/h y escenario comparado '+c.doubled.speedKmh+' km/h; masa '+c.baseline.massKg+' kg; μ='+c.baseline.mu+'.</p><table class="rw-table" style="width:100%"><caption>Resultados de física ideal, NO distancias de seguridad vial</caption><thead><tr><th scope="col">Magnitud</th><th scope="col">Inicial</th><th scope="col">Doble velocidad</th></tr></thead><tbody>';
   const rows=[['Energía cinética (kJ)',c.baseline.energyJ/1000,c.doubled.energyJ/1000],['Fuerza de fricción límite (N)',c.baseline.forceN,c.doubled.forceN],['Recorrido de reacción supuesto (m)',c.baseline.reactionM,c.doubled.reactionM],['Distancia de frenado ideal (m)',c.baseline.idealBrakingM,c.doubled.idealBrakingM]];
   html+=rows.map(([name,a,b])=>'<tr><th scope="row">'+esc(name)+'</th><td>'+a.toFixed(2)+'</td><td>'+b.toFixed(2)+'</td></tr>').join('')+'</tbody></table>';
   html+='<p>Predicciones congeladas: energía '+esc(s.energyPrediction)+', distancia '+esc(s.distancePrediction)+', masa '+esc(s.massPrediction)+'.</p><p>La energía y la distancia ideal se cuadruplican al duplicar velocidad con μ constante; la distancia ideal no depende de la masa en este modelo simplificado.</p>';
   if(!s.grade){
    html+='<label for="br-reason">Desarrollá la relación entre velocidad, energía, fricción y masa (mín. 80 caracteres)</label><textarea id="br-reason" class="field" rows="4" maxlength="2500">'+esc(s.reasoning)+'</textarea>';
    html+='<label for="br-limits">Límites del modelo y por qué no predice una distancia segura real (mín. 60 caracteres)</label><textarea id="br-limits" class="field" rows="3" maxlength="2000">'+esc(s.limitations)+'</textarea>';
    html+='<button class="button" type="button" data-br="evaluate">Evaluar explicación</button>';
   }else{
    html+='<p><strong>Resultado:</strong> '+s.grade.score+'/100 · '+(s.grade.passed?'Criterios del ejercicio cumplidos.':'Faltan evidencias del ejercicio.')+'</p><button class="button" type="button" data-br="save" '+(s.saved||s.saving?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar investigación MC08')+'</button>';
   }
  }
  html+='<button class="button alt" type="button" data-br="reset">Nuevo estudio</button></div><p role="status" aria-live="polite">'+esc(s.error)+'</p>';
  root.innerHTML=html;
  if(!s.comparison){root.querySelector('#br-mass').value=String(s.params.massKg);root.querySelector('#br-speed').value=String(s.params.speedKmh);root.querySelector('#br-mu').value=String(s.params.mu);root.querySelector('#br-reaction').value=String(s.params.reactionSeconds);}
 }
 root.addEventListener('input',e=>{
  if(e.target.id==='br-mass')s.params.massKg=Number(e.target.value);
  if(e.target.id==='br-speed')s.params.speedKmh=Number(e.target.value);
  if(e.target.id==='br-mu')s.params.mu=Number(e.target.value);
  if(e.target.id==='br-reaction')s.params.reactionSeconds=Number(e.target.value);
  if(e.target.id==='br-energy')s.energyPrediction=e.target.value;
  if(e.target.id==='br-distance')s.distancePrediction=e.target.value;
  if(e.target.id==='br-mass-effect')s.massPrediction=e.target.value;
  if(e.target.id==='br-reason')s.reasoning=e.target.value;
  if(e.target.id==='br-limits')s.limitations=e.target.value;
 });
 root.addEventListener('click',async e=>{
  const op=e.target.closest('[data-br]')?.dataset.br;if(!op)return;s.error='';
  if(op==='reset'){s.comparison=null;s.grade=null;s.energyPrediction='';s.distancePrediction='';s.massPrediction='';s.reasoning='';s.limitations='';s.saved=false;s.saving=false;render();return;}
  if(op==='measure'){
   if(!s.energyPrediction||!s.distancePrediction||!s.massPrediction){s.error='Formulá las tres predicciones antes de ejecutar el modelo.';render();return;}
   try{s.comparison=compareIdealBraking(s.params);}catch(err){s.error='Valores fuera del rango pedagógico';}render();return;
  }
  if(op==='evaluate'){
   if(!s.comparison||s.reasoning.trim().length<80||s.limitations.trim().length<60){s.error='Explicá la física (80 caracteres) y sus límites (60).';render();return;}
   try{s.grade=gradeBrakeInvestigation(s);}catch(err){s.error='Predicciones no válidas';}render();return;
  }
  if(op==='save'){
   if(!s.grade||s.saved||s.saving)return;s.saving=true;
   try{await record({id:'lab-brake-energy-v1',score:s.grade.score,passed:s.grade.passed,at:new Date().toISOString(),hypothesis:s.energyPrediction+' / '+s.distancePrediction,conclusion:'Evaluación de la dependencia cuadrática ideal',used:['energy','mu','reaction-distance'],reasoning:s.reasoning,report:brakeResearchReport(s,s.grade)});s.saved=true;}
   catch(error){s.error='No se confirmó el guardado en IndexedDB; reintentá.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
