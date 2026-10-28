import{ROTARY_MODEL,housingPoint,rotorAt,chamberBoundary,chamberAreas,conceptualPhase,trendNext,mechanicalPowerKw,normalizedAngle}from'./rotary-geometry.js';
import{geometryResearch,RESEARCH_BENCH_VERSION}from'./rotary-research.js';
import{independentGeometryAudit}from'./rotary-geometry-analytic.js';
const colors=['#30a4c5','#e6a354','#b9a0e7'],letters=['A','B','C'];
const path=(points,closed=false)=>points.map((p,i)=>(i?'L':'M')+p.x.toFixed(3)+' '+(-p.y).toFixed(3)).join(' ')+(closed?' Z':'');
const escapeText=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function rotaryShell(){return '<section class="stack"><div class="eyebrow">AUTOMOTIVE ENGINEERING · RW0/RW1</div><h1>Rotary Geometry Explorer</h1><p>Investigá el movimiento de un Wankel y contrastá predicciones antes de revelar resultados.</p><div id="rotary-explorer"></div></section>';}
function svg(deg,chamber){
 const housing=Array.from({length:241},(_,i)=>housingPoint(2*Math.PI*i/240)),rotor=rotorAt(deg);
 const faces=letters.map((name,i)=>'<path d="'+path(chamberBoundary(deg,i),true)+'" fill="'+colors[i]+'" fill-opacity="'+(i===chamber?'.43':'.17')+'" stroke="'+colors[i]+'" stroke-width="1.5"/>').join('');
 const tips=rotor.apexes.map(p=>p.x.toFixed(2)+','+(-p.y).toFixed(2)).join(' ');
 return '<svg style="width:100%;max-height:420px;background:#0c2133;border-radius:12px" viewBox="-125 -115 250 230" role="img" aria-label="Carcasa epitrocoidal, rotor triangular simplificado, eje excéntrico y tres cámaras">'
 +faces+'<polygon fill="#243d52" fill-opacity=".85" stroke="#ffffff" stroke-width="2" points="'+tips+'"/>'
 +'<path d="'+path(housing,true)+'" fill="none" stroke="#f8fafc" stroke-width="2.7"/>'
 +'<path d="M0 0L'+rotor.center.x.toFixed(2)+' '+(-rotor.center.y).toFixed(2)+'" stroke="white" stroke-dasharray="3 3"/><circle r="3" fill="white"/>'
 +'<circle cx="'+rotor.center.x.toFixed(2)+'" cy="'+(-rotor.center.y).toFixed(2)+'" r="5" fill="#f8b84e"/>'
 +'<text x="-116" y="-99" font-size="9" fill="white">R=90 mm · e=14 mm · sintético</text></svg>';
}
const profile=Array.from({length:73},(_,i)=>({angle:i*15,volume:chamberAreas(i*15)[0].volumeProxyCm3}));
const minVolume=Math.min(...profile.map(x=>x.volume)),maxVolume=Math.max(...profile.map(x=>x.volume));
function graph(deg){
 const xy=(angle,volume)=>[30+325*angle/1080,101-76*(volume-minVolume)/(maxVolume-minVolume)];
 const points=profile.map(p=>xy(p.angle,p.volume).map(x=>x.toFixed(1)).join(',')).join(' ');
 const [x,y]=xy(deg,chamberAreas(deg)[0].volumeProxyCm3);
 return '<svg style="width:100%;max-width:650px" viewBox="0 0 380 135" role="img" aria-label="Gráfico de volumen geométrico proxy de cámara A en un ciclo de 1080 grados"><path d="M30 15V102H355" fill="none" stroke="currentColor"/><polyline points="'+points+'" fill="none" stroke="#30a4c5" stroke-width="2.8"/><circle cx="'+x+'" cy="'+y+'" r="4" fill="#e6a354"/><g fill="currentColor" font-size="10"><text x="30" y="120">0°</text><text x="162" y="120">540°</text><text x="326" y="120">1080°</text><text x="38" y="14">V proxy (cm³)</text></g></svg>';
}
function report(snapshot){
 const v=chamberAreas(snapshot.deg)[snapshot.chamber];
 return ['# AutoLab RW1 — Registro de investigación geométrica','',
 'Modelo: '+ROTARY_MODEL.id+' v'+ROTARY_MODEL.version,
 'Procedencia: derived_from_geometry, modelo sintético, no medición.',
 'R=90 mm; e=14 mm; ancho virtual=50 mm; lados rectos; 96 segmentos.',
 'Baseline: cámara '+letters[snapshot.chamber]+'; eje '+snapshot.deg.toFixed(1)+'°; área '+v.areaMm2.toFixed(2)+' mm².',
 'Hipótesis antes de revelar: área '+snapshot.predicted+' en +30° de eje.',
 'Resultado calculado: '+snapshot.actual+'.',
 'Interpretación del estudiante, sin evaluación semántica: '+snapshot.reason,
 'Contraste independiente integral exacta vs polígono: '+JSON.stringify(independentGeometryAudit(snapshot.deg).rows.map(r=>({chamber:r.chamber,exactMm2:r.exactMm2,polygonMm2:r.polygonMm2,refinedPolygonMm2:r.refinedPolygonMm2}))),
 'Incertidumbre: discretización poligonal, rotor sin curvatura real y sin holguras.',
 'Restricciones: fases de funcionamiento esquemáticas; sin puertos, combustión, presión, eficiencia u OEM.'].join('\n');
}
export function mountRotaryLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW1 requiere guardar evidencias');
 const s={deg:0,speed:90,chamber:0,predicted:'',reason:'',result:null,recorded:false,saving:false,research:null,researchRecorded:false,playing:false,last:null};
 root.innerHTML='<style>.rw-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,350px);gap:16px}.rw-table{width:100%;border-collapse:collapse}.rw-table th,.rw-table td{padding:7px;border-bottom:1px solid #8496a344;text-align:left}.rw-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px}.rw-row input[type=range]{min-width:150px;flex:1}@media(max-width:780px){.rw-grid{grid-template-columns:1fr}}</style>'
 +'<div class="panel stack"><h2>RW1 · Geometría y movimiento</h2><p role="note"><strong>Modelo didáctico, no CAD validado.</strong> Epitrocoide y giro 3:1; rotor de lados rectos sin holguras. Las áreas se integran en 2D; volumen proxy = área × ancho ficticio de 50 mm. No son cilindradas, presiones ni mediciones reales. Las fases son conceptuales, no tiempos de puertos o de encendido.</p>'
 +'<div class="rw-row"><label for="rw-angle">Ángulo de eje</label><input type="range" id="rw-angle" min="0" max="1080" step="1" value="0"/><output for="rw-angle" id="rw-deg">0°</output></div>'
 +'<div class="rw-row"><button class="button" type="button" id="rw-play" data-rw="play" aria-pressed="false">Reproducir</button><button class="button alt" type="button" data-rw="step">Paso +15°</button><label for="rw-speed">Velocidad</label><select id="rw-speed" class="field"><option value="30">30°/s</option><option value="90" selected>90°/s</option><option value="180">180°/s</option></select></div>'
 +'<div class="rw-grid"><div id="rw-diagram"></div><div><h3>Cámaras</h3><div id="rw-measures"></div><p class="muted">En 1080° de eje el rotor gira 360°. Los nombres de etapas no predicen apertura de puertos o eventos de combustión.</p></div></div><h3>Variación geométrica de la cámara A</h3><div id="rw-chart"></div></div>'
 +'<div class="panel stack"><h2>Pronosticá antes de revelar</h2><p>Para los siguientes 30° de eje, ¿qué ocurre con el área de la cámara elegida? Escribí tu hipótesis y una justificación de al menos 60 caracteres antes de contrastar.</p>'
 +'<div class="rw-row"><label for="rw-chamber">Cámara</label><select id="rw-chamber" class="field"><option value="0">A</option><option value="1">B</option><option value="2">C</option></select>'
 +'<label for="rw-predicted">Predicción</label><select id="rw-predicted" class="field"><option value="">Elegí…</option><option value="aumenta">Aumenta</option><option value="disminuye">Disminuye</option><option value="igual">Se mantiene</option></select></div>'
 +'<label for="rw-reason">Justificación, evidencia que buscarías y límites del modelo</label><textarea class="field" id="rw-reason" rows="4" maxlength="1500"></textarea>'
 +'<div class="rw-row"><button class="button" type="button" data-rw="predict">Congelar pronóstico y revelar</button><button class="button alt" type="button" data-rw="reset">Nuevo experimento</button></div><div id="rw-feedback" aria-live="polite"></div></div>'
 +'<div class="panel stack"><h2>RW1+ · Validación matemática independiente</h2><p>La geometría de tres cámaras puede resolverse mediante una integral exacta de Green sin discretizar la curva. Contrastá el cálculo analítico con el polígono N=96 y N=192. Solo valida la matemática del mismo modelo ficticio; no valida geometría CAD ni un Wankel real.</p><div id="rw-analytic-audit" aria-live="polite"></div></div>'
 +'<div class="panel stack"><h2>Rotary Research Bench · Sensibilidad geométrica A/B</h2><p><strong>Variable independiente:</strong> excentricidad e (mm). Baseline e=14 mm, R=90 mm, ancho proxy=50 mm y muestreo idénticos. <strong>Variable dependiente:</strong> oscilación máximo-mínimo del volumen proxy de la cámara A por 1080° de eje. No representa rendimiento, consumo, sellado ni compresión real.</p><div class="rw-row"><label for="rw-research-e">Alternativa (e en mm)</label><select id="rw-research-e" class="field"><option value="10">10 mm</option><option value="18">18 mm</option></select><label for="rw-research-pred">Predicción vs. baseline</label><select id="rw-research-pred" class="field"><option value="">Elegí…</option><option value="aumenta">Mayor oscilación</option><option value="disminuye">Menor oscilación</option><option value="igual">Sin cambio</option></select></div><label for="rw-research-reason">Hipótesis, variables controladas e incertidumbre (mín. 60 caracteres)</label><textarea class="field" id="rw-research-reason" rows="3" maxlength="1500"></textarea><div class="rw-row"><button type="button" class="button" data-rw="bench-evaluate">Contrastar experimento A/B</button></div><div id="rw-research-feedback" aria-live="polite"></div></div>'
 +'<div class="panel stack"><h2>RW0 · Comparación de arquitecturas mecánicas</h2><p>La arquitectura no determina por sí sola el ciclo termodinámico. Un motor Wankel de encendido provocado y un motor alternativo de cuatro tiempos realizan admisión, compresión, combustión/expansión y escape.</p><table class="rw-table"><caption>Comparación cinemática ideal, no de prestaciones</caption><thead><tr><th>Criterio</th><th>Wankel</th><th>Alternativo 4T</th></tr></thead><tbody><tr><th scope="row">Movimiento</th><td>Rotor de tres caras en carcasa epitrocoidal</td><td>Pistón reciprocante, biela y cigüeñal</td></tr><tr><th scope="row">Ciclo por cámara</th><td>1080° del eje excéntrico</td><td>720° del cigüeñal</td></tr><tr><th scope="row">Proceso ideal por fase</th><td>270° del eje</td><td>180° del cigüeñal</td></tr><tr><th scope="row">Comparación de eficiencia</th><td colspan="2">No se puede inferir de esta geometría. Requiere carga, potencia efectiva, consumo específico, emisiones y condiciones equivalentes.</td></tr></tbody></table></div>'
 +'<div class="panel stack"><h2>RW0 · Fundamentos: potencia y torque</h2><p>Un eje entrega <strong>160 N·m a 3000 rpm</strong>. Calculá potencia mecánica en kW mediante P = T × (2π × rpm / 60). No es una especificación de un Wankel.</p><div class="rw-row"><label for="rw-power">Potencia (kW)</label><input class="field" id="rw-power" inputmode="decimal" placeholder="Valor calculado"/><button class="button alt" type="button" data-rw="power">Contrastar</button></div><p id="rw-power-feedback" role="status"></p></div>';
 const $=id=>root.querySelector('#'+id);
 function draw(){
  $('rw-deg').textContent=s.deg.toFixed(0)+'° eje · '+(s.deg/3).toFixed(0)+'° rotor';
  $('rw-diagram').innerHTML=svg(s.deg,s.chamber);
  $('rw-measures').innerHTML='<table class="rw-table"><caption>Áreas del modelo</caption><thead><tr><th>Cámara</th><th>mm²</th><th>Etapa</th></tr></thead><tbody>'+chamberAreas(s.deg).map((a,i)=>'<tr><th scope="row" style="color:'+colors[i]+'">'+letters[i]+'</th><td>'+a.areaMm2.toFixed(0)+'</td><td>'+conceptualPhase(s.deg,i)+'</td></tr>').join('')+'</tbody></table>';
  $('rw-chart').innerHTML=graph(s.deg);
  const audit=independentGeometryAudit(s.deg);
  $('rw-analytic-audit').innerHTML='<table class="rw-table"><caption>Área por cámara: integral exacta vs discretización (mm²)</caption><thead><tr><th scope="col">Cámara</th><th scope="col">Exacta</th><th scope="col">N=96</th><th scope="col">N=192</th></tr></thead><tbody>'+audit.rows.map((a,i)=>'<tr><th scope="row">'+letters[i]+'</th><td>'+a.exactMm2.toFixed(2)+'</td><td>'+a.polygonMm2.toFixed(2)+'</td><td>'+a.refinedPolygonMm2.toFixed(2)+'</td></tr>').join('')+'</tbody></table><p>Error relativo máximo del polígono: '+audit.maxRelativeErrorPct.toFixed(4)+' % (N=96) y '+audit.maxRefinedRelativeErrorPct.toFixed(4)+' % (N=192). Cierre exacto de tres cámaras: '+audit.areaClosureErrorMm2.toExponential(2)+' mm². No son incertidumbres físicas.</p>';
 }
 function stop(){s.playing=false;s.last=null;$('rw-play').textContent='Reproducir';$('rw-play').setAttribute('aria-pressed','false');}
 let frameId;
 function tick(t){
  if(!s.playing||!root.isConnected){stop();return;}
  if(s.last!==null)s.deg=normalizedAngle(s.deg+Math.min((t-s.last)/1000,.2)*s.speed);
  s.last=t;$('rw-angle').value=String(s.deg);draw();frameId=requestAnimationFrame(tick);
 }
 function feedback(){
  const v=s.result;
  $('rw-feedback').innerHTML=v?'<p><strong>Predicción congelada:</strong> cámara '+letters[v.chamber]+', '+escapeText(v.predicted)+' desde '+v.deg.toFixed(0)+'°.</p><p><strong>Resultado geométrico:</strong> '+escapeText(v.actual)+'. '+(v.actual===v.predicted?'Coincide con el pronóstico.':'No coincide con el pronóstico.')+'</p><p>¿Qué otra evidencia demostraría que un cambio geométrico se traduce en el comportamiento real de un motor?</p><button type="button" class="button" data-rw="record" '+(s.recorded?'disabled':'')+'>'+(s.recorded?'Evidencia registrada':'Guardar evidencia en portafolio')+'</button>':'';
 }
 root.addEventListener('input',e=>{
  if(e.target.id==='rw-angle'){stop();cancelAnimationFrame(frameId);s.deg=Number(e.target.value);draw();}
  if(e.target.id==='rw-speed')s.speed=Number(e.target.value);
  if(e.target.id==='rw-chamber'){s.chamber=Number(e.target.value);draw();}
  if(e.target.id==='rw-predicted')s.predicted=e.target.value;
  if(e.target.id==='rw-reason')s.reason=e.target.value;
 });
 root.addEventListener('click',async e=>{
  const op=e.target.closest('[data-rw]')?.dataset.rw;if(!op)return;
  if(op==='play'){if(s.playing){stop();cancelAnimationFrame(frameId);}else{s.playing=true;$('rw-play').textContent='Pausar';$('rw-play').setAttribute('aria-pressed','true');frameId=requestAnimationFrame(tick);}return;}
  if(op==='step'){stop();cancelAnimationFrame(frameId);s.deg=normalizedAngle(s.deg+15);$('rw-angle').value=String(s.deg);draw();return;}
  if(op==='reset'){s.result=null;s.recorded=false;s.predicted='';s.reason='';$('rw-predicted').value='';$('rw-reason').value='';feedback();return;}
  if(op==='predict'){if(!s.predicted||s.reason.trim().length<60){$('rw-feedback').textContent='Elegí una predicción y escribí una justificación de al menos 60 caracteres.';return;}stop();cancelAnimationFrame(frameId);s.result={deg:s.deg,chamber:s.chamber,predicted:s.predicted,actual:trendNext(s.deg,s.chamber),reason:s.reason.trim()};s.recorded=false;feedback();return;}
  if(op==='record'){if(!s.result||s.recorded||s.saving)return;s.saving=true;const v=s.result;try{await record({id:'lab-rotary-geometry-v1',score:v.predicted===v.actual?100:0,at:new Date().toISOString(),hypothesis:v.predicted,conclusion:v.actual,used:['geometry-'+letters[v.chamber].toLowerCase()],reasoning:v.reason,passed:v.predicted===v.actual,report:report(v)});s.recorded=true;if(root.isConnected)feedback();}catch(error){if(root.isConnected)$('rw-feedback').insertAdjacentHTML('beforeend','<p role="alert">El guardado no se confirmó. Revisá el almacenamiento y reintentá.</p>');}finally{s.saving=false;}return;}
  if(op==='bench-evaluate'){
   const reason=$('rw-research-reason').value.trim(),predicted=$('rw-research-pred').value;
   if(!predicted||reason.length<60){$('rw-research-feedback').textContent='Primero escribí hipótesis e incertidumbre (60 caracteres) y seleccioná la predicción.';return;}
   const experiment=geometryResearch(Number($('rw-research-e').value));s.research={experiment,predicted,reason};s.researchRecorded=false;
   $('rw-research-feedback').innerHTML='<p>Baseline e=14 mm: '+experiment.baseline.swingCm3.toFixed(2)+' cm³ proxy. Alternativa e='+experiment.candidate.eMm+' mm: '+experiment.candidate.swingCm3.toFixed(2)+' cm³ proxy.</p><p><strong>Variación:</strong> '+experiment.changePct.toFixed(2)+'%. Predijiste '+escapeText(predicted)+'; el modelo indica '+escapeText(experiment.direction)+'. Convergencia numérica entre 48 y 192 segmentos: '+experiment.numericalConvergencePct.toFixed(3)+'%. Diferencia en oscilación del volumen proxy respecto de integral exacta independiente: '+experiment.relativeSwingErrorPct.toFixed(4)+'%. Cierre de área exacta: '+experiment.geometryAudit.areaClosureErrorMm2.toExponential(2)+' mm² (NO incertidumbre física).</p><button class="button" data-rw="bench-record" type="button">Guardar comparación en portafolio</button>';return;
  }
  if(op==='bench-record'){
   if(!s.research||s.researchRecorded||s.saving)return;s.saving=true;
   const {experiment:x,predicted,reason}=s.research;
   const reportText=['# Rotary Research Bench P1b','Modelo: '+RESEARCH_BENCH_VERSION,'Origen: '+x.origin,'Baseline: R=90 mm, e=14 mm, b=50 mm, 96 segmentos, paso de 15 grados','Variable independiente: e='+x.candidate.eMm+' mm','Variable dependiente: oscilación geométrica en cm3 proxy','Baseline: '+x.baseline.swingCm3.toFixed(4)+' cm3; alternativa: '+x.candidate.swingCm3.toFixed(4)+' cm3','Cambio: '+x.changePct.toFixed(4)+'%','Predicción previa: '+predicted,'Resultado de modelo: '+x.direction,'Convergencia numérica aproximada: '+x.numericalConvergencePct.toFixed(4)+'% entre 48 y 192 segmentos','RW1+ auditoría integral exacta: '+JSON.stringify(x.geometryAudit),'Comparación de oscilación contra solución analítica: '+x.relativeSwingErrorPct.toFixed(4)+'%','Hipótesis del estudiante sin evaluación semántica: '+reason,'Limitaciones: '+x.limitations].join('\n');
   try{await record({id:'lab-rotary-sensitivity-v1',at:new Date().toISOString(),score:predicted===x.direction?100:0,passed:predicted===x.direction,hypothesis:predicted,conclusion:x.direction,used:['geometry-sensitivity'],reasoning:reason,report:reportText});s.researchRecorded=true;if(root.isConnected)$('rw-research-feedback').insertAdjacentHTML('beforeend','<p role="status">Comparación guardada.</p>');}
   catch(error){if(root.isConnected)$('rw-research-feedback').insertAdjacentHTML('beforeend','<p role="alert">No se pudo guardar la comparación. Reintentá.</p>');}finally{s.saving=false;}return;
  }
  if(op==='power'){const value=$('rw-power').value.trim().replace(',','.');const num=Number(value),correct=mechanicalPowerKw(160,3000);$('rw-power-feedback').textContent=!value||!Number.isFinite(num)||num<0?'Ingresá un valor numérico de potencia válido.':(Math.abs(num-correct)<=.5?'Correcto. ':'Revisá unidades y fórmula. ')+'Referencia matemática: '+correct.toFixed(2)+' kW.';}
 });
 const visibility=()=>{if(document.hidden){stop();cancelAnimationFrame(frameId);}};
 document.addEventListener('visibilitychange',visibility);
 const watcher=new MutationObserver(()=>{if(!root.isConnected){stop();cancelAnimationFrame(frameId);document.removeEventListener('visibilitychange',visibility);watcher.disconnect();}});
 watcher.observe(root.ownerDocument.documentElement,{subtree:true,childList:true});
 draw();
}
