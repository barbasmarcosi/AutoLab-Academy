import {evaluateAAWithoutService,syntheticAAReceiptPair} from './mechanical-age-raw-obd.js';
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
 const state={raw:'',report:null,error:''};
 function output(r){
  const heads=r.comparable?'<p><strong>Ventanas documentalmente compatibles</strong> (no verificación metrológica)</p>':'<p><strong>Comparación bloqueada</strong>: '+esc(r.blockers.join('; '))+'</p>';
  const rows=r.observedChanges?Object.entries(r.observedChanges).map(([pid,c])=>'<tr><td>'+esc(pid)+'</td><td>'+esc(c.unit)+'</td><td>'+num(c.firstMedian)+'</td><td>'+num(c.lastMedian)+'</td><td>'+num(c.lastMinusFirst)+'</td></tr>').join(''):'';
  return '<section class="stack"><h3>Evaluación A–A</h3>'+heads
   +'<p>Sesiones independientes declaradas: '+r.sessionCount+'. Unidad de análisis: <strong>sesión</strong>, no respuesta individual. Evidencia física o sincronización ECU: <strong>no verificada</strong>.</p>'
   +(rows?'<table><thead><tr><th>PID</th><th>Unidad</th><th>Mediana A1</th><th>Mediana A2</th><th>Δ</th></tr></thead><tbody>'+rows+'</tbody></table>':'')
   +'<p><strong>Edad mecánica, score de salud, desgaste y causalidad:</strong> no determinados.</p>'
   +'<p class="muted">'+esc(r.caveat)+'</p></section>';
 }
 function render(){
  root.innerHTML='<p>Podés cargar un array JSON con 2–12 sesiones registradas por PID; los datos externos permanecen sin puntaje. Ejemplo precargable: 100 % simulado.</p>'
   +'<label for="ma-aa-json">Sesiones A–A en formato raw PID JSON (sin VIN, patentes ni datos personales)</label>'
   +'<textarea class="field" id="ma-aa-json" rows="5" spellcheck="false" maxlength="1300000" placeholder="Pegá aquí un array de sesiones A–A">'+esc(state.raw)+'</textarea>'
   +'<div class="row"><button class="button" type="button" data-aa="demo">Ensayo A–A sintético</button>'
   +'<button class="button alt" type="button" data-aa="evaluate">Evaluar sesiones aportadas</button>'
   +'<button class="button alt" type="button" data-aa="clear">Limpiar</button></div>'
   +'<div role="status" aria-live="polite">'+(state.error?'<p>'+esc(state.error)+'</p>':'')+'</div>'
   +(state.report?output(state.report):'');
 }
 root.addEventListener('input',ev=>{if(ev.target.id==='ma-aa-json')state.raw=ev.target.value;});
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-aa]');if(!b)return;
  state.error='';state.report=null;
  if(b.dataset.aa==='clear')state.raw='';
  else try{
   if(b.dataset.aa==='demo')state.raw=reference;
   if(state.raw.length>1300000)throw RangeError('Entrada demasiado grande');
   const sessions=JSON.parse(state.raw);
   if(!Array.isArray(sessions))throw RangeError('Se espera un array JSON');
   if(state.raw!==reference){
    // External input cannot self-label as synthetic; provenance is unverified.
    for(const s of sessions){if(!s||typeof s!=='object'||Array.isArray(s))throw RangeError('Sesión inválida');s.source='provided_obd_unverified';}
   }
   state.report=evaluateAAWithoutService(sessions);
  }catch(err){state.error='No se pudo evaluar A–A: '+err.message;}
  render();
 });
 render();
}
