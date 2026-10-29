/**
 * Lesson 03 — held-out synthetic oscilloscope cases.
 * The intent is distinguish physical signal change from instrument display
 * scaling or reference offset. No actual vehicle or mains-ground instruction.
 */
export const SCOPE_HOLDOUT_ID="lab-scope-holdout-v1";
const rows=[
 ["S01","frequency",260,1,0,"La separación horizontal entre crestas difiere de la captura anterior"],
 ["S02","gain",200,2,0,"La forma de onda aparece con una altura diferente en la pantalla"],
 ["S03","reference",200,1,1,"La línea media aparente no coincide con la captura anterior"],
 ["S04","frequency",150,1,0,"Se repite una discrepancia temporal en una nueva captura del banco"],
 ["S05","gain",200,0.5,0,"La altura en divisiones difiere de otra captura del mismo banco"],
 ["S06","reference",200,1,-1,"Se observa un desplazamiento vertical sin confirmar su origen"],
 ["S07","frequency",320,1,0,"La separación aparente entre crestas se modificó"],
 ["S08","gain",200,2,0,"La presentación vertical difiere del registro previo"],
 ["S09","reference",200,1,1,"El nivel medio aparente parece cambiar respecto del registro previo"]
];
export const SCOPE_HOLDOUT_CASES=Object.freeze(rows.map(([id,cause,hz,voltsDiv,referenceShift,condition])=>
 Object.freeze({id,cause,hz,voltsDiv,referenceShift,condition})));
const labels=Object.freeze({frequency:"Cambio físico del período de la fuente",gain:"Cambio de V/div (solo pantalla)",reference:"Cambio de referencia/offset aparente",unknown:"Todavía no concluyente"});
export const SCOPE_HOLDOUT_TESTS=Object.freeze([
 {id:"period",label:"Comparar período contra patrón temporal calibrado"},
 {id:"vertical",label:"Contrastar V/div y divisiones pico a pico"},
 {id:"reference",label:"Contrastar nivel medio contra referencia independiente"},
 {id:"source",label:"Medir directamente la salida del generador ficticio"}
].map(t=>Object.freeze(t)));
export const SCOPE_HOLDOUT_FALSIFIERS=Object.freeze({
 frequency:Object.freeze({options:Object.freeze(["La medición calibrada conserva 5 ms de período y solo cambió V/div","El período calibrado difiere de 5 ms en dos referencias","La señal tiene nivel medio de 2,5 V"]),answer:0}),
 gain:Object.freeze({options:Object.freeze(["Cambia la altura en divisiones al variar V/div","Vpp medido con patrón externo cambia mientras V/div y referencia permanecen iguales","La amplitud en voltios se mantiene en 2,4 Vpp"]),answer:1}),
 reference:Object.freeze({options:Object.freeze(["Con referencia fija se demuestra un cambio físico de nivel medio del generador","Se modifica la posición vertical al cambiar la referencia","El período y Vpp permanecen constantes"]),answer:0})
});
const discriminator=Object.freeze({frequency:"period",gain:"vertical",reference:"reference"});
const get=id=>{const c=SCOPE_HOLDOUT_CASES.find(c=>c.id===id);if(!c)throw RangeError("Escenario de osciloscopio desconocido");return c;};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>n.toFixed(2).replace(".",",");
export function scopeHoldoutReading(id,test){
 const c=get(id),period=1000/c.hz;
 if(test==="period")return "Cresta a cresta con reloj calibrado: "+fmt(period)+" ms por ciclo. Referencia inicial 5,00 ms.";
 if(test==="vertical")return "Pantalla: "+fmt(2.4/c.voltsDiv)+" divisiones pico a pico a "+fmt(c.voltsDiv)+" V/div. Vpp físico del generador modelo: 2,40 V.";
 if(test==="reference")return "Nivel medio aparente: "+fmt(2.5+c.referenceShift)+" V respecto de la referencia seleccionada; patrón original 2,50 V.";
 if(test==="source")return "Instrumento patrón ficticio sobre la salida: en 10,00 ms se observan "+fmt(c.hz/100)+" períodos equivalentes; Vpp = 2,40 V (sin cambio físico de amplitud).";
 throw RangeError("Prueba de osciloscopía inválida");
}
export function freezeScopeHoldout({caseId,hypothesis,firstTest,predictedHz}={}){
 get(caseId);
 if(!Object.hasOwn(labels,hypothesis)||!SCOPE_HOLDOUT_TESTS.some(x=>x.id===firstTest)||
 !Number.isFinite(predictedHz)||predictedHz<1||predictedHz>1000)
  throw RangeError("Congelá hipótesis, prueba prevista y frecuencia esperada válida");
 return Object.freeze({caseId,hypothesis,firstTest,predictedHz});
}
export function gradeScopeHoldout({caseId,prior,measurements,observedHz,diagnosis,decisiveTest,falsifier,reasoning,alternative}={}){
 const c=get(caseId),frozen=freezeScopeHoldout(prior);
 if(frozen.caseId!==caseId)throw RangeError("Predicción de otro caso");
 const permitted=SCOPE_HOLDOUT_TESTS.map(x=>x.id);
 if(!Array.isArray(measurements)||measurements.length!==4||measurements[0]!==frozen.firstTest||
  new Set(measurements).size!==4||measurements.some(t=>!permitted.includes(t)))
  throw RangeError("Recorré cuatro pruebas únicas empezando con la que planificaste");
 if(!Number.isFinite(observedHz)||observedHz<1||observedHz>1000||!Object.hasOwn(SCOPE_HOLDOUT_FALSIFIERS,diagnosis)||
  !permitted.includes(decisiveTest)||!Number.isInteger(falsifier)||falsifier<0||falsifier>2)
  throw RangeError("Completá frecuencia, causa, ensayo discriminante y refutación");
 if(typeof reasoning!=="string"||!reasoning.trim()||typeof alternative!=="string"||!alternative.trim())
  throw RangeError("Explicá tu criterio y una causa alternativa, sin nota semántica");
 const numeric=Math.abs(observedHz-c.hz)<=Math.max(3,0.02*c.hz),
  causal=diagnosis===c.cause,
  discriminated=decisiveTest===discriminator[c.cause],
  falsified=falsifier===SCOPE_HOLDOUT_FALSIFIERS[diagnosis].answer;
 const score=40*Number(numeric)+40*Number(causal)+10*Number(discriminated)+10*Number(falsified);
 return Object.freeze({score,passed:score===100,numeric,causal,discriminated,falsified,
  initial:frozen.hypothesis,changed:frozen.hypothesis!==diagnosis,
  expected:{cause:c.cause,frequencyHz:c.hz},qualitativeReview:"pending",
  disclaimer:"Caso simulado. Sin juicio semántico, seguridad instrumental ni acreditación física"});
}
export function nextScopeHoldoutIndex(history=[]){
 if(!Array.isArray(history))return 0;
 for(let i=history.length-1;i>=0;i--){
  const entry=history[i];if(entry?.id!==SCOPE_HOLDOUT_ID||typeof entry.report!=="string")continue;
  try{
   const report=JSON.parse(entry.report),idx=SCOPE_HOLDOUT_CASES.findIndex(c=>c.id===report.caseId);
   if(report.rubric===SCOPE_HOLDOUT_ID&&idx>=0)return(idx+1)%SCOPE_HOLDOUT_CASES.length;
  }catch{/* historical malformed records are ignored */}
 }
 return 0;
}
export function mountScopeHoldout(root,{record,history=[],onSaved=()=>{}}={}){
 if(!root||typeof record!=="function")throw Error("Sin almacenamiento confirmado no hay transferencia");
 let idx=nextScopeHoldoutIndex(history),prior=null,measurements=[],result=null,busy=false,why="",alternative="";
 const $=id=>root.querySelector("#"+id);
 const select=(id,label,values,disabled=false)=>"<label for='"+id+"'>"+esc(label)+"</label><select class='field' id='"+id+"' "+(disabled?"disabled":"")+"><option value=''>Elegí</option>"+values.map(([v,t])=>"<option value='"+esc(v)+"'>"+esc(t)+"</option>").join("")+"</select>";
 const head=()=>"<section class='panel stack' aria-label='Transferencia independiente de osciloscopía'><h3>Investigación independiente: señal o pantalla</h3>"+
  "<p>Banco reservado "+SCOPE_HOLDOUT_CASES[idx].id+". "+esc(SCOPE_HOLDOUT_CASES[idx].condition)+". Partimos de una fuente patrón previa: 200 Hz, 2,40 Vpp y centro aparente 2,50 V.</p>"+
  "<p class='muted small'>La causa nueva está oculta; los números son inventados. Una predicción inicial equivocada se registra, pero no descuenta puntos.</p>";
 const render=()=>{
  if(!prior){
   root.innerHTML=head()+
    select("scope-h-prior","Hipótesis inicial",Object.entries(labels))+
    select("scope-h-first","Primera prueba discriminante",SCOPE_HOLDOUT_TESTS.map(t=>[t.id,t.label]))+
    "<label for='scope-h-pred'>Frecuencia que pronosticás, antes de medir (Hz)</label><input type='number' class='field' id='scope-h-pred' min='1' max='1000' step='any'/>"+
    "<button class='button' type='button' data-scope-h='freeze'>Congelar hipótesis, plan y predicción</button><p id='scope-h-status' role='status' aria-live='polite'></p></section>";return;
  }
  root.innerHTML=head()+"<p id='scope-h-frozen'><strong>Plan congelado:</strong> "+esc(labels[prior.hypothesis])+", primera prueba "+esc(prior.firstTest)+", pronóstico "+fmt(prior.predictedHz)+" Hz.</p>"+
   select("scope-h-probe","Prueba sintética para revelar",SCOPE_HOLDOUT_TESTS.filter(t=>!measurements.includes(t.id)).map(t=>[t.id,t.label]),Boolean(result)||measurements.length===4)+
   "<button class='button alt' type='button' data-scope-h='measure' "+(result||measurements.length===4?"disabled":"")+">Revelar medición</button>"+
   "<div class='panel stack' id='scope-h-observations' role='status' aria-live='polite'><strong>"+measurements.length+"/4 pruebas registradas</strong>"+
   (measurements.length?"<ol>"+measurements.map(t=>"<li>"+esc(scopeHoldoutReading(SCOPE_HOLDOUT_CASES[idx].id,t))+"</li>").join("")+"</ol>":"<p>Los datos todavía no fueron revelados.</p>")+"</div>"+
   (result?"<div class='result' id='scope-h-result' tabindex='-1' role='status' aria-live='polite'><strong>"+result.score+"/100 · "+(result.passed?"criterios objetivos cumplidos":"revisar mediciones")+"</strong>"+
    "<p>Frecuencia: "+(result.numeric?"compatible":"incorrecta")+". Mecanismo: "+(result.causal?"compatible":"incorrecto")+
    ". Prueba discriminante: "+(result.discriminated?"correcta":"incorrecta")+". Falsador: "+(result.falsified?"correcto":"incorrecto")+".</p>"+
    "<p>Causa modelada: "+esc(labels[result.expected.cause])+"; frecuencia "+fmt(result.expected.frequencyHz)+" Hz. Hipótesis inicial revisada: "+(result.changed?"sí":"no")+".</p>"+
    "<p>Justificación pendiente de revisión cualitativa: "+esc(why)+"</p><p>Alternativa considerada: "+esc(alternative)+"</p><p>"+esc(result.disclaimer)+"</p></div>"+
    "<button class='button alt' type='button' data-scope-h='again'>Resolver otra variación</button>":
    "<label for='scope-h-freq'>Frecuencia que calculaste con evidencia (Hz)</label><input class='field' type='number' step='any' min='1' max='1000' id='scope-h-freq'/>"+
    select("scope-h-diagnosis","¿Qué mecanismo explica el cambio observado?",Object.entries(labels).filter(([k])=>k!=="unknown"))+
    select("scope-h-decisive","¿Cuál prueba diferencia mejor ese mecanismo?",SCOPE_HOLDOUT_TESTS.map(t=>[t.id,t.label]))+
    "<fieldset class='panel' id='scope-h-falsifier'><legend>¿Qué observación refutaría tu hipótesis elegida?</legend><p>Elegí primero una conclusión.</p></fieldset>"+
    "<label for='scope-h-why'>Razonamiento: unidades, condiciones y observación que discrimina</label><textarea id='scope-h-why' class='field' maxlength='1200' rows='3'></textarea>"+
    "<label for='scope-h-alt'>Otra hipótesis considerada y cómo la contrastaste</label><textarea id='scope-h-alt' class='field' maxlength='1200' rows='3'></textarea>"+
    "<button class='button' type='button' data-scope-h='grade' "+(measurements.length!==4?"disabled":"")+">Guardar transferencia independiente</button>")+
   "<p id='scope-h-status' role='status' aria-live='polite'></p></section>";
 };
 root.addEventListener("change",e=>{
  if(e.target.id==="scope-h-diagnosis"&&!result){
   const f=$("scope-h-falsifier"),c=e.target.value;
   f.innerHTML="<legend>¿Qué observación refutaría tu hipótesis elegida?</legend>"+
    (SCOPE_HOLDOUT_FALSIFIERS[c]?SCOPE_HOLDOUT_FALSIFIERS[c].options.map((txt,i)=>"<label class='option'><input type='radio' name='scope-h-falsifier' value='"+i+"'>"+esc(txt)+"</label>").join(""):"<p>Elegí primero una conclusión.</p>");
  }
 });
 root.addEventListener("click",async e=>{
  const btn=e.target.closest("[data-scope-h]");if(!btn||busy)return;
  const action=btn.dataset.scopeH,c=SCOPE_HOLDOUT_CASES[idx];
  if(action==="freeze"&&!prior){
   try{prior=freezeScopeHoldout({caseId:c.id,hypothesis:$("scope-h-prior").value,firstTest:$("scope-h-first").value,predictedHz:Number($("scope-h-pred").value)});render();}
   catch(error){$("scope-h-status").textContent=error.message;}return;
  }
  if(action==="measure"&&prior&&!result){
   const probe=$("scope-h-probe").value;
   if(measurements.length===0&&probe!==prior.firstTest){$("scope-h-status").textContent="La primera prueba debe ser la que congelaste.";return;}
   if(measurements.includes(probe)||!SCOPE_HOLDOUT_TESTS.some(t=>t.id===probe)){$("scope-h-status").textContent="Seleccioná una prueba no utilizada.";return;}
   measurements.push(probe);render();return;
  }
  if(action==="grade"&&prior&&!result){
   const selected=root.querySelector("input[name='scope-h-falsifier']:checked");
   if(!selected){$("scope-h-status").textContent="Elegí un resultado falsador.";return;}
   why=$("scope-h-why").value.trim();alternative=$("scope-h-alt").value.trim();
   let evaluation;try{
    evaluation=gradeScopeHoldout({caseId:c.id,prior,measurements,observedHz:Number($("scope-h-freq").value),
     diagnosis:$("scope-h-diagnosis").value,decisiveTest:$("scope-h-decisive").value,
     falsifier:Number(selected.value),reasoning:why,alternative});
   }catch(error){$("scope-h-status").textContent=error.message;return;}
   busy=true;try{
    await record({id:SCOPE_HOLDOUT_ID,at:new Date().toISOString(),score:evaluation.score,passed:evaluation.passed,
     hypothesis:"Osciloscopía "+evaluation.expected.cause,conclusion:"Evaluación objetiva "+evaluation.score+"/100",reasoning:why,
     report:JSON.stringify({rubric:SCOPE_HOLDOUT_ID,caseId:c.id,prior,measurementsInOrder:measurements,
      observations:measurements.map(test=>({test,value:scopeHoldoutReading(c.id,test)})),
      final:{observedHz:Number($("scope-h-freq").value),diagnosis:$("scope-h-diagnosis").value,
       decisiveTest:$("scope-h-decisive").value,falsifier:Number(selected.value)},
      grade:evaluation,reasoning:why,alternative,qualitativeReview:"pending"})});
    result=evaluation;render();$("scope-h-result")?.focus({preventScroll:true});onSaved(evaluation);
   }catch(error){$("scope-h-status").textContent="Guardado no confirmado: "+String(error.message||error);}
   finally{busy=false;}return;
  }
  if(action==="again"&&result){idx=(idx+1)%SCOPE_HOLDOUT_CASES.length;prior=null;measurements=[];result=null;why="";alternative="";render();}
 });
 render();
}
