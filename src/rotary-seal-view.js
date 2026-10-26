import{publicSealScenario,revealSealProbe,evaluateSealInvestigation,sealInvestigationReport,RW4_CAUSES,RW4_PROBES}from'./rotary-seal-diagnostic.js';
const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
export function sealLabShell(){
 return '<section class="stack"><div class="eyebrow">ROTARY ENGINEERING · RW4</div><h1>Rotary Diagnostic Research</h1><p>Investigá dos causas diferentes que provocan el mismo síntoma. Predecí primero, observá evidencia independiente y documentá la incertidumbre.</p><div id="rotary-seal-lab"></div></section>';
}
export function mountSealLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW4 requiere un registrador de evidencia');
 const state={seed:null,initial:'',observations:[],final:'',reasoning:'',uncertainty:'',result:null,saving:false,saved:false,error:''};
 const options=choices=>choices.map(x=>'<option value="'+e(x.id)+'">'+e(x.label)+'</option>').join('');
 function render(){
  const scenario=state.seed===null?null:publicSealScenario(state.seed);
  let body='<div class="panel stack"><h2>Alcance del banco</h2><p><strong>Datos enteramente sintéticos, no mediciones físicas.</strong> Los índices adimensionales de retención y energía primaria no son presión de compresión, tensión de bobina, rangos OEM ni procedimientos de taller. No indican que el motor real tenga una falla específica. La investigación requiere dos pruebas porque los síntomas iniciales son deliberadamente ambiguos.</p><button class="button" data-rw4="new" type="button">Crear caso reproducible</button></div>';
  if(scenario){
   body+='<div class="panel stack"><h2>Expediente RW4 · semilla '+state.seed+'</h2><p>'+e(scenario.complaint)+'</p><p class="muted">'+e(scenario.environment)+'</p><p>Dos hipótesis viables: pérdida simulada de estanqueidad y déficit simulado de encendido. Antes de medir, seleccioná una hipótesis provisional; podrás rectificarla si la evidencia la contradice.</p>';
   if(!state.initial){
    body+='<label for="rw4-initial">Hipótesis provisional</label><select class="field" id="rw4-initial"><option value="">Elegí…</option>'+options(RW4_CAUSES)+'</select><button class="button" type="button" data-rw4="lock">Congelar hipótesis inicial</button>';
   }else{
    body+='<p><strong>Hipótesis congelada:</strong> '+e(RW4_CAUSES.find(x=>x.id===state.initial)?.label)+'</p>';
    if(!state.result){
     body+='<h3>Mediciones simuladas</h3><p>Predecí si cada índice será <strong>bajo</strong> o <strong>normal</strong> antes de revelar su valor. No se muestra el diagnóstico oculto antes de concluir.</p>';
     for(const probe of RW4_PROBES){
      const measured=state.observations.find(o=>o.probeId===probe.id);
      body+='<div class="panel stack"><h4>'+e(probe.label)+'</h4><p class="muted">'+e(probe.explanation)+'</p>';
      if(!measured){
       body+='<label for="rw4-'+probe.id+'">Pronóstico ('+probe.id+')</label><select class="field" id="rw4-'+probe.id+'"><option value="">Elegí…</option><option value="bajo">Índice bajo</option><option value="normal">Índice normal</option></select><button class="button alt" type="button" data-rw4="reveal" data-probe="'+probe.id+'">Congelar y revelar '+e(probe.id)+'</button>';
      }else{
       const v=revealSealProbe(state.seed,probe.id,measured.prediction);
       body+='<p>Predicho: '+e(measured.prediction)+'; observado: '+v.value.toFixed(3)+' índice adimensional sintético. Clase del modelo: '+e(v.classification)+'.</p>';
      }
      body+='</div>';
     }
     body+='<h3>Conclusión</h3><label for="rw4-final">Hipótesis final</label><select class="field" id="rw4-final"><option value="">Evidencia insuficiente / elegir luego</option>'+options(RW4_CAUSES)+'</select><label for="rw4-reason">Justificá cómo una prueba confirma y otra descarta una alternativa (mín. 80 caracteres)</label><textarea id="rw4-reason" class="field" rows="4" maxlength="2500"></textarea><label for="rw4-uncertainty">Incertidumbre y límites de extrapolación (mín. 60 caracteres)</label><textarea id="rw4-uncertainty" class="field" rows="3" maxlength="2000"></textarea><button class="button" type="button" data-rw4="finish">Concluir investigación</button>';
    }else{
     body+='<p><strong>Resultado:</strong> '+state.result.score+'/100. '+(state.result.passed?'Criterios objetivos satisfechos.':'Faltan evidencias, predicciones o justificación para aprobar.')+'</p><p><strong>Causa del banco sintético:</strong> '+e(RW4_CAUSES.find(c=>c.id===state.result.expected)?.label)+'</p><p class="muted">'+e(state.result.warning)+'</p>';
     body+='<button class="button" type="button" data-rw4="save" '+(state.saved||state.saving?'disabled':'')+'>'+(state.saved?'Evidencia registrada':'Guardar expediente RW4')+'</button>';
    }
   }
   body+='</div>';
  }
  body+='<div role="status" aria-live="polite" id="rw4-feedback">'+e(state.error)+'</div>';
  root.innerHTML=body;
  if(state.initial&&!state.result){const f=root.querySelector('#rw4-final'),reason=root.querySelector('#rw4-reason'),unc=root.querySelector('#rw4-uncertainty');
   if(f)f.value=state.final;if(reason)reason.value=state.reasoning;if(unc)unc.value=state.uncertainty;}
 }
 root.addEventListener('input',event=>{
  if(event.target.id==='rw4-final')state.final=event.target.value;
  if(event.target.id==='rw4-reason')state.reasoning=event.target.value;
  if(event.target.id==='rw4-uncertainty')state.uncertainty=event.target.value;
 });
 root.addEventListener('click',async event=>{
  const btn=event.target.closest('[data-rw4]');if(!btn)return;
  const op=btn.dataset.rw4;state.error='';
  if(op==='new'){state.seed=Math.floor(Math.random()*2147483647)+1;state.initial='';state.observations=[];state.final='';state.reasoning='';state.uncertainty='';state.result=null;state.saved=false;state.saving=false;render();return;}
  if(op==='lock'){const guess=root.querySelector('#rw4-initial')?.value;if(!RW4_CAUSES.some(x=>x.id===guess)){state.error='Elegí una hipótesis inicial antes de medir.';}else state.initial=guess;render();return;}
  if(op==='reveal'){if(!state.initial||state.result)return;const probeId=btn.dataset.probe;
   const predicted=root.querySelector('#rw4-'+probeId)?.value;
   try{revealSealProbe(state.seed,probeId,predicted);if(state.observations.some(x=>x.probeId===probeId))throw Error('Prueba duplicada');state.observations.push({probeId,prediction:predicted});}
   catch(error){state.error='Elegí una predicción válida y no repitas la prueba.';}
   render();return;
  }
  if(op==='finish'){
   if(!state.initial||!state.final||state.reasoning.trim().length<80||state.uncertainty.trim().length<60||state.observations.length!==2){
    state.error='Se requieren ambas pruebas, hipótesis final y justificación de al menos 80 y 60 caracteres.';render();return;
   }
   try{state.result=evaluateSealInvestigation(state);}catch(error){state.error='Entrada de investigación inválida.';}render();return;
  }
  if(op==='save'){
   if(!state.result||state.saved||state.saving)return;state.saving=true;
   const entry={id:'lab-rotary-sealing-v1',score:state.result.score,passed:state.result.passed,at:new Date().toISOString(),hypothesis:state.initial,conclusion:state.final,used:state.observations.map(x=>x.probeId),reasoning:state.reasoning,report:sealInvestigationReport(state,state.result)};
   try{await record(entry);state.saved=true;}catch(error){state.error='No se confirmó IndexedDB. La evidencia no figura como guardada; reintentá.';}finally{state.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
