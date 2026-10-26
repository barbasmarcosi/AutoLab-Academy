import{apertureStudy,gradeAperture,apertureReport,APERTURE_REFERENCE}from'./rotary-aperture.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const select=(id,label,options,current)=>'<label for="'+id+'">'+esc(label)+'</label><select class="field" id="'+id+'">'+
 options.map(([v,n])=>'<option value="'+v+'" '+(String(v)===String(current)?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select>';
const fmt=v=>Number(v).toFixed(4);
function profileGraph(data){
 const path=key=>data.samples.map((pt,i)=>(i?'L':'M')+(35+300*pt.fraction).toFixed(2)+' '+(117-100*pt[key]).toFixed(2)).join(' ');
 return '<svg role="img" aria-label="Gráfico de fracción de área abierta frente al avance del borde, circular y rectangular ficticios" viewBox="0 0 380 146" style="width:100%;max-width:560px">'+
 '<path d="M35 15V117H340" stroke="currentColor" fill="none"/>'+
 '<path d="'+path('circular')+'" fill="none" stroke="#36a3bb" stroke-width="2.5"/>'+
 '<path d="'+path('rectangular')+'" fill="none" stroke="#df9150" stroke-width="2.5"/>'+
 '<text x="17" y="22" font-size="10" fill="currentColor">1</text>'+
 '<text x="22" y="119" font-size="10" fill="currentColor">0</text>'+
 '<text x="35" y="134" font-size="10" fill="currentColor">u=0</text>'+
 '<text x="302" y="134" font-size="10" fill="currentColor">u=1</text></svg>'+
 '<p class="muted">Curva celeste: puerto circular; curva naranja: rectángulo de igual área máxima. Ambas son geometrías bidimensionales inventadas.</p>';
}
export function apertureShell(){
 return '<section class="stack"><div class="eyebrow">ROTARY ENGINEERING · RW6+</div><h1>Port Aperture Geometry Lab</h1><p>Compará un puerto circular y uno rectangular con la misma área máxima: el área descubierta puede ser distinta para idéntico avance de una máscara ideal.</p><div id="rotary-aperture-explorer"></div></section>';
}
export function mountApertureLab(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW6+ requiere registrador IndexedDB');
 const s={radiusMm:20,openFraction:.25,steps:512,predictedArea:'',predictedPhysical:'',reasoning:'',limits:'',
  data:null,grade:null,saving:false,saved:false,error:''};
 function render(){
  let html='<div class="panel stack"><h2>Contrato geométrico</h2><p role="note"><strong>Modelo matemático 2D.</strong> Un borde <em>recto</em> y rígido descubre progresivamente dos formas de igual área nominal: un círculo de radio R y un rectángulo de ancho 2R y altura πR/2. Su posición se describe por la coordenada de apertura u, entre 0 y 1, <strong>no</strong> por grados de giro del eje o del rotor.</p>'+
  '<p>Para el círculo: A(d)=R²·acos(d/R) − d·√(R²−d²), con d=R(1−2u). Para el rectángulo: A=πR²·u. Un integrador independiente calcula el área circular sumando bandas verticales.</p>'+
  '<p>Contexto científico de geometría de puertos: <a href="'+APERTURE_REFERENCE+'" target="_blank" rel="noopener noreferrer">investigación abierta sobre puertos Wankel</a>. Las formas y dimensiones utilizadas aquí son inventadas; no reproducen ninguna lumbrera OEM.</p></div>';
  html+='<div class="panel stack"><h2>RW6+ · Hipótesis y convergencia numérica</h2>';
  if(!s.data){
   html+=select('ra-radius','Radio del puerto circular (mm)',[[10,'10 mm'],[20,'20 mm'],[30,'30 mm']],s.radiusMm);
   html+=select('ra-u','Fracción adimensional de barrido u',[[.25,'0,25 — cuarto de recorrido'],[.5,'0,50 — mitad'],[.75,'0,75 — tres cuartos']],s.openFraction);
   html+=select('ra-steps','Bandas del integrador numérico',[[128,'128 bandas'],[512,'512 bandas'],[2048,'2048 bandas']],s.steps);
   html+=select('ra-predict','¿Qué forma tiene mayor área descubierta a este valor de u?',[
    ['','Seleccioná…'],['circular','Círculo'],['rectangular','Rectángulo'],['igual','Ambas iguales']],s.predictedArea);
   html+=select('ra-physical','¿Permite inferir el caudal de un Wankel o la eficiencia de un motor real?',[
    ['','Seleccioná…'],['si','Sí, permite calcular caudal directamente'],['no','No, falta la geometría y las condiciones físicas reales']],s.predictedPhysical);
   html+='<button class="button" type="button" data-ra="reveal">Congelar hipótesis y medir apertura</button>';
  }else{
   const a=s.data;
   html+='<p><strong>Hipótesis congeladas:</strong> mayor área '+esc(s.predictedArea)+'; aplicabilidad real '+esc(s.predictedPhysical)+'.</p>';
   html+='<table class="rw-table" style="width:100%"><caption>Geometría plana: áreas de puertos de igual superficie máxima</caption><thead><tr><th scope="col">Magnitud</th><th scope="col">Círculo</th><th scope="col">Rectángulo</th></tr></thead><tbody>';
   for(const [name,key] of [['Área total (mm²)','fullAreaMm2'],['Área abierta (mm²)','openAreaMm2'],['Fracción abierta','areaFraction'],['Área oculta (mm²)','closedAreaMm2']]){
    html+='<tr><th scope="row">'+esc(name)+'</th><td>'+fmt(a.circular[key])+'</td><td>'+fmt(a.rectangle[key])+'</td></tr>';
   }
   html+='</tbody></table>'+profileGraph(a);
   html+='<h3>Auditoría numérica independiente</h3>';
   html+='<table class="rw-table" style="width:100%"><caption>Comparación del área circular analítica e integración por punto medio</caption><thead><tr><th scope="col">Procedimiento</th><th scope="col">Área (mm²)</th><th scope="col">Error absoluto (mm²)</th></tr></thead><tbody>'+
    '<tr><th scope="row">Fórmula exacta</th><td>'+fmt(a.circular.openAreaMm2)+'</td><td>—</td></tr>'+
    '<tr><th scope="row">Integración '+a.steps+' bandas</th><td>'+fmt(a.numericalMm2)+'</td><td>'+fmt(a.absoluteErrorMm2)+'</td></tr>'+
    '<tr><th scope="row">Refinamiento '+(2*a.steps)+' bandas</th><td>'+fmt(a.refinedMm2)+'</td><td>'+fmt(a.refinedErrorMm2)+'</td></tr></tbody></table>'+
    '<p><strong>Resultado puramente geométrico:</strong> '+esc(a.prediction)+' tiene '+(a.prediction==='igual'?'la misma':'mayor')+' área abierta con u='+fmt(a.atFraction)+'. No calcula presión, velocidad o masa de gas.</p>';
   if(!s.grade){
    html+='<label for="ra-reason">Explicá por qué igual área nominal no implica igual apertura parcial y cómo verificarías el cálculo (mín. 100 caracteres)</label><textarea id="ra-reason" class="field" rows="4" maxlength="3000">'+esc(s.reasoning)+'</textarea>';
    html+='<label for="ra-limits">¿Qué elementos físicos y de medición faltan para estimar flujo Wankel real? (mín. 75 caracteres)</label><textarea id="ra-limits" class="field" rows="3" maxlength="2500">'+esc(s.limits)+'</textarea>';
    html+='<button class="button" type="button" data-ra="grade">Evaluar investigación RW6+</button>';
   }else{
    html+='<p role="status"><strong>Resultado:</strong> '+s.grade.score+'/100 · '+(s.grade.passed?'Criterios objetivos completos.':'No cumple todos los criterios.')+'</p><p class="muted">'+esc(s.grade.warning)+'</p>';
    html+='<button class="button" type="button" data-ra="save" '+(s.saved||s.saving?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar expediente RW6+')+'</button>';
   }
  }
  html+='</div><div class="panel"><button class="button alt" type="button" data-ra="reset">Nuevo ensayo RW6+</button></div><p role="status" aria-live="polite">'+esc(s.error)+'</p>';
  root.innerHTML=html;
 }
 root.addEventListener('input',e=>{
  if(s.data&&['ra-radius','ra-u','ra-steps','ra-predict','ra-physical'].includes(e.target.id))return;
  const fields={'ra-radius':'radiusMm','ra-u':'openFraction','ra-steps':'steps',
   'ra-predict':'predictedArea','ra-physical':'predictedPhysical',
   'ra-reason':'reasoning','ra-limits':'limits'};
  const key=fields[e.target.id];if(!key)return;
  s[key]=['radiusMm','openFraction','steps'].includes(key)?Number(e.target.value):e.target.value;
 });
 root.addEventListener('click',async e=>{
  const action=e.target.closest('[data-ra]')?.dataset.ra;if(!action)return;s.error='';
  if(action==='reset'){Object.assign(s,{data:null,grade:null,predictedArea:'',predictedPhysical:'',reasoning:'',limits:'',saved:false,saving:false});render();return;}
  if(action==='reveal'){
   if(!s.predictedArea||!s.predictedPhysical){s.error='Primero completá las dos predicciones.';render();return;}
   try{s.data=apertureStudy(s);}catch(error){s.error='Parámetros geométricos fuera del rango admitido.';}
   render();return;
  }
  if(action==='grade'){
   if(!s.data){s.error='Primero calculá el área.';render();return;}
   try{s.grade=gradeAperture(s);}catch(error){s.error='Datos inválidos para la evaluación.';}
   render();return;
  }
  if(action==='save'){
   if(!s.grade||s.saved||s.saving)return;s.saving=true;
   try{await record({id:'lab-rotary-aperture-v1',at:new Date().toISOString(),score:s.grade.score,passed:s.grade.passed,
    hypothesis:s.predictedArea,conclusion:'Área parcial de puerto 2D, sin inferencia de flujo',
    used:['circular-segment-integral','equal-area-rectangle','midpoint-convergence','no-physical-flux'],
    reasoning:s.reasoning,report:apertureReport(s,s.grade)});s.saved=true;}
   catch(error){s.error='La persistencia IndexedDB no confirmó el guardado; reintentá.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
