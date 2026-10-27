import{reasoningChallenge}from'./lesson-reasoning.js';
import{transferCase,transferCaseId,gradeReasoningTransfer,reasoningTransferReport}from'./lesson-transfer.js';
import{CONFIDENCE_LEVELS,auditDecisionConfidence,confidenceReport}from'./lesson-confidence.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/**
 * Predict → freeze → next question; no key or feedback displayed until
 * after all three decisions and written caveats are submitted.
 */
export function mountLessonReasoning(root,{lessonId,record,onSaved=()=>{}}){
 if(!root||typeof record!=='function')throw Error('La reflexión necesita un guardador de evidencia');
 const scenario=reasoningChallenge(lessonId),transfer=transferCase(lessonId);
 if(!scenario||!transfer){root.innerHTML='';return;}
 let answers={},confidences={},transferAnswer=null,transferConfidence=null,transferFrozen=false,reasoning='',limitations='',result=null,recorded=false,saving=false,error='';
 const keys=['hypothesis','measurement','falsifier'];
 const confidenceSelect=(id)=>'<label for="confidence-'+id+'">¿Cuán seguro estás de tu decisión? (opcional; se congela junto con tu respuesta)</label>'+
  '<select class="field" id="confidence-'+id+'"><option value="">No declarar confianza</option>'+
  CONFIDENCE_LEVELS.map(x=>'<option value="'+x.value+'">'+esc(x.label)+'</option>').join('')+'</select>';
 const readConfidence=(id)=>{
  const value=root.querySelector('#confidence-'+id)?.value;
  return value===''||value===undefined?null:Number(value);
 };
 const currentAudit=()=>auditDecisionConfidence([
  ...scenario.steps.map((step,i)=>({correct:result.original.stepResults[i].correct,confidence:confidences[step.id]??null})),
  {correct:result.transferCorrect,confidence:transferConfidence}
 ]);
 function render(){
  const next=scenario.steps.find(step=>!Object.hasOwn(answers,step.id));
  const committed=scenario.steps.filter(step=>Object.hasOwn(answers,step.id));
  let html='<div class="panel stack reasoning-bench"><div class="eyebrow">HIPÓTESIS · PRUEBA · FALSACIÓN</div>'+
  '<h2>Desafío de razonamiento: '+esc(scenario.title)+'</h2>'+
  '<p>'+esc(scenario.context)+'</p>'+
  '<p class="muted">Las decisiones se congelan antes de mostrar la devolución. Primero predecí; después contrastá con el simulador de la lección. La explicación escrita se guarda, pero no se juzga semánticamente.</p>';
  for(const step of committed){
   const choice=step.options[answers[step.id]];
   html+='<p class="reasoning-frozen"><strong>'+esc(step.title)+':</strong> '+esc(choice)+' <span class="tag dim">Congelado</span>'+(confidences[step.id]===null?' · confianza no declarada':' · confianza subjetiva '+Math.round(confidences[step.id]*100)+' %')+'</p>';
  }
  if(next){
   const field='reasoning-'+next.id;
   html+='<label for="'+field+'"><strong>'+esc(next.title)+'</strong> · '+esc(next.question)+'</label>'+
    '<select class="field" id="'+field+'"><option value="">Elegí una decisión antes de continuar</option>'+
    next.options.map((item,i)=>'<option value="'+i+'">'+esc(item)+'</option>').join('')+'</select>'+confidenceSelect(next.id)+
    '<button type="button" class="button" data-reasoning="lock" data-step="'+esc(next.id)+'">Congelar decisión y continuar</button>';
  }else if(!transferFrozen){
   html+='<div class="panel stack"><div class="eyebrow">TRANSFERENCIA · ESCENARIO NUEVO</div><h3>Aplicá el mismo criterio con evidencia diferente</h3><p>'+esc(transfer.context)+'</p>'+ 
     '<label for="reasoning-transfer">'+esc(transfer.context.split('.')[0])+': ¿qué conclusión justifica la nueva evidencia?</label>'+ 
     '<select class="field" id="reasoning-transfer"><option value="">Elegí una decisión antes de continuar</option>'+ 
     transfer.options.map((item,i)=>'<option value="'+i+'">'+esc(item)+'</option>').join('')+'</select>'+confidenceSelect('transfer')+ 
     '<button type="button" class="button" data-reasoning="lock-transfer">Congelar hipótesis de transferencia</button></div>';
  }else if(!result){
   html+='<p class="reasoning-frozen"><strong>Escenario reservado: </strong>'+esc(transfer.options[transferAnswer])+' <span class="tag dim">Congelado</span>'+(transferConfidence===null?' · confianza no declarada':' · confianza subjetiva '+Math.round(transferConfidence*100)+' %')+'</p>';
   html+='<label for="reasoning-justification">Explicá qué observación discrimina y qué te haría cambiar de hipótesis (100 caracteres mínimo)</label>'+
    '<textarea class="field" id="reasoning-justification" rows="4" maxlength="3000">'+esc(reasoning)+'</textarea>'+
    '<label for="reasoning-limitations">Explicá límites de la simulación y evidencia física faltante (60 caracteres mínimo)</label>'+
    '<textarea class="field" id="reasoning-limitations" rows="3" maxlength="3000">'+esc(limitations)+'</textarea>'+
    '<button type="button" class="button" data-reasoning="grade">Revelar devoluciones y evaluar</button>';
  }else{
   html+='<h3>Devolución por criterio</h3>'+
    result.original.stepResults.map((item,i)=>'<div class="panel"><p><strong>'+esc(scenario.steps[i].title)+': '+(item.correct?'Coincide con el modelo':'Revisar hipótesis')+'</strong></p><p>'+esc(item.feedback)+'</p></div>').join('')+
    '<div class="panel"><p><strong>Transferencia: '+(result.transferCorrect?'Coincide con el modelo':'Revisar hipótesis')+'</strong></p><p>'+esc(transfer.feedback)+'</p></div>'+
    '<p><strong>Resultado estructurado con transferencia: '+result.score+'/100</strong> · '+(result.passed?'Criterios cumplidos':'Volvé a plantear el caso')+'</p>'+
    '<p><strong>Autoconfianza (no es parte de la nota):</strong> '+currentAudit().declared+'/4 decisiones declaradas.'+
 (currentAudit().complete?' Error cuadrático medio descriptivo: '+currentAudit().meanSquaredError.toFixed(4)+'.':' No se calcula índice con declaraciones incompletas.')+
 ' Errores cometidos con confianza 95 %: '+currentAudit().overconfidentErrors+'.</p>'+
 '<p class="muted">'+esc(currentAudit().limitations)+'</p>'+
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
   answers={...answers,[id]:index};confidences={...confidences,[id]:readConfidence(id)};render();return;
  }
  if(b.dataset.reasoning==='lock-transfer'){
   if(transferFrozen||scenario.steps.some(x=>!Object.hasOwn(answers,x.id)))return;
   const input=root.querySelector('#reasoning-transfer')?.value;
   const value=Number(input);
   if(input===''||!Number.isInteger(value)||value<0||value>=transfer.options.length){
    error='Seleccioná una conclusión de transferencia antes de congelarla.';render();return;
   }
   transferAnswer=value;transferConfidence=readConfidence('transfer');transferFrozen=true;render();return;
  }
  if(b.dataset.reasoning==='grade'){
   try{result=gradeReasoningTransfer({lessonId,answers,transferAnswer,reasoning,limitations});}
   catch(e){error='No se pudo evaluar: '+e.message;}
   render();return;
  }
  if(b.dataset.reasoning==='reset'){
   if(saving)return;answers={};confidences={};transferAnswer=null;transferConfidence=null;transferFrozen=false;reasoning='';limitations='';result=null;recorded=false;render();return;
  }
  if(b.dataset.reasoning==='save'){
   if(!result||saving||recorded)return;saving=true;
   try{
    await record({id:transferCaseId(lessonId),score:result.score,passed:result.passed,at:new Date().toISOString(),
      hypothesis:scenario.steps[0].options[answers.hypothesis],
      conclusion:scenario.steps[2].options[answers.falsifier],
      used:['hypothesis-frozen','independent-probe-choice','falsifier-choice','counterfactual-transfer-frozen'],
      reasoning,report:reasoningTransferReport({lessonId,answers,transferAnswer,reasoning,limitations},result)+'\n\n'+confidenceReport(currentAudit())});
    recorded=true;onSaved(result);
   }catch{error='No se confirmó el guardado de tu reflexión. Podés reintentarlo.';}
   finally{saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
