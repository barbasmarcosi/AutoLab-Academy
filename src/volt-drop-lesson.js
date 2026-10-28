/**
 * Introductory low-voltage series circuit. Pure DC resistive model, NOT an
 * OEM starter motor or battery discharge model. No live vehicle instructions.
 */
export const VOLT_DROP_CASE_ID="lab-volt-drop-guided-v1";
export const VOLT_DROP_CHECKS=Object.freeze([
 {id:"units",question:"Si por una conexión de 0,50 Ω circulan 4 A, ¿qué caída predice la ley de Ohm?",
  options:[
   {label:"0,125 V",why:"Eso es 0,50 dividido por 4; la caída se calcula multiplicando I por R."},
   {label:"2,00 V",why:"Correcto: ΔV = I × R = 4 A × 0,50 Ω = 2,00 V.",correct:true},
   {label:"8,00 V",why:"Ese valor no resulta de I × R para los datos informados."}]},
 {id:"load",question:"¿Por qué no alcanza con medir 12 V de batería en reposo para descartar una conexión resistiva?",
  options:[
   {label:"Porque sin corriente la caída I × R puede ser prácticamente nula.",why:"Correcto: con I ≈ 0, incluso un tramo resistivo muestra una caída muy pequeña.",correct:true},
   {label:"Porque todos los voltímetros muestran 12 V aunque la batería esté descargada.",why:"Incorrecto: los voltímetros miden diferencias de potencial reales dentro de sus límites."},
   {label:"Porque una conexión resistiva siempre aumenta la tensión en la carga.",why:"Incorrecto: en el circuito serie modelado, la caída en el cable deja menos tensión para la carga."}]},
 {id:"probe",question:"En el modelo con una carga activa, ¿cómo medís la caída de un cable concreto?",
  options:[
   {label:"Con un voltímetro entre sus dos extremos, sin interrumpir el circuito.",why:"Correcto: el instrumento de tensión se dispone en paralelo con el tramo, respetando sus límites.",correct:true},
   {label:"Con el voltímetro sustituyendo al cable en serie.",why:"Incorrecto: eso no es una medición de caída de tensión en paralelo."},
   {label:"Solo entre el positivo de batería y cualquier masa arbitraria.",why:"Incorrecto: para aislar un tramo deben identificarse sus dos extremos y la referencia."}]}
]);

export function voltageDropModel({sourceV=12,positiveOhm=0.10,returnOhm=0.40,loadOhm=2,energized=true}={}){
 const values=[sourceV,positiveOhm,returnOhm,loadOhm];
 if(values.some(n=>!Number.isFinite(n))||sourceV<=0||sourceV>24||positiveOhm<0||returnOhm<0||loadOhm<=0)throw RangeError("Parámetros LV inválidos");
 const currentA=energized?sourceV/(positiveOhm+returnOhm+loadOhm):0;
 const positiveV=currentA*positiveOhm,returnV=currentA*returnOhm,loadV=currentA*loadOhm;
 return {sourceV,currentA,positiveV,returnV,loadV,positiveOhm,returnOhm,loadOhm,
  balanceV:positiveV+returnV+loadV,energized:Boolean(energized)};
}
export function checkVoltageDropAnswer(id,choice){
 const q=VOLT_DROP_CHECKS.find(x=>x.id===id);
 if(!q||!Number.isInteger(choice)||choice<0||choice>=q.options.length)throw RangeError("Respuesta inválida");
 const expected=q.options.findIndex(x=>x.correct===true);
 return {correct:choice===expected,selected:q.options[choice].label,expected:q.options[expected].label,
  why:q.options[choice].why,explanation:q.options[expected].why};
}
export function diagnoseVoltageDrop(model,choice){
 if(!["positive","return","balanced"].includes(choice))throw RangeError("Diagnóstico inválido");
 const expected=model.positiveV>model.returnV*1.25?"positive":model.returnV>model.positiveV*1.25?"return":"balanced";
 return {correct:choice===expected,expected,positiveV:model.positiveV,returnV:model.returnV};
}
const fmt=n=>n.toFixed(2).replace(".",",");
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function voltDropTheoryIllustration(){
 return [
  "<div class='notice'><strong>Objetivos verificables.</strong> Al terminar podrás: definir tensión, corriente y resistencia; calcular I × R; explicar por qué medir bajo carga; identificar los dos puntos de una medición de caída; y revisar una hipótesis cuando cambia la evidencia.</div>",
  "<section class='panel stack' aria-label='Ejemplo guiado de caída de tensión'><h2>Ejemplo resuelto, paso a paso</h2>",
  "<p>Imaginá una fuente ideal de <strong>12 V</strong>, un consumidor resistivo de <strong>2,00 Ω</strong>, un cable positivo de <strong>0,10 Ω</strong> y un retorno deteriorado de <strong>0,40 Ω</strong>. Todos son elementos <strong>en serie</strong>: circula la misma corriente.</p>",
  "<ol><li><strong>Resistencia total:</strong> 2,00 + 0,10 + 0,40 = <strong>2,50 Ω</strong>.</li>",
  "<li><strong>Corriente:</strong> I = V / R = 12 / 2,50 = <strong>4,80 A</strong>.</li>",
  "<li><strong>Caída en positivo:</strong> 4,80 × 0,10 = <strong>0,48 V</strong>.</li>",
  "<li><strong>Caída en retorno:</strong> 4,80 × 0,40 = <strong>1,92 V</strong>.</li>",
  "<li><strong>Tensión en consumidor:</strong> 4,80 × 2,00 = <strong>9,60 V</strong>.</li></ol>",
  "<p><strong>Comprobación:</strong> 0,48 + 1,92 + 9,60 = 12,00 V. La fuente no desapareció: parte de su tensión se pierde en conexiones y menos llega a la carga.</p>",
  "<p><strong>Ahora pensá:</strong> si desconectás la carga e I = 0 A, las caídas en los cables de este modelo son 0 V, aunque la resistencia del retorno siga siendo 0,40 Ω. Medir solo en vacío ocultaría el problema.</p>",
  "<p class='muted small'>Supuestos: corriente continua estable, resistencias constantes, fuente de tensión ideal y voltímetro ideal. No modela temperatura, inductancia, química de batería ni comportamiento de un motor de arranque real.</p></section>"
 ].join("");
}
const choices=VOLT_DROP_CHECKS.map(q=>
 "<fieldset class='panel' data-check='"+q.id+"'><legend><strong>"+escapeHtml(q.question)+"</strong></legend>"+
 q.options.map((o,i)=>"<label class='option'><input type='radio' name='volt-"+q.id+"' value='"+i+"'>"+escapeHtml(o.label)+"</label>").join("")+
 "<button type='button' class='button alt small' data-volt-check='"+q.id+"'>Corregir esta pregunta</button>"+
 "<div class='result' data-volt-feedback='"+q.id+"' role='status' aria-live='polite'>Sin responder.</div></fieldset>").join("");
const shell=[
 "<div class='stack'><h3>1. Investigá un circuito controlado</h3>",
 "<p>El banco virtual incluye fuente, cable positivo, carga resistiva y retorno. Cambiá <strong>una variable por vez</strong> y observá en qué tramo se concentra la caída. No son valores de referencia OEM.</p>",
 "<div class='grid two'><div><label for='volt-positive'>Resistencia del cable positivo (Ω): <output id='volt-positive-value'>0,10</output></label><input id='volt-positive' type='range' min='0.02' max='1' step='0.02' value='0.10'></div>",
 "<div><label for='volt-return'>Resistencia del retorno (Ω): <output id='volt-return-value'>0,40</output></label><input id='volt-return' type='range' min='0.02' max='1' step='0.02' value='0.40'></div>",
 "<div><label for='volt-load'>Resistencia del consumidor (Ω): <output id='volt-load-value'>2,00</output></label><input id='volt-load' type='range' min='1' max='6' step='0.5' value='2'></div>",
 "<div><label for='volt-power'>Condición del circuito</label><select class='field' id='volt-power'><option value='on'>Carga conectada y activa</option><option value='off'>Circuito abierto, I = 0 A</option></select></div></div>",
 "<div class='panel' id='volt-model' role='status' aria-live='polite'></div>",
 "<p><strong>Colocá el voltímetro virtual:</strong> siempre entre los dos extremos de un elemento, sin interrumpir el circuito.</p>",
 "<label for='volt-points'>Puntos de medición</label><select id='volt-points' class='field'><option value='positive'>Extremo inicial y final del cable positivo</option><option value='return'>Extremo inicial y final del retorno</option><option value='load'>Bornes del consumidor</option><option value='source'>Bornes de la fuente ideal</option></select>",
 "<p class='result' id='volt-reading' role='status' aria-live='polite'></p>",
 "<p class='muted small'>Actividad sugerida: observá las caídas con 0,40 Ω de retorno, bajá ese valor a 0,04 Ω y repetí ambas mediciones. Después aumentá solo el positivo. Compará qué hipótesis corresponde a cada situación.</p>",
 "<h3>2. Diagnosticá con evidencia</h3><p>Con la carga activa, medí cable positivo y retorno. ¿Dónde está la mayor caída? Si ambas son parecidas (diferencia menor al 25 %), marcá que no hay una localización dominante en este modelo.</p>",
 "<label for='volt-diagnosis'>Hipótesis sobre el tramo dominante</label><select id='volt-diagnosis' class='field'><option value=''>Elegí una hipótesis</option><option value='positive'>Mayor caída en cable positivo</option><option value='return'>Mayor caída en retorno</option><option value='balanced'>Caídas similares; ninguna domina</option></select>",
 "<button type='button' class='button' id='volt-diagnose'>Comprobar hipótesis</button><div id='volt-diagnosis-result' role='status' aria-live='polite'></div>",
 "<h3>3. Verificá que comprendiste</h3><p>Corregí cada pregunta inmediatamente. Podés reintentar; la explicación muestra tu elección, la respuesta esperada y el motivo. No se califica la longitud de textos.</p>",
 choices,
 "<div class='panel stack'><h3>4. Guardá evidencia de este banco</h3>",
 "<p>Para registrar esta práctica virtual debés responder correctamente las tres preguntas, comparar los dos tramos, modificar un parámetro y diagnosticar la condición activa. Esto no acredita competencia física ni garantiza transferencia a otro caso.</p>",
 "<button type='button' id='volt-save' class='button' disabled>Guardar práctica virtual</button><p id='volt-save-status' role='status' aria-live='polite'>Todavía faltan comprobaciones.</p></div>",
 "</div>"
].join("");

export function mountVoltDropPractice(root,{record,onSaved=()=>{}}={}){
 if(!root||typeof record!=="function")throw Error("Se requiere guardar evidencia de práctica");
 root.innerHTML=shell;
 let changed=false,recorded=false,saving=false;
 const passedChecks=new Set(),measurements=new Set();
 let diagnosisPassed=false;
 const $=id=>root.querySelector("#"+id);
 const read=()=>voltageDropModel({positiveOhm:Number($("volt-positive").value),returnOhm:Number($("volt-return").value),
  loadOhm:Number($("volt-load").value),energized:$("volt-power").value==="on"});
 const status=()=>{const ready=changed&&diagnosisPassed&&passedChecks.size===VOLT_DROP_CHECKS.length&&measurements.has("positive")&&measurements.has("return");
  $("volt-save").disabled=!ready||recorded||saving;
  if(!recorded&&!saving)$("volt-save-status").textContent=ready?"Banco virtual completado. Podés guardar evidencia.":"Pendientes: "+[
   !changed?"variar un parámetro":null,!measurements.has("positive")||!measurements.has("return")?"medir positivo y retorno":null,
   !diagnosisPassed?"diagnóstico correcto":null,passedChecks.size!==VOLT_DROP_CHECKS.length?"preguntas correctas "+passedChecks.size+"/"+VOLT_DROP_CHECKS.length:null].filter(Boolean).join("; ")+".";
 };
 const display=()=>{
  const m=read();
  $("volt-positive-value").textContent=fmt(m.positiveOhm);
  $("volt-return-value").textContent=fmt(m.returnOhm);
  $("volt-load-value").textContent=fmt(m.loadOhm);
  $("volt-model").innerHTML="<strong>Fuente ideal "+fmt(m.sourceV)+" V · Corriente "+fmt(m.currentA)+" A</strong>"+
   "<p>Caída positivo: <strong>"+fmt(m.positiveV)+" V</strong> · caída retorno: <strong>"+fmt(m.returnV)+" V</strong> · consumidor: <strong>"+fmt(m.loadV)+" V</strong>.</p>"+
   "<p>Balance: "+fmt(m.positiveV)+" + "+fmt(m.returnV)+" + "+fmt(m.loadV)+" = <strong>"+fmt(m.balanceV)+" V</strong>"+
   (m.energized?".":" (circuito abierto: sin corriente, la fuente conserva sus 12 V ideales; no se afirma tensión en puntos no modelados).")+"</p>";
  const k=$("volt-points").value;
  if(k==="positive"||k==="return")measurements.add(k);
  const v={positive:m.positiveV,return:m.returnV,load:m.loadV,source:m.sourceV}[k];
  $("volt-reading").textContent="Lectura virtual entre esos dos puntos: "+fmt(v)+" V"+(m.energized?" bajo carga.":" con circuito abierto.");
  status();
 };
 ["volt-positive","volt-return","volt-load","volt-power"].forEach(id=>$(id).addEventListener("input",()=>{
  changed=true;diagnosisPassed=false;$("volt-diagnosis-result").textContent="Cambiaste el circuito: volvé a contrastar tu hipótesis.";display();
 }));
 $("volt-points").addEventListener("change",display);
 root.addEventListener("click",async event=>{
  const check=event.target.closest("[data-volt-check]");
  if(check){
   const id=check.dataset.voltCheck,q=VOLT_DROP_CHECKS.find(x=>x.id===id);
   const input=root.querySelector("input[name='volt-"+id+"']:checked"),out=root.querySelector("[data-volt-feedback='"+id+"']");
   if(!input){out.textContent="Elegí una respuesta para recibir devolución.";return;}
   const grade=checkVoltageDropAnswer(id,Number(input.value));
   if(grade.correct)passedChecks.add(id);else passedChecks.delete(id);
   out.innerHTML="<strong>"+(grade.correct?"Correcto.":"Incorrecto.")+"</strong><p><strong>Tu respuesta:</strong> "+escapeHtml(grade.selected)+
    "</p><p><strong>Respuesta esperada:</strong> "+escapeHtml(grade.expected)+"</p><p>"+escapeHtml(grade.why)+
    (grade.correct?"":" "+escapeHtml(grade.explanation))+"</p>";
   status();return;
  }
  if(event.target.id==="volt-diagnose"){
   if($("volt-power").value!=="on"){$("volt-diagnosis-result").textContent="Activá la carga para localizar la caída.";diagnosisPassed=false;status();return;}
   const value=$("volt-diagnosis").value;
   if(!value){$("volt-diagnosis-result").textContent="Elegí una hipótesis.";return;}
   const r=diagnoseVoltageDrop(read(),value);
   diagnosisPassed=r.correct;
   const labels={positive:"cable positivo",return:"retorno",balanced:"caídas similares (sin tramo dominante)"};
   $("volt-diagnosis-result").textContent=(r.correct?"Correcto. ":"Incorrecto. ")+
    "Tu elección: "+labels[value]+". Resultado del modelo: "+labels[r.expected]+
    ". Positivo "+fmt(r.positiveV)+" V; retorno "+fmt(r.returnV)+" V. La localización se decide por la comparación de caídas bajo la misma corriente.";
   status();return;
  }
  if(event.target.id==="volt-save"){
   if(recorded||saving||$("volt-save").disabled)return;
   saving=true;status();
   try{const m=read();
    await record({id:VOLT_DROP_CASE_ID,at:new Date().toISOString(),score:100,passed:true,
     hypothesis:"Tramo de mayor caída bajo la misma corriente",conclusion:"Positivo "+fmt(m.positiveV)+" V; retorno "+fmt(m.returnV)+" V.",
     used:["modelo-resistivo-lv","variacion-parametrica","medicion-dos-tramos","tres-checks-correctos","diagnostico-estructurado"],
     reasoning:"Comparación de caídas de tensión de un circuito serie sintético; no hay evaluación de competencia física.",
     report:"Modelo DC ideal: fuente="+m.sourceV+" V, corriente="+m.currentA+" A, Rpos="+m.positiveOhm+" Ω, Rret="+m.returnOhm+" Ω, Rcarga="+m.loadOhm+" Ω."});
    recorded=true;$("volt-save-status").textContent="Práctica virtual guardada. La competencia física y el razonamiento libre siguen sin evaluar.";onSaved();
   }catch(e){$("volt-save-status").textContent="No se confirmó el guardado: "+String(e.message||e);}
   finally{saving=false;status();}
  }
 });
 display();
}
