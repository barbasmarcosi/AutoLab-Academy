import{publicInventorCase,revealInventorProbe,evaluateInventor,inventorReport,INVENTOR_HYPOTHESES,INVENTOR_CLASSES,INVENTOR_PROBES}from'./inventor-blackbox.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const opts=(items,placeholder)=>'<option value="">'+placeholder+'</option>'+items.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.label)+'</option>').join('');
export function inventorShell(){
 return '<section class="stack"><div class="eyebrow">MC14 · AUTOMOTIVE R&D</div><h1>Inventor’s Bench — Caja negra virtual</h1><p>Diseñá pruebas discriminantes, realizá predicciones antes de conocer la respuesta y validá un modelo con un conjunto retenido sin tocar hardware.</p><div id="inventor-explorer"></div></section>';
}
export function mountInventorLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('Se requiere persistencia de evidencia MC14');
 const s={seed:null,initial:'',observations:[],final:'',reasoning:'',limitations:'',grade:null,recorded:false,saving:false,error:''};
 function render(){
  let html='<div class="panel stack"><h2>Contratos del experimento</h2><p role="note"><strong>Instrumentación estrictamente virtual de 0 a 5 V.</strong> Tres modelos ficticios dan exactamente las mismas lecturas iniciales. Tu tarea es elegir predicciones, descubrir una respuesta nueva y contrastar en una entrada retenida. Los valores no corresponden a sensores, calibraciones o protocolos OEM. Ninguna conexión o escritura física está disponible.</p><button class="button" type="button" data-inv="new">Crear experimento reproducible</button></div>';
  if(s.seed!==null){
   const c=publicInventorCase(s.seed);
   html+='<div class="panel stack"><h2>Expediente MC14 · semilla '+s.seed+'</h2><p>'+esc(c.limits)+'</p><table class="rw-table"><caption>Observaciones compartidas: ninguna identifica la causa</caption><thead><tr><th>Entrada virtual</th><th>Salida virtual</th></tr></thead><tbody>'+c.baseline.map(p=>'<tr><th scope="row">'+p.inputV.toFixed(1)+' V</th><td>'+p.outputV.toFixed(3)+' V</td></tr>').join('')+'</tbody></table>';
   if(!s.initial){
    html+='<label for="inv-initial">Hipótesis inicial provisional</label><select class="field" id="inv-initial">'+opts(INVENTOR_HYPOTHESES,'Seleccioná antes de experimentar')+'</select><button class="button" type="button" data-inv="lock">Congelar hipótesis</button>';
   }else{
    html+='<p><strong>Hipótesis congelada:</strong> '+esc(INVENTOR_HYPOTHESES.find(x=>x.id===s.initial)?.label)+'</p>';
    for(const p of INVENTOR_PROBES){
     const observation=s.observations.find(o=>o.id===p.id);
     html+='<div class="panel stack"><h3>'+esc(p.label)+'</h3><p>'+ (p.id==='holdout'?'Validación retenida: no se usa para ajustar la hipótesis tras conocer el ensayo de entrenamiento.':'Primera prueba que intenta separar las alternativas aún compatibles.')+'</p>';
     if(observation){
      const result=revealInventorProbe(s.seed,p.id,observation.prediction);
      html+='<p>Pronóstico congelado: '+esc(observation.prediction)+'; lectura: '+result.outputV.toFixed(3)+' V virtual. Clase observada: '+esc(result.classification)+'.</p>';
     }else if(!s.grade&&(p.id==='training'||s.observations.some(o=>o.id==='training'))){
      html+='<label for="inv-'+p.id+'">Predicción antes de revelar ('+p.inputV+' V)</label><select class="field" id="inv-'+p.id+'">'+opts(INVENTOR_CLASSES,'Pronosticá la región de salida')+'</select><button class="button alt" type="button" data-inv="probe" data-probe="'+p.id+'">Congelar y revelar '+esc(p.label)+'</button>';
     }else{html+='<p class="muted">Completá el ensayo de entrenamiento primero.</p>';}
     html+='</div>';
    }
    if(s.observations.length===2){
     if(!s.grade){
      html+='<label for="inv-final">Hipótesis final (o evidencia insuficiente)</label><select class="field" id="inv-final">'+opts([...INVENTOR_HYPOTHESES,{id:'insufficient',label:'Evidencia insuficiente'}],'Seleccioná conclusión')+'</select>';
      html+='<label for="inv-reason">Argumento falsable: qué datos descartaron alternativas (100 caracteres mínimo)</label><textarea class="field" id="inv-reason" rows="4" maxlength="3000">'+esc(s.reasoning)+'</textarea>';
      html+='<label for="inv-limit">Incertidumbre y límites de transferencia (80 caracteres mínimo)</label><textarea class="field" id="inv-limit" rows="3" maxlength="3000">'+esc(s.limitations)+'</textarea><button class="button" type="button" data-inv="grade">Evaluar investigación</button>';
     }else{
      html+='<h3>Evaluación</h3><p>Resultado: '+s.grade.score+'/100 · '+(s.grade.passed?'Criterios objetivos completos.':'No cumplió los criterios objetivos.')+'</p><p>Causa programada del modelo: '+esc(INVENTOR_HYPOTHESES.find(x=>x.id===s.grade.expected)?.label)+'</p><p>'+esc(s.grade.warning)+'</p><button class="button" type="button" data-inv="save" '+(s.recorded||s.saving?'disabled':'')+'>'+(s.recorded?'Evidencia registrada':'Guardar expediente MC14')+'</button>';
     }
    }
   }
   html+='</div>';
  }
  html+='<p role="status" aria-live="polite">'+esc(s.error)+'</p>';
  root.innerHTML=html;
  if(s.initial&&!s.grade&&s.observations.length===2){const el=root.querySelector('#inv-final');if(el)el.value=s.final;}
 }
 root.addEventListener('input',ev=>{
  if(ev.target.id==='inv-final')s.final=ev.target.value;
  if(ev.target.id==='inv-reason')s.reasoning=ev.target.value;
  if(ev.target.id==='inv-limit')s.limitations=ev.target.value;
 });
 root.addEventListener('click',async ev=>{
  const b=ev.target.closest('[data-inv]');if(!b)return;s.error='';
  const action=b.dataset.inv;
  if(action==='new'){
   Object.assign(s,{seed:Math.floor(Math.random()*2147483647)+1,initial:'',observations:[],final:'',reasoning:'',limitations:'',grade:null,recorded:false,saving:false,error:''});
   render();return;
  }
  if(action==='lock'){
   const selected=root.querySelector('#inv-initial')?.value;
   if(!INVENTOR_HYPOTHESES.some(x=>x.id===selected)){s.error='Elegí una hipótesis inicial antes de medir.';render();return;}
   s.initial=selected;render();return;
  }
  if(action==='probe'){
   const id=b.dataset.probe;
   const pred=root.querySelector('#inv-'+id)?.value;
   if(!INVENTOR_CLASSES.some(x=>x.id===pred)){s.error='Predecí la clase de lectura antes de revelar.';render();return;}
   if(s.grade||s.observations.some(o=>o.id===id)||!s.initial||id==='holdout'&&!s.observations.some(o=>o.id==='training'))return;
   try{revealInventorProbe(s.seed,id,pred);s.observations.push({id,prediction:pred});}catch{s.error='No se pudo generar la lectura virtual.';}
   render();return;
  }
  if(action==='grade'){
   if(s.reasoning.trim().length<100||s.limitations.trim().length<80){s.error='Completá la justificación (100 caracteres) y limitaciones (80 caracteres).';render();return;}
   try{s.grade=evaluateInventor(s);}catch{s.error='Seleccioná la conclusión final para evaluar.';}
   render();return;
  }
  if(action==='save'){
   if(!s.grade||s.recorded||s.saving)return;
   s.saving=true;
   try{await record({id:'lab-inventor-blackbox-v1',score:s.grade.score,passed:s.grade.passed,at:new Date().toISOString(),
    hypothesis:s.initial,conclusion:s.final,used:['baseline-control','training-probe','holdout-probe'],reasoning:s.reasoning,
    report:inventorReport(s,s.grade)});s.recorded=true;}
   catch{s.error='El almacenamiento no confirmó el expediente. Reintentá.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
