import{portStudy,heatReleaseStudy,evaluatePortBurn,portBurnReport,
 PORT_RESEARCH_SOURCE,PORT_OVERLAP_SOURCE,PORT_PRESETS,BURN_PRESETS}from'./rotary-port-burn.js';
const escapeText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const format=x=>Number(x).toFixed(3);
const choice=(id,label,opts,current)=>'<label for="'+id+'">'+escapeText(label)+'</label><select id="'+id+'" class="field">'+opts.map(([value,title])=>
 '<option value="'+value+'" '+(String(value)===String(current)?'selected':'')+'>'+escapeText(title)+'</option>').join('')+'</select>';
const prior=[['','Elegí antes de revelar'],['aumenta','Aumenta'],['disminuye','Disminuye'],['igual','No cambia']];
export function portBurnShell(){
 return '<section class="stack"><div class="eyebrow">ROTARY ENGINEERING · RW6/RW7</div><h1>Rotary Ports & Combustion Lab</h1><p>Investigá dos modelos separados: superposición de ventanas de admisión/escape y una curva de liberación de calor normalizada. Elegí hipótesis antes de ver resultados.</p><div id="rotary-port-burn-explorer"></div></section>';
}
const coords=(samples,key)=>samples.map((sample,index)=>{
 const x=36+300*index/(samples.length-1);
 const y=103-82*sample[key];
 return (index?'L':'M')+x.toFixed(2)+' '+y.toFixed(2);
}).join(' ');
function graph(samples){
 return '<svg style="width:100%;max-width:560px" viewBox="0 0 380 132" role="img" aria-label="Curva supuesta de fracción normalizada de calor liberado, base y candidata, frente al ángulo de eje">'+
 '<path d="M36 15V103H340" stroke="currentColor" fill="none"/>'+
 '<path d="'+coords(samples,'baseline')+'" fill="none" stroke="#30a4c5" stroke-width="2.5"/>'+
 '<path d="'+coords(samples,'candidate')+'" fill="none" stroke="#e6a354" stroke-width="2.5"/>'+
 '<text x="38" y="12" fill="currentColor" font-size="10">1</text>'+
 '<text x="22" y="106" fill="currentColor" font-size="10">0</text>'+
 '<text x="36" y="118" fill="currentColor" font-size="9">100°</text>'+
 '<text x="300" y="118" fill="currentColor" font-size="9">400°</text></svg>'+
 '<p class="muted">Curva azul: base; naranja: alternativa. Son perfiles adimensionales hipotéticos, no gráficos de presión o potencia.</p>';
}
export function mountPortBurnLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW6/RW7 requiere persistencia confirmable');
 const s={portPreset:'delay',burnPreset:'later',portPrediction:'',burnPrediction:'',realEnginePrediction:'',
  reasoning:'',limits:'',revealed:false,ports:null,burn:null,grade:null,saved:false,saving:false,error:''};
 function render(){
  let html='<div class="panel stack"><h2>Contrato científico y fuentes</h2><p role="note"><strong>Dos modelos independientes y sintéticos.</strong> RW6 calcula exclusivamente grados de apertura simultánea en un calendario de ventanas rectangulares de una cámara ficticia. No resuelve obstrucción por el rotor, área efectiva, VE, presión ni emisiones. RW7 usa una función de Wiebe normalizada entre cero y uno que solo describe una curva supuesta: <strong>no calcula combustión física, detonación, potencia, emisiones ni estrategia de encendido OEM.</strong></p>'+
  '<p>Inspiración técnica: <a href="'+PORT_RESEARCH_SOURCE+'" target="_blank" rel="noopener noreferrer">investigación abierta sobre puertos laterales y fases</a> y <a href="'+PORT_OVERLAP_SOURCE+'" target="_blank" rel="noopener noreferrer">SAE: compensaciones del solapamiento de puertos</a>. Los ángulos utilizados abajo son inventados; no se atribuyen a esos estudios.</p></div>';
  html+='<div class="panel stack"><h2>RW6 · Ventanas de admisión y escape</h2><p>Período conceptual: 1080° de eje para una cámara. Base: admisión -40° durante 340°; escape 760° durante 320°. La alternativa desplaza el comienzo de admisión, manteniendo sus 340°; no modifica el escape.</p>';
  if(!s.revealed){
   html+=choice('rp-port','Alternativa de sincronización conceptual',[
    ['delay','Retrasar apertura de admisión 60°'],['advance','Adelantar apertura de admisión 40°']],s.portPreset);
   html+=choice('rp-port-pred','Pronóstico: grados de solapamiento simultáneo',prior,s.portPrediction);
  }else{
   const p=s.ports;
   html+='<table class="rw-table" style="width:100%"><caption>Calendario sintético de puertos, sin máscaras geométricas ni caudal</caption><thead><tr><th scope="col">Magnitud (grados de eje)</th><th scope="col">Base</th><th scope="col">Alternativa</th></tr></thead><tbody>';
   const rows=[['Inicio de admisión',p.base.intake.startDeg,p.candidate.intake.startDeg],
    ['Duración de admisión',p.base.intake.durationDeg,p.candidate.intake.durationDeg],
    ['Inicio de escape',p.base.exhaust.startDeg,p.candidate.exhaust.startDeg],
    ['Duración de escape',p.base.exhaust.durationDeg,p.candidate.exhaust.durationDeg],
    ['Solapamiento calculado',p.base.overlapDeg,p.candidate.overlapDeg]];
   html+=rows.map(([label,a,b])=>'<tr><th scope="row">'+escapeText(label)+'</th><td>'+a+'</td><td>'+b+'</td></tr>').join('')+'</tbody></table>';
   html+='<p><strong>Cambio de solapamiento:</strong> '+p.deltaOverlapDeg+'°; predicho '+escapeText(s.portPrediction)+', calculado '+escapeText(p.prediction)+'. Un menor solapamiento no garantiza aumento de potencia o eficiencia volumétrica real.</p>';
  }
  html+='</div><div class="panel stack"><h2>RW7 · Curva de liberación térmica ficticia</h2><p>Curva Wiebe normalizada con inicio base 100° y duración 240°; sonda matemática a 220°. Esta escala angular es independiente del calendario RW6: combinarlos no define un motor físico.</p>';
  if(!s.revealed){
   html+=choice('rp-burn','Alternativa de forma de liberación normalizada',[
    ['later','Retrasar inicio 40° (duración fija)'],['shorter','Acortar duración a 160° (inicio fijo)']],s.burnPreset);
   html+=choice('rp-burn-pred','Pronóstico: fracción liberada a 220° de eje',prior,s.burnPrediction);
   html+=choice('rp-real','¿Puede el resultado de estos modelos probar una mejora de motor Wankel real?',[
    ['','Elegí antes de revelar'],['si','Sí, directamente'],['no','No: faltan ensayos y modelos físicos']],s.realEnginePrediction);
   html+='<button class="button" data-rp="reveal" type="button">Congelar tres hipótesis y contrastar</button>';
  }else{
   const b=s.burn;
   html+='<table class="rw-table" style="width:100%"><caption>RW7: valores de curva supuesta, NO porcentaje de combustión medido</caption><thead><tr><th scope="col">Magnitud</th><th scope="col">Base</th><th scope="col">Alternativa</th></tr></thead><tbody>';
   for(const [label,key] of [['Inicio (°)','startDeg'],['Duración (°)','durationDeg'],['Fracción a 220°','fraction']]){
    html+='<tr><th scope="row">'+escapeText(label)+'</th><td>'+format(b.baseline[key])+'</td><td>'+format(b.candidate[key])+'</td></tr>';
   }
   html+='</tbody></table>'+graph(b.samples);
   html+='<p><strong>Variación de fracción normalizada:</strong> '+format(b.changeFraction)+'; predicho '+escapeText(s.burnPrediction)+', modelo '+escapeText(b.prediction)+'. Ni los gases residuales ni la presión de cámara se derivan de esta curva.</p>';
   if(!s.grade){
    html+='<label for="rp-reason">Explicá qué variable modifica cada experimento y por qué el solapamiento no prueba VE (mín. 100 caracteres)</label><textarea id="rp-reason" class="field" rows="4" maxlength="3200">'+escapeText(s.reasoning)+'</textarea>';
    html+='<label for="rp-limits">Instrumentación, incertidumbre y pruebas pendientes para inferir rendimiento real (mín. 70 caracteres)</label><textarea id="rp-limits" class="field" rows="3" maxlength="2400">'+escapeText(s.limits)+'</textarea>';
    html+='<button class="button" data-rp="grade" type="button">Evaluar investigación RW6/RW7</button>';
   }else{
    html+='<p role="status"><strong>Resultado:</strong> '+s.grade.score+'/100 · '+(s.grade.passed?'Criterios matemáticos alcanzados.':'Faltan hipótesis o documentación suficiente.')+'</p>'+
     '<p class="muted">'+escapeText(s.grade.warning)+'</p>'+
     '<button class="button" data-rp="save" type="button" '+(s.saved||s.saving?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar expediente RW6/RW7')+'</button>';
   }
  }
  html+='</div><div class="panel"><button class="button alt" data-rp="reset" type="button">Nuevo ensayo RW6/RW7</button></div><p role="status" aria-live="polite">'+escapeText(s.error)+'</p>';
  root.innerHTML=html;
 }
 root.addEventListener('input',ev=>{
  if(s.revealed&&['rp-port','rp-port-pred','rp-burn','rp-burn-pred','rp-real'].includes(ev.target.id))return;
  const map={'rp-port':'portPreset','rp-port-pred':'portPrediction','rp-burn':'burnPreset',
   'rp-burn-pred':'burnPrediction','rp-real':'realEnginePrediction','rp-reason':'reasoning','rp-limits':'limits'};
  if(map[ev.target.id])s[map[ev.target.id]]=ev.target.value;
 });
 root.addEventListener('click',async ev=>{
  const action=ev.target.closest('[data-rp]')?.dataset.rp;
  if(!action)return;s.error='';
  if(action==='reset'){Object.assign(s,{revealed:false,portPrediction:'',burnPrediction:'',realEnginePrediction:'',reasoning:'',limits:'',ports:null,burn:null,grade:null,saved:false,saving:false});render();return;}
  if(action==='reveal'){
   if(!s.portPrediction||!s.burnPrediction||!s.realEnginePrediction){s.error='Antes de calcular, formulá las tres hipótesis.';render();return;}
   try{s.ports=portStudy(s.portPreset);s.burn=heatReleaseStudy(s.burnPreset);s.revealed=true;}
   catch(error){s.error='El banco detectó una configuración fuera de rango.';}
   render();return;
  }
  if(action==='grade'){
   if(!s.revealed||!s.ports||!s.burn){s.error='Primero realizá ambos estudios.';render();return;}
   try{s.grade=evaluatePortBurn(s);}
   catch(error){s.error='Faltan hipótesis válidas para evaluar.';}
   render();return;
  }
  if(action==='save'){
   if(!s.grade||s.saving||s.saved)return;s.saving=true;
   try{await record({id:'lab-rotary-port-burn-v1',at:new Date().toISOString(),score:s.grade.score,
     passed:s.grade.passed,hypothesis:s.portPrediction+' / '+s.burnPrediction,
     conclusion:'Ventanas y curva normalizada sin inferencia OEM',
     used:['cyclic-port-window','exact-overlap','normalized-wiebe-shape','independent-clocks'],
     reasoning:s.reasoning,report:portBurnReport(s,s.grade)});s.saved=true;}
   catch(error){s.error='No hay confirmación de almacenamiento local. Volvé a intentar.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
