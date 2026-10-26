import{REASONING_MODEL,reasoningChallenge,reasoningCaseId,gradeReasoning,reasoningReport}from'./lesson-reasoning.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/**
 * Predict → freeze → next question; no key or feedback displayed until
 * after all three decisions and written caveats are submitted.
 */
export function mountLessonReasoning(root,{lessonId,record,onSaved=()=>{}}){
 if(!root||typeof record!=='function')throw Error('La reflexión necesita un guardador de evidencia');
 const scenario=reasoningChallenge(lessonId);
 if(!scenario){root.innerHTML='';return;}
 let answers={},reasoning='',limitations='',result=null,recorded=false,saving=false,error='';
 const keys=['hypothesis','measurement','falsifier'];
 function render(){
  const next=scenario.steps.find(step=>!Object.hasOwn(answers,step.id));
  const committed=scenario.steps.filter(step=>Object.hasOwn(answers,step.id));
  let html='<div class="panel stack reasoning-bench"><div class="eyebrow">HIPÓTESIS · PRUEBA · FALSACIÓN</div>'+
  '<h2>Desafío de razonamiento: '+esc(scenario.title)+'</h2>'+
  '<p>'+esc(scenario.context)+'</p>'+
  '<p class="muted">Las decisiones se congelan antes de mostrar la devolución. Primero predecí; después contrastá con el simulador de la lección. La explicación escrita se guarda, pero no se juzga semánticamente.</p>';
  for(const step of committed){
   const choice=step.options[answers[step.id]];
   html+='<p class="reasoning-frozen"><strong>'+esc(step.title)+':</strong> '+esc(choice)+' <span class="tag dim">Congelado</span></p>';
  }
  if(next){
   const field='reasoning-'+next.id;
   html+='<label for="'+field+'"><strong>'+esc(next.title)+'</strong> · '+esc(next.question)+'</label>'+
    '<select class="field" id="'+field+'"><option value="">Elegí una decisión antes de continuar</option>'+
    next.options.map((item,i)=>'<option value="'+i+'">'+esc(item)+'</option>').join('')+'</select>'+
    '<button type="button" class="button" data-reasoning="lock" data-step="'+esc(next.id)+'">Congelar decisión y continuar</button>';
  }else if(!result){
   html+='<label for="reasoning-justification">Explicá qué observación discrimina y qué te haría cambiar de hipótesis (100 caracteres mínimo)</label>'+
    '<textarea class="field" id="reasoning-justification" rows="4" maxlength="3000">'+esc(reasoning)+'</textarea>'+
    '<label for="reasoning-limitations">Explicá límites de la simulación y evidencia física faltante (60 caracteres mínimo)</label>'+
    '<textarea class="field" id="reasoning-limitations" rows="3" maxlength="3000">'+esc(limitations)+'</textarea>'+
    '<button type="button" class="button" data-reasoning="grade">Revelar devoluciones y evaluar</button>';
  }else{
   html+='<h3>Devolución por criterio</h3>'+
    result.stepResults.map((item,i)=>'<div class="panel"><p><strong>'+esc(scenario.steps[i].title)+': '+(item.correct?'Coincide con el modelo':'Revisar hipótesis')+'</strong></p><p>'+esc(item.feedback)+'</p></div>').join('')+
    '<p><strong>Resultado objetivo: '+result.score+'/100</strong> · '+(result.passed?'Criterios cumplidos':'Volvé a plantear el caso')+'</p>'+
    '<p class="muted">'+esc(result.warning)+'</p>'+
    '<div class="row">'+
      '<button class="button" type="button" data-reasoning="save" '+(recorded||saving?'disabled':'')+'>'+(recorded?'Reflexión guardada':'Guardar evidencia de razonamiento')+'</button>'+
      '<button class="button alt" type="button" data-reasoning="reset">Reintentar con nuevas decisiones</button>'+
    '</div>';
  }
  html+='<p role="status" class="muted" aria-live="polite">'+esc(error)+'</p></div>';
  root.innerHTML=html;
 }
 root.addEventListener('input',ev=>{
  if(ev.target.id==='reasoning-justification')reasoning=ev.target.value;
  if(ev.target.id==='reasoning-limitations')limitations=ev.target.value;
 });
 root.addEventListener('click',async ev=>{
  const b=ev.target.closest('[data-reasoning]');if(!b)return;
  error='';
  if(b.dataset.reasoning==='lock'){
   const id=b.dataset.step,step=scenario.steps.find(x=>x.id===id);
   if(!step||Object.hasOwn(answers,id)||scenario.steps.find(x=>!Object.hasOwn(answers,x.id))!==step)return;
   const index=Number(root.querySelector('#reasoning-'+id)?.value);
   const selected=root.querySelector('#reasoning-'+id)?.value;
   if(selected===''||!Number.isInteger(index)||index<0||index>=step.options.length){error='Seleccioná una hipótesis o prueba antes de congelarla.';render();return;}
   answers={...answers,[id]:index};render();return;
  }
  if(b.dataset.reasoning==='grade'){
   try{result=gradeReasoning({lessonId,answers,reasoning,limitations});}
   catch(e){error='No se pudo evaluar: '+e.message;}
   render();return;
  }
  if(b.dataset.reasoning==='reset'){
   if(saving)return;answers={};reasoning='';limitations='';result=null;recorded=false;render();return;
  }
  if(b.dataset.reasoning==='save'){
   if(!result||saving||recorded)return;saving=true;
   try{
    await record({id:reasoningCaseId(lessonId),score:result.score,passed:result.passed,at:new Date().toISOString(),
      hypothesis:scenario.steps[0].options[answers.hypothesis],
      conclusion:scenario.steps[2].options[answers.falsifier],
      used:['hypothesis-frozen','independent-probe-choice','falsifier-choice'],
      reasoning,report:reasoningReport({lessonId,answers,reasoning,limitations},result)});
    recorded=true;onSaved(result);
   }catch{error='No se confirmó el guardado de tu reflexión. Podés reintentarlo.';}
   finally{saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
