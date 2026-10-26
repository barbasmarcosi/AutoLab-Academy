import{RW4_ALTERNATIVES,RW4_CROSSCHECKS,publicAdversarialCase,revealCrosscheck,evaluateAdversarial,adversarialReport}from'./rotary-instrument-check.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
export function adversarialShell(){
 return '<section class="stack"><div class="eyebrow">RW4 · INVESTIGACIÓN ADVERSARIAL</div><h1>Instrument Verification Lab</h1><p>Una señal anómala puede provenir del sistema o del instrumento. Contrastá el diagnóstico con una segunda lectura y un control de referencia antes de atribuir una causa.</p><div id="rotary-instrument-explorer"></div></section>';
}
export function mountAdversarialLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('Se requiere registrar evidencia RW4');
 const s={seed:null,initial:'',observations:[],final:'',reasoning:'',limits:'',result:null,saved:false,saving:false,error:''};
 const opts=(list,empty)=>'<option value="">'+empty+'</option>'+list.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.label)+'</option>').join('');
 function render(){
  let html='<div class="panel stack"><h2>Qué se investiga</h2><p role="note"><strong>Banco ficticio.</strong> Una falla de estanqueidad y un instrumento desviado pueden entregar la misma lectura inicial baja. El resultado inicial <em>no</em> confirma desgaste ni fugas. Los índices son adimensionales e inventados: no representan presión de compresión, calibración certificada ni mediciones OEM.</p><button class="button" type="button" data-ri="new">Crear desafío adversarial</button></div>';
  if(s.seed!==null){
   const c=publicAdversarialCase(s.seed);
   html+='<div class="panel stack"><h2>Expediente RW4+ · semilla '+s.seed+'</h2><p>'+esc(c.symptom)+'</p><p>Índice de retención del instrumento original: <strong>'+c.observed.toFixed(3)+'</strong> (bajo en ambas causas). Índice de encendido sintético: '+c.ignitionIndex.toFixed(3)+'.</p>';
   if(!s.initial){
    html+='<p>Elegí una hipótesis inicial antes de realizar verificaciones; ambas son compatibles con la primera observación.</p><label for="ri-initial">Hipótesis provisional</label><select class="field" id="ri-initial">'+opts(RW4_ALTERNATIVES,'Elegí…')+'</select><button class="button" data-ri="lock" type="button">Congelar hipótesis provisional</button>';
   }else{
    html+='<p><strong>Hipótesis inicial congelada:</strong> '+esc(RW4_ALTERNATIVES.find(x=>x.id===s.initial)?.label)+'</p>';
    if(!s.result){
     for(const cfg of RW4_CROSSCHECKS){
      const obs=s.observations.find(x=>x.id===cfg.id);
      html+='<div class="panel stack"><h3>'+esc(cfg.label)+'</h3>';
      if(obs){
       const result=revealCrosscheck(s.seed,cfg.id,obs.prediction);
       html+='<p>Predicción: '+esc(obs.prediction)+'; índice observado: '+result.value.toFixed(3)+'; clasificación simulada: '+esc(result.classification)+'.</p>';
      }else{
       html+='<label for="ri-'+cfg.id+'">Predicción de la verificación '+cfg.id+'</label><select class="field" id="ri-'+cfg.id+'"><option value="">Elegí antes de revelar…</option>'+cfg.options.map(x=>'<option value="'+x+'">'+esc(x)+'</option>').join('')+'</select><button class="button alt" type="button" data-ri="probe" data-probe="'+cfg.id+'">Congelar y revelar '+cfg.id+'</button>';
      }
      html+='</div>';
     }
     html+='<label for="ri-final">Hipótesis final</label><select class="field" id="ri-final">'+opts(RW4_ALTERNATIVES,'Concluir después de las pruebas…')+'</select>';
     html+='<label for="ri-reason">Justificá qué evidencia separa el estado del sistema del error de medición (mín. 90 caracteres)</label><textarea class="field" id="ri-reason" rows="4" maxlength="3000">'+esc(s.reasoning)+'</textarea>';
     html+='<label for="ri-limits">Fuentes de error y límites de transferencia a un vehículo real (mín. 60 caracteres)</label><textarea class="field" id="ri-limits" rows="3" maxlength="2000">'+esc(s.limits)+'</textarea>';
     html+='<button class="button" type="button" data-ri="finish">Concluir desafío adversarial</button>';
    }else{
     html+='<p><strong>Resultado:</strong> '+s.result.score+'/100 · '+(s.result.passed?'Criterios objetivos completos.':'Criterios incompletos o causa sin confirmar.')+'</p><p>Solución programada del modelo: '+esc(RW4_ALTERNATIVES.find(x=>x.id===s.result.expected)?.label)+'</p><p>'+esc(s.result.warning)+'</p><button class="button" data-ri="record" type="button" '+(s.saved||s.saving?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar expediente adversarial')+'</button>';
    }
   }
   html+='</div>';
  }
  html+='<p role="status" aria-live="polite">'+esc(s.error)+'</p>';root.innerHTML=html;
  if(s.initial&&!s.result){const sel=root.querySelector('#ri-final');if(sel)sel.value=s.final;}
 }
 root.addEventListener('input',e=>{
  if(e.target.id==='ri-final')s.final=e.target.value;
  if(e.target.id==='ri-reason')s.reasoning=e.target.value;
  if(e.target.id==='ri-limits')s.limits=e.target.value;
 });
 root.addEventListener('click',async e=>{
  const b=e.target.closest('[data-ri]');if(!b)return;s.error='';
  if(b.dataset.ri==='new'){
   s.seed=Math.floor(Math.random()*2147483647)+1;s.initial='';s.observations=[];s.final='';s.reasoning='';s.limits='';s.result=null;s.saved=false;s.saving=false;render();return;
  }
  if(b.dataset.ri==='lock'){const id=root.querySelector('#ri-initial')?.value;
   if(!RW4_ALTERNATIVES.some(x=>x.id===id)){s.error='Elegí la hipótesis antes de las pruebas.';}else s.initial=id;render();return;
  }
  if(b.dataset.ri==='probe'){
   const id=b.dataset.probe,guess=root.querySelector('#ri-'+id)?.value;
   try{revealCrosscheck(s.seed,id,guess);if(s.observations.some(x=>x.id===id))throw RangeError('Repetido');s.observations.push({id,prediction:guess});}
   catch(error){s.error='Elegí una predicción válida para una prueba nueva.';}render();return;
  }
  if(b.dataset.ri==='finish'){
   if(s.observations.length!==2||!s.final||s.reasoning.trim().length<90||s.limits.trim().length<60){
    s.error='Primero completá ambas verificaciones, hipótesis final, razonamiento (90) y límites (60).';render();return;
   }
   try{s.result=evaluateAdversarial(s);}catch(error){s.error='Las verificaciones contienen datos inconsistentes.';}render();return;
  }
  if(b.dataset.ri==='record'){
   if(!s.result||s.saving||s.saved)return;s.saving=true;
   try{await record({id:'lab-rotary-instrument-v1',score:s.result.score,passed:s.result.passed,at:new Date().toISOString(),hypothesis:s.initial,conclusion:s.final,used:s.observations.map(x=>x.id),reasoning:s.reasoning,report:adversarialReport(s,s.result)});s.saved=true;}
   catch(error){s.error='No se confirmó el guardado de IndexedDB. Reintentá.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
