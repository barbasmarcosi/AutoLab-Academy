import{publicMetrologyCase,simulateMetrology,evaluateMetrology,metrologyReport,METROLOGY_INSTRUMENTS}from'./metrology-research.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const format=x=>Number(x).toFixed(4);
export function metrologyShell(){
 return '<section class="stack"><div class="eyebrow">AUTOMOTIVE MECHANICS · MC01</div><h1>Metrology Research Bench</h1><p>Seleccioná un instrumento, formulá una predicción, medí dos series virtuales y contrastá la diferencia con la incertidumbre, sin atribuir resultados a vehículos reales.</p><div id="metrology-explorer"></div></section>';
}
export function mountMetrology(root,{record}){
 if(!root||typeof record!=='function')throw Error('MC01 requiere guardar evidencia');
 const s={seed:null,instrumentId:'dial',prediction:'',result:null,decision:'',reasoning:'',limits:'',grade:null,saving:false,saved:false,error:''};
 const opts=[['resolvable','Diferencia resoluble con la regla k=2'],['inconclusive','Diferencia no resoluble con esta regla']];
 const options=(current,empty)=>'<option value="">'+empty+'</option>'+opts.map(([id,title])=>'<option value="'+id+'" '+(current===id?'selected':'')+'>'+title+'</option>').join('');
 const table=x=>'<table class="rw-table" style="width:100%"><caption>Series simuladas en mm, por repetición</caption><thead><tr><th scope="col">n</th><th scope="col">Condición A</th><th scope="col">Condición B</th></tr></thead><tbody>'+x.seriesA.map((v,i)=>'<tr><th scope="row">'+(i+1)+'</th><td>'+format(v)+'</td><td>'+format(x.seriesB[i])+'</td></tr>').join('')+'</tbody></table>';
 function render(){
  let html='<div class="panel stack"><h2>Contrato científico</h2><p role="note">Todas las dimensiones e incertidumbres son <strong>inventadas para entrenamiento</strong>. Se toman cinco lecturas repetidas por condición, con el mismo instrumento y un sesgo de calibración común. No se simula una pieza, un certificado de calibración o una tolerancia OEM.</p><p>Type A: desviación estándar muestral de lecturas dividida por √5. Type B: cuantización rectangular u<sub>r</sub>=resolución/√12 y componente de calibración común. Para B−A el sesgo común se cancela; no se lo agrega dos veces. Regla de decisión didáctica: |B−A| &gt; 2u(B−A). <strong>k=2 no implica cobertura exacta del 95 %.</strong></p><button class="button" type="button" data-mc="new">Nuevo expediente reproducible</button></div>';
  if(s.seed!==null){
   const c=publicMetrologyCase(s.seed);
   html+='<div class="panel stack"><h2>MC01 · Semilla '+s.seed+'</h2><p>'+esc(c.measurand)+'</p><p class="muted">'+esc(c.environment)+'</p>';
   if(!s.result){
    html+='<label for="mc-tool">Instrumento virtual</label><select class="field" id="mc-tool">'+METROLOGY_INSTRUMENTS.map(x=>'<option value="'+x.id+'" '+(s.instrumentId===x.id?'selected':'')+'>'+esc(x.name)+' · resolución '+x.resolutionMm+' mm · u calibración '+x.uCalMm+' mm (sintética)</option>').join('')+'</select>';
    html+='<label for="mc-prediction">Pronóstico antes de medir</label><select class="field" id="mc-prediction">'+options(s.prediction,'Elegí una predicción…')+'</select><button class="button" type="button" data-mc="measure">Congelar pronóstico y medir</button>';
   }else{
    const m=s.result;
    html+='<p><strong>Instrumento elegido:</strong> '+esc(METROLOGY_INSTRUMENTS.find(i=>i.id===s.instrumentId)?.name)+'</p><p><strong>Pronóstico congelado:</strong> '+esc(opts.find(([id])=>id===s.prediction)?.[1])+'</p>'+table(m);
    html+='<h3>Presupuesto de incertidumbre</h3><table class="rw-table" style="width:100%"><caption>Magnitudes educativas de la medición, milímetros</caption><thead><tr><th>Componente</th><th>Valor</th></tr></thead><tbody>'+
     [['Media A',m.meanA],['Media B',m.meanB],['uA(A), repetibilidad',m.uAA],['uA(B), repetibilidad',m.uAB],['uB, resolución rectangular',m.uResolution],['uB, calibración común (solo para valor absoluto)',m.uCalibration],['B − A',m.difference],['u(B−A), combinación',m.uDifference],['U(B−A), k=2',m.expanded]].map(([label,value])=>'<tr><th scope="row">'+esc(label)+'</th><td>'+format(value)+'</td></tr>').join('')+'</tbody></table>';
    html+='<p>La corrección de calibración común se cancela en la diferencia entre condiciones con el mismo instrumento; el valor de una dimensión absoluta conserva su incertidumbre de calibración. No extrapolar a una calibración física.</p>';
    if(!s.grade){
     html+='<label for="mc-decision">Decisión final según |B−A| &gt; 2u</label><select class="field" id="mc-decision">'+options(s.decision,'Seleccioná después de interpretar…')+'</select>';
     html+='<label for="mc-reason">Interpretación del presupuesto de incertidumbre y sesgo común (mínimo 80 caracteres)</label><textarea id="mc-reason" class="field" rows="4" maxlength="2500">'+esc(s.reasoning)+'</textarea>';
     html+='<label for="mc-limits">Supuestos, limitaciones y siguiente verificación experimental (mínimo 60 caracteres)</label><textarea id="mc-limits" class="field" rows="3" maxlength="2000">'+esc(s.limits)+'</textarea>';
     html+='<button class="button" type="button" data-mc="evaluate">Cerrar investigación</button>';
    }else{
     html+='<p><strong>Resultado:</strong> '+s.grade.score+'/100 · '+(s.grade.passed?'Criterio educativo alcanzado.':'No cumple todos los criterios objetivos.')+'</p><p><strong>Solución del modelo:</strong> '+esc(opts.find(([id])=>id===s.grade.expected)?.[1])+'</p><p class="muted">'+esc(s.grade.warning)+'</p>';
     html+='<button class="button" type="button" data-mc="save" '+(s.saving||s.saved?'disabled':'')+'>'+(s.saved?'Evidencia registrada':'Guardar expediente MC01')+'</button>';
    }
   }
   html+='</div>';
  }
  html+='<p role="status" aria-live="polite">'+esc(s.error)+'</p>';
  root.innerHTML=html;
 }
 root.addEventListener('input',ev=>{
  if(ev.target.id==='mc-tool')s.instrumentId=ev.target.value;
  if(ev.target.id==='mc-prediction')s.prediction=ev.target.value;
  if(ev.target.id==='mc-decision')s.decision=ev.target.value;
  if(ev.target.id==='mc-reason')s.reasoning=ev.target.value;
  if(ev.target.id==='mc-limits')s.limits=ev.target.value;
 });
 root.addEventListener('click',async ev=>{
  const op=ev.target.closest('[data-mc]')?.dataset.mc;if(!op)return;s.error='';
  if(op==='new'){s.seed=Math.floor(Math.random()*2147483647)+1;s.instrumentId='dial';s.prediction='';s.result=null;s.decision='';s.reasoning='';s.limits='';s.grade=null;s.saving=false;s.saved=false;render();return;}
  if(op==='measure'){
   if(!opts.some(([id])=>id===s.prediction)){s.error='Primero elegí una predicción.';render();return;}
   try{s.result=simulateMetrology(s.seed,s.instrumentId);}catch(error){s.error='No se pudo generar la medición.';}
   render();return;
  }
  if(op==='evaluate'){
   if(!s.result||s.reasoning.trim().length<80||s.limits.trim().length<60){
    s.error='Se requiere conclusión, razonamiento de 80 caracteres y límites de 60 caracteres.';render();return;
   }
   try{s.grade=evaluateMetrology(s);}catch(error){s.error='Seleccioná la conclusión numérica antes de cerrar.';}render();return;
  }
  if(op==='save'){
   if(!s.grade||s.saving||s.saved)return;s.saving=true;
   try{await record({id:'lab-metrology-uncertainty-v1',score:s.grade.score,passed:s.grade.passed,at:new Date().toISOString(),hypothesis:s.prediction,conclusion:s.decision,used:[s.instrumentId,'repeatability','resolution','shared-calibration'],reasoning:s.reasoning,report:metrologyReport(s,s.grade)});s.saved=true;}
   catch(error){s.error='La evidencia no se guardó. Verificá almacenamiento local y reintentá.';}
   finally{s.saving=false;if(root.isConnected)render();}
  }
 });
 render();
}
