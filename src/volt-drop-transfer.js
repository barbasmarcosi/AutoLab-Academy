/**
 * Reserved low-voltage transfer cases, separate from the guided examples.
 * Correct answers and assumed hidden resistances are disclosed only after
 * committing a full response. Retakes use a different fault localization.
 */
import{voltageDropModel}from"./volt-drop-lesson.js";
export const VOLT_DROP_HOLDOUT_ID="lab-volt-drop-holdout-v2";
export const VOLT_DROP_HOLDOUT_CASES=Object.freeze([
 Object.freeze({id:"balanced",story:"Un circuito didáctico de 12 V alimenta una carga con tensión inferior a la de la fuente. No conocemos las pérdidas de sus conductores. Medí ambos tramos y decidí si alguno concentra claramente la caída o si los resultados obligan a otra interpretación.",
  positiveOhm:0.16,returnOhm:0.15,loadOhm:2.7}),
 Object.freeze({id:"positive",story:"Un consumidor de 12 V funciona débilmente en un banco aislado. La tensión de fuente virtual se mantiene en 12,00 V. Se desconoce en qué tramo aparece la pérdida dominante.",
  positiveOhm:0.62,returnOhm:0.06,loadOhm:2.5}),
 Object.freeze({id:"return",story:"En otro equipo didáctico de 12 V la carga recibe menos tensión de lo esperado. La fuente ideal sigue estable. No disponés de las resistencias ocultas ni de una pieza identificada como culpable.",
  positiveOhm:0.07,returnOhm:0.52,loadOhm:2.8})
]);
// A falsifier is tied to the student's selected diagnosis, not the hidden
// actual fault: otherwise a wrong conclusion could earn points for refuting
// the model's answer instead of the claim the student committed to.
export const VOLT_DROP_FALSIFIERS=Object.freeze({
 balanced:Object.freeze({
  options:Object.freeze([
   "Las caídas de positivo y retorno siguen siendo próximas con la misma carga.",
   "La fuente ideal conserva 12 V en reposo; no se repiten las caídas de los cables.",
   "Una nueva medición bajo la misma carga encuentra una caída claramente dominante en uno de los dos cables."
  ]),answer:2
 }),
 positive:Object.freeze({
  options:Object.freeze([
   "Una nueva medición bajo la misma carga muestra poca caída en positivo y retorno claramente dominante.",
   "La caída del positivo continúa siendo claramente mayor que la del retorno.",
   "La fuente ideal conserva 12 V en reposo, sin datos sobre las caídas bajo carga."
  ]),answer:0
 }),
 return:Object.freeze({
  options:Object.freeze([
   "La fuente ideal conserva 12 V en reposo, sin medir los conductores bajo carga.",
   "Una nueva medición bajo la misma carga muestra poco descenso en retorno y caída claramente dominante en positivo.",
   "El retorno sigue mostrando la caída claramente superior bajo la misma carga."
  ]),answer:1
 })
});
const labels={positive:"tramo positivo",return:"tramo de retorno",balanced:"sin tramo dominante"};
const probeLabels={positive:"positivo A–B",return:"retorno D–E",load:"consumidor B–D"};
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>n.toFixed(2).replace(".",",");
const modelFor=id=>{
 const x=VOLT_DROP_HOLDOUT_CASES.find(x=>x.id===id);
 if(!x)throw RangeError("Caso reservado no identificado");
 return voltageDropModel({sourceV:12,positiveOhm:x.positiveOhm,returnOhm:x.returnOhm,loadOhm:x.loadOhm});
};
export function heldOutVoltageReading(id,probe){
 const m=modelFor(id);
 if(probe==="positive")return m.positiveV;
 if(probe==="return")return m.returnV;
 if(probe==="load")return m.loadV;
 throw RangeError("Puntos del instrumento desconocidos");
}

export function freezeVoltageDropHypothesis({caseId,hypothesis,prediction,firstProbe,confidence="low"}={}){
 modelFor(caseId);
 const hypotheses=["positive","return","balanced","undetermined"];
 if(!hypotheses.includes(hypothesis)||!["positive","return"].includes(firstProbe)||!["low","medium","high"].includes(confidence))
  throw RangeError("Hipótesis inicial, confianza o primer ensayo inválidos");
 const expectedPrediction=hypothesis==="undetermined"?"need-evidence":hypothesis;
 if(prediction!==expectedPrediction)throw RangeError("La predicción debe ser compatible con la hipótesis declarada");
 return Object.freeze({caseId,hypothesis,prediction,firstProbe,confidence});
}
export function compareVoltageDropHypotheses(prior,final,{supported=null}={}){
 if(!prior||!Object.hasOwn(labels,final)||!["positive","return","balanced","undetermined"].includes(prior.hypothesis)||![true,false,null].includes(supported))
  throw RangeError("Revisión de hipótesis incompleta");
 const changed=prior.hypothesis!==final;
 const interpretation=supported===false?
  "La conclusión final no coincide con las mediciones del modelo. "+(changed?"La revisión fue necesaria, pero todavía insuficiente.":"La hipótesis inicial se mantuvo sin respaldo en estas lecturas."):
  prior.hypothesis==="undetermined"?
   (supported?"La evidencia permitió pasar de incertidumbre explícita a una conclusión provisional.":"Se pasó de incertidumbre explícita a una conclusión que todavía debe contrastarse."):
  !changed?
   (supported?"La evidencia fue compatible con la hipótesis congelada.":"Mantuviste la hipótesis inicial; falta contrastar si los datos la sostienen."):
   (supported?"La evidencia contradijo la hipótesis inicial: revisarla es parte del método científico, no un error por sí mismo.":
    "Se revisó la hipótesis inicial; falta determinar si la nueva es compatible con las lecturas.");
 return Object.freeze({initial:prior.hypothesis,final,changed,evidenceSupported:supported,interpretation});
}
export function gradeVoltageDropHoldout({caseId,measurements,loadPrediction,diagnosis,falsifier,prior}){
 const m=modelFor(caseId);
 const frozen=freezeVoltageDropHypothesis({...prior,caseId:prior?.caseId});
 if(frozen.caseId!==caseId)throw RangeError("La hipótesis inicial pertenece a otro caso");
 if(!Array.isArray(measurements)||measurements.length!==2||measurements[0]!==frozen.firstProbe||new Set(measurements).size!==2||!measurements.includes("positive")||!measurements.includes("return"))throw RangeError("Falta respetar el primer ensayo congelado o las dos mediciones independientes");
 const parsed=typeof loadPrediction==="number"?loadPrediction:Number(String(loadPrediction).trim().replace(",","."));
 if(!Number.isFinite(parsed)||parsed<0||parsed>24)throw RangeError("Predicción de tensión inválida");
 if(!Object.hasOwn(labels,diagnosis)||!Number.isInteger(falsifier)||falsifier<0||falsifier>=VOLT_DROP_FALSIFIERS[diagnosis]?.options.length)throw RangeError("Decisiones inválidas");
 const expected=m.positiveV>m.returnV*1.25?"positive":m.returnV>m.positiveV*1.25?"return":"balanced";
 const numeric=Math.abs(parsed-m.loadV)<=0.12;
 const causal=diagnosis===expected;
 const falsified=falsifier===VOLT_DROP_FALSIFIERS[diagnosis].answer;
 const score=(numeric?40:0)+(causal?30:0)+(falsified?30:0);
 return {caseId,score,passed:score===100,prior:frozen,evolution:compareVoltageDropHypotheses(frozen,diagnosis,{supported:causal}),selected:{loadPrediction:parsed,diagnosis,falsifier},
  expected:{loadV:m.loadV,diagnosis:expected,falsifier:VOLT_DROP_FALSIFIERS[diagnosis].answer,positiveV:m.positiveV,returnV:m.returnV},
  numeric,causal,falsified,reason:"La tensión de la carga es la fuente menos ambas caídas bajo la misma condición. La falsación debe buscar una observación incompatible con la hipótesis. Caídas similares NO demuestran que ambos tramos cumplan límites OEM: solo que no hay un dominante relativo en este modelo."};
}
/**
 * Picks a different case after an earlier locally retained v2 submission.
 * Old-rubric or malformed entries cannot steer the selection.
 * This is anti-repetition for offline training, NOT examination security.
 */
export function nextVoltageDropHoldoutIndex(history=[]){
 if(!Array.isArray(history))return 0;
 for(let i=history.length-1;i>=0;i--){
  const entry=history[i];
  if(entry?.id!==VOLT_DROP_HOLDOUT_ID||typeof entry.report!=="string")continue;
  try{
   const data=JSON.parse(entry.report);
   const index=VOLT_DROP_HOLDOUT_CASES.findIndex(x=>x.id===data?.caseId);
   if(index>=0)return (index+1)%VOLT_DROP_HOLDOUT_CASES.length;
  }catch{}
 }
 return 0;
}
export function mountVoltDropHoldout(root,{record,onSaved=()=>{},history=[]}={}){
 if(!root||typeof record!=="function")throw Error("Falta el guardador de evidencia");
 let index=nextVoltageDropHoldoutIndex(history),measurements=new Set(),prior=null,frozenAt=null,readingTrail=[],result=null,saving=false,attempts=0,feedback="",learnerReasoning="";
 const $=id=>root.querySelector("#"+id);
 const render=()=>{
  const scenario=VOLT_DROP_HOLDOUT_CASES[index];
  const header="<section class='panel stack' aria-label='Caso independiente de caída de tensión'>"+
   "<div class='eyebrow'>TRANSFERENCIA · ESCENARIO SIN RESPUESTA ADELANTADA</div>"+
   "<h3>5. De la hipótesis a la evidencia</h3><p>"+esc(scenario.story)+"</p>";
  if(!prior){
   root.innerHTML=header+
    "<p><strong>Momento 1: antes de medir.</strong> Con solo el síntoma, las cuatro opciones son hipótesis provisionales. Si no hay información suficiente, declaralo expresamente. Elegí qué comparación esperás observar y qué tramo vas a medir primero. La respuesta no recibe puntos por acertar antes de investigar.</p>"+
    "<p class='muted small'>Criterio de este banco: un tramo domina si su caída supera en más del 25 % la del otro (relación superior a 1,25). Es una convención didáctica, no un umbral de reparación ni una tolerancia OEM.</p>"+
    "<label for='holdout-initial'>Hipótesis inicial (sin mediciones)</label>"+
    "<select class='field' id='holdout-initial'><option value=''>Elegí una posición provisional</option>"+
    "<option value='positive'>El positivo concentra la pérdida</option>"+
    "<option value='return'>El retorno concentra la pérdida</option>"+
    "<option value='balanced'>Los tramos muestran caídas similares</option>"+
    "<option value='undetermined'>Aún no hay datos para localizar una causa</option></select>"+
    "<label for='holdout-expected'>Predicción que se contrastará</label>"+
    "<select class='field' id='holdout-expected'><option value=''>Elegí qué esperarías observar</option>"+
    "<option value='positive'>Caída positiva claramente superior</option>"+
    "<option value='return'>Caída del retorno claramente superior</option>"+
    "<option value='balanced'>Caídas de ambos tramos similares</option>"+
    "<option value='need-evidence'>No predigo cuál domina: mediré ambos para decidir</option></select>"+
    "<label for='holdout-first'>Primer tramo que medirías, manteniendo la misma carga</label>"+
    "<select class='field' id='holdout-first'><option value='positive'>A–B: positivo</option><option value='return'>D–E: retorno</option></select>"+
    "<label for='holdout-confidence'>Confianza subjetiva antes de ver evidencia (no suma ni resta nota)</label>"+
    "<select class='field' id='holdout-confidence'><option value='low'>Baja</option><option value='medium'>Media</option><option value='high'>Alta</option></select>"+
    "<button type='button' class='button' data-holdout='freeze'>Congelar hipótesis y plan de medición</button>"+
    "<p class='muted small'>Después de congelar podrás medir. No se puede alterar la hipótesis anterior sin iniciar un caso nuevo.</p>"+
    "<p id='holdout-status' role='status' aria-live='polite'></p></section>";
   return;
  }
  root.innerHTML=header+
   "<div class='panel' id='holdout-locked' role='status'><strong>Hipótesis inicial congelada:</strong> "+esc(prior.hypothesis==="undetermined"?"Información insuficiente":labels[prior.hypothesis])+
   " · predicción: "+esc(prior.prediction==="need-evidence"?"comparar los dos cables":labels[prior.prediction])+
   " · primer tramo planificado: "+esc(prior.firstProbe==="positive"?"positivo":"retorno")+
   " · confianza inicial: "+esc({low:"baja",medium:"media",high:"alta"}[prior.confidence])+".</div>"+
   "<p><strong>Momento 2: medí.</strong> Solo ahora se habilita el voltímetro. Registrá ambos cables bajo la misma carga; usá los números para revisar, sostener o descartar tu hipótesis inicial.</p>"+
   "<label for='holdout-probe'>Puntas de tu voltímetro</label>"+
   "<select id='holdout-probe' class='field' "+(result?"disabled":"")+">"+
   "<option value='positive'>A–B: cable positivo</option><option value='return'>D–E: retorno</option></select>"+
   "<button type='button' class='button alt' data-holdout='probe' "+(result?"disabled":"")+">Medir este tramo</button>"+
   "<p role='status' aria-live='polite' id='holdout-measured'>"+esc(feedback||"Todavía no mediste ningún tramo.")+"</p>"+
   "<p class='muted small' id='holdout-history'>"+(readingTrail.length?
    "Lecturas tomadas bajo la misma carga: "+readingTrail.map(x=>esc(probeLabels[x.probe])+": "+fmt(x.volts)+" V").join("; ")+".":"Todavía no hay lecturas.")+"</p>"+
   "<p><strong>Momento 3: decisión revisada.</strong> No se penaliza modificar la hipótesis; importa que la conclusión final sea compatible con la evidencia. La tensión del consumidor NO se puede medir directamente en este desafío: calculala a partir de los 12 V de la fuente y las dos caídas registradas. Se revelará después de entregar.</p>"+
   "<label for='holdout-load'>Calculá la tensión del consumidor usando fuente y ambas caídas (V)</label>"+
   "<input class='field' type='text' inputmode='decimal' id='holdout-load' placeholder='Por ejemplo: 9,45' "+(result?"disabled":"")+">"+
   "<label for='holdout-cause'>Localización final a partir de tus mediciones</label>"+
   "<select id='holdout-cause' class='field' "+(result?"disabled":"")+">"+
   "<option value=''>Elegí según los datos</option><option value='positive'>Positivo</option><option value='return'>Retorno</option><option value='balanced'>Ambas caídas similares</option></select>"+
   "<fieldset class='panel' id='holdout-falsifier-field'><legend>¿Qué observación refutaría la localización final que elegiste?</legend>"+
   (result?VOLT_DROP_FALSIFIERS[result.selected.diagnosis].options.map((o,i)=>"<label class='option'><input type='radio' disabled name='holdout-falsifier' value='"+i+"'>"+esc(o)+"</label>").join(""):
    "<p class='muted' id='holdout-falsifier-hint'>Elegí tu diagnóstico final para ver qué observaciones lo apoyarían o refutarían.</p>")+
   "</fieldset>"+
   (result?"":
    "<label for='holdout-reasoning'>Explicá qué evidencia hizo sostener o revisar la hipótesis inicial y qué la refutaría</label>"+
    "<textarea class='field' id='holdout-reasoning' rows='4' maxlength='1200' aria-describedby='holdout-reasoning-help' placeholder='Comparo ambas caídas, justifico mi localización y describo qué lectura la contradice.'></textarea>"+
    "<p class='muted small' id='holdout-reasoning-help'>El texto queda para revisión humana. No se califica semánticamente ni por cantidad de caracteres.</p>")+
   (result?
    "<div class='result' id='holdout-result' role='status' aria-live='polite' tabindex='-1'>"+
    "<strong>Resultado objetivo del intento "+attempts+" de esta sesión: "+result.score+"/100 · "+(result.passed?"criterios cumplidos":"revisar evidencia")+"</strong>"+
    "<p>Cálculo: "+(result.numeric?"correcto":"incorrecto")+". Tu lectura calculada: "+fmt(result.selected.loadPrediction)+" V; valor del modelo: "+fmt(result.expected.loadV)+" V.</p>"+
    "<p>Localización: "+(result.causal?"correcta":"incorrecta")+". Elegiste "+esc(labels[result.selected.diagnosis])+"; según el modelo: "+esc(labels[result.expected.diagnosis])+".</p>"+
    "<p>Refutación: "+(result.falsified?"correcta":"incorrecta")+". Tu elección: "+esc(VOLT_DROP_FALSIFIERS[result.selected.diagnosis].options[result.selected.falsifier])+". Observación que realmente contradice la hipótesis: "+esc(VOLT_DROP_FALSIFIERS[result.selected.diagnosis].options[result.expected.falsifier])+"</p>"+
    "<p><strong>Comparación con tu hipótesis congelada:</strong> "+esc(result.evolution.interpretation)+
    " Antes: "+esc(prior.hypothesis==="undetermined"?"indeterminado":labels[prior.hypothesis])+
    "; después: "+esc(labels[result.selected.diagnosis])+".</p>"+
    "<p>Mediciones del modelo: positivo "+fmt(result.expected.positiveV)+" V; retorno "+fmt(result.expected.returnV)+" V. "+esc(result.reason)+"</p>"+
    "<details><summary>Revisar mi explicación escrita</summary><p>"+esc(learnerReasoning)+"</p></details>"+
    "<p class='muted'>El argumento está guardado y pendiente de revisión cualitativa humana. La puntuación automática solo considera cálculos y elecciones objetivas del modelo. No acredita competencias físicas.</p></div>":
    "<button class='button' type='button' data-holdout='grade'>Entregar diagnóstico y revelar devolución</button>")+
   "<p id='holdout-status' role='status' aria-live='polite'></p>"+
   (result?"<button class='button alt' type='button' data-holdout='retry'>Practicar un caso diferente</button>":"")+
   "</section>";
 };
 root.addEventListener("change",ev=>{
  if(ev.target.id!=="holdout-cause"||result||!prior)return;
  const choice=ev.target.value,fieldset=$("holdout-falsifier-field");
  if(!fieldset)return;
  const choices=VOLT_DROP_FALSIFIERS[choice];
  fieldset.innerHTML="<legend>¿Qué observación refutaría la localización final que elegiste?</legend>"+
   (choices?choices.options.map((option,i)=>
    "<label class='option'><input type='radio' name='holdout-falsifier' value='"+i+"'>"+esc(option)+"</label>").join(""):
    "<p class='muted' id='holdout-falsifier-hint'>Elegí tu diagnóstico final para ver las opciones.</p>");
  $("holdout-status").textContent="La prueba de refutación se define respecto de tu hipótesis final, no respecto de una respuesta oculta.";
 });
 root.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-holdout]");if(!b||saving)return;
  if(b.dataset.holdout==="freeze"&&!prior&&!result){
   try{
    prior=freezeVoltageDropHypothesis({caseId:VOLT_DROP_HOLDOUT_CASES[index].id,
     hypothesis:$("holdout-initial").value,prediction:$("holdout-expected").value,
     firstProbe:$("holdout-first").value,confidence:$("holdout-confidence").value});
    frozenAt=new Date().toISOString();feedback="";render();$("holdout-probe")?.focus({preventScroll:true});
   }catch(e){$("holdout-status").textContent="Revisá el compromiso inicial: "+String(e.message);}
   return;
  }
  if(b.dataset.holdout==="probe"&&prior&&!result){
   if(!measurements.size&&$("holdout-probe").value!==prior.firstProbe){
    $("holdout-measured").textContent="Primero medí el tramo que congelaste en el plan, y después compará con el otro.";return;
   }
   const probe=$("holdout-probe").value,value=heldOutVoltageReading(VOLT_DROP_HOLDOUT_CASES[index].id,probe);
   measurements.add(probe);
   readingTrail.push({probe,volts:value,recordedAt:new Date().toISOString()});
   feedback="Medición entre los extremos de "+(probe==="positive"?"positivo":probe==="return"?"retorno":"consumidor")+": "+fmt(value)+" V (bajo carga).";
   $("holdout-measured").textContent=feedback;
   $("holdout-history").textContent="Lecturas tomadas bajo la misma carga: "+
    readingTrail.map(x=>probeLabels[x.probe]+": "+fmt(x.volts)+" V").join("; ")+".";
   return;
  }
  if(b.dataset.holdout==="grade"&&!result){
   let g,reasoningText="";
   try{
    const raw=$("holdout-load").value.trim();
    if(!prior)throw Error("Primero congelá una hipótesis y un plan de medida.");
    if(!raw)throw Error("Primero completá la predicción de la carga.");
    reasoningText=$("holdout-reasoning").value.trim();
    if(!reasoningText)throw Error("Escribí una justificación para documentar la hipótesis; no se califica por su longitud.");
    const selected=root.querySelector("[name='holdout-falsifier']:checked");
    if(!selected)throw Error("Elegí también una observación falsadora.");
    g=gradeVoltageDropHoldout({caseId:VOLT_DROP_HOLDOUT_CASES[index].id,measurements:[...measurements],
     loadPrediction:raw,diagnosis:$("holdout-cause").value,falsifier:Number(selected.value),prior});
   }catch(e){$("holdout-status").textContent="Falta evidencia: "+String(e.message);return;}
   saving=true;attempts++;
   try{
    await record({id:VOLT_DROP_HOLDOUT_ID,passed:g.passed,score:g.score,at:new Date().toISOString(),attemptInSession:attempts,
     hypothesis:"Causa localizada: "+g.selected.diagnosis,conclusion:"Evaluación objetiva "+g.score+"/100",
     used:["hipotesis-y-plan-congelados","dos-mediciones-bajo-carga","prediccion-numerica","revision-o-sostenimiento","falsacion","argumento-documentado-sin-nota"],
     reasoning:reasoningText,
     report:JSON.stringify({caseId:g.caseId,initial:{...g.prior,frozenAt},revision:g.evolution,
      measuredInOrder:[...measurements],measurementTrail:readingTrail,selected:g.selected,expected:g.expected,
      firstInThisSession:attempts===1,qualitativeReview:"pending",reasoning:reasoningText})});
    learnerReasoning=reasoningText;result=g;feedback="";render();$("holdout-result")?.focus({preventScroll:true});onSaved(g);
   }catch(e){attempts--;$("holdout-status").textContent="No se confirmó el guardado: "+String(e.message||e);}
   finally{saving=false;}
   return;
  }
  if(b.dataset.holdout==="retry"&&result){
   index=(index+1)%VOLT_DROP_HOLDOUT_CASES.length;measurements=new Set();prior=null;frozenAt=null;readingTrail=[];result=null;feedback="";learnerReasoning="";render();
  }
 });
 render();
}
