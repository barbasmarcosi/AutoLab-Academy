/**
 * Lesson 02: reserved diagnostic transfer cases, separate from the three
 * guided examples. Readings are invented and use a self-contained bench
 * reference, never OEM/repair thresholds. This is not a secure exam.
 */
import{DTC_TESTS,DTC_FALSIFIERS}from'./dtc-lesson.js';
export const DTC_HOLDOUT_ID="lab-dtc-holdout-v1";
const caseData=[
 ["R01","air",18,5,3.4,true,false,"Ralentí estable; demanda moderada"],
 ["R02","fuel",12,26,2.4,false,false,"Demanda sostenida de banco"],
 ["R03","sensor",17,19,3.6,false,true,"Banco a temperatura estable"],
 ["R04","air",26,7,3.6,true,false,"Ralentí de banco con consumidores auxiliares"],
 ["R05","fuel",11,20,2.2,false,false,"Comparación con mayor demanda"],
 ["R06","sensor",24,22,3.5,false,true,"Banco con mismo estímulo de referencia"],
 ["R07","air",16,4,3.3,true,false,"Dos regímenes de medición"],
 ["R08","fuel",15,29,2.5,false,false,"Demanda progresiva de banco"],
 ["R09","sensor",19,21,3.7,false,true,"Referencia independiente reproducida"]
];
export const DTC_HOLDOUT_CASES=Object.freeze(caseData.map(([id,cause,idle,load,pressure,leak,sensor,condition])=>Object.freeze({
 id,condition,cause,idle,load,pressure,leak,sensor
})));
const hypotheses=Object.freeze({air:"Entrada de aire no medida",fuel:"Suministro insuficiente",sensor:"Lectura sesgada de sensor",undetermined:"No concluyente"});
const verdicts=Object.freeze({normal:"Dentro de la referencia del banco",abnormal:"Fuera de referencia o discrepancia confirmada",uncertain:"Sin predicción suficiente"});
const discriminator=Object.freeze({air:"leak",fuel:"pressure",sensor:"sensor"});
const get=id=>{const c=DTC_HOLDOUT_CASES.find(x=>x.id===id);if(!c)throw RangeError("Caso de transferencia inexistente");return c;};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const comma=n=>n.toFixed(1).replace(".",",");
export function dtcHoldoutReading(id,test){
 const c=get(id);
 if(test==="trims")return "Correcciones estimadas (modelo): ralentí +"+c.idle+" %; demanda +"+c.load+" %. Requieren contraste independiente.";
 if(test==="pressure")return "Presión sintética bajo demanda: "+comma(c.pressure)+" bar; referencia interna 3,3–3,7 bar (NO OEM).";
 if(test==="leak")return c.leak?"Contraste simulado de admisión: indicio de aire no medido replicado.":"Contraste simulado de admisión: sin indicios de aire no medido.";
 if(test==="sensor")return c.sensor?"Referencia independiente: señal discrepante y reproducible.":"Referencia independiente: señal plausible bajo estímulo de banco.";
 throw RangeError("Ensayo desconocido");
}
export function freezeDtcHoldout({caseId,hypothesis,firstTest,expectedObservation}={}){
 get(caseId);
 if(!Object.hasOwn(hypotheses,hypothesis)||!DTC_TESTS.some(t=>t.id===firstTest)||!Object.hasOwn(verdicts,expectedObservation))
  throw RangeError("Congelá hipótesis, primera prueba y predicción");
 return Object.freeze({caseId,hypothesis,firstTest,expectedObservation});
}
export function dtcHoldoutObservedClass(id,test){
 const c=get(id);
 if(test==="trims")return "uncertain"; // A correction alone is not a mechanism discriminator.
 if(test==="pressure")return c.pressure<3.3||c.pressure>3.7?"abnormal":"normal";
 if(test==="leak")return c.leak?"abnormal":"normal";
 if(test==="sensor")return c.sensor?"abnormal":"normal";
 throw RangeError("Ensayo desconocido");
}
export function gradeDtcHoldout({caseId,prior,measurements,diagnosis,decisiveTest,falsifier,reasoning,alternative}={}){
 const c=get(caseId),frozen=freezeDtcHoldout(prior);
 if(frozen.caseId!==caseId)throw RangeError("El plan congelado pertenece a otro caso");
 const permitted=DTC_TESTS.map(x=>x.id);
 if(!Array.isArray(measurements)||measurements.length!==4||measurements[0]!==frozen.firstTest||new Set(measurements).size!==4||measurements.some(x=>!permitted.includes(x)))
  throw RangeError("Revelá las cuatro pruebas con la primera planificada");
 if(!Object.hasOwn(DTC_FALSIFIERS,diagnosis)||!permitted.includes(decisiveTest)||!Number.isInteger(falsifier)||falsifier<0||falsifier>2)
  throw RangeError("Completá conclusión, contraste y posible refutación");
 if(typeof reasoning!=="string"||!reasoning.trim()||typeof alternative!=="string"||!alternative.trim())throw RangeError("Registrá razonamiento y alternativa; ninguno es corregido automáticamente");
 const causal=diagnosis===c.cause,discriminated=decisiveTest===discriminator[c.cause],falsified=falsifier===DTC_FALSIFIERS[diagnosis].answer;
 const score=50*Number(causal)+25*Number(discriminated)+25*Number(falsified);
 const predictionMatched=frozen.expectedObservation===dtcHoldoutObservedClass(caseId,frozen.firstTest);
 return Object.freeze({score,passed:score===100,causal,discriminated,falsified,predictionMatched,
  initial:frozen.hypothesis,changed:frozen.hypothesis!==diagnosis,expected:c.cause,
  qualitativeReview:"pending",scope:"Entrenamiento sintético, no competencia física"});
}
/** Rotate only through well-formed records of this specific lesson. */
export function nextDtcHoldoutIndex(history=[]){
 if(!Array.isArray(history))return 0;
 for(let i=history.length-1;i>=0;i--){
  const entry=history[i];if(entry?.id!==DTC_HOLDOUT_ID||typeof entry.report!=="string")continue;
  try{
   const report=JSON.parse(entry.report),idx=DTC_HOLDOUT_CASES.findIndex(c=>c.id===report.caseId);
   if(report.rubric===DTC_HOLDOUT_ID&&idx>=0)return(idx+1)%DTC_HOLDOUT_CASES.length;
  }catch{ /* malformed historical record: ignore */ }
 }
 return 0;
}
export function mountDtcHoldout(root,{record,history=[],onSaved=()=>{}}={}){
 if(!root||typeof record!=="function")throw Error("Se necesita guardado durable para la transferencia");
 let idx=nextDtcHoldoutIndex(history),prior=null,measurements=[],result=null,busy=false,reasoning="",alternative="";
 const $=id=>root.querySelector("#"+id);
 const select=(id,title,options,disabled=false)=>"<label for='"+id+"'>"+title+"</label><select class='field' id='"+id+"' "+(disabled?"disabled":"")+"><option value=''>Elegí</option>"+
  options.map(([value,label])=>"<option value='"+esc(value)+"'>"+esc(label)+"</option>").join("")+"</select>";
 const initial=()=>{
  const c=DTC_HOLDOUT_CASES[idx];
  return "<section class='panel stack' aria-label='Transferencia DTC independiente'><h3>Caso reservado: diagnóstico sin solución a la vista</h3>"+
   "<p>Banco "+esc(c.id)+". Condición: "+esc(c.condition)+". El monitor sintético registró P0171; no se conoce la causa. Este caso <strong>no fue mostrado en la lección guiada</strong>.</p>"+
   "<p class='muted small'>No se asume un vehículo real; las referencias son internas del simulador. La primera hipótesis puede ser incorrecta: actualizarla tras los datos no penaliza.</p>";
 };
 const render=()=>{
  if(!prior){
   root.innerHTML=initial()+select("dtc-h-prior","Hipótesis inicial, sin nota",Object.entries(hypotheses))+
    select("dtc-h-first","Primera prueba que realizarías",DTC_TESTS.map(x=>[x.id,x.label]))+
    select("dtc-h-predict","Qué resultado esperás de esa primera prueba",Object.entries(verdicts))+
    "<button class='button' type='button' data-dtc-h='freeze'>Congelar plan antes de ver evidencia</button>"+
    "<p id='dtc-h-status' role='status' aria-live='polite'></p></section>";return;
  }
  root.innerHTML=initial()+"<p id='dtc-h-frozen'><strong>Plan bloqueado:</strong> "+esc(hypotheses[prior.hypothesis])+"; primera prueba: "+esc(prior.firstTest)+"; predicción: "+esc(verdicts[prior.expectedObservation])+".</p>"+
   "<p class='muted small'>Corregir una predicción después de observar evidencia es aprendizaje; la predicción previa queda registrada por separado.</p>"+
   select("dtc-h-probe","Próxima medición virtual",DTC_TESTS.filter(x=>!measurements.includes(x.id)).map(x=>[x.id,x.label]),Boolean(result)||measurements.length===4)+
   "<button class='button alt' type='button' data-dtc-h='measure' "+(result||measurements.length===4?"disabled":"")+">Revelar una observación</button>"+
   "<section class='panel stack' id='dtc-h-observed' role='status' aria-live='polite'><strong>Evidencias "+measurements.length+"/4</strong>"+
   (measurements.length?"<ol>"+measurements.map(t=>"<li>"+esc(dtcHoldoutReading(DTC_HOLDOUT_CASES[idx].id,t))+"</li>").join("")+"</ol>":"<p>No se revelaron valores.</p>")+"</section>"+
   (result?"<div id='dtc-h-result' class='result' tabindex='-1' role='status' aria-live='polite'><strong>"+result.score+"/100 · "+(result.passed?"objetivos verificados":"necesita otra investigación")+"</strong>"+
    "<p>Conclusión causal: "+(result.causal?"compatible":"incompatible")+". Prueba más discriminante: "+(result.discriminated?"correcta":"incorrecta")+". Falsador: "+(result.falsified?"correcto":"incorrecto")+".</p>"+
    "<p>La causa del modelo era: "+esc(hypotheses[result.expected])+". Predicción inicial: "+(result.predictionMatched?"coincidió":"no coincidió")+
    " con la primera medición. Hipótesis inicial revisada: "+(result.changed?"sí":"no")+".</p>"+
    "<p>Justificación escrita: "+esc(reasoning)+"</p><p>Alternativa considerada: "+esc(alternative)+"</p>"+
    "<p>La escritura queda pendiente de revisión humana. No se califica su significado ni se certifica capacidad profesional.</p></div>"+
    "<button type='button' class='button alt' data-dtc-h='again'>Resolver otro caso reservado</button>":
    select("dtc-h-diagnosis","Conclusión causal después de observar evidencia",Object.entries(hypotheses).filter(([id])=>id!=="undetermined"))+
    select("dtc-h-decisive","Prueba independiente decisiva para la causa del caso",DTC_TESTS.map(t=>[t.id,t.label]))+
    "<fieldset class='panel' id='dtc-h-falsifier'><legend>¿Qué resultado desmentiría la conclusión elegida?</legend><p>Elegí primero una conclusión.</p></fieldset>"+
    "<label for='dtc-h-why'>Justificá qué evidencia separa tu diagnóstico de una causa competidora</label>"+
    "<textarea class='field' id='dtc-h-why' maxlength='1200' rows='3'></textarea>"+
    "<label for='dtc-h-alternative'>Qué otra causa consideraste y por qué la descartás o mantenés abierta</label>"+
    "<textarea class='field' id='dtc-h-alternative' maxlength='1200' rows='3'></textarea>"+
    "<p class='muted small'>Las dos respuestas abiertas se guardan sin evaluación semántica.</p>"+
    "<button type='button' class='button' data-dtc-h='grade' "+(measurements.length!==4?"disabled":"")+">Entregar diagnóstico independiente</button>")+
   "<p id='dtc-h-status' role='status' aria-live='polite'></p></section>";
 };
 root.addEventListener("change",event=>{
  if(event.target.id==="dtc-h-diagnosis"&&!result){
   const f=$("dtc-h-falsifier"),d=event.target.value;
   f.innerHTML="<legend>¿Qué resultado desmentiría la conclusión elegida?</legend>"+
    (DTC_FALSIFIERS[d]?DTC_FALSIFIERS[d].options.map((txt,i)=>"<label class='option'><input type='radio' name='dtc-h-falsifier' value='"+i+"'>"+esc(txt)+"</label>").join(""):"<p>Elegí primero una conclusión.</p>");
  }
 });
 root.addEventListener("click",async event=>{
  const button=event.target.closest("[data-dtc-h]");if(!button||busy)return;
  const action=button.dataset.dtcH,c=DTC_HOLDOUT_CASES[idx];
  if(action==="freeze"&&!prior){
   try{prior=freezeDtcHoldout({caseId:c.id,hypothesis:$("dtc-h-prior").value,firstTest:$("dtc-h-first").value,expectedObservation:$("dtc-h-predict").value});render();}
   catch(e){$("dtc-h-status").textContent=e.message;}return;
  }
  if(action==="measure"&&prior&&!result){
   const t=$("dtc-h-probe").value;
   if(measurements.length===0&&t!==prior.firstTest){$("dtc-h-status").textContent="La primera medición debe respetar el plan congelado.";return;}
   if(measurements.includes(t)||!DTC_TESTS.some(x=>x.id===t)){$("dtc-h-status").textContent="Seleccioná una medición nueva.";return;}
   measurements.push(t);render();return;
  }
  if(action==="grade"&&prior&&!result){
   const selected=root.querySelector("input[name='dtc-h-falsifier']:checked");
   if(!selected){$("dtc-h-status").textContent="Elegí una posible refutación antes de entregar.";return;}
   reasoning=$("dtc-h-why").value.trim();alternative=$("dtc-h-alternative").value.trim();
   let g;try{g=gradeDtcHoldout({caseId:c.id,prior,measurements,diagnosis:$("dtc-h-diagnosis").value,
    decisiveTest:$("dtc-h-decisive").value,falsifier:Number(selected.value),reasoning,alternative});}
   catch(e){$("dtc-h-status").textContent=e.message;return;}
   busy=true;try{
    await record({id:DTC_HOLDOUT_ID,at:new Date().toISOString(),score:g.score,passed:g.passed,
     hypothesis:"DTC transferencia "+g.expected,conclusion:"Evaluación objetiva "+g.score+"/100",reasoning,
     report:JSON.stringify({rubric:DTC_HOLDOUT_ID,caseId:c.id,prior,measurementsInOrder:measurements,
      observations:measurements.map(test=>({test,value:dtcHoldoutReading(c.id,test)})),
      final:{diagnosis:$("dtc-h-diagnosis").value,decisiveTest:$("dtc-h-decisive").value,falsifier:Number(selected.value)},
      grade:g,reasoning,alternative,qualitativeReview:"pending"})});
    result=g;render();$("dtc-h-result")?.focus({preventScroll:true});onSaved(g);
   }catch(e){$("dtc-h-status").textContent="Guardado no confirmado: "+String(e.message||e);}
   finally{busy=false;}return;
  }
  if(action==="again"&&result){idx=(idx+1)%DTC_HOLDOUT_CASES.length;prior=null;measurements=[];result=null;reasoning="";alternative="";render();}
 });
 render();
}
