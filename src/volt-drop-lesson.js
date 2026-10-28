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
  "<p class='muted small'>Supuestos: corriente continua estable, resistencias constantes, fuente de tensión ideal y voltímetro ideal. No modela temperatura, inductancia, química de batería ni comportamiento de un motor de arranque real.</p></section>",
  "<section class='panel stack' aria-label='Segundo ejemplo progresivo'><h2>Segundo ejemplo: cambiá de hipótesis</h2>"+
  "<p>Otro banco ideal de 12 V tiene un consumidor de 3 Ω, un cable positivo de 0,60 Ω y un retorno de 0,10 Ω. Antes de abrir la resolución, estimá: ¿cuál es la corriente, cuál cable pierde más tensión y cuánto recibe la carga?</p>"+
  "<details><summary>Mostrar resolución cuando hayas calculado</summary><ol>"+
  "<li>Resistencia total = 3,00 + 0,60 + 0,10 = 3,70 Ω.</li>"+
  "<li>Corriente I = 12 / 3,70 ≈ 3,24 A.</li>"+
  "<li>Positivo: 3,243 × 0,60 ≈ 1,95 V; retorno: 3,243 × 0,10 ≈ 0,32 V.</li>"+
  "<li>Carga: 3,243 × 3 ≈ 9,73 V. Suma sin redondear: 12 V.</li></ol>"+
  "<p>Ahora la pérdida dominante está en el positivo, no en el retorno. La hipótesis depende de las <strong>mediciones bajo carga</strong>; no del nombre de la pieza ni de suponer que siempre falla la masa.</p></details>"+
  "<p><strong>Glosario para el diagnóstico:</strong> hipótesis = explicación provisional; observación = dato medido con referencia y condición; predicción = resultado que esperarías si la hipótesis fuera correcta; falsador = resultado que la debilita. El voltímetro mide un tramo, no decide automáticamente la reparación.</p></section>"
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
 "<figure class='panel'><svg role='img' aria-label='Lazo de corriente continua: fuente de 12 voltios, cable positivo, consumidor y retorno en serie' viewBox='0 0 760 196' style='width:100%;height:auto'>"+
 "<path d='M105 60 H660 V145 H105 V60' fill='none' stroke='currentColor' stroke-width='3' stroke-linejoin='round'/>"+
 "<rect x='38' y='72' width='130' height='62' rx='10' fill='#17374b' stroke='#60d9c7' stroke-width='2'/>"+
 "<text x='103' y='94' text-anchor='middle' fill='#ffffff' font-size='16'>Fuente</text><text x='103' y='116' text-anchor='middle' fill='#ffffff' font-size='16'>12 V CC</text>"+
 "<rect x='242' y='40' width='164' height='46' rx='8' fill='#17374b' stroke='#60d9c7' stroke-width='2'/>"+
 "<text x='324' y='68' text-anchor='middle' fill='#ffffff' font-size='15'>Cable positivo</text>"+
 "<rect x='566' y='80' width='184' height='48' rx='8' fill='#17374b' stroke='#60d9c7' stroke-width='2'/>"+
 "<text x='658' y='109' text-anchor='middle' fill='#ffffff' font-size='15'>Consumidor</text>"+
 "<rect x='245' y='122' width='170' height='46' rx='8' fill='#17374b' stroke='#ffb76a' stroke-width='2'/>"+
 "<text x='330' y='150' text-anchor='middle' fill='#ffffff' font-size='15'>Retorno</text>"+
 "<text x='174' y='54' fill='currentColor' font-size='17'>+</text><text x='174' y='166' fill='currentColor' font-size='17'>−</text>"+
 "<circle id='volt-probe-red' cx='208' cy='60' r='9' fill='#fa6868' stroke='#ffffff' stroke-width='2'/>"+
 "<circle id='volt-probe-black' cx='550' cy='60' r='9' fill='#1f2937' stroke='#ffffff' stroke-width='2'/>"+
 "</svg>"+
 "<figcaption>Esquema funcional de serie, no plano de conexiones. Los dos círculos resaltados son las puntas del voltímetro virtual; podés escoger el tramo mediante la lista accesible.</figcaption></figure>",
 "<div class='grid two'><div><label for='volt-positive'>Resistencia del cable positivo (Ω): <output id='volt-positive-value'>0,10</output></label><input id='volt-positive' type='range' min='0.02' max='1' step='0.02' value='0.10'></div>",
 "<div><label for='volt-return'>Resistencia del retorno (Ω): <output id='volt-return-value'>0,40</output></label><input id='volt-return' type='range' min='0.02' max='1' step='0.02' value='0.40'></div>",
 "<div><label for='volt-load'>Resistencia del consumidor (Ω): <output id='volt-load-value'>2,00</output></label><input id='volt-load' type='range' min='1' max='6' step='0.5' value='2'></div>",
 "<div><label for='volt-power'>Condición del circuito</label><select class='field' id='volt-power'><option value='on'>Carga conectada y activa</option><option value='off'>Circuito abierto, I = 0 A</option></select></div></div>",
 "<div class='panel' id='volt-model' role='status' aria-live='polite'></div>",
 "<p><strong>Colocá el voltímetro virtual:</strong> elegí los extremos del elemento, anticipá la caída y presioná Medir. El instrumento está en paralelo; no interrumpe la corriente.</p>",
 "<label for='volt-points'>Dos extremos entre los que medir</label><select id='volt-points' class='field'><option value='positive'>A–B: cable positivo</option><option value='return'>D–E: retorno</option><option value='load'>B–D: consumidor</option><option value='source'>A–E: fuente ideal</option></select>",
 "<p id='volt-probe-location' class='muted' role='status'>Puntas sobre cable positivo (A–B).</p>",
 "<label for='volt-prediction'>Predicción de la lectura (V, magnitud)</label><input type='text' id='volt-prediction' class='field' inputmode='decimal' maxlength='24' placeholder='Ejemplo: 0,48'>",
 "<button type='button' id='volt-measure' class='button'>Medir entre estos puntos</button>",
 "<p class='result' id='volt-reading' role='status' aria-live='polite'>Escribí tu predicción y medí para revelar la lectura.</p>",
 "<div class='panel'><h4>Lecturas hechas bajo la condición actual</h4><ul id='volt-measurements'><li>Todavía no realizaste una medición.</li></ul></div>",
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
 const passedChecks=new Set(),measurements=new Map();
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
 const probes={
  positive:{red:[208,60],black:[550,60],label:"A–B: cable positivo"},
  return:{red:[550,145],black:[208,145],label:"D–E: retorno"},
  load:{red:[660,60],black:[660,145],label:"B–D: consumidor"},
  source:{red:[105,60],black:[105,145],label:"A–E: fuente ideal"}
 };
 const updateProbes=()=>{
  const k=$("volt-points").value,p=probes[k];
  for(const [id,xy] of [["volt-probe-red",p.red],["volt-probe-black",p.black]]){
   $(id).setAttribute("cx",String(xy[0]));$(id).setAttribute("cy",String(xy[1]));
  }
  $("volt-probe-location").textContent="Puntas marcadas en "+p.label+". El modelo muestra magnitudes, no el signo asociado a invertir la polaridad.";
 };
 const updateMeasuredList=()=>{
  $("volt-measurements").innerHTML=measurements.size?[...measurements].map(([key,m])=>
   "<li>"+escapeHtml(probes[key].label)+": "+fmt(m.observed)+" V (predijiste "+fmt(m.predicted)+" V; diferencia absoluta "+fmt(m.error)+" V)</li>").join(""):"<li>Todavía no realizaste una medición.</li>";
 };
 const display=()=>{
  const m=read();
  $("volt-positive-value").textContent=fmt(m.positiveOhm);
  $("volt-return-value").textContent=fmt(m.returnOhm);
  $("volt-load-value").textContent=fmt(m.loadOhm);
  $("volt-model").innerHTML="<strong>Fuente ideal "+fmt(m.sourceV)+" V · Corriente "+fmt(m.currentA)+" A</strong>"+
   "<p>Los valores de cada tramo se ocultan hasta que selecciones sus extremos, anotes una predicción y midas.</p>"+
   (m.energized?"<p>La suma de las caídas resistivas de la malla debe ser "+fmt(m.sourceV)+" V.</p>":
   "<p>Circuito abierto: no circula corriente por los resistores. La fuente conserva 12 V; la diferencia aparece sobre la apertura no modelada como resistor.</p>");
  updateProbes();
  updateMeasuredList();
  status();
 };
 ["volt-positive","volt-return","volt-load","volt-power"].forEach(id=>$(id).addEventListener("input",()=>{
  if(id!=="volt-power")changed=true;
  measurements.clear();diagnosisPassed=false;
  $("volt-diagnosis-result").textContent="Cambiaste la condición: repetí las mediciones y volvé a contrastar.";
  $("volt-reading").textContent="Los resultados anteriores ya no corresponden: predecí y medí nuevamente.";
  $("volt-prediction").value="";
  display();
 }));
 $("volt-points").addEventListener("change",()=>{
  $("volt-prediction").value="";
  $("volt-reading").textContent="Nueva referencia seleccionada. Escribí la predicción antes de medir.";
  updateProbes();
 });
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
  if(event.target.id==="volt-measure"){
   const raw=$("volt-prediction").value.trim().replace(",",".");
   const predicted=Number(raw);
   if(!raw||!Number.isFinite(predicted)||predicted<0||predicted>24){
    $("volt-reading").textContent="Escribí primero una predicción numérica válida, entre 0 y 24 V.";return;
   }
   const m=read(),k=$("volt-points").value;
   const observed={positive:m.positiveV,return:m.returnV,load:m.loadV,source:m.sourceV}[k];
   if(!m.energized&&k!=="source"){
    $("volt-reading").textContent="Con el circuito abierto, el voltímetro del modelo no define automáticamente diferencias entre todos los puntos. Cerrá el circuito para medir caídas bajo carga.";return;
   }
   measurements.set(k,{observed,predicted,error:Math.abs(observed-predicted)});
   $("volt-reading").textContent=probes[k].label+": predicción "+fmt(predicted)+" V; instrumento virtual "+fmt(observed)+
    " V. Error absoluto "+fmt(Math.abs(observed-predicted))+" V. Revisá I × R y las hipótesis.";
   updateMeasuredList();status();return;
  }
  if(event.target.id==="volt-diagnose"){
   if($("volt-power").value!=="on"){$("volt-diagnosis-result").textContent="Activá la carga para localizar la caída.";diagnosisPassed=false;status();return;}
   if(!measurements.has("positive")||!measurements.has("return")){
    $("volt-diagnosis-result").textContent="Primero medí explícitamente ambos tramos, en esta misma condición activa.";
    diagnosisPassed=false;status();return;
   }
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
     used:["modelo-resistivo-lv","variacion-parametrica","medicion-predicha-dos-tramos","tres-checks-correctos","diagnostico-estructurado"],
     reasoning:"Comparación de caídas de tensión de un circuito serie sintético; no hay evaluación de competencia física.",
     report:"Modelo DC ideal: fuente="+m.sourceV+" V, corriente="+m.currentA+" A, Rpos="+m.positiveOhm+" Ω, Rret="+m.returnOhm+" Ω, Rcarga="+m.loadOhm+" Ω."});
    recorded=true;$("volt-save-status").textContent="Práctica virtual guardada. La competencia física y el razonamiento libre siguen sin evaluar.";onSaved();
   }catch(e){$("volt-save-status").textContent="No se confirmó el guardado: "+String(e.message||e);}
   finally{saving=false;status();}
  }
 });
 display();
}
