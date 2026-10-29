/**
 * Lesson 05, BMS: causal estimation with explicit provenance and uncertainty.
 * Reuses the existing deterministic synthetic-data generator and coulomb counter.
 * Neither the synthetic observations nor the score certify actual cell/pack SOH.
 */
import{BMS_SCENARIOS,generateSyntheticBms,analyzeBms,capacitySohPct}from'./bms-lab.js';
export const BMS_GUIDED_ID="lab-bms-guided-v1";
export const BMS_HOLDOUT_ID="lab-bms-holdout-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const signed=n=>Number(n).toFixed(2).replace(".",",");
const causes=Object.freeze({bias:"Sesgo positivo del sensor de corriente",capacity:"Capacidad útil distinta de la supuesta",initial:"SOC inicial supuesto incorrecto",unknown:"Sin evidencia suficiente"});
export const BMS_BASELINE=Object.freeze([
 {id:"soc",question:"Una celda tiene 3,7 V bajo carga. ¿Alcanza para conocer exactamente su SOC?",
  options:["Sí, la tensión identifica el porcentaje en toda química","No, influyen química, temperatura, carga y relajación","Sí, si se informa también el nombre del fabricante"],answer:1,
  why:"La tensión terminal bajo carga no equivale de forma universal al SOC; se necesita un modelo y condiciones declaradas."},
 {id:"count",question:"Un integrador empieza en 100% y registra 12 Ah extraídos de 60 Ah de capacidad supuesta. ¿Qué estima?",
  options:["20%","88%","80%"],answer:2,
  why:"SOC estimado = 100% − (12/60) × 100 = 80%, solo si SOC inicial, corriente y capacidad son correctos."},
 {id:"bias",question:"Un offset positivo fijo de 0,6 A sostenido una hora provoca...",
  options:["0,6 Ah extra integrados: 1 punto porcentual de error con 60 Ah","Ninguna deriva porque el error se compensa solo","Un diagnóstico demostrado de celda degradada"],answer:0,
  why:"0,6 A × 1 h = 0,6 Ah; dividir por 60 Ah da 1 punto porcentual. El error crece con el tiempo."},
 {id:"soh",question:"Se midieron 48 Ah completos frente a una referencia comparable de 60 Ah. ¿Qué SOH por capacidad resulta?",
  options:["125%","80%","12%"],answer:1,
  why:"SOH por capacidad = 48/60 × 100 = 80%. El cálculo requiere un ensayo comparable, no una estimación de una única tensión."}
].map(q=>Object.freeze({...q,options:Object.freeze(q.options)})));
export function evaluateBmsBaseline(answers={}){
 if(!answers||typeof answers!=="object"||Array.isArray(answers))throw RangeError("Entrada inválida");
 return BMS_BASELINE.map(q=>{
  const a=answers[q.id];if(!Number.isInteger(a)||a<0||a>=q.options.length)throw RangeError("Respondé todas las preguntas");
  return Object.freeze({id:q.id,correct:a===q.answer,selected:a,why:q.why});
 });
}
export function mountBmsBaseline(root){
 if(!root)return;
 root.innerHTML="<section class='panel stack' aria-label='Ideas previas sobre BMS'><h2>Antes de leer: SOC, SOH y sesgo</h2><p>Evaluación conceptual sin nota, sin guardar respuestas.</p>"+
 BMS_BASELINE.map(q=>"<fieldset class='panel'><legend>"+esc(q.question)+"</legend>"+q.options.map((o,i)=>
 "<label class='option'><input type='radio' name='bms-pre-"+q.id+"' value='"+i+"'>"+esc(o)+"</label>").join("")+"</fieldset>").join("")+
 "<button type='button' class='button alt' id='bms-baseline-check'>Comparar ideas</button>"+
 "<div id='bms-baseline-feedback' role='status' aria-live='polite'>Sin revisar.</div></section>";
 root.querySelector("#bms-baseline-check").addEventListener("click",()=>{
  const feedback=root.querySelector("#bms-baseline-feedback");
  try{const answers=Object.fromEntries(BMS_BASELINE.map(q=>{
   const field=root.querySelector("input[name='bms-pre-"+q.id+"']:checked");
   if(!field)throw RangeError("Completá las cuatro ideas previas");
   return[q.id,Number(field.value)];
  }));
  feedback.innerHTML="<h3>Contraste sin nota</h3><ol>"+evaluateBmsBaseline(answers).map(x=>
   "<li><strong>"+(x.correct?"Idea compatible":"Idea por revisar")+"</strong>: "+esc(x.why)+"</li>").join("")+"</ol><p>Este chequeo no acredita habilidades instrumentales.</p>";
  }catch(e){feedback.textContent=e.message;}
 });
}
export function bmsTheoryIllustration(){
 return "<section class='panel stack' aria-label='BMS: ejercicio científico resuelto'><h2>Ejemplo resuelto: estimación, no medida directa</h2><ol>"+
 "<li><strong>Definí convención:</strong> corriente positiva durante descarga. SOC inicial supuesto 100%, capacidad supuesta 60 Ah, 12 A durante 3600 s = 12 Ah; SOC calculado 80%.</li>"+
 "<li><strong>Planteá un contraste:</strong> si el sensor agrega +0,6 A de error, integra 12,6 Ah y predice 79%; si una referencia ideal verifica 12 Ah, el sesgo acumulado es −1 punto porcentual.</li>"+
 "<li><strong>Alternativa de capacidad:</strong> si el circuito entrega realmente 12 Ah de una capacidad útil de 48 Ah, parte desde 100% y termina en 75%, aunque el estimador fijado en 60 Ah diga 80%. Un desacuerdo no permite atribuir culpa a un sensor sin otra prueba.</li>"+
 "<li><strong>Diferenciá SOH:</strong> 48/60 = 80% de SOH por <em>capacidad completa comparable</em>. El SOC instantáneo de esa celda puede ser 75%, 80% o cualquier otro valor; SOH no es su SOC.</li>"+
 "<li><strong>Refutá:</strong> compará corriente contra referencia independiente, capacidad útil con protocolo completo y punto inicial validado. La tensión terminal bajo carga no reemplaza estos controles.</li></ol>"+
 "<p class='muted small'>Cálculos algebraicos y datos sintetizados. No abrir packs HV, no realizar descargas completas reales ni diagnosticar un vehículo a partir de esta lección. Los modelos electroquímicos avanzados se exploran con el compañero PyBaMM existente.</p></section>";
}
/** Guided calculations reuse the academy BMS analyzer, not a new simulator. */
export function bmsGuidedOutcome(scenarioId){
 const d=generateSyntheticBms(scenarioId),r=analyzeBms(d.rows,{capacityAh:60,initialSocPct:100});
 const cause=scenarioId==="bias"?"bias":scenarioId==="aged"?"capacity":"nominal";
 return Object.freeze({scenarioId,cause,estimatedSoc:r.finalSocPct,referenceSoc:r.referenceSocPct,
  gapPp:r.finalErrorPp,dischargeAh:r.dischargeAh});
}
export function gradeBmsGuided({scenarioId,plannedGap,finalCause,reasoning,alternative}={}){
 const c=bmsGuidedOutcome(scenarioId);
 if(!Number.isFinite(plannedGap)||Math.abs(plannedGap)>100||!["nominal","bias","capacity"].includes(finalCause)||
 typeof reasoning!=="string"||!reasoning.trim()||typeof alternative!=="string"||!alternative.trim())
 throw RangeError("Completá predicción de error, conclusión, justificación y alternativa");
 const numeric=Math.abs(plannedGap-c.gapPp)<=0.2,causal=finalCause===c.cause;
 return Object.freeze({score:50*Number(numeric)+50*Number(causal),passed:numeric&&causal,
  numeric,causal,expected:c,qualitativeReview:"pending",limit:"Solo datos sintéticos"});
}
const scenarios=Object.freeze([
 ["B01","bias",60,0.6,100,"La curva estimada se separa levemente de una referencia"],
 ["B02","capacity",48,0,100,"Dos curvas de carga declaradas no coinciden al final"],
 ["B03","initial",60,0,95,"Existe un desvío persistente entre referencia y estimador"],
 ["B04","bias",60,1.2,100,"Se observa una divergencia acumulada progresiva"],
 ["B05","capacity",50,0,100,"El error del estimador aparece durante una descarga comparada"],
 ["B06","initial",60,0,92,"Una curva mantiene offset respecto de otra"],
 ["B07","bias",60,-0.6,100,"Las curvas sintetizadas divergen ligeramente a lo largo del tiempo"],
 ["B08","capacity",54,0,100,"Los resultados nominales no coinciden con la referencia sintética"],
 ["B09","initial",60,0,97,"La estimación parte de un punto inicial incierto"]
].map(([id,cause,capacityAh,biasA,trueInitialSoc,condition])=>
 Object.freeze({id,cause,capacityAh,biasA,trueInitialSoc,condition})));
export const BMS_HOLDOUT_CASES=scenarios;
const tests=Object.freeze([
 {id:"sensor",label:"Comparar corriente registrada contra patrón de corriente ficticio"},
 {id:"capacity",label:"Comparar prueba sintética de capacidad completa y referencia"},
 {id:"initial",label:"Contrastar punto inicial con referencia ideal independiente"},
 {id:"trajectory",label:"Integrar carga y contrastar las dos curvas al final"}
].map(x=>Object.freeze(x)));
export const BMS_HOLDOUT_TESTS=tests;
export const BMS_HOLDOUT_FALSIFIERS=Object.freeze({
 bias:Object.freeze({options:Object.freeze([
  "La corriente leída difiere sistemáticamente de la referencia",
  "La corriente medida coincide con patrón independiente, pero difiere la capacidad completa comprobada",
  "El error de integración crece con el tiempo"
 ]),answer:1}),
 capacity:Object.freeze({options:Object.freeze([
  "La capacidad completa coincide con 60 Ah, pero un patrón muestra offset de corriente",
  "La prueba completa registra menos de 60 Ah",
  "Una curva difiere de otra al final"
 ]),answer:0}),
 initial:Object.freeze({options:Object.freeze([
  "La referencia independiente inicial coincide con el punto que asumió el estimador, pero aparece un sesgo corriente",
  "La referencia independiente inicial difiere del estimador",
  "Una curva tiene desplazamiento constante"
 ]),answer:0})
});
const decisive=Object.freeze({bias:"sensor",capacity:"capacity",initial:"initial"});
const get=id=>{const c=BMS_HOLDOUT_CASES.find(x=>x.id===id);if(!c)throw RangeError("Caso BMS inexistente");return c;};
export function bmsHoldoutModel(id){
 const c=get(id),d=generateSyntheticBms("nominal");
 const rows=d.rows.map(r=>Object.freeze({t_s:r.t_s,current_a:12+c.biasA,
  voltage_v:r.voltage_v,soc_reference_pct:c.trueInitialSoc-100*(12*r.t_s/3600)/c.capacityAh}));
 const r=analyzeBms(rows,{capacityAh:60,initialSocPct:100});
 return Object.freeze({estimatedSoc:r.finalSocPct,referenceSoc:r.referenceSocPct,gapPp:r.finalErrorPp,
  usedAh:r.dischargeAh,sohPct:capacitySohPct(c.capacityAh,60)});
}
export function bmsHoldoutReading(id,test){
 const c=get(id),r=bmsHoldoutModel(id);
 if(test==="sensor")return "Patrón independiente ideal: 12,00 A. Lectura del estimador: "+signed(12+c.biasA)+" A. Sesgos reales exigirían calibración y trazabilidad.";
 if(test==="capacity")return "Ensayo sintético completo comparable: "+signed(c.capacityAh)+" Ah útiles frente a 60,00 Ah de referencia. No se puede inferir SOH real de un tramo de descarga parcial.";
 if(test==="initial")return "Patrón independiente del inicio: "+signed(c.trueInitialSoc)+"% SOC; estimador inicial fijado en 100,00%. Validar este dato en celdas reales no es trivial.";
 if(test==="trajectory")return "Después de 1,00 h a 12,00 A físicos, el estimador entrega "+signed(r.estimatedSoc)+"%; referencia verdadera ficticia "+signed(r.referenceSoc)+"%. Compará el error con las alternativas.";
 throw RangeError("Prueba BMS desconocida");
}
export function freezeBmsHoldout({caseId,hypothesis,firstTest,predictedGapPp}={}){
 get(caseId);
 if(!Object.hasOwn(causes,hypothesis)||!tests.some(x=>x.id===firstTest)||
 !Number.isFinite(predictedGapPp)||Math.abs(predictedGapPp)>100)throw RangeError("Congelá hipótesis, primera prueba y error previsto");
 return Object.freeze({caseId,hypothesis,firstTest,predictedGapPp});
}
export function gradeBmsHoldout({caseId,prior,measurements,observedGapPp,diagnosis,decisiveTest,falsifier,reasoning,alternative}={}){
 const c=get(caseId),p=freezeBmsHoldout(prior),model=bmsHoldoutModel(caseId);
 if(p.caseId!==caseId)throw RangeError("El plan pertenece a otro caso");
 if(!Array.isArray(measurements)||measurements.length!==4||measurements[0]!==p.firstTest||
  new Set(measurements).size!==4||measurements.some(x=>!tests.some(t=>t.id===x)))
 throw RangeError("Necesitás cuatro observaciones únicas, empezando por el ensayo comprometido");
 if(!Number.isFinite(observedGapPp)||Math.abs(observedGapPp)>100||!Object.hasOwn(BMS_HOLDOUT_FALSIFIERS,diagnosis)||
 !tests.some(t=>t.id===decisiveTest)||!Number.isInteger(falsifier)||falsifier<0||falsifier>2)
 throw RangeError("Completá error calculado, mecanismo, contraste y posible falsación");
 if(typeof reasoning!=="string"||!reasoning.trim()||typeof alternative!=="string"||!alternative.trim())
 throw RangeError("Justificá una evidencia y una alternativa; el texto no se corrige automáticamente");
 const numeric=Math.abs(observedGapPp-model.gapPp)<=0.2,causal=diagnosis===c.cause,
  discriminated=decisiveTest===decisive[c.cause],falsified=falsifier===BMS_HOLDOUT_FALSIFIERS[diagnosis].answer;
 const score=35*Number(numeric)+45*Number(causal)+10*Number(discriminated)+10*Number(falsified);
 return Object.freeze({score,passed:score===100,numeric,causal,discriminated,falsified,
  expected:{cause:c.cause,gapPp:model.gapPp},changed:p.hypothesis!==diagnosis,
  initial:p.hypothesis,qualitativeReview:"pending",disclaimer:"Banco virtual. Sin certificación SOH/seguridad/diagnóstico OEM"});
}
export function nextBmsHoldoutIndex(history=[]){
 if(!Array.isArray(history))return 0;
 for(let i=history.length-1;i>=0;i--){
  const entry=history[i];if(entry?.id!==BMS_HOLDOUT_ID||typeof entry.report!=="string")continue;
  try{const obj=JSON.parse(entry.report),index=BMS_HOLDOUT_CASES.findIndex(x=>x.id===obj.caseId);
   if(obj.rubric===BMS_HOLDOUT_ID&&index>=0)return(index+1)%BMS_HOLDOUT_CASES.length;
  }catch{/* corrupt historic record: ignore */}
 }return 0;
}
function select(id,label,choices){
 return "<label for='"+id+"'>"+esc(label)+"</label><select class='field' id='"+id+"'><option value=''>Elegí</option>"+
 choices.map(([v,t])=>"<option value='"+esc(v)+"'>"+esc(t)+"</option>").join("")+"</select>";
}
export function mountBmsGuided(root,{record,onSaved=()=>{}}={}){
 if(!root||typeof record!=="function")throw Error("No hay almacenamiento BMS");
 let scenarioId="nominal",prior=null,revealed=false,result=null,busy=false;
 const $=id=>root.querySelector("#"+id);
 const render=()=>{
  const scenario=BMS_SCENARIOS.find(x=>x.id===scenarioId);
  root.innerHTML="<section class='panel stack' aria-label='BMS guiado con conteo de carga'><h3>Banco BMS: referencia, sesgo y capacidad</h3>"+
   (!prior?select("bms-g-scenario","Ejemplo guiado",BMS_SCENARIOS.map(c=>[c.id,c.title]))+
    "<p>"+esc(scenario.description)+"</p>"+
    "<label for='bms-g-pred'>Predecí diferencia final estimación − referencia (puntos porcentuales)</label><input id='bms-g-pred' type='number' step='any' class='field'/>"+
    "<button class='button' type='button' data-bms-g='freeze'>Congelar predicción antes de resolver</button>":
    "<p id='bms-g-locked'>Predicción inicial bloqueada: "+signed(prior)+" puntos porcentuales.</p>"+
    "<p>Modelo integrado desde el motor `bms-lab.js`, no datos vehiculares.</p>"+
    (revealed?"<p id='bms-g-observed'>SOC estimado: "+signed(bmsGuidedOutcome(scenarioId).estimatedSoc)+"%; referencia simulada: "+
     signed(bmsGuidedOutcome(scenarioId).referenceSoc)+"%. Error observado: "+signed(bmsGuidedOutcome(scenarioId).gapPp)+" puntos.</p>":
     "<button class='button alt' type='button' data-bms-g='reveal'>Revelar resultado calculado</button>")+
    (!revealed?"":result?"<div id='bms-g-result' role='status' aria-live='polite'><strong>"+result.score+"/100</strong><p>La explicación escrita sigue pendiente de revisión humana.</p></div>":
    select("bms-g-cause","Mecanismo que explica el caso",Object.entries({nominal:"Modelo nominal consistente",bias:causes.bias,capacity:causes.capacity}))+
    "<label for='bms-g-reason'>Justificá usando las cantidades observadas</label><textarea class='field' id='bms-g-reason' rows='3' maxlength='1200'></textarea>"+
    "<label for='bms-g-alternative'>Qué otra causa investigaste</label><textarea class='field' id='bms-g-alternative' rows='3' maxlength='1200'></textarea>"+
    "<button class='button' type='button' data-bms-g='save'>Guardar evidencia guiada</button>"))+
   "<p id='bms-g-status' role='status' aria-live='polite'></p>"+
   "<p class='muted small'>Un número perfecto dentro de un modelo sintético NO verifica un estado electroquímico real ni seguridad HV.</p></section>";
   if(!prior&&scenarioId!=="nominal")$("bms-g-scenario").value=scenarioId;
 };
 root.addEventListener("change",e=>{if(e.target.id==="bms-g-scenario"&&!prior){scenarioId=e.target.value;render();}});
 root.addEventListener("click",async e=>{
  const button=e.target.closest("[data-bms-g]");if(!button||busy)return;
  if(button.dataset.bmsG==="freeze"&&!prior){
   const raw=$("bms-g-pred").value;
   if(!raw||!Number.isFinite(Number(raw))||Math.abs(Number(raw))>100){$("bms-g-status").textContent="Indicá la predicción numérica antes de revelar.";return;}
   prior=Number(raw);render();return;
  }
  if(button.dataset.bmsG==="reveal"&&prior!==null){revealed=true;render();return;}
  if(button.dataset.bmsG==="save"&&revealed&&!result){
   const reasoning=$("bms-g-reason").value.trim(),alternative=$("bms-g-alternative").value.trim();
   let grade;try{grade=gradeBmsGuided({scenarioId,plannedGap:prior,finalCause:$("bms-g-cause").value,reasoning,alternative});}
   catch(error){$("bms-g-status").textContent=error.message;return;}
   busy=true;try{
    await record({id:BMS_GUIDED_ID,at:new Date().toISOString(),score:grade.score,passed:grade.passed,
     hypothesis:"Práctica guiada BMS "+scenarioId,conclusion:"Nota objetiva "+grade.score+"/100",reasoning,
     report:JSON.stringify({rubric:BMS_GUIDED_ID,scenarioId,initialPredictionGapPp:prior,
      observations:grade.expected,final:{cause:$("bms-g-cause").value},grade,reasoning,alternative,qualitativeReview:"pending"})});
    result=grade;render();onSaved(grade);
   }catch(error){$("bms-g-status").textContent="Guardado no confirmado: "+String(error.message||error);}
   finally{busy=false;}
  }
 });render();
}
export function mountBmsHoldout(root,{record,history=[],onSaved=()=>{}}={}){
 if(!root||typeof record!=="function")throw Error("No hay almacenamiento de transferencia");
 let idx=nextBmsHoldoutIndex(history),prior=null,measurements=[],result=null,why="",alternative="",busy=false;
 const $=id=>root.querySelector("#"+id),c=()=>BMS_HOLDOUT_CASES[idx];
 const render=()=>{
  root.innerHTML="<section class='panel stack' aria-label='Investigación BMS reservada'><h3>Caso reservado: estimación divergente de SOC</h3>"+
   "<p>Banco "+c().id+". "+esc(c().condition)+". Estimador con 60 Ah y 100% inicial; una referencia sintética no divulgada permite contrastar hipótesis.</p>"+
   (!prior?
    select("bms-h-prior","Hipótesis inicial",Object.entries(causes))+
    select("bms-h-first","Primera prueba discriminante",tests.map(t=>[t.id,t.label]))+
    "<label for='bms-h-forecast'>Pronóstico de error final (puntos porcentuales; estimación menos referencia)</label>"+
    "<input class='field' type='number' step='any' min='-100' max='100' id='bms-h-forecast'/>"+
    "<button class='button' type='button' data-bms-h='freeze'>Congelar hipótesis y pronóstico</button>":
    "<p id='bms-h-locked'>Hipótesis registrada: "+esc(causes[prior.hypothesis])+"; primera prueba "+esc(prior.firstTest)+
     "; error previsto "+signed(prior.predictedGapPp)+" puntos.</p>"+
    select("bms-h-next","Próxima observación virtual",tests.filter(t=>!measurements.includes(t.id)).map(t=>[t.id,t.label]))+
    "<button class='button alt' type='button' data-bms-h='measure' "+(measurements.length===4||result?"disabled":"")+">Revelar dato del banco</button>"+
    "<div class='panel stack' id='bms-h-observations' role='status' aria-live='polite'><strong>"+measurements.length+"/4 pruebas</strong>"+
    (measurements.length?"<ol>"+measurements.map(t=>"<li>"+esc(bmsHoldoutReading(c().id,t))+"</li>").join("")+"</ol>":"<p>Sin datos revelados.</p>")+"</div>"+
    (result?"<div id='bms-h-result' class='result' tabindex='-1' role='status' aria-live='polite'><strong>"+result.score+"/100</strong>"+
     "<p>Error numérico: "+(result.numeric?"correcto":"incorrecto")+". Mecanismo: "+(result.causal?"correcto":"incorrecto")+
     ". Contraste: "+(result.discriminated?"correcto":"incorrecto")+". Falsación: "+(result.falsified?"correcta":"incorrecta")+".</p>"+
     "<p>Causa modelada: "+esc(causes[result.expected.cause])+". Error del modelo: "+signed(result.expected.gapPp)+" puntos; hipótesis inicial revisada: "+(result.changed?"sí":"no")+".</p>"+
     "<p>Razón: "+esc(why)+"</p><p>Alternativa: "+esc(alternative)+"</p>"+
     "<p>Ambos textos permanecen pendientes de revisión humana, sin nota semántica ni acreditación física.</p></div>"+
     "<button class='button alt' type='button' data-bms-h='again'>Resolver otro caso reservado</button>":
     "<label for='bms-h-gap'>Error final calculado (estimación menos referencia, puntos porcentuales)</label>"+
     "<input class='field' id='bms-h-gap' type='number' min='-100' max='100' step='any'/>"+
     select("bms-h-cause","Conclusión causal después de comparar",Object.entries(causes).filter(([key])=>key!=="unknown"))+
     select("bms-h-decisive","Prueba que más discrimina esa causa",tests.map(t=>[t.id,t.label]))+
     "<fieldset class='panel' id='bms-h-falsifier'><legend>¿Qué observación refutaría tu conclusión?</legend><p>Seleccioná primero una causa.</p></fieldset>"+
     "<label for='bms-h-why'>Justificá y explicitá incertidumbre de medición</label><textarea class='field' id='bms-h-why' maxlength='1200' rows='3'></textarea>"+
     "<label for='bms-h-alt'>Otra hipótesis contrastada</label><textarea class='field' id='bms-h-alt' maxlength='1200' rows='3'></textarea>"+
     "<button type='button' class='button' data-bms-h='grade' "+(measurements.length!==4?"disabled":"")+">Guardar diagnóstico independiente</button>"))+
   "<p id='bms-h-status' role='status' aria-live='polite'></p>"+
   "<p class='muted small'>Un ejercicio no autoriza abrir baterías de alta tensión ni interpretar datos OEM.</p></section>";
 };
 root.addEventListener("change",e=>{
  if(e.target.id==="bms-h-cause"&&!result){
   const q=BMS_HOLDOUT_FALSIFIERS[e.target.value];
   $("bms-h-falsifier").innerHTML="<legend>¿Qué observación refutaría tu conclusión?</legend>"+
    (q?q.options.map((o,i)=>"<label class='option'><input type='radio' name='bms-h-falsifier' value='"+i+"'>"+esc(o)+"</label>").join(""):"<p>Seleccioná primero una causa.</p>");
  }
 });
 root.addEventListener("click",async e=>{
  const btn=e.target.closest("[data-bms-h]");if(!btn||busy)return;
  const action=btn.dataset.bmsH;
  if(action==="freeze"&&!prior){
   if(!$("bms-h-forecast").value){$("bms-h-status").textContent="Pronosticá un error numérico explícito.";return;}
   try{prior=freezeBmsHoldout({caseId:c().id,hypothesis:$("bms-h-prior").value,firstTest:$("bms-h-first").value,
     predictedGapPp:Number($("bms-h-forecast").value)});render();}
   catch(error){$("bms-h-status").textContent=error.message;}return;
  }
  if(action==="measure"&&prior&&!result){
   const test=$("bms-h-next").value;
   if(measurements.length===0&&test!==prior.firstTest){$("bms-h-status").textContent="Respetá primero el ensayo comprometido.";return;}
   if(measurements.includes(test)||!tests.some(t=>t.id===test)){$("bms-h-status").textContent="Seleccioná otra prueba válida.";return;}
   measurements.push(test);render();return;
  }
  if(action==="grade"&&prior&&!result){
   if(!$("bms-h-gap").value){$("bms-h-status").textContent="Calculá el error antes de entregar.";return;}
   const marked=root.querySelector("input[name='bms-h-falsifier']:checked");
   if(!marked){$("bms-h-status").textContent="Seleccioná una observación que refutaría tu hipótesis.";return;}
   why=$("bms-h-why").value.trim();alternative=$("bms-h-alt").value.trim();
   let grade;try{grade=gradeBmsHoldout({caseId:c().id,prior,measurements,observedGapPp:Number($("bms-h-gap").value),
    diagnosis:$("bms-h-cause").value,decisiveTest:$("bms-h-decisive").value,falsifier:Number(marked.value),reasoning:why,alternative});}
   catch(error){$("bms-h-status").textContent=error.message;return;}
   busy=true;try{
    const caseId=c().id;
    await record({id:BMS_HOLDOUT_ID,at:new Date().toISOString(),score:grade.score,passed:grade.passed,
     hypothesis:"BMS transferencia "+grade.expected.cause,conclusion:"Evaluación "+grade.score+"/100",reasoning:why,
     report:JSON.stringify({rubric:BMS_HOLDOUT_ID,caseId,prior,measurementsInOrder:measurements,
      observations:measurements.map(test=>({test,value:bmsHoldoutReading(caseId,test)})),
      final:{gapPp:Number($("bms-h-gap").value),diagnosis:$("bms-h-cause").value,decisiveTest:$("bms-h-decisive").value,
      falsifier:Number(marked.value)},grade,reasoning:why,alternative,qualitativeReview:"pending"})});
    result=grade;render();$("bms-h-result")?.focus({preventScroll:true});onSaved(grade);
   }catch(error){$("bms-h-status").textContent="Guardado no confirmado: "+String(error.message||error);}
   finally{busy=false;}return;
  }
  if(action==="again"&&result){idx=(idx+1)%BMS_HOLDOUT_CASES.length;prior=null;measurements=[];result=null;why="";alternative="";render();}
 });render();
}
