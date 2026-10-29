/**
 * Lesson 04 reserved CAN diagnosis on fully synthetic, isolated bench data.
 * There is no interface for transmitting frames, wiring, energizing or probing.
 */
import{canArbitrationModel}from'./can-lesson.js';
export const CAN_HOLDOUT_ID="lab-can-holdout-v1";
const rows=[
 ["N01","termination",120,12,1.7,"Observaciones con retrasos y pérdidas de tramas ficticias"],
 ["N02","supply",60,0,2.0,"Un nodo no responde; otros intercambian tramas"],
 ["N03","arbitration",60,12,2.0,"Retraso de un emisor bajo tráfico simultáneo"],
 ["N04","termination",40,12,1.6,"Recepciones intermitentes bajo una condición no identificada"],
 ["N05","supply",60,0,2.1,"Nodo silencioso; red restante estable"],
 ["N06","arbitration",60,12,1.9,"Tramas de un emisor aparecen más tarde de lo previsto"],
 ["N07","termination",120,12,1.8,"Tasa variable de recepción de una trama sintética"],
 ["N08","supply",60,0,2.0,"Comprobación de transmisor no participativo"],
 ["N09","arbitration",60,12,2.0,"En ocasiones aumenta el intervalo entre mensajes del mismo emisor"]
];
export const CAN_HOLDOUT_CASES=Object.freeze(rows.map(([id,cause,resistanceOhm,nodeSupplyV,differentialV,condition])=>
 Object.freeze({id,cause,resistanceOhm,nodeSupplyV,differentialV,condition})));
export const CAN_HOLDOUT_TESTS=Object.freeze([
 {id:"termination",label:"Modelo de terminación en red desconectada"},
 {id:"supply",label:"Referencia virtual independiente de alimentación del nodo"},
 {id:"differential",label:"Estados diferenciales sintéticos, H y L"},
 {id:"traffic",label:"Log de actividad y arbitraje del banco"}
].map(x=>Object.freeze(x)));
export const CAN_HOLDOUT_FALSIFIERS=Object.freeze({
 termination:Object.freeze({options:Object.freeze([
  "La resistencia sintética permanece en 120 Ω con extremo ausente",
  "El banco aislado confirma 60 Ω estable, pero falta alimentación del nodo",
  "Una trama se retransmite después de perder el arbitraje"
 ]),answer:1}),
 supply:Object.freeze({options:Object.freeze([
  "La alimentación está estable en el nodo y se confirma ausencia de terminador",
  "La alimentación permanece ausente en la referencia virtual",
  "El bus muestra tráfico ajeno al nodo"
 ]),answer:0}),
 arbitration:Object.freeze({options:Object.freeze([
  "Un emisor con ID superior reintenta tras perder arbitraje sin errores",
  "Se conserva la tensión diferencial del banco",
  "La captura independiente demuestra errores físicos repetibles o pérdida de alimentación"
 ]),answer:2})
});
const names=Object.freeze({termination:"Terminación diferente de referencia (modelo)",supply:"Alimentación ausente en el nodo",arbitration:"Arbitraje normal, no defecto",unknown:"Aún no hay conclusión"});
const discriminators=Object.freeze({termination:"termination",supply:"supply",arbitration:"traffic"});
const arbitrationPairs=Object.freeze({N03:[0x080,0x120],N06:[0x140,0x080],N09:[0x180,0x300]});
const get=id=>{const c=CAN_HOLDOUT_CASES.find(c=>c.id===id);if(!c)throw RangeError("Caso reservado CAN inexistente");return c;};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function canHoldoutReading(id,test){
 const c=get(id);
 if(test==="termination")return "Banco completamente desconectado y ficticio: "+c.resistanceOhm+" Ω entre conductores. Un terminador de 120 Ω por extremo en topología de referencia.";
 if(test==="supply")return "Referencia independiente virtual: alimentación del nodo observado "+c.nodeSupplyV+" V (referencia de banco 12 V). No describe una medición real.";
 if(test==="differential")return "Estados del emulador: recesivo CAN-H = CAN-L = 2,5 V; dominante diferencial "+c.differentialV.toFixed(1).replace(".",",")+" V. No decide por sí solo la causa.";
 if(test==="traffic")return c.cause==="arbitration"?
  "Registro sintético: dos ID estándar, 0x"+arbitrationPairs[c.id][0].toString(16).toUpperCase().padStart(3,"0")+" y 0x"+
  arbitrationPairs[c.id][1].toString(16).toUpperCase().padStart(3,"0")+
  " solicitan el bus a la vez; gana el nodo "+canArbitrationModel(...arbitrationPairs[c.id]).winner+
  " por prioridad y el otro reintenta con éxito, sin error de protocolo.":
  c.cause==="supply"?
  "Registro sintético: tramas de otros nodos válidas, sin mensajes del nodo observado; el log por sí solo no prueba un transceptor roto.":
  "Registro sintético: huecos variables en mensajes y reintentos ficticios; por sí solos no identifican la causa eléctrica.";
 throw RangeError("Prueba reservada CAN inválida");
}
export function freezeCanHoldout({caseId,hypothesis,firstTest,predictedEnds}={}){
 get(caseId);
 if(!Object.hasOwn(names,hypothesis)||!CAN_HOLDOUT_TESTS.some(x=>x.id===firstTest)||
  !Number.isInteger(predictedEnds)||predictedEnds<0||predictedEnds>3)
  throw RangeError("Congelá hipótesis, primera prueba y número previsto de terminadores");
 return Object.freeze({caseId,hypothesis,firstTest,predictedEnds});
}
export function gradeCanHoldout({caseId,prior,measurements,finalEnds,diagnosis,decisiveTest,falsifier,reasoning,alternative}={}){
 const c=get(caseId),p=freezeCanHoldout(prior);
 if(p.caseId!==caseId)throw RangeError("Hipótesis congelada para otro banco");
 const keys=CAN_HOLDOUT_TESTS.map(x=>x.id);
 if(!Array.isArray(measurements)||measurements.length!==4||measurements[0]!==p.firstTest||
  new Set(measurements).size!==4||measurements.some(x=>!keys.includes(x)))
  throw RangeError("Se requieren cuatro observaciones únicas empezando con el ensayo comprometido");
 if(!Number.isInteger(finalEnds)||finalEnds<0||finalEnds>3||!Object.hasOwn(CAN_HOLDOUT_FALSIFIERS,diagnosis)||
  !keys.includes(decisiveTest)||!Number.isInteger(falsifier)||falsifier<0||falsifier>2)
  throw RangeError("Falta un valor calculado, causa, prueba discriminante o refutador válido");
 if(typeof reasoning!=="string"||!reasoning.trim()||typeof alternative!=="string"||!alternative.trim())
  throw RangeError("Explicá el razonamiento y una alternativa; el texto no se califica");
 const expectedEnds=120/c.resistanceOhm;
 const numeric=finalEnds===expectedEnds,causal=diagnosis===c.cause,
  discriminated=decisiveTest===discriminators[c.cause],
  falsified=falsifier===CAN_HOLDOUT_FALSIFIERS[diagnosis].answer;
 const score=25*Number(numeric)+50*Number(causal)+15*Number(discriminated)+10*Number(falsified);
 return Object.freeze({score,passed:score===100,numeric,causal,discriminated,falsified,
  initial:p.hypothesis,changed:p.hypothesis!==diagnosis,expected:{cause:c.cause,ends:expectedEnds},
  qualitativeReview:"pending",warning:"Solo inferencia en modelos sintéticos. No evidencia de capacidad para manipular buses reales."});
}
export function nextCanHoldoutIndex(history=[]){
 if(!Array.isArray(history))return 0;
 for(let i=history.length-1;i>=0;i--){
  const e=history[i];if(e?.id!==CAN_HOLDOUT_ID||typeof e.report!=="string")continue;
  try{const r=JSON.parse(e.report),at=CAN_HOLDOUT_CASES.findIndex(c=>c.id===r.caseId);
   if(r.rubric===CAN_HOLDOUT_ID&&at>=0)return(at+1)%CAN_HOLDOUT_CASES.length;
  }catch{/* ignore corrupted history */}
 }
 return 0;
}
export function mountCanHoldout(root,{record,history=[],onSaved=()=>{}}={}){
 if(!root||typeof record!=="function")throw Error("Falta un registro persistente de transferencia");
 let index=nextCanHoldoutIndex(history),prior=null,tests=[],result=null,why="",alt="",busy=false;
 const $=id=>root.querySelector("#"+id);
 const select=(id,label,values,disabled=false)=>"<label for='"+id+"'>"+esc(label)+"</label><select class='field' id='"+id+"' "+(disabled?"disabled":"")+"><option value=''>Elegí</option>"+values.map(([key,name])=>"<option value='"+esc(key)+"'>"+esc(name)+"</option>").join("")+"</select>";
 const header=()=>"<section class='panel stack' aria-label='Caso CAN reservado de transferencia'><h3>CASO RESERVADO: ¿defecto o arbitraje normal?</h3>"+
  "<p>Banco "+CAN_HOLDOUT_CASES[index].id+": "+esc(CAN_HOLDOUT_CASES[index].condition)+". La causa se oculta hasta entregar tu explicación.</p>"+
  "<p class='muted small'>Todos los valores son simulados, de una red aislada y nunca energizada físicamente. No conectes instrumentos ni transmitas tramas en vehículos.</p>";
 const render=()=>{
  if(!prior){
   root.innerHTML=header()+select("can-h-prior","Hipótesis inicial sin nota",Object.entries(names))+
    select("can-h-first","Primer contraste antes de observar",CAN_HOLDOUT_TESTS.map(t=>[t.id,t.label]))+
    select("can-h-prediction","Cantidad de resistores de 120 Ω equivalentes prevista",[[0,"0"],[1,"1"],[2,"2"],[3,"3"]])+
    "<button class='button' type='button' data-can-h='freeze'>Congelar hipótesis, prueba y predicción</button>"+
    "<p id='can-h-status' role='status' aria-live='polite'></p></section>";return;
  }
  root.innerHTML=header()+"<p id='can-h-locked'><strong>Compromiso previo:</strong> "+esc(names[prior.hypothesis])+"; primero "+esc(prior.firstTest)+"; previsto "+prior.predictedEnds+" terminadores.</p>"+
   select("can-h-probe","Ensayo sintético pendiente",CAN_HOLDOUT_TESTS.filter(t=>!tests.includes(t.id)).map(t=>[t.id,t.label]),Boolean(result)||tests.length===4)+
   "<button class='button alt' type='button' data-can-h='measure' "+(result||tests.length===4?"disabled":"")+">Revelar observación</button>"+
   "<div class='panel stack' id='can-h-observations' role='status' aria-live='polite'><strong>Pruebas "+tests.length+"/4</strong>"+
   (tests.length?"<ol>"+tests.map(t=>"<li>"+esc(canHoldoutReading(CAN_HOLDOUT_CASES[index].id,t))+"</li>").join("")+"</ol>":"<p>No se han revelado datos.</p>")+"</div>"+
   (result?"<div id='can-h-result' class='result' tabindex='-1' role='status' aria-live='polite'><strong>"+result.score+"/100 · "+(result.passed?"objetivos verificables cumplidos":"revisar hipótesis")+"</strong>"+
    "<p>Equivalente de terminadores: "+(result.numeric?"correcto":"incorrecto")+". Causa: "+(result.causal?"correcta":"incorrecta")+
    ". Discriminador: "+(result.discriminated?"correcto":"incorrecto")+". Falsación: "+(result.falsified?"correcta":"incorrecta")+".</p>"+
    "<p>La causa del modelo era "+esc(names[result.expected.cause])+". La hipótesis inicial fue revisada: "+(result.changed?"sí":"no")+".</p>"+
    "<p>Justificación registrada: "+esc(why)+"</p><p>Alternativa registrada: "+esc(alt)+"</p>"+
    "<p>Escritura pendiente de revisión humana; no hay nota semántica ni acreditación de trabajo físico.</p></div>"+
    "<button class='button alt' type='button' data-can-h='again'>Investigar siguiente banco reservado</button>":
    select("can-h-count","Cantidad equivalente de terminadores de 120 Ω inferida",[[0,"0"],[1,"1"],[2,"2"],[3,"3"]])+
    select("can-h-cause","Mecanismo que mejor explica todas las pruebas",Object.entries(names).filter(([k])=>k!=="unknown"))+
    select("can-h-discriminate","Prueba que más distingue este mecanismo",CAN_HOLDOUT_TESTS.map(t=>[t.id,t.label]))+
    "<fieldset class='panel' id='can-h-falsifier'><legend>¿Qué observación refutaría tu conclusión?</legend><p>Primero seleccioná una conclusión.</p></fieldset>"+
    "<label for='can-h-why'>Razoná por qué la evidencia favorece esa hipótesis</label><textarea class='field' id='can-h-why' rows='3' maxlength='1200'></textarea>"+
    "<label for='can-h-alt'>Alternativa que descartaste o mantenés abierta</label><textarea class='field' id='can-h-alt' rows='3' maxlength='1200'></textarea>"+
    "<p class='muted small'>El texto se guarda sin evaluación de contenido semántico.</p>"+
    "<button type='button' class='button' data-can-h='grade' "+(tests.length!==4?"disabled":"")+">Entregar y guardar transferencia CAN</button>")+
   "<p id='can-h-status' role='status' aria-live='polite'></p></section>";
 };
 root.addEventListener("change",e=>{
  if(e.target.id==="can-h-cause"&&!result){
   const f=$("can-h-falsifier"),cause=e.target.value;
   f.innerHTML="<legend>¿Qué observación refutaría tu conclusión?</legend>"+
    (CAN_HOLDOUT_FALSIFIERS[cause]?CAN_HOLDOUT_FALSIFIERS[cause].options.map((o,i)=>"<label class='option'><input type='radio' name='can-h-falsifier' value='"+i+"'>"+esc(o)+"</label>").join(""):"<p>Primero seleccioná una conclusión.</p>");
  }
 });
 root.addEventListener("click",async e=>{
  const button=e.target.closest("[data-can-h]");if(!button||busy)return;
  const action=button.dataset.canH,c=CAN_HOLDOUT_CASES[index];
  if(action==="freeze"&&!prior){
   if($("can-h-prediction").value===""){$("can-h-status").textContent="Elegí una predicción explícita antes de congelar.";return;}
   try{prior=freezeCanHoldout({caseId:c.id,hypothesis:$("can-h-prior").value,firstTest:$("can-h-first").value,
     predictedEnds:Number($("can-h-prediction").value)});render();}
   catch(error){$("can-h-status").textContent=error.message;}return;
  }
  if(action==="measure"&&prior&&!result){
   const probe=$("can-h-probe").value;
   if(tests.length===0&&probe!==prior.firstTest){$("can-h-status").textContent="Medí primero la prueba comprometida.";return;}
   if(tests.includes(probe)||!CAN_HOLDOUT_TESTS.some(t=>t.id===probe)){$("can-h-status").textContent="Seleccioná un ensayo no observado.";return;}
   tests.push(probe);render();return;
  }
  if(action==="grade"&&prior&&!result){
   if($("can-h-count").value===""){$("can-h-status").textContent="Calculá y elegí la cantidad equivalente de terminadores.";return;}
   const selected=root.querySelector("input[name='can-h-falsifier']:checked");
   if(!selected){$("can-h-status").textContent="Elegí la prueba que refutaría tu hipótesis.";return;}
   why=$("can-h-why").value.trim();alt=$("can-h-alt").value.trim();
   let g;try{g=gradeCanHoldout({caseId:c.id,prior,measurements:tests,finalEnds:Number($("can-h-count").value),
    diagnosis:$("can-h-cause").value,decisiveTest:$("can-h-discriminate").value,
    falsifier:Number(selected.value),reasoning:why,alternative:alt});}
   catch(error){$("can-h-status").textContent=error.message;return;}
   busy=true;try{
    await record({id:CAN_HOLDOUT_ID,at:new Date().toISOString(),score:g.score,passed:g.passed,
     hypothesis:"Transferencia CAN "+g.expected.cause,conclusion:"Nota objetiva "+g.score+"/100",reasoning:why,
     report:JSON.stringify({rubric:CAN_HOLDOUT_ID,caseId:c.id,prior,measurementsInOrder:tests,
      observations:tests.map(test=>({test,value:canHoldoutReading(c.id,test)})),
      final:{equivalentEnds:Number($("can-h-count").value),diagnosis:$("can-h-cause").value,
       decisiveTest:$("can-h-discriminate").value,falsifier:Number(selected.value)},
      grade:g,reasoning:why,alternative:alt,qualitativeReview:"pending"})});
    result=g;render();$("can-h-result")?.focus({preventScroll:true});onSaved(g);
   }catch(error){$("can-h-status").textContent="Guardado no confirmado: "+String(error.message||error);}
   finally{busy=false;}return;
  }
  if(action==="again"&&result){index=(index+1)%CAN_HOLDOUT_CASES.length;prior=null;tests=[];result=null;why="";alt="";render();}
 });
 render();
}
