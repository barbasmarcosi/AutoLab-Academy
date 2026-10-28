/** Synthetic fuel-trim/DTC experiment. Not OEM values, repair thresholds or physical procedures. */
export const DTC_GUIDED_ID="lab-dtc-guided-v1";
export const DTC_CASES=Object.freeze([
 {id:"air",name:"Caso A",idle:22,load:6,pressure:3.5,leak:"indicio positivo de fuga",sensor:"señal plausible"},
 {id:"fuel",name:"Caso B",idle:14,load:23,pressure:2.1,leak:"sin indicios de fuga",sensor:"señal plausible"},
 {id:"sensor",name:"Caso C",idle:21,load:20,pressure:3.5,leak:"sin indicios de fuga",sensor:"señal no compatible con referencia independiente"}
].map(x=>Object.freeze(x)));
export const DTC_TESTS=Object.freeze([
 {id:"trims",label:"Comparar correcciones a ralentí y con demanda"},
 {id:"pressure",label:"Medir presión del banco y contrastar con su referencia"},
 {id:"leak",label:"Evaluar estanqueidad de admisión simulada"},
 {id:"sensor",label:"Contrastar sensor con estímulo independiente"}
].map(x=>Object.freeze(x)));
const labels=Object.freeze({air:"aire no medido",fuel:"suministro insuficiente",sensor:"medición sesgada",unknown:"todavía indeterminado"});
export const DTC_FALSIFIERS=Object.freeze({
 air:Object.freeze({options:["Admisión sin fugas y falta de presión verificada","Fuga de admisión confirmada","Persistencia del DTC sin repetir pruebas"],answer:0}),
 fuel:Object.freeze({options:["Caída de presión repetible bajo demanda","Presión normal bajo demanda y fuga de admisión confirmada","Un nuevo DTC sin mediciones"],answer:1}),
 sensor:Object.freeze({options:["La señal sigue discrepando de una referencia independiente","Se reproduce la respuesta sesgada del sensor","Señal normal y mezcla pobre confirmada por prueba externa"],answer:2})
});
const get=id=>{const c=DTC_CASES.find(c=>c.id===id);if(!c)throw RangeError("Caso DTC inválido");return c;};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function dtcReading(id,test){
 const c=get(id);
 if(test==="trims")return "Correcciones sintéticas: ralentí +"+c.idle+" %; demanda +"+c.load+" %. No identifican una pieza por sí solas.";
 if(test==="pressure")return "Presión bajo demanda: "+c.pressure.toFixed(1).replace(".",",")+" bar. Referencia didáctica 3,3–3,7 bar, NO OEM.";
 if(test==="leak")return "Ensayo ficticio de estanqueidad: "+c.leak+". No prescribe técnicas físicas.";
 if(test==="sensor")return "Comparación con referencia externa: "+c.sensor+".";
 throw RangeError("Prueba DTC desconocida");
}
/**
 * Deliberately simple what-if table. Only post-submission: cannot reveal the
 * reserved diagnosis before committing. A synthetic response is not causality
 * demonstrated on a physical car.
 */
export function dtcCounterfactual(caseId,controlledChange){
 const c=get(caseId);
 if(!Object.hasOwn(DTC_FALSIFIERS,controlledChange))throw RangeError("Cambio controlado inválido");
 const matched=controlledChange===caseId;
 return Object.freeze({caseId,controlledChange,matched,before:{idle:c.idle,load:c.load},
  after:{idle:matched?3:c.idle,load:matched?4:c.load},
  caution:"Este es un modelo hipotético que presupone una sola causa. Una corrección del dato sintético no acredita que una reparación física funcionaría."});
}
export function gradeDtcGuided({caseId,initial,first,tests,diagnosis,falsifier}={}){
 get(caseId);
 if(!Object.hasOwn(labels,initial)||!DTC_TESTS.some(t=>t.id===first))throw RangeError("Hipótesis o primer ensayo inválido");
 if(!Array.isArray(tests)||tests.length!==4||tests[0]!==first||new Set(tests).size!==4||tests.some(t=>!DTC_TESTS.some(x=>x.id===t)))
  throw RangeError("Debés obtener las cuatro evidencias, sin duplicar pruebas y respetando el plan");
 if(!Object.hasOwn(DTC_FALSIFIERS,diagnosis)||!Number.isInteger(falsifier)||falsifier<0||falsifier>=3)throw RangeError("Conclusión o falsador inválido");
 const causal=diagnosis===caseId,falsified=falsifier===DTC_FALSIFIERS[diagnosis].answer,score=(causal?70:0)+(falsified?30:0);
 return Object.freeze({score,passed:score===100,causal,falsified,initial,diagnosis,changed:initial!==diagnosis,expected:caseId});
}
export function dtcTheoryIllustration(){
 return "<section class='panel stack' aria-label='Ejemplos completos de DTC y correcciones'><h2>Dos problemas, un mismo DTC: ejemplo resuelto</h2>"+
 "<p>Un DTC P0171 indica que el control detectó una condición compatible con mezcla pobre bajo sus reglas, no que la sonda o la ECU estén rotas. Las correcciones positivas indican un ajuste al alza en la estrategia del control, no demuestran por sí solas la causa.</p>"+
 "<ol><li><strong>Escenario A:</strong> +22 % a ralentí y +6 % con otra demanda. Hipótesis: aire no medido. Para distinguirla de combustible y señal, compará presión, estanqueidad y respuesta del sensor.</li>"+
 "<li><strong>Pruebas:</strong> presión sintética 3,5 bar en referencia del banco, indicio de fuga en admisión y sensor plausible. La fuga explica mejor la evidencia, no solo el patrón de correcciones.</li>"+
 "<li><strong>Refutación:</strong> una prueba repetible sin fuga y con insuficiencia de presión obliga a revisar la hipótesis original.</li></ol>"+
 "<h3>Segundo ejemplo: la misma alerta, distinta causa</h3><p>En otro banco +14 % al ralentí y +23 % con demanda, presión 2,1 bar frente a referencia <strong>ficticia</strong> 3,3–3,7 bar, sin fuga y sensor plausible, favorecen la hipótesis de suministro insuficiente. Es una comparación causal, no un umbral OEM.</p>"+
 "<p><strong>Preguntas guía:</strong> ¿qué evidencia separaría un sensor sesgado de mezcla realmente pobre? ¿Qué dato haría abandonar tu hipótesis? No confundas condiciones de control, freeze frame y un dato aislado con causalidad.</p>"+
 "<p class='muted small'>Los valores y el comportamiento de las señales se inventaron para aprender método científico. STFT/LTFT y disponibilidad de códigos varían por ECU y condición. No realizar pruebas invasivas ni asumir procedimientos seguros sin documentación y capacitación.</p></section>";
}
export function mountDtcGuided(root,{record,onSaved=()=>{}}={}){
 if(!root||typeof record!=="function")throw Error("Falta guardar evidencia");
 let idx=0,initial=null,first="",tests=[],result=null,busy=false,why="";
 const $=id=>root.querySelector("#"+id);
 const render=()=>{
  const c=DTC_CASES[idx],head="<section class='panel stack' aria-label='Laboratorio DTC sintético'><h3>Laboratorio guiado de inferencia con DTC</h3><p>Banco ficticio con P0171: la ECU registró una condición, pero la causa permanece oculta. Antes de concluir, contrastá hipótesis alternativas.</p><p class='muted small'>Todas las lecturas son datos sintéticos, sin límites OEM ni ensayos en vehículo.</p>";
  if(!initial){
   root.innerHTML=head+"<label for='dtc-case'>Banco a investigar</label><select id='dtc-case' class='field'>"+
    DTC_CASES.map((a,i)=>"<option value='"+i+"' "+(i===idx?"selected":"")+">"+a.name+"</option>").join("")+"</select>"+
    "<label for='dtc-prior'>Hipótesis previa (no puntúa)</label><select id='dtc-prior' class='field'><option value=''>Elegí</option>"+
    Object.entries(labels).map(([k,v])=>"<option value='"+k+"'>"+v+"</option>").join("")+"</select>"+
    "<label for='dtc-first'>Primera prueba prevista</label><select id='dtc-first' class='field'><option value=''>Elegí</option>"+
    DTC_TESTS.map(t=>"<option value='"+t.id+"'>"+t.label+"</option>").join("")+"</select>"+
    "<button type='button' class='button' data-dtc='freeze'>Congelar hipótesis y plan</button><p id='dtc-status' role='status' aria-live='polite'></p></section>";return;
  }
  root.innerHTML=head+"<p id='dtc-locked'><strong>Hipótesis inicial:</strong> "+esc(labels[initial])+". Primera prueba: "+esc(first)+". Esta idea puede revisarse sin penalización.</p>"+
   "<label for='dtc-probe'>Seleccioná la prueba virtual</label><select class='field' id='dtc-probe' "+(result?"disabled":"")+">"+
   DTC_TESTS.map(t=>"<option value='"+t.id+"' "+(tests.includes(t.id)?"disabled":"")+">"+esc(t.label)+"</option>").join("")+"</select>"+
   "<button type='button' class='button alt' data-dtc='measure' "+(result||tests.length===4?"disabled":"")+">Revelar observación</button>"+
   "<div class='panel stack' id='dtc-measured' role='status' aria-live='polite'><strong>Pruebas realizadas: "+tests.length+"/4</strong>"+
   (tests.length?"<ol>"+tests.map(t=>"<li>"+esc(dtcReading(c.id,t))+"</li>").join("")+"</ol>":"<p>Todavía no hay evidencia.</p>")+"</div>"+
   "<label for='dtc-diagnosis'>Localización basada en evidencia</label><select id='dtc-diagnosis' class='field' "+(result?"disabled":"")+"><option value=''>Elegí</option>"+
   Object.entries(labels).filter(([k])=>k!=="unknown").map(([k,v])=>"<option value='"+k+"' "+(result?.diagnosis===k?"selected":"")+">"+v+"</option>").join("")+"</select>"+
   "<fieldset id='dtc-falsifier' class='panel'><legend>¿Qué observación refutaría tu conclusión?</legend>"+
   (result?DTC_FALSIFIERS[result.diagnosis].options.map((x,i)=>"<p>"+esc(x)+(i===result.selectedFalsifier?" (tu respuesta)":"")+"</p>").join(""):"<p>Elegí primero una conclusión.</p>")+"</fieldset>"+
   (result?"<div class='result' id='dtc-result' role='status' aria-live='polite' tabindex='-1'><strong>"+result.score+"/100 · "+(result.passed?"criterios objetivos cumplidos":"revisar evidencia")+"</strong>"+
   "<p>Diagnóstico: "+(result.causal?"correcto":"incorrecto")+". Refutación: "+(result.falsified?"correcta":"incorrecta")+". La causa modelada era "+esc(labels[result.expected])+". Revisaste la hipótesis inicial: "+(result.changed?"sí":"no")+".</p>"+
   "<p>Justificación: "+esc(why)+"</p><p>Texto pendiente de revisión cualitativa; la nota automática no acredita razonamiento libre ni habilidad física.</p></div>"+
   "<div class='panel stack'><h4>Contrafactual después de entregar</h4><p>Ahora podés cambiar UNA causa del modelo y observar si las correcciones previstas disminuyen. Esto prueba la coherencia de nuestras reglas ficticias, no una reparación real.</p>"+
   "<label for='dtc-counter'>Cambio simulado</label><select id='dtc-counter' class='field'>"+
   Object.entries(labels).filter(([k])=>k!=="unknown").map(([k,v])=>"<option value='"+k+"'>Restablecer "+esc(v)+"</option>").join("")+"</select>"+
   "<button type='button' class='button alt' data-dtc='counter'>Probar el contrafactual</button><p id='dtc-counter-result' role='status' aria-live='polite'>Sin ejecutar.</p></div>"+
   "<button type='button' class='button alt' data-dtc='again'>Otro caso</button>":
   "<label for='dtc-why'>Justificá qué pruebas discriminaron causas y qué falsaría la elegida</label>"+
   "<textarea id='dtc-why' class='field' maxlength='1200' rows='4' placeholder='La evidencia que favorece mi hipótesis es...'></textarea>"+
   "<p class='muted small'>La explicación se guarda sin evaluación semántica ni mínimos de longitud.</p>"+
   "<button type='button' class='button' data-dtc='grade'>Evaluar y guardar el caso</button>")+
   "<p id='dtc-status' role='status' aria-live='polite'></p></section>";
 };
 root.addEventListener("change",event=>{
  if(event.target.id==="dtc-case"&&!initial){idx=Number(event.target.value);render();return;}
  if(event.target.id==="dtc-diagnosis"&&!result){
   const f=$("dtc-falsifier"),d=event.target.value;
   f.innerHTML="<legend>¿Qué observación refutaría tu conclusión?</legend>"+
    (DTC_FALSIFIERS[d]?DTC_FALSIFIERS[d].options.map((o,i)=>"<label class='option'><input type='radio' name='dtc-falsifier' value='"+i+"'>"+esc(o)+"</label>").join(""):"<p>Elegí una conclusión.</p>");
  }
 });
 root.addEventListener("click",async event=>{
  const button=event.target.closest("[data-dtc]");if(!button||busy)return;
  if(button.dataset.dtc==="freeze"&&!initial){
   const a=$("dtc-prior").value,t=$("dtc-first").value;
   if(!Object.hasOwn(labels,a)||!DTC_TESTS.some(x=>x.id===t)){$("dtc-status").textContent="Elegí hipótesis y primera prueba.";return;}
   initial=a;first=t;render();return;
  }
  if(button.dataset.dtc==="measure"&&initial&&!result){
   const t=$("dtc-probe").value;
   if(tests.length===0&&t!==first){$("dtc-status").textContent="Medí primero lo que habías planificado.";return;}
   if(tests.includes(t)||!DTC_TESTS.some(x=>x.id===t)){$("dtc-status").textContent="Esa prueba ya existe.";return;}
   tests.push(t);render();return;
  }
  if(button.dataset.dtc==="grade"&&initial&&!result){
   const selected=root.querySelector("input[name='dtc-falsifier']:checked"),reason=$("dtc-why").value.trim();
   if(!selected||!reason){$("dtc-status").textContent="Completá refutación y justificación; el texto no se califica.";return;}
   let g;try{g=gradeDtcGuided({caseId:DTC_CASES[idx].id,initial,first,tests,diagnosis:$("dtc-diagnosis").value,falsifier:Number(selected.value)});}
   catch(e){$("dtc-status").textContent=e.message;return;}
   busy=true;
   try{
    await record({id:DTC_GUIDED_ID,at:new Date().toISOString(),score:g.score,passed:g.passed,
     hypothesis:"Hipótesis DTC "+g.diagnosis,conclusion:"Evaluación objetiva "+g.score+"/100",reasoning:reason,
     report:JSON.stringify({caseId:DTC_CASES[idx].id,initial,first,measurementsInOrder:tests,observations:tests.map(t=>({test:t,value:dtcReading(DTC_CASES[idx].id,t)})),selected:{diagnosis:g.diagnosis,falsifier:Number(selected.value)},expected:g.expected,qualitativeReview:"pending",reasoning:reason})});
    why=reason;result={...g,selectedFalsifier:Number(selected.value)};render();$("dtc-result")?.focus({preventScroll:true});onSaved(g);
   }catch(e){$("dtc-status").textContent="Guardado no confirmado: "+String(e.message||e);}finally{busy=false;}
   return;
  }
  if(button.dataset.dtc==="counter"&&result){
   const cf=dtcCounterfactual(DTC_CASES[idx].id,$("dtc-counter").value);
   $("dtc-counter-result").textContent="Antes: +"+cf.before.idle+" % en ralentí y +"+cf.before.load+" % con demanda. Después: +"+
    cf.after.idle+" % y +"+cf.after.load+" %. "+(cf.matched?"El cambio afecta la causa supuesta en este modelo.":"El cambio no modifica la causa que controla este modelo.")+" "+cf.caution;
   return;
  }
  if(button.dataset.dtc==="again"&&result){idx=(idx+1)%DTC_CASES.length;initial=null;first="";tests=[];result=null;why="";render();}
 });
 render();
}
