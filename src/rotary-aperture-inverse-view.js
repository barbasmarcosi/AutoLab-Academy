import{inverseApertureStudy,gradeInverseAperture,inverseApertureReport,APERTURE_INVERSE_REFERENCE}from'./rotary-aperture-inverse.js';
import{radiusAmbiguityStudy,radiusAmbiguityReport}from'./rotary-aperture-radius.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const select=(id,label,choices,current)=>'<label for="'+id+'">'+esc(label)+'</label><select class="field" id="'+id+'">'+
 choices.map(([v,text])=>'<option value="'+v+'" '+(String(v)===String(current)?'selected':'')+'>'+esc(text)+'</option>').join('')+'</select>';
const fmt=v=>Number(v).toFixed(6);
export function apertureInverseShell(){
 return '<section class="stack"><div class="eyebrow">ROTARY ENGINEERING · RW6++</div><h1>Inverse Port Metrology Lab</h1><p>Inferí la posición adimensional de una máscara sintética a partir de una observación de área con sesgo y tolerancia supuesta.</p><div id="rotary-aperture-inverse-explorer"></div></section>';
}
export function mountApertureInverse(root,{record}){
 if(!root||typeof record!=='function')throw Error('RW6++ requiere almacenamiento confirmado');
 const s={radiusMm:20,trueOpeningFraction:.25,biasFraction:.04,toleranceFraction:.02,radiusBandFraction:.05,
  predictedCoverage:'',predictedSensitivity:'',predictedPhysical:'',predictedRadiusEffect:'',reasoning:'',limits:'',
  data:null,assessment:null,saved:false,saving:false,error:''};
 function render(){
  let html='<div class="panel stack"><h2>Contrato de inferencia</h2><p role="note"><strong>Modelo 2D inventado.</strong> El puerto es un círculo ideal parcialmente descubierto por una máscara recta. El supuesto instrumento informa un área con sesgo artificial y una tolerancia determinista absoluta. Una bisección invierte el área de segmento circular para encontrar u. Los límites no son datos metrológicos, ni una incertidumbre estadística o un intervalo de confianza, ni un ángulo real de rotor.</p>'+
  '<p>La abertura circular es <code>A(u)=R²·acos(1−2u)−R²·(1−2u)·sqrt(1−(1−2u)²)</code>. El mismo margen de área puede generar intervalos distintos de u según la sensibilidad geométrica.</p>'+
  '<p>Marco conceptual: <a href="'+APERTURE_INVERSE_REFERENCE+'" target="_blank" rel="noopener noreferrer">BIPM/JCGM — Guías de metrología</a>. La tolerancia del ejercicio no es un presupuesto de incertidumbre GUM y no viene del BIPM.</p></div>';
  html+='<div class="panel stack"><h2>Identificación RW6++ · Predicción y contraste</h2>';
  if(!s.data){
   html+=select('ai-radius','Radio geométrico ficticio',[[10,'10 mm'],[20,'20 mm'],[30,'30 mm']],s.radiusMm);
   html+=select('ai-radius-band','Margen geométrico supuesto de radio',[[0,'±0 % (radio conocido)'],[.05,'±5 %'],[.15,'±15 %']],s.radiusBandFraction);
   html+=select('ai-u','Apertura verdadera simulada u',[[.05,'0,05 — cerca del borde'],[.25,'0,25'],[.5,'0,50 — mitad'],[.75,'0,75'],[.95,'0,95 — cerca del final']],s.trueOpeningFraction);
   html+=select('ai-bias','Sesgo asumido en el instrumento (fracción de área total)',
    [[-.04,'−0,04'],[-.01,'−0,01'],[0,'0'],[.01,'+0,01'],[.04,'+0,04']],s.biasFraction);
   html+=select('ai-tolerance','Tolerancia supuesta del instrumento (fracción de área total)',
    [[.01,'±0,01'],[.02,'±0,02'],[.05,'±0,05']],s.toleranceFraction);
   html+='<p>El sesgo conocido es <em>ficticio</em>: te permite anticipar si una tolerancia elegida cubre el dato verdadero. Un instrumento real necesitaría calibración y evidencia de sus límites.</p>';
   html+=select('ai-cover','¿El intervalo estimado de u incluirá la apertura real simulada?',
    [['','Elegí…'],['si','Sí'],['no','No']],s.predictedCoverage);
   html+=select('ai-sense','A igual tolerancia de área, ¿dónde será más ancho el intervalo de u?',
    [['','Elegí…'],['borde','Cerca del borde u=0,05'],['centro','Cerca de la mitad u=0,50'],['igual','Igual en ambos']],s.predictedSensitivity);
   html+=select('ai-physical','¿Permite este resultado inferir grados de eje, caudal o pérdida física Wankel?',
    [['','Elegí…'],['si','Sí, directamente'],['no','No, falta modelo/medición física']],s.predictedPhysical);
   html+=select('ai-radius-predict','¿Ampliar la banda de radios admisibles puede reducir el conjunto de aperturas compatibles?',[['','Elegí…'],['si','Sí, puede descartar soluciones'],['no','No, no puede descartar soluciones previas']],s.predictedRadiusEffect);
   html+='<button type="button" class="button" data-ai="reveal">Congelar predicciones y recuperar apertura</button>';
  }else{
   const a=s.data,radius=radiusAmbiguityStudy(s),b=radius.boundedRadius;
   html+='<p>Predicciones congeladas: cobertura '+esc(s.predictedCoverage)+', sensibilidad '+esc(s.predictedSensitivity)+', extrapolación física '+esc(s.predictedPhysical)+', banda radial '+esc(s.predictedRadiusEffect)+'.</p>';
   html+='<table class="rw-table" style="width:100%"><caption>Inversión de área inventada: tolerancia absoluta determinista</caption><thead><tr><th scope="col">Magnitud</th><th scope="col">Resultado</th></tr></thead><tbody>'+
    [['Área total circular (mm²)',fmt(a.fullAreaMm2)],
     ['Área verdadera ficticia (mm²)',fmt(a.trueAreaMm2)],
     ['Área observada con sesgo (mm²)',fmt(a.observedAreaMm2)],
     ['Tolerancia artificial ± (mm²)',fmt(a.toleranceMm2)],
     ['u real sintético',fmt(a.trueOpeningFraction)],
     ['u inferido nominal',fmt(a.inferredFraction)],
     ['u inferior',fmt(a.lowerOpeningFraction)],
     ['u superior',fmt(a.upperOpeningFraction)],
     ['Ancho del intervalo u',fmt(a.openingIntervalWidth)]]
     .map(([label,value])=>'<tr><th scope="row">'+esc(label)+'</th><td>'+esc(value)+'</td></tr>').join('')+'</tbody></table>';
   html+='<p><strong>¿Intervalo contiene verdad sintética?</strong> '+(a.coverage?'Sí':'No')+'. Una lectura sesgada puede quedar fuera incluso usando una fórmula geométrica exacta.</p>';
   html+='<table class="rw-table" style="width:100%"><caption>Sensibilidad: idéntica tolerancia de área, distinto intervalo de posición</caption><thead><tr><th scope="col">Ubicación simulada</th><th scope="col">Ancho de intervalo u</th></tr></thead><tbody>'+
    '<tr><th scope="row">Borde (u=0,05)</th><td>'+fmt(a.nearEdgeIntervalWidth)+'</td></tr>'+
    '<tr><th scope="row">Centro (u=0,50)</th><td>'+fmt(a.centerIntervalWidth)+'</td></tr></tbody></table>'+
    '<p>La sensibilidad local normalizada dF/du='+fmt(a.openingSensitivity)+'. Cerca de los extremos, una diferencia muy pequeña de área puede corresponder a un desplazamiento mayor de u. No es un ensayo de un sello de motor real.</p>';
   html+='<h3>RW6+++ · Radio incierto e identificabilidad</h3><p>Una sola área no identifica a la vez radio y apertura. Las dos cotas siguientes son <strong>supuestos deterministas</strong>, no mediciones ni incertidumbres GUM. No se infiere posición de rotor real.</p>'+
    '<table class="rw-table" style="width:100%"><caption>Conjunto factible: comparación radio conocido frente a radio dentro de una banda</caption><thead><tr><th scope="col">Hipótesis geométrica</th><th scope="col">u mínimo</th><th scope="col">u máximo</th></tr></thead><tbody>'+
    [['Radio nominal conocido',radius.fixed],['Radio acotado ±'+(100*s.radiusBandFraction)+' %',b],['Banda mayor (prueba de sensibilidad)',radius.widened]]
     .map(([label,x])=>'<tr><th scope="row">'+esc(label)+'</th><td>'+fmt(x.lowerOpeningFraction)+'</td><td>'+fmt(x.upperOpeningFraction)+'</td></tr>').join('')+
    '</tbody></table><p><strong>Prueba adversarial:</strong> área mínima superior a la de cualquier círculo permitido → '+(radius.contradict.failClosed?'inconsistencia detectada; sin solución (fail-closed).':'error: inconsistencia no detectada')+'</p>';
   if(!s.assessment){
    html+='<label for="ai-reason">Justificá matemáticamente el efecto del sesgo y la diferencia entre borde/centro (mínimo 100 caracteres)</label><textarea id="ai-reason" class="field" rows="4" maxlength="3500">'+esc(s.reasoning)+'</textarea>';
    html+='<label for="ai-limits">Definí qué instrumentación/calibración y geometría faltan antes de trasladarlo a un Wankel (mínimo 75 caracteres)</label><textarea id="ai-limits" class="field" rows="4" maxlength="2500">'+esc(s.limits)+'</textarea>';
    html+='<button type="button" class="button" data-ai="grade">Evaluar inferencia inversa</button>';
   }else{
    html+='<p role="status"><strong>Resultado:</strong> '+s.assessment.score+'/100 · '+(s.assessment.passed?'Criterios de prueba satisfechos.':'Predicciones o documentación incompletas.')+'</p><p>'+esc(s.assessment.warning)+'</p>';
    html+='<button type="button" class="button" data-ai="save" '+(s.saved||s.saving?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar expediente RW6++')+'</button>';
   }
  }
  html+='</div><div class="panel"><button type="button" class="button alt" data-ai="reset">Nuevo experimento inverso</button></div><p role="status" aria-live="polite">'+esc(s.error)+'</p>';
  root.innerHTML=html;
 }
 root.addEventListener('input',event=>{
  const f={'ai-radius':'radiusMm','ai-radius-band':'radiusBandFraction','ai-u':'trueOpeningFraction','ai-bias':'biasFraction','ai-tolerance':'toleranceFraction',
   'ai-cover':'predictedCoverage','ai-sense':'predictedSensitivity','ai-physical':'predictedPhysical','ai-radius-predict':'predictedRadiusEffect',
   'ai-reason':'reasoning','ai-limits':'limits'};
  const prop=f[event.target.id];if(!prop)return;
  if(s.data&& !['reasoning','limits'].includes(prop))return;
  s[prop]=['radiusMm','radiusBandFraction','trueOpeningFraction','biasFraction','toleranceFraction'].includes(prop)?Number(event.target.value):event.target.value;
 });
 root.addEventListener('click',async event=>{
  const action=event.target.closest('[data-ai]')?.dataset.ai;if(!action)return;s.error='';
  if(action==='reset'){Object.assign(s,{data:null,assessment:null,predictedCoverage:'',predictedSensitivity:'',predictedPhysical:'',predictedRadiusEffect:'',reasoning:'',limits:'',saved:false,saving:false});render();return;}
  if(action==='reveal'){
   if(!s.predictedCoverage||!s.predictedSensitivity||!s.predictedPhysical||!s.predictedRadiusEffect){s.error='Completá las cuatro predicciones antes de revelar la medición.';render();return;}
   try{s.data=inverseApertureStudy(s);}catch(error){s.error='Los parámetros del modelo no son válidos.';}
   render();return;
  }
  if(action==='grade'){
   if(!s.data){s.error='Primero recuperá el intervalo de apertura.';render();return;}
   try{s.assessment=gradeInverseAperture(s);}catch(error){s.error='Evaluación incompleta.';}
   render();return;
  }
  if(action==='save'){
   if(!s.assessment||s.saved||s.saving)return;s.saving=true;
   try{await record({id:'lab-rotary-aperture-inverse-v1',at:new Date().toISOString(),score:s.assessment.score,
    passed:s.assessment.passed,hypothesis:s.predictedCoverage,conclusion:s.data.coverage?'Intervalo incluye verdad sintética':'Intervalo excluye verdad sintética',
    used:['exact-circular-area','bounded-inverse-bisection','synthetic-gauge-bias','local-sensitivity','radius-feasible-set'],
    reasoning:s.reasoning,report:inverseApertureReport(s,s.assessment)+'\n\n'+radiusAmbiguityReport(s)});s.saved=true;}
   catch(error){s.error='El almacenamiento local no confirmó el guardado; reintentá.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
