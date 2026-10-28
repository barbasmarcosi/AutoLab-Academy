/**
 * Reserved low-voltage transfer cases, separate from the guided examples.
 * Correct answers and assumed hidden resistances are disclosed only after
 * committing a full response. Retakes use a different fault localization.
 */
import{voltageDropModel}from"./volt-drop-lesson.js";
export const VOLT_DROP_HOLDOUT_ID="lab-volt-drop-holdout-v1";
export const VOLT_DROP_HOLDOUT_CASES=Object.freeze([
 Object.freeze({id:"positive",story:"Un consumidor de 12 V funciona débilmente en un banco aislado. La tensión de fuente virtual se mantiene en 12,00 V. Se desconoce en qué tramo aparece la pérdida dominante.",
  positiveOhm:0.62,returnOhm:0.06,loadOhm:2.5}),
 Object.freeze({id:"return",story:"En otro equipo didáctico de 12 V la carga recibe menos tensión de lo esperado. La fuente ideal sigue estable. No disponés de las resistencias ocultas ni de una pieza identificada como culpable.",
  positiveOhm:0.07,returnOhm:0.52,loadOhm:2.8})
]);
const FALSIFIERS=Object.freeze([
 "Medir poca caída en el tramo sospechado y una caída dominante en el otro bajo la misma carga.",
 "Repetir la tensión de fuente en reposo, sin medir los tramos.",
 "Reemplazar piezas a partir del síntoma sin comprobar otra hipótesis."
]);
const labels={positive:"tramo positivo",return:"tramo de retorno",balanced:"sin tramo dominante"};
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
export function gradeVoltageDropHoldout({caseId,measurements,loadPrediction,diagnosis,falsifier}){
 const m=modelFor(caseId);
 if(!Array.isArray(measurements)||!measurements.includes("positive")||!measurements.includes("return"))throw RangeError("Faltan las dos mediciones independientes");
 const parsed=typeof loadPrediction==="number"?loadPrediction:Number(String(loadPrediction).trim().replace(",","."));
 if(!Number.isFinite(parsed)||parsed<0||parsed>24)throw RangeError("Predicción de tensión inválida");
 if(!Object.hasOwn(labels,diagnosis)||!Number.isInteger(falsifier)||falsifier<0||falsifier>=FALSIFIERS.length)throw RangeError("Decisiones inválidas");
 const expected=m.positiveV>m.returnV*1.25?"positive":m.returnV>m.positiveV*1.25?"return":"balanced";
 const numeric=Math.abs(parsed-m.loadV)<=0.12;
 const causal=diagnosis===expected;
 const falsified=falsifier===0;
 const score=(numeric?40:0)+(causal?30:0)+(falsified?30:0);
 return {caseId,score,passed:score===100,selected:{loadPrediction:parsed,diagnosis,falsifier},
  expected:{loadV:m.loadV,diagnosis:expected,falsifier:0,positiveV:m.positiveV,returnV:m.returnV},
  numeric,causal,falsified,reason:"La tensión de la carga es la fuente menos las caídas de positivo y retorno, bajo la misma condición. La prueba de refutación debe medir lo contrario de lo que predice tu hipótesis."};
}
export function mountVoltDropHoldout(root,{record,onSaved=()=>{}}={}){
 if(!root||typeof record!=="function")throw Error("Falta el guardador de evidencia");
 let index=0,measurements=new Set(),result=null,saving=false,attempts=0,feedback="";
 const $=id=>root.querySelector("#"+id);
 const render=()=>{
  const c=VOLT_DROP_HOLDOUT_CASES[index];
  root.innerHTML="<section class='panel stack' aria-label='Caso de transferencia de caída de tensión'>"+
   "<div class='eyebrow'>CASO NUEVO · SIN SOLUCIÓN ADELANTADA</div><h3>5. ¿Podés aplicarlo sin el ejemplo?</h3>"+
   "<p>"+esc(c.story)+"</p><p class='muted'>No se muestran resistencias ni la clave. Para decidir, elegí los extremos y registrá al menos una medición de cada cable mientras la carga funciona. Podés consultar la tensión en el consumidor para contrastar tu predicción.</p>"+
   "<label for='holdout-probe'>Puntas de tu voltímetro</label><select id='holdout-probe' class='field' "+(result?"disabled":"")+"><option value='positive'>A–B: cable positivo</option><option value='return'>D–E: retorno</option><option value='load'>B–D: consumidor</option></select>"+
   "<button type='button' class='button alt' data-holdout='probe' "+(result?"disabled":"")+">Medir este tramo</button>"+
   "<p role='status' aria-live='polite' id='holdout-measured'>"+esc(feedback||"Todavía no mediste ningún tramo.")+"</p>"+
   "<p class='muted small'>Mediciones registradas: "+[...measurements].map(k=>esc(k)).join(", ")+".</p>"+
   "<label for='holdout-load'>Calculá la tensión del consumidor usando la fuente y ambas caídas (V)</label><input class='field' type='text' inputmode='decimal' id='holdout-load' placeholder='Por ejemplo: 9,45' "+(result?"disabled":"")+">"+
   "<label for='holdout-cause'>¿En qué tramo se concentra la mayor caída?</label><select id='holdout-cause' class='field' "+(result?"disabled":"")+"><option value=''>Elegí a partir de las medidas</option><option value='positive'>Positivo</option><option value='return'>Retorno</option><option value='balanced'>Ambas caídas similares</option></select>"+
   "<fieldset class='panel'><legend>¿Qué observación refutaría la localización que elegiste?</legend>"+
   FALSIFIERS.map((o,i)=>"<label class='option'><input type='radio' name='holdout-falsifier' value='"+i+"' "+(result?"disabled":"")+">"+esc(o)+"</label>").join("")+"</fieldset>"+
   (result?"<div class='result' role='status' aria-live='polite'><strong>Resultado objetivo del intento "+attempts+": "+result.score+"/100 · "+(result.passed?"criterios cumplidos":"revisar evidencia")+"</strong>"+
    "<p>Cálculo de carga: "+(result.numeric?"correcto":"incorrecto")+". Tu valor: "+fmt(result.selected.loadPrediction)+" V · esperado: "+fmt(result.expected.loadV)+" V.</p>"+
    "<p>Localización: "+(result.causal?"correcta":"incorrecta")+". Elegiste "+esc(labels[result.selected.diagnosis])+"; según las medidas, "+esc(labels[result.expected.diagnosis])+".</p>"+
    "<p>Refutación: "+(result.falsified?"correcta":"incorrecta")+". "+esc(FALSIFIERS[0])+"</p>"+
    "<p>Mediciones de referencia: positivo "+fmt(result.expected.positiveV)+" V; retorno "+fmt(result.expected.returnV)+" V. "+esc(result.reason)+"</p>"+
    "<p class='muted'>Se corrigen únicamente elecciones objetivas y números dentro del modelo. No se evalúa una justificación escrita ni competencia con instrumentos reales.</p></div>":
    "<button class='button' type='button' data-holdout='grade'>Entregar diagnóstico y revelar devolución</button>")+
   "<p id='holdout-status' role='status' aria-live='polite'></p>"+
   (result?"<button class='button alt' type='button' data-holdout='retry'>Practicar un caso diferente</button>":"")+
   "</section>";
 };
 root.addEventListener("click",async ev=>{
  const b=ev.target.closest("[data-holdout]");if(!b||saving)return;
  if(b.dataset.holdout==="probe"&&!result){
   const probe=$("holdout-probe").value,value=heldOutVoltageReading(VOLT_DROP_HOLDOUT_CASES[index].id,probe);
   measurements.add(probe);
   feedback="Medición entre los extremos de "+(probe==="positive"?"positivo":probe==="return"?"retorno":"consumidor")+": "+fmt(value)+" V (bajo carga).";
   const save={load:$("holdout-load").value,cause:$("holdout-cause").value,falsifier:root.querySelector("[name='holdout-falsifier']:checked")?.value};
   render();$("holdout-load").value=save.load;$("holdout-cause").value=save.cause;
   if(save.falsifier!==undefined)root.querySelector("[name='holdout-falsifier'][value='"+save.falsifier+"']").checked=true;
   return;
  }
  if(b.dataset.holdout==="grade"&&!result){
   let g;
   try{
    const raw=$("holdout-load").value.trim();
    if(!raw)throw Error("Primero completá la predicción de la carga.");
    const selected=root.querySelector("[name='holdout-falsifier']:checked");
    if(!selected)throw Error("Elegí también una observación falsadora.");
    g=gradeVoltageDropHoldout({caseId:VOLT_DROP_HOLDOUT_CASES[index].id,measurements:[...measurements],
     loadPrediction:raw,diagnosis:$("holdout-cause").value,falsifier:Number(selected.value)});
   }catch(e){$("holdout-status").textContent="Falta evidencia: "+String(e.message);return;}
   saving=true;attempts++;
   try{
    await record({id:VOLT_DROP_HOLDOUT_ID,passed:g.passed,score:g.score,at:new Date().toISOString(),attempt:attempts,
     hypothesis:"Causa localizada: "+g.selected.diagnosis,conclusion:"Evaluación objetiva "+g.score+"/100",
     used:["dos-mediciones-bajo-carga","prediccion-numerica","falsacion"],reasoning:"Texto libre no calificado",
     report:JSON.stringify({caseId:g.caseId,selected:g.selected,expected:g.expected,firstAttempt:attempts===1})});
    result=g;feedback="";render();onSaved(g);
   }catch(e){attempts--;$("holdout-status").textContent="No se confirmó el guardado: "+String(e.message||e);}
   finally{saving=false;}
   return;
  }
  if(b.dataset.holdout==="retry"&&result){
   index=(index+1)%VOLT_DROP_HOLDOUT_CASES.length;measurements=new Set();result=null;feedback="";render();
  }
 });
 render();
}
