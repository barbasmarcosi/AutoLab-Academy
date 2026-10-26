import{POWERTRAIN_CAUSES,POWERTRAIN_PROBES,publicPowertrainCase,revealPowertrainProbe,gradePowertrainCase,powertrainReport}from'./powertrain-research.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const options=(xs,placeholder,current='')=>'<option value="">'+esc(placeholder)+'</option>'+xs.map(x=>'<option value="'+esc(x.id)+'" '+(current===x.id?'selected':'')+'>'+esc(x.label)+'</option>').join('');
export function powertrainShell(){return '<section class="stack"><div class="eyebrow">AUTOMOTIVE MECHANICS · MC06</div><h1>Powertrain Diagnostic Bench</h1><p>Una misma lectura de RPM admite causas mecánicas, instrumentales o combinadas. Pronosticá pruebas independientes antes de revelar resultados y verificá el balance energético.</p><div id="powertrain-explorer"></div></section>';}
export function mountPowertrainLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('MC06 necesita guardar evidencias');
 const s={seed:null,initial:'',observations:[],final:'',reasoning:'',limitations:'',grade:null,recorded:false,saving:false,error:''};
 function render(){
  let html='<div class="panel stack"><h2>Contrato físico y metrológico</h2><p role="note"><strong>Banco completamente sintético, sin CAN, vehículos o datos OEM.</strong> Transmisión estacionaria 3:1, par ficticio 140 N·m a 2400 rpm y eficiencia base hipotética 92 %. Tres causas producen idénticas 704 rpm <em>indicadas</em>. Una comprobación independiente de régimen y otra del offset instrumental las distinguen. Nunca inferir pérdidas energéticas desde una lectura de RPM no verificada.</p><button class="button" type="button" data-pt="new">Crear investigación MC06</button></div>';
  if(s.seed!==null){
   const c=publicPowertrainCase(s.seed);
   html+='<div class="panel stack"><h2>Expediente · semilla '+s.seed+'</h2><p>Entrada '+c.inputRpm+' rpm; reducción '+c.gearRatio+':1; <strong>salida indicada '+c.indicatedOutputRpm+' rpm</strong>.</p><p>'+esc(c.warning)+'</p>';
   if(!s.initial){
    html+='<label for="pt-initial">Hipótesis provisional antes de medir</label><select class="field" id="pt-initial">'+options(POWERTRAIN_CAUSES,'Elegí una hipótesis')+'</select><button class="button" type="button" data-pt="lock">Congelar hipótesis</button>';
   }else{
    html+='<p>Hipótesis inicial congelada: <strong>'+esc(POWERTRAIN_CAUSES.find(x=>x.id===s.initial).label)+'</strong></p>';
    for(const probe of POWERTRAIN_PROBES){
     const observation=s.observations.find(x=>x.id===probe.id);
     html+='<div class="panel stack"><h3>'+esc(probe.label)+'</h3>';
     if(observation){
      const p=revealPowertrainProbe(s.seed,probe.id,observation.prediction);
      html+='<p>Pronóstico: '+esc(observation.prediction)+'; lectura: <strong>'+p.value.toFixed(2)+' '+esc(p.unit)+'</strong>; clase: '+esc(p.classification)+'.</p>';
     }else if(!s.grade&&(probe.id==='independent'||s.observations.some(o=>o.id==='independent'))){
      html+='<label for="pt-'+probe.id+'">Predicción de lectura antes de revelar</label><select class="field" id="pt-'+probe.id+'">'+options(probe.classes,'Elegí una región')+'</select><button class="button alt" type="button" data-pt="probe" data-probe="'+probe.id+'">Congelar y revelar '+esc(probe.label)+'</button>';
     }else html+='<p class="muted">Completá primero la medición independiente de régimen.</p>';
     html+='</div>';
    }
    if(s.observations.length===2){
     if(!s.grade){
      html+='<label for="pt-final">Conclusión causal final</label><select class="field" id="pt-final">'+options([...POWERTRAIN_CAUSES,{id:'insufficient',label:'Evidencia insuficiente'}],'Elegí conclusión',s.final)+'</select>';
      html+='<label for="pt-reason">Por qué la segunda lectura y la referencia permiten discriminar (mínimo 100 caracteres)</label><textarea class="field" id="pt-reason" rows="4" maxlength="3000">'+esc(s.reasoning)+'</textarea>';
      html+='<label for="pt-limits">Límites y siguientes comprobaciones reales seguras (mínimo 80 caracteres)</label><textarea class="field" id="pt-limits" rows="3" maxlength="3000">'+esc(s.limitations)+'</textarea>';
      html+='<button class="button" type="button" data-pt="grade">Evaluar investigación</button>';
     }else{
      const report=powertrainReport(s,s.grade);
      html+='<p><strong>Resultado: '+s.grade.score+'/100.</strong> '+(s.grade.passed?'Criterios objetivos completos.':'Criterios incompletos.')+'</p><p>Causa simulada: '+esc(s.grade.expected)+'</p>';
      html+='<pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(report.split('\n').filter(x=>x.includes('Balance energético ficticio:'))[0])+'</pre><p>'+esc(s.grade.warning)+'</p>';
      html+='<button class="button" type="button" data-pt="save" '+(s.recorded||s.saving?'disabled':'')+'>'+(s.recorded?'Evidencia registrada':'Guardar investigación MC06')+'</button>';
     }
    }
   }
   html+='</div>';
  }
  html+='<p role="status" aria-live="polite">'+esc(s.error)+'</p>';root.innerHTML=html;
 }
 root.addEventListener('input',ev=>{
  if(ev.target.id==='pt-final')s.final=ev.target.value;
  if(ev.target.id==='pt-reason')s.reasoning=ev.target.value;
  if(ev.target.id==='pt-limits')s.limitations=ev.target.value;
 });
 root.addEventListener('click',async ev=>{
  const b=ev.target.closest('[data-pt]');if(!b)return;
  const action=b.dataset.pt;s.error='';
  if(action==='new'){Object.assign(s,{seed:Math.floor(Math.random()*2147483647)+1,initial:'',observations:[],final:'',reasoning:'',limitations:'',grade:null,recorded:false,saving:false,error:''});render();return;}
  if(action==='lock'){
   const guess=root.querySelector('#pt-initial')?.value;
   if(!POWERTRAIN_CAUSES.some(x=>x.id===guess)){s.error='Elegí una hipótesis inicial.';render();return;}
   s.initial=guess;render();return;
  }
  if(action==='probe'){
   const id=b.dataset.probe,guess=root.querySelector('#pt-'+id)?.value;
   if(!s.initial||s.grade||s.observations.some(o=>o.id===id)||id==='reference'&&!s.observations.some(o=>o.id==='independent'))return;
   try{revealPowertrainProbe(s.seed,id,guess);s.observations.push({id,prediction:guess});}
   catch{s.error='La clase seleccionada no es válida; elegí una predicción.';}
   render();return;
  }
  if(action==='grade'){
   if(s.reasoning.trim().length<100||s.limitations.trim().length<80){s.error='Se requieren 100 caracteres de razonamiento y 80 de límites.';render();return;}
   try{s.grade=gradePowertrainCase(s);}catch{s.error='Falta una conclusión causal válida.';}
   render();return;
  }
  if(action==='save'){
   if(!s.grade||s.recorded||s.saving)return;s.saving=true;
   try{await record({id:'lab-powertrain-mc06-v1',score:s.grade.score,passed:s.grade.passed,
    at:new Date().toISOString(),hypothesis:s.initial,conclusion:s.final,used:['independent-tachometer','sensor-reference'],
    reasoning:s.reasoning,report:powertrainReport(s,s.grade)});s.recorded=true;}
   catch{s.error='No se confirmó el guardado local. Reintentá.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
