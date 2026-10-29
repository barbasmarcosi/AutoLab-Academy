/**
 * Lesson 04 — Classical CAN physical layer and arbitration training.
 * All numbers belong to an isolated, de-energized synthetic bench.
 * No bus transmission, bypass, probing or real-vehicle instructions.
 */
export const CAN_BASELINE=Object.freeze([
 {id:"dominant",question:"En CAN clásico de dos hilos, ¿qué representa el estado dominante?",
  options:["Un bit que prevalece sobre recesivo durante el arbitraje","Siempre una falla eléctrica","Un byte recibido completo"],answer:0,
  why:"La señalización diferencial separa dominante/recesivo; durante arbitraje un bit dominante prevalece, sin que perder arbitraje implique un error."},
 {id:"termination",question:"Dos terminadores ideales de 120 Ω en paralelo, desconectados de alimentación, ¿qué equivalente dan?",
  options:["240 Ω","60 Ω","120 Ω"],answer:1,why:"1/R_eq=1/120+1/120; 60 Ω solo es esperable en ESA topología ideal, no es una regla universal para cualquier red."},
 {id:"voltage",question:"¿Qué describe el diferencial CAN-H − CAN-L en estado recesivo ideal del banco?",
  options:["Unos 2 V","Unos 12 V","Aproximadamente 0 V"],answer:2,
  why:"En este modelo recesivo ambas líneas se sitúan cerca de 2,5 V; el diferencial es aproximadamente cero."},
 {id:"dtc",question:"Un nodo no participa en CAN; ¿se puede concluir que falló el transceptor?",
  options:["No: primero distinguir alimentación, red, terminación y comportamiento","Sí: cambiarlo sin contraste","Sí: todo retraso de arbitraje es un bus desconectado"],answer:0,
  why:"La ausencia de mensajes o un DTC de comunicación no individualizan una pieza; pueden intervenir alimentación, terminación, red o el plan de transmisiones."}
].map(q=>Object.freeze({...q,options:Object.freeze(q.options)})));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function evaluateCanBaseline(answers={}){
 if(!answers||typeof answers!=="object"||Array.isArray(answers))throw RangeError("Respuestas de entrada inválidas");
 return CAN_BASELINE.map(q=>{
  const chosen=answers[q.id];
  if(!Number.isInteger(chosen)||chosen<0||chosen>=q.options.length)throw RangeError("Respondé las cuatro preguntas antes de evaluar");
  return Object.freeze({id:q.id,correct:chosen===q.answer,why:q.why,selected:chosen});
 });
}
export function mountCanBaseline(root){
 if(!root)return;
 root.innerHTML="<section class='panel stack' aria-label='Conocimientos previos sobre CAN'><h2>Antes de empezar: ¿qué suponés sobre CAN?</h2>"+
 "<p>Chequeo de ideas previas sin nota ni registro. Elegí antes de leer los ejemplos resueltos.</p>"+
 CAN_BASELINE.map(q=>"<fieldset class='panel'><legend>"+esc(q.question)+"</legend>"+
 q.options.map((option,i)=>"<label class='option'><input type='radio' name='can-pre-"+q.id+"' value='"+i+"'>"+esc(option)+"</label>").join("")+"</fieldset>").join("")+
 "<button class='button alt' type='button' id='can-baseline-check'>Comparar mis ideas</button><div role='status' aria-live='polite' id='can-baseline-feedback'>Sin revisar.</div></section>";
 root.querySelector("#can-baseline-check").addEventListener("click",()=>{
  const feedback=root.querySelector("#can-baseline-feedback");
  try{
   const answers=Object.fromEntries(CAN_BASELINE.map(q=>{
    const checked=root.querySelector("input[name='can-pre-"+q.id+"']:checked");
    if(!checked)throw RangeError("Completá las cuatro ideas previas.");
    return[q.id,Number(checked.value)];
   }));
   feedback.innerHTML="<h3>Devolución conceptual · sin nota</h3><ol>"+evaluateCanBaseline(answers).map(x=>
    "<li><strong>"+(x.correct?"Idea compatible":"Idea para revisar")+"</strong>: "+esc(x.why)+"</li>").join("")+
    "</ol><p>No se guarda ni acredita capacidad sobre vehículos reales.</p>";
  }catch(e){feedback.textContent=e.message;}
 });
}
/** Parallel nominal resistors on a disconnected, fully isolated toy circuit. */
export function canTerminationModel({ends=2,ohmsPerEnd=120}={}){
 if(!Number.isInteger(ends)||ends<0||ends>3||!Number.isFinite(ohmsPerEnd)||ohmsPerEnd<40||ohmsPerEnd>200)
  throw RangeError("Terminación ficticia inválida");
 const equivalentOhm=ends===0?null:ohmsPerEnd/ends;
 return Object.freeze({ends,ohmsPerEnd,equivalentOhm,isolated:true,
  warning:"Solo red sintética desenergizada. No es una orden de medir resistencia en una red vehicular activa."});
}
/** Classical CAN standard 11-bit identifiers, same-start bits and wired arbitration. */
export function canArbitrationModel(a,b){
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||a>0x7ff||b<0||b>0x7ff||a===b)
  throw RangeError("Se requieren dos identificadores estándar distintos");
 const bits=id=>id.toString(2).padStart(11,"0");
 const A=bits(a),B=bits(b);
 const decisive=[...A].findIndex((bit,i)=>bit!==B[i]);
 const winner=a<b?"A":"B",loser=a<b?"B":"A";
 return Object.freeze({a,b,aBits:A,bBits:B,decisiveBit:decisive+1,winner,loser,
  busBit:"0",reason:"En el primer bit diferente domina 0; menor ID estándar obtiene prioridad en este arbitraje. El nodo que pierde reintenta sin tratarlo como error."});
}
export function canDifferentialModel(state){
 if(!["dominant","recessive"].includes(state))throw RangeError("Estado CAN desconocido");
 const dominant=state==="dominant",highV=dominant?3.5:2.5,lowV=dominant?1.5:2.5;
 return Object.freeze({state,highV,lowV,differentialV:highV-lowV,
  caution:"Niveles nominales ilustrativos, no umbrales OEM ni diagnóstico suficiente de transceptores"});
}
export function canTheoryIllustration(){
 const no=canTerminationModel({ends:2}),one=canTerminationModel({ends:1}),extra=canTerminationModel({ends:3});
 const dom=canDifferentialModel("dominant"),rec=canDifferentialModel("recessive"),arb=canArbitrationModel(0x080,0x120);
 return "<section class='panel stack' aria-label='Teoría aplicada CAN'><h2>CAN paso a paso: señal, terminación y arbitraje</h2>"+
 "<ol><li><strong>Señal diferencial:</strong> en este modelo el estado dominante muestra CAN-H "+dom.highV.toFixed(1)+" V, CAN-L "+dom.lowV.toFixed(1)+" V y H−L "+dom.differentialV.toFixed(1)+" V. Recesivo: "+rec.highV.toFixed(1)+" V y "+rec.lowV.toFixed(1)+" V, diferencial 0 V. No son pruebas de salud de una ECU.</li>"+
 "<li><strong>Terminación:</strong> dos resistencias ficticias de 120 Ω en paralelo producen "+no.equivalentOhm+" Ω; una sola da "+one.equivalentOhm+" Ω y tres darían "+extra.equivalentOhm+" Ω. Es un <em>modelo aislado y desenergizado</em>, no un objetivo de cualquier topología vehicular.</li>"+
 "<li><strong>Arbitraje sin colisión destructiva:</strong> si dos nodos estándar empiezan simultáneamente con ID 0x080 y 0x120, gana el ID 0x080 porque 0 prevalece sobre 1 en el primer bit diferente (posición "+arb.decisiveBit+"). El perdedor puede reintentar; ese retraso por sí solo no es falla.</li>"+
 "<li><strong>Diagnóstico diferencial:</strong> si un módulo parece ausente, contrastá una condición de alimentación, un observable de terminación, una señal diferencial y actividad de red; ninguno por separado permite asegurar que el transceptor esté roto.</li></ol>"+
 "<p><strong>Contrafactual:</strong> ¿qué tendría que observarse para abandonar la hipótesis de terminación incorrecta y preferir pérdida de alimentación de un nodo?</p>"+
 "<p class='muted small'>Este material no habilita medir ni transmitir en vehículos reales. La resistencia se contempla solo en banco desconectado. La topología, voltajes, estados y transitorios reales requieren documentación y procedimientos seguros.</p></section>";
}
export function mountCanConceptLab(root){
 if(!root)return;let ends=2,a=128,b=288;
 function render(){
  const r=canTerminationModel({ends}),arb=canArbitrationModel(a,b),dom=canDifferentialModel("dominant"),rec=canDifferentialModel("recessive");
  root.innerHTML="<section class='panel stack' aria-label='Calculadora CAN aislada'><h3>Explorá sin conectar equipos: terminadores y prioridades</h3>"+
   "<p>Manipulá cada variable por separado para comprobar qué cambia en el modelo, sin atribuir causas reales.</p>"+
   "<label for='can-ends'>Terminadores de 120 Ω conectados en paralelo (0–3)</label>"+
   "<select class='field' id='can-ends'>"+[0,1,2,3].map(n=>"<option value='"+n+"' "+(ends===n?"selected":"")+">"+n+"</option>").join("")+"</select>"+
   "<label for='can-id-a'>Identificador estándar del nodo A</label>"+
   "<select class='field' id='can-id-a'>"+[[128,"0x080"],[256,"0x100"],[512,"0x200"]].map(([id,label])=>"<option value='"+id+"' "+(a===id?"selected":"")+">"+label+"</option>").join("")+"</select>"+
   "<label for='can-id-b'>Identificador estándar del nodo B</label>"+
   "<select class='field' id='can-id-b'>"+[[288,"0x120"],[384,"0x180"],[768,"0x300"]].map(([id,label])=>"<option value='"+id+"' "+(b===id?"selected":"")+">"+label+"</option>").join("")+"</select>"+
   "<div id='can-concept-readings' role='status' aria-live='polite'><p><strong>Resistencia ideal equivalente:</strong> "+(r.equivalentOhm===null?"circuito abierto (sin terminadores)":r.equivalentOhm.toFixed(1)+" Ω")+".</p>"+
   "<p><strong>Dominante:</strong> CAN-H "+dom.highV+" V · CAN-L "+dom.lowV+" V · H−L "+dom.differentialV+" V. <strong>Recesivo:</strong> H−L "+rec.differentialV+" V.</p>"+
   "<p><strong>Prioridad:</strong> gana nodo "+arb.winner+" en bit "+arb.decisiveBit+"; el otro reintenta. No equivale a error eléctrico.</p></div>"+
   "<p class='muted small'>"+esc(r.warning)+"</p></section>";
 }
 root.addEventListener("change",e=>{
  if(e.target.id==="can-ends")ends=Number(e.target.value);
  else if(e.target.id==="can-id-a")a=Number(e.target.value);
  else if(e.target.id==="can-id-b")b=Number(e.target.value);
  else return;
  render();
 });render();
}
