import {CASES,getCase,getCause,makeSession,chooseCause,takeMeasurement,evaluate,explain} from './engine.js';
const KEY='autolab-modo-taller-v1';
const app=document.getElementById('app');
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const saved=(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}})();
let state={active:saved.active?.version===1?saved.active:null,history:Array.isArray(saved.history)?saved.history:[],mode:saved.mode==='reto'?'reto':'guia',selection:null,error:''};
function store(){
 try{localStorage.setItem(KEY,JSON.stringify({active:state.active,history:state.history.slice(-100),mode:state.mode}));}
 catch{state.error='El navegador no pudo guardar el progreso. Podés seguir jugando, pero al cerrar podría perderse.';}
}
function top(){
 const wins=state.history.filter(x=>x.result?.passed).length;
 return '<header class="top"><a class="backlink" href="../">‹ AutoLab Academy</a><div class="top-right"><span class="live-dot"></span><span>LABORATORIO VIRTUAL</span></div></header>'+
 '<div class="brand"><span class="brand-icon">A<span>+</span></span><span>AutoLab <strong>Modo Taller</strong></span></div>'+
 '<div class="dashboard"><div><b>'+state.history.length+'</b><small>Diagnósticos</small></div><div><b>'+wins+'</b><small>Confirmados</small></div><div><b>3</b><small>Vehículos</small></div></div>';
}
function home(){
 const best=id=>state.history.filter(x=>x.caseId===id).reduce((m,x)=>Math.max(m,x.result?.score||0),0);
 return '<section class="intro"><div class="overline">ENTRENÁ TU CRITERIO · GRATIS · SIN CUENTA</div><h1>Una falla. Tres sospechosos.<br><em>Tu diagnóstico.</em></h1>'+
 '<p>Un taller de bolsillo: investigá síntomas, anticipá resultados, elegí instrumentos y defendé la causa raíz. Sin compras, anuncios ni respuestas regaladas.</p>'+
 '<div class="mode" role="group" aria-label="Nivel de ayuda"><button data-act="mode" data-mode="guia" class="'+(state.mode==='guia'?'chosen':'')+'">Aprendiz · con pistas</button><button data-act="mode" data-mode="reto" class="'+(state.mode==='reto'?'chosen':'')+'">Desafío · sin pistas</button></div></section>'+
 (state.active?.status==='active'?'<button class="resume" data-act="resume">↗ Continuar diagnóstico: '+escapeHtml(getCase(state.active.caseId)?.title)+' <span>→</span></button>':'')+
 '<h2 class="section-heading">Órdenes de trabajo <span>3 disponibles</span></h2>'+
 '<div class="jobs">'+CASES.map((c,i)=>'<article class="job"><div class="job-top"><span class="number">0'+(i+1)+'</span><span class="label">'+escapeHtml(c.area)+'</span><span class="best">MEJOR '+(best(c.id)?best(c.id)+'/100':'—')+'</span></div>'+
 '<div class="job-mid"><div><h3>'+escapeHtml(c.title)+'</h3><p>'+escapeHtml(c.subtitle)+'</p></div><div class="case-icon">'+(['◉','⚡','⌁'][i])+'</div></div>'+
 '<div class="job-bottom"><span>◷ '+c.minutes+' min aprox.</span><span>Nivel '+c.level+'</span><button data-act="start" data-id="'+c.id+'">Investigar →</button></div></article>').join('')+'</div>'+
 '<section class="disclaimer"><b>No es un manual de reparación.</b> Mediciones sintéticas de baja tensión: no son valores OEM ni certifican competencia sobre un vehículo real.</section>';
}
function optionRadio(name,options,selected=''){
 return '<div class="option-list">'+options.map(o=>'<label class="option"><input type="radio" name="'+name+'" value="'+escapeHtml(o.id)+'" '+(selected===o.id?'checked':'')+'><span>'+escapeHtml(o.label)+'</span></label>').join('')+'</div>';
}
function game(){
 const s=state.active,c=getCase(s.caseId),done=s.status==='done';
 const latest=s.measurements.at(-1);
 const progress=s.measurements.length;
 let html='<div class="case-top"><button class="quiet" data-act="home">← Volver a órdenes</button><span class="pill">'+(done?'Informe cerrado':'CASO ABIERTO')+'</span></div>'+
 '<div class="case-head"><div class="overline">'+escapeHtml(c.area)+' · '+escapeHtml(c.vehicle)+'</div><h1>'+escapeHtml(c.title)+'</h1><p>'+escapeHtml(c.story)+'</p><div class="case-stats"><span>PRUEBAS <strong>'+progress+'</strong></span><span>HIPÓTESIS <strong>'+(s.hypothesis?'REGISTRADA':'PENDIENTE')+'</strong></span></div></div>';
 if(!s.hypothesis) {
  html+='<section class="panel"><div class="step"><b>01</b> HIPÓTESIS ANTES DE MEDIR</div><h2>¿Qué sospechás inicialmente?</h2><p class="help">No tenés que acertar ahora. Un buen diagnosticador puede cambiar de hipótesis cuando aparece evidencia.</p>'+
   optionRadio('hypothesis',c.choices.map(x=>({id:x.id,label:x.label})))+
   '<button class="primary wide" data-act="hypothesis">Registrar hipótesis y abrir instrumentos →</button></section>';
 } else if(!done){
  html+='<section class="panel"><div class="step"><b>02</b> BANCO DE PRUEBAS</div><h2>Elegí qué medir</h2><p class="help">Hipótesis inicial: <strong>'+escapeHtml(getCause(c,s.hypothesis).label)+'</strong>. El resultado de una prueba podría obligarte a descartarla.</p>'+
  '<div class="probes">'+c.probes.map(p=>'<button class="probe '+(s.measurements.some(m=>m.id===p.id)?'used':'')+'" data-act="probe" data-id="'+p.id+'" '+(s.measurements.some(m=>m.id===p.id)?'disabled':'')+'><small>'+escapeHtml(p.kind)+'</small><strong>'+escapeHtml(p.label)+'</strong><span>'+(s.measurements.some(m=>m.id===p.id)?'MEDIDA':'ELEGIR ↗')+'</span></button>').join('')+'</div>';
  const selected=c.probes.find(p=>p.id===state.selection);
  if(selected){
   html+='<div class="pending"><div class="step">ANTES DE TOCAR EL INSTRUMENTO</div><h3>'+escapeHtml(selected.label)+'</h3><p>¿Esperás un resultado normal o anómalo?</p>'+
   optionRadio('prediction',[{id:'normal',label:'Normal'},{id:'anormal',label:'Anómalo'},{id:'nose',label:'Todavía no sé'}],'nose')+
   '<button class="primary wide" data-act="measure" data-id="'+selected.id+'">Realizar medición</button></div>';
  }
  if(latest){
   html+='<div class="reading" role="status"><div class="step">RESULTADO DEL INSTRUMENTO</div><h3>'+escapeHtml(latest.label)+'</h3><div class="meter">'+escapeHtml(latest.value)+'</div>'+
   (s.mode==='guia'?'<p class="help">'+escapeHtml(latest.note)+'</p>':'')+'</div>';
  }
  if(s.measurements.length){
   html+='<details class="history"><summary>Registro de mediciones ('+progress+')</summary><ol>'+s.measurements.map(m=>'<li><strong>'+escapeHtml(m.label)+'</strong><br>'+escapeHtml(m.value)+'</li>').join('')+'</ol></details>';
  }
  html+='</section><section class="panel"><div class="step"><b>03</b> INFORME DEL TALLER</div><h2>¿Cuál es la causa raíz?</h2>'+
   '<p class="help">Necesitás al menos dos mediciones. Para destacar, usá una prueba que identifique la causa y otra que descarte una alternativa.</p>'+
   '<label class="fieldlabel" for="final-diagnosis">Diagnóstico final</label><select id="final-diagnosis"><option value="">Seleccionar causa</option>'+c.choices.map(x=>'<option value="'+x.id+'">'+escapeHtml(x.label)+'</option>').join('')+'</select>'+
   '<label class="fieldlabel" for="reasoning">Explicá qué mediciones respaldan y descartan tu hipótesis</label><textarea id="reasoning" maxlength="1500" placeholder="Por ejemplo: medí... Observé... Esto descarta..."></textarea>'+
   '<button class="primary wide" data-act="submit" '+(progress<2?'disabled':'')+'>Entregar diagnóstico y ver informe →</button></section>';
 }else{
  const e=explain(s),r=s.result;
  html+='<section class="panel result"><div class="step"><b>✓</b> INFORME DE DIAGNÓSTICO</div><div class="bigscore">'+r.score+'<small>/100</small></div>'+
   '<h2>'+(r.passed?'Causa confirmada':'Revisá la cadena de evidencias')+'</h2>'+
   '<div class="score-grid"><div><b>'+(r.correct?'✓':'×')+'</b> Causa raíz</div><div><b>'+(r.decisive?'✓':'×')+'</b> Prueba discriminante</div><div><b>'+(r.contrast?'✓':'×')+'</b> Alternativa descartada</div></div>'+
   '<h3>Avería generada</h3><p><strong>'+escapeHtml(e.cause)+'</strong>. '+escapeHtml(e.mechanism)+'</p><p><strong>Prueba clave:</strong> '+escapeHtml(e.decisive)+'</p><p><strong>Prueba de contraste:</strong> '+escapeHtml(e.contrast)+'</p>'+
   '<p><strong>Reparación propuesta:</strong> '+escapeHtml(e.fix)+'</p>'+
   '<h3>Tu diagnóstico</h3><p>'+escapeHtml(getCause(c,s.diagnosis)?.label)+'</p><blockquote>'+escapeHtml(s.reasoning)+'</blockquote>'+
   '<p class="help">El puntaje evalúa elecciones y evidencia registrada, no la exactitud semántica de tu texto. La explicación requiere revisión humana.</p>'+
   '<div class="actions"><button class="primary" data-act="start" data-id="'+c.id+'">Nueva falla del mismo auto ↻</button><button class="secondary" data-act="home">Otras órdenes</button></div></section>';
 }
 if(s.mode==='guia'&&!done){html+='<details class="teach"><summary>◈ Ayuda conceptual (sin revelar la avería)</summary><p>'+escapeHtml(c.lesson)+'</p><p>'+escapeHtml(c.reference)+'</p></details>';}
 return html;
}
function render(){
 app.innerHTML=top()+(state.error?'<div class="alert" role="alert">'+escapeHtml(state.error)+'</div>':'')+(state.active&&state.screen!=='home'?game():home())+
 '<footer class="footer">AutoLab Academy · Prácticas sintéticas · Progreso guardado solo en este dispositivo.</footer>';
}
function showGame(){if(state.active){state.screen='game';state.selection=null;store();render();}}
app.addEventListener('click',e=>{
 const button=e.target.closest('button[data-act]');if(!button)return;
 const a=button.dataset.act;
 try{
  state.error='';
  if(a==='home'){state.screen='home';state.selection=null;}
  if(a==='resume'){showGame();return;}
  if(a==='mode'){state.mode=button.dataset.mode;}
  if(a==='start'){const id=button.dataset.id;state.active=makeSession(id,chooseCause(id),state.mode);state.screen='game';state.selection=null;}
  if(a==='hypothesis'){
   const choice=app.querySelector('input[name="hypothesis"]:checked')?.value;
   if(!choice)throw Error('Elegí primero una hipótesis inicial.');
   state.active.hypothesis=choice;
  }
  if(a==='probe'){state.selection=button.dataset.id;}
  if(a==='measure'){
   const guess=app.querySelector('input[name="prediction"]:checked')?.value||'nose';
   state.active=takeMeasurement(state.active,button.dataset.id,guess);
   state.selection=null;
  }
  if(a==='submit'){
   const d=app.querySelector('#final-diagnosis')?.value||'';
   const r=app.querySelector('#reasoning')?.value||'';
   if(state.active.measurements.length<2)throw Error('Realizá al menos dos mediciones.');
   state.active=evaluate(state.active,d,r);
   state.history.push({caseId:state.active.caseId,result:state.active.result,at:state.active.finishedAt});
  }
  store();render();window.scrollTo({top:0,behavior:'smooth'});
 }catch(err){state.error=err.message;render();window.scrollTo({top:0,behavior:'smooth'});}
});
render();
