import {MECHANICAL_AGE_VERSION,syntheticServicePair,evaluateMechanicalSnapshot,compareMechanicalSnapshots} from './mechanical-age-research.js';
import {syntheticReplicatedServiceCase,evaluateReplicatedMeasurements} from './mechanical-age-repeatability.js';
import {runMechanicalAgeFalsification} from './mechanical-age-falsification.js';
import {rawAAShell,mountRawAA} from './mechanical-age-aa-view.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v===null?'no disponible':Number(v).toFixed(2);
export function mechanicalAgeShell(){
 return '<section class="stack"><div class="eyebrow">AUTOMOTIVE R&D · MA00</div><h1>Edad mecánica · laboratorio experimental</h1>'
  +'<p>Analizá una foto OBD con un protocolo reproducible y contrastá antes/después de mantenimiento. <strong>No mide edad real, desgaste estructural, vida restante ni diagnostica averías.</strong></p><div id="mechanical-age-explorer"></div>'+rawAAShell()+'</section>';
}
export function mountMechanicalAgeLab(root){
 if(!root)throw Error('Falta contenedor de investigación MA00');
 const demo=syntheticServicePair();
 const state={before:JSON.stringify(demo.before,null,2),after:JSON.stringify(demo.after,null,2),result:null,repeatResult:null,falsification:null,error:''};
 function summary(r,title){
  return '<div class="panel stack"><h3>'+esc(title)+'</h3><p><strong>Estado:</strong> '+esc(r.status)+'. <strong>Índice de desviación funcional experimental:</strong> '+(r.deviationIndex===null?'No calculable':r.deviationIndex+'/100')+'.</p>'
   +'<p>RPM mediana '+fmt(r.features.medianRpm)+'; dispersión robusta RPM '+fmt(r.features.rpmRobustSigma)+'; ECT '+fmt(r.features.medianEctC)+' °C; carga '+fmt(r.features.medianLoadPct)+' %; STFT+LTFT '+fmt(r.features.medianCombinedTrimPct)+' puntos porcentuales.</p>'
   +(r.exclusion.length?'<p role="note">Exclusiones: '+esc(r.exclusion.join('; '))+'</p>':'')
   +'<p class="muted">Evidencia de adquisición: '+esc(r.measurementEvidence.completeness)+'; verificación instrumental independiente: ninguna.</p>'
   +'<p class="muted">Sincronización entre PIDs: no verificada. Alertas de observabilidad: '+r.signalObservability.warnings.length+'.</p>'
   +(r.signalObservability.warnings.length?'<ul>'+r.signalObservability.warnings.map(w=>'<li>'+esc(w)+'</li>').join('')+'</ul>':'')
   +'<p class="muted">Procedencia: '+esc(r.provenance)+'; muestras: '+r.sampleCount+'. Edad equivalente: <strong>no determinada</strong>. Desgaste estructural: <strong>no determinado</strong>.</p></div>';
 }
 function render(){
  root.innerHTML='<div class="panel stack"><h2>Diseño experimental MA00 · '+esc(MECHANICAL_AGE_VERSION)+'</h2>'
   +'<p role="note">Ejemplo 100 % sintético precargado. Podés sustituirlo con un expediente JSON de lecturas OBD de origen conocido, sin importar VIN, patente ni datos personales. Los umbrales son didácticos, no tolerancias del fabricante. Las capturas externas requieren measurementContext documentado; ninguna declaración del operador constituye prueba independiente. No se guardan lecturas en esta pantalla.</p>'
   +'<label for="ma-before">Medición ANTES del service (JSON, 20-10000 muestras)</label>'
   +'<textarea class="field" id="ma-before" rows="7" spellcheck="false" maxlength="200000">'+esc(state.before)+'</textarea>'
   +'<label for="ma-after">Medición DESPUÉS del service (JSON)</label>'
   +'<textarea class="field" id="ma-after" rows="7" spellcheck="false" maxlength="200000">'+esc(state.after)+'</textarea>'
   +'<div class="row"><button class="button" type="button" data-ma="evaluate">Evaluar ambas mediciones</button>'
   +'<button class="button alt" type="button" data-ma="demo">Restaurar ejemplo sintético</button><button class="button alt" type="button" data-ma="replicates">Ensayar repetibilidad 2 + 2 (sintético)</button><button class="button alt" type="button" data-ma="falsify">Intentar refutar el índice</button></div>'
   +'</div><div role="status" aria-live="polite">'+(state.error?'<p>'+esc(state.error)+'</p>':'')+'</div>'
   +(state.result?summary(state.result.before,'Antes del mantenimiento')+summary(state.result.after,'Después del mantenimiento')
     +'<div class="panel stack"><h2>Comparación</h2><p><strong>'+ (state.result.comparable?'Condiciones comparables':'Comparación no válida')+'</strong></p>'
     +(state.result.comparable?(state.result.deltaDeviationIndex===null?'<p>Datos externos: NO calculamos ningún índice no calibrado.</p>':'<p>Diferencia de índice funcional sintético: '+fmt(state.result.deltaDeviationIndex)+' puntos (después − antes). No significa reducción demostrada de desgaste o edad.</p>'):'<p>'+esc(state.result.blockers.join('; '))+'</p>')+(state.result.before.provenance==='provided_obd_unverified'&&!state.result.comparable?'<p>Datos externos: NO calculamos ningún índice no calibrado.</p>':'')+'<p>'+esc(state.result.interpretation)+'</p>'
     +'<p class="muted">Prohibido traducir este índice a kilómetros, salud %, longevidad, falla específica o rejuvenecimiento. Los cambios podrían explicarse por mantenimiento, ambiente y sensores.</p></div>':'')
   +(state.falsification?'<div class="panel stack"><h2>Controles negativos de falsación (100 % sintéticos)</h2><p>Resultado del desafío: <strong>'+ (state.falsification.passedBehaviorChecks?'Se detectaron limitaciones del indicador':'Al menos un ensayo requiere revisión')+'</strong>.</p><ul>'+state.falsification.controls.map(x=>'<li>'+esc(x.label)+': '+(x.comparisonAllowed?'comparación permitida':'rechazada')+', Δíndice '+(x.delta===null?'no calculable':x.delta)+'; comportamiento esperado '+(x.behaviorObserved?'verificado':'NO verificado')+'</li>').join('')+'</ul><p><strong>Conclusión:</strong> '+esc(state.falsification.conclusion)+'</p><p class="muted">Son controles negativos creados por código, no mediciones de vehículos reales ni un experimento aleatorizado.</p></div>':'')
   +(state.repeatResult?'<div class="panel stack"><h2>Ensayo de repetibilidad · 4 sesiones sintéticas</h2><p><strong>'+esc(state.repeatResult.verdict)+'</strong></p><p>Mediana experimental antes/después: '+fmt(state.repeatResult.baseline?.experimentalDeviationIndex?.median??null)+' / '+fmt(state.repeatResult.after?.experimentalDeviationIndex?.median??null)+'; rangos entre sesiones: '+fmt(state.repeatResult.baseline?.experimentalDeviationIndex?.range??null)+' / '+fmt(state.repeatResult.after?.experimentalDeviationIndex?.range??null)+'.</p><p>Unidades experimentales: '+state.repeatResult.sessionUnitCount+' sesiones, no miles de filas. Sin intervalo de confianza, prueba causal ni edad mecánica determinada.</p></div>':'');
 }
 root.addEventListener('input',ev=>{if(ev.target.id==='ma-before')state.before=ev.target.value; if(ev.target.id==='ma-after')state.after=ev.target.value;});
 root.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-ma]');if(!b)return;
  state.result=null;state.repeatResult=null;state.falsification=null;state.error='';
  if(b.dataset.ma==='demo'){
   state.before=JSON.stringify(demo.before,null,2);state.after=JSON.stringify(demo.after,null,2);
  }else if(b.dataset.ma==='replicates'){
   state.repeatResult=evaluateReplicatedMeasurements(syntheticReplicatedServiceCase());
  }else if(b.dataset.ma==='falsify'){
   state.falsification=runMechanicalAgeFalsification();
  }else if(b.dataset.ma==='evaluate'){
   try{
    if(state.before.length>200000||state.after.length>200000)throw RangeError('Expediente demasiado grande');
    const a=JSON.parse(state.before),z=JSON.parse(state.after);
    // User JSON is untrusted even when it self-declares source:'synthetic'.
    // Only the exact bundled demonstration can use the illustrative synthetic score.
    const intactDemo=state.before===JSON.stringify(demo.before,null,2)&&state.after===JSON.stringify(demo.after,null,2);
    if(!intactDemo){a.source='provided_obd_unverified';z.source='provided_obd_unverified';}
    state.result=compareMechanicalSnapshots(a,z);
   }catch(error){state.error='No se pudo evaluar: '+error.message;}
  }
  render();
 });
 render();
 const aaRoot=typeof document!=='undefined'?document.getElementById('ma-aa-explorer'):null;
 if(aaRoot)mountRawAA(aaRoot);
}
