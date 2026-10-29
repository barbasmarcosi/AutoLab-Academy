import {evaluateAAWithoutService,syntheticAAReceiptPair} from './mechanical-age-raw-obd.js';
import {assessObdMultiSessionRepeatability,syntheticR12ReceiptSeries} from './mechanical-age-r12-quality.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>typeof x==='number'?x.toFixed(3):'No determinada';
export function rawAAShell(){
 return '<section class="panel stack"><h2>A–A: repetibilidad sin intervención</h2>'
  +'<p>Este ensayo conserva los tiempos de <strong>recepción</strong> por PID, no los instantes reales de adquisición en la ECU. Compara sesiones, no filas ni desgaste.</p>'
  +'<div id="ma-aa-explorer"></div></section>';
}
export function mountRawAA(root){
 if(!root)throw Error('Falta contenedor de A–A');
 const reference=JSON.stringify(syntheticAAReceiptPair(),null,2);
 const r12Reference=JSON.stringify(syntheticR12ReceiptSeries(),null,2);
 const state={raw:'',report:null,r12Report:null,error:''};
 function output(r){
  const heads=r.comparable?'<p><strong>Ventanas documentalmente compatibles</strong> (no verificación metrológica)</p>':'<p><strong>Comparación bloqueada</strong>: '+esc(r.blockers.join('; '))+'</p>';
  const rows=r.observedChanges?Object.entries(r.observedChanges).map(([pid,c])=>'<tr><td>'+esc(pid)+'</td><td>'+esc(c.unit)+'</td><td>'+num(c.firstMedian)+'</td><td>'+num(c.lastMedian)+'</td><td>'+num(c.lastMinusFirst)+'</td></tr>').join(''):'';
  const serial=r.sessionAudits.filter(a=>a.traceIntegrity?.applies);
  const provenance=serial.length?'<p>Expedientes seriales: '+serial.length+'; integridad interna del registro: '+(serial.every(a=>a.traceIntegrity.internallyConsistent)?'consistente':'rechazada')+'. <strong>Autenticidad del sensor y calibración: no verificadas.</strong></p>':'';
  return '<section class="stack"><h3>Evaluación A–A</h3>'+heads+provenance
   +'<p>Sesiones independientes declaradas: '+r.sessionCount+'. Unidad de análisis: <strong>sesión</strong>, no respuesta individual. Evidencia física o sincronización ECU: <strong>no verificada</strong>.</p>'
   +(rows?'<table><thead><tr><th>PID</th><th>Unidad</th><th>Mediana A1</th><th>Mediana A2</th><th>Δ</th></tr></thead><tbody>'+rows+'</tbody></table>':'')
   +'<p><strong>Edad mecánica, score de salud, desgaste y causalidad:</strong> no determinados.</p>'
   +'<p class="muted">'+esc(r.caveat)+'</p></section>';
 }
 function outputR12(report){
  const ok=report.status==='descriptive_only';
  const provenance=report.evidenceGrade==='synthetic_demonstration'
   ?'Secuencias 100 % sintéticas; no son ensayos físicos.'
   :'Metadatos y tramas aportados por operador; el origen físico y la calibración no están autenticados.';
  const rows=report.pidReports?Object.entries(report.pidReports).map(([pid,p])=>(
   '<tr><td>'+esc(pid)+'</td><td>'+esc(p.unit)+'</td>'
   +'<td>'+num(p.referenceMedian)+'</td><td>'+num(p.descriptiveBandHalfWidth)+'</td>'
   +'<td>'+esc(p.subsequentSessionMedians.map(num).join(' / '))+'</td>'
   +'<td>'+(p.anyOutsideObservedReferenceBand?'Fuera de la banda descriptiva':'Dentro de la banda descriptiva')+'</td></tr>'
  )).join(''):'';
  return '<section class="stack"><h3>R12 — Repetibilidad entre sesiones</h3>'
   +'<p><strong>'+(ok?'Comparación descriptiva habilitada':'Abstención obligatoria')+'</strong></p>'
   +(ok?'<p>4 sesiones de referencia + '+report.holdoutSessionCount+' posteriores; cada sesión representa una unidad, no cada respuesta PID.</p>'
    :'<p>Motivos: '+esc(report.blockers.join('; '))+'</p>')
   +'<p>'+esc(provenance)+' Independencia física de sesiones y precisión metrológica: <strong>no verificadas</strong>.</p>'
   +(rows?'<table><thead><tr><th>PID</th><th>Unidad</th><th>Mediana referencia</th><th>± banda observada</th><th>Medianas posteriores</th><th>Estado</th></tr></thead><tbody>'+rows+'</tbody></table>':'')
   +(ok?'<p>Canales fuera de su banda empírica: '+esc(report.summary.channelsWithObservedShift.join(', ')||'ninguno')
     +'. Esto no es un diagnóstico de avería.</p>':'')
   +'<p><strong>Desgaste, edad mecánica, vida útil y salud porcentual: no estimables.</strong></p>'
   +'<p class="muted">'+esc(report.caveat)+'</p></section>';
 }
 function render(){
  root.innerHTML='<p>Podés cargar un array JSON con 2–12 sesiones registradas por PID. R12 exige al menos 6 sesiones (4 de referencia + 2 de comprobación). Los datos externos permanecen sin score de desgaste. Ejemplos 100 % simulados.</p>'
   +'<label for="ma-aa-json">Sesiones A–A en formato raw PID JSON (sin VIN, patentes ni datos personales)</label>'
   +'<textarea class="field" id="ma-aa-json" rows="5" spellcheck="false" maxlength="1300000" placeholder="Pegá aquí un array de sesiones A–A">'+esc(state.raw)+'</textarea>'
   +'<div class="row"><button class="button" type="button" data-aa="demo">Ensayo A–A sintético</button>'
   +'<button class="button alt" type="button" data-aa="evaluate">Evaluar sesiones aportadas</button>'
   +'<button class="button" type="button" data-aa="demo-r12">Demo R12 (6 sesiones)</button>'
   +'<button class="button alt" type="button" data-aa="evaluate-r12">Evaluar repetibilidad R12</button>'
   +'<button class="button alt" type="button" data-aa="clear">Limpiar</button></div>'
   +'<div role="status" aria-live="polite">'+(state.error?'<p>'+esc(state.error)+'</p>':'')+'</div>'
   +(state.report?output(state.report):'')
   +(state.r12Report?outputR12(state.r12Report):'');
 }
 root.addEventListener('input',ev=>{if(ev.target.id==='ma-aa-json')state.raw=ev.target.value;});
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-aa]');if(!b)return;
  state.error='';state.report=null;state.r12Report=null;
  if(b.dataset.aa==='clear')state.raw='';
  else try{
   if(b.dataset.aa==='demo')state.raw=reference;
   if(b.dataset.aa==='demo-r12')state.raw=r12Reference;
   if(state.raw.length>1300000)throw RangeError('Entrada demasiado grande');
   const sessions=JSON.parse(state.raw);
   if(!Array.isArray(sessions))throw RangeError('Se espera un array JSON');
   if(state.raw!==reference&&state.raw!==r12Reference){
    // External input cannot self-label as synthetic; provenance is unverified.
    for(const s of sessions){if(!s||typeof s!=='object'||Array.isArray(s))throw RangeError('Sesión inválida');s.source='provided_obd_unverified';}
   }
   if(b.dataset.aa==='demo-r12'||b.dataset.aa==='evaluate-r12')
    state.r12Report=assessObdMultiSessionRepeatability(sessions);
   else state.report=evaluateAAWithoutService(sessions);
  }catch(err){state.error='No se pudo evaluar A–A: '+err.message;}
  render();
 });
 render();
}
