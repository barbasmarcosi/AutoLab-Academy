/**
 * Lesson 03: oscilloscope reading prerequisites and interactive display controls.
 * Reuses wave-inquiry synthetic signal source. Does not sample real hardware.
 */
import{generateInquiryTrace}from'./waveform-inquiry.js';
export const SCOPE_BASELINE=Object.freeze([
 {id:"period",q:"Una señal repite un ciclo cada 5 ms. ¿Cuál es su frecuencia?",options:["5 Hz","200 Hz","5000 Hz"],answer:1,
  why:"5 ms = 0,005 s. f = 1/T = 200 Hz; separar unidades evita errores por un factor mil."},
 {id:"vertical",q:"Cambiar V/div de 1 a 2, sin alterar la fuente, ¿qué efecto tiene?",options:["La amplitud física se duplica","La frecuencia de la fuente cae a la mitad","La misma señal ocupa menos divisiones verticales"],answer:2,
  why:"V/div cambia la escala de representación, no el voltaje real que entrega una fuente estable."},
 {id:"trigger",q:"¿Qué permite un disparo (trigger) correctamente configurado?",options:["Estabilizar la posición temporal de una forma de onda repetitiva","Aumentar físicamente el voltaje del sensor","Corregir una referencia de masa mal conectada"],answer:0,
  why:"El trigger establece cuándo empieza la captura. No reemplaza una buena referencia ni modifica la señal."},
 {id:"reference",q:"Una pantalla cambia su nivel de continua al cambiar la referencia de medición. ¿Qué afirmás?",options:["La amplitud pico a pico cambió necesariamente","El desplazamiento puede deberse a la referencia, sin cambio de amplitud","El sensor debe reemplazarse"],answer:1,
  why:"El potencial es relativo a una referencia; mover el origen altera offset observado sin demostrar cambio de Vpp."}
].map(q=>Object.freeze({...q,options:Object.freeze(q.options)})));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function evaluateScopeBaseline(answers={}){
 if(!answers||typeof answers!=="object"||Array.isArray(answers))throw RangeError("Respuestas inválidas");
 return SCOPE_BASELINE.map(q=>{
  const a=answers[q.id];if(!Number.isInteger(a)||a<0||a>=q.options.length)throw RangeError("Respondé las cuatro ideas previas");
  return Object.freeze({id:q.id,correct:a===q.answer,selected:a,why:q.why});
 });
}
export function mountScopeBaseline(root){
 if(!root)return;
 root.innerHTML="<section class='panel stack' aria-label='Ideas previas sobre osciloscopía'><h2>Antes de leer: tiempo, tensión y referencia</h2>"+
  "<p>Diagnóstico inicial sin nota ni guardado. Compará las respuestas con tus ideas, antes de revisar los ejemplos.</p>"+
  SCOPE_BASELINE.map(q=>"<fieldset class='panel'><legend>"+esc(q.q)+"</legend>"+
   q.options.map((opt,i)=>"<label class='option'><input type='radio' name='scope-pre-"+q.id+"' value='"+i+"'>"+esc(opt)+"</label>").join("")+"</fieldset>").join("")+
  "<button class='button alt' id='scope-baseline-check' type='button'>Comparar ideas</button>"+
  "<div role='status' aria-live='polite' id='scope-baseline-feedback'>Sin revisar.</div></section>";
 root.querySelector("#scope-baseline-check").addEventListener("click",()=>{
  const result=root.querySelector("#scope-baseline-feedback");
  try{
   const answers=Object.fromEntries(SCOPE_BASELINE.map(q=>{
    const selected=root.querySelector("input[name='scope-pre-"+q.id+"']:checked");
    if(!selected)throw RangeError("Respondé las cuatro ideas previas antes de comparar.");
    return[q.id,Number(selected.value)];
   }));
   result.innerHTML="<h3>Devolución conceptual — sin calificación</h3><ol>"+evaluateScopeBaseline(answers).map(x=>
    "<li><strong>"+(x.correct?"Idea compatible":"Idea por revisar")+"</strong>: "+esc(x.why)+"</li>").join("")+
    "</ol><p>Esta comprobación no registra notas ni acredita práctica instrumental.</p>";
  }catch(e){result.textContent=e.message;}
 });
}
const SOURCE=Object.freeze({frequencyHz:200,peakV:1.2,offsetV:2.5,periodMs:5});
export function scopeDisplayModel({timeDiv=1,voltsDiv=1,referenceOffset=0,trigger="stable"}={}){
 if(![0.5,1,2].includes(timeDiv)||![0.5,1,2].includes(voltsDiv)||![-1,0,1].includes(referenceOffset)||!["stable","free"].includes(trigger))
  throw RangeError("Ajuste de banco de osciloscopía desconocido");
 const p=SOURCE;
 return Object.freeze({timeDiv,voltsDiv,referenceOffset,trigger,frequencyHz:p.frequencyHz,periodMs:p.periodMs,
  peakToPeakV:p.peakV*2,offsetV:p.offsetV+referenceOffset,periodDiv:p.periodMs/timeDiv,amplitudeDiv:(p.peakV*2)/voltsDiv,
  triggerStable:trigger==="stable",
  warning:"El instrumento solo escala y desplaza una señal sintética. No implica un cambio físico de frecuencia o Vpp ni valida una conexión real."});
}
export function scopeTheoryIllustration(){
 return "<section class='panel stack' aria-label='Osciloscopía: ejemplo resuelto y criterios'><h2>Ejemplo resuelto: primero la referencia, después la interpretación</h2>"+
 "<ol><li><strong>Ubicá la referencia y la condición de prueba:</strong> un banco de baja tensión simulado entrega una senoide centrada en 2,5 V, con mínimo 1,3 V y máximo 3,7 V.</li>"+
 "<li><strong>Medí la escala vertical:</strong> Vpp = Vmáx − Vmín = 2,4 V. Si V/div = 1 V, la señal ocupa 2,4 divisiones pico a pico; a 2 V/div ocupa 1,2 divisiones, sin cambiar la fuente.</li>"+
 "<li><strong>Medí el tiempo:</strong> dos crestas consecutivas están separadas 5 ms. Como T = 0,005 s, f = 200 Hz. Con 1 ms/div, un ciclo ocupa cinco divisiones; a 2 ms/div, 2,5.</li>"+
 "<li><strong>Separá disparo y realidad:</strong> el trigger sirve para estabilizar la ventana temporal; no corrige un error de sonda, masa, atenuación, acoplamiento o calibración.</li>"+
 "<li><strong>Contrastá antes de culpar al sensor:</strong> si cambian las divisiones pero no la medida calibrada, la diferencia podría ser instrumental. Registrá referencia, V/div, ms/div, acoplamiento, carga y condición de funcionamiento.</li></ol>"+
 "<p><strong>Pregunta de falsación:</strong> ¿qué observación de una referencia de tiempo conocida refutaría la idea de que la frecuencia física cambió?</p>"+
 "<p class='muted small'>Los valores son enteramente sintéticos. Nunca conectes la pinza de masa de un osciloscopio referenciado a tierra a puntos arbitrarios del vehículo. La práctica real requiere equipo apropiado y formación.</p></section>";
}
function svgScope(trace,model){
 const {timeDiv,voltsDiv,referenceOffset,triggerStable}=model;
 const W=540,H=210,L=44,T=18,dx=48,dy=27,phase=triggerStable?0:1.2,points=[];
 // The underlying samples come from the academy's existing synthetic trace generator.
 const windowMs=10*timeDiv;
 for(const s of trace.series){
  const t=s.t+phase;if(t<0||t>windowMs)continue;
  const yRaw=s.values[0];
  const x=L+(t/windowMs)*(W-L-10);
  const y=T+3*dy-((yRaw-2.5+referenceOffset)/voltsDiv)*dy;
  points.push(x.toFixed(1)+","+y.toFixed(1));
 }
 const guides=Array.from({length:11},(_,i)=>"<line x1='"+(L+i*dx)+"' y1='"+T+"' x2='"+(L+i*dx)+"' y2='"+(T+6*dy)+"' stroke='#476073' stroke-width='0.7'/>").join("")+
  Array.from({length:7},(_,i)=>"<line x1='"+L+"' y1='"+(T+i*dy)+"' x2='"+(L+10*dx)+"' y2='"+(T+i*dy)+"' stroke='#476073' stroke-width='0.7'/>").join("");
 return "<figure><svg viewBox='0 0 "+W+" "+H+"' role='img' aria-label='Oscilograma sintético con escala horizontal de "+timeDiv+" milisegundos por división y vertical de "+voltsDiv+" voltios por división' style='width:100%;height:auto;max-width:100%'>"+
  "<rect x='"+L+"' y='"+T+"' width='"+(10*dx)+"' height='"+(6*dy)+"' fill='#0b1e2e'/>"+guides+
  "<polyline fill='none' stroke='#60d9c7' stroke-width='2.5' points='"+points.join(" ")+"'/>"+
  "<text x='5' y='202' font-size='12' fill='#d4e6f5'>Modelo de baja tensión · "+(triggerStable?"disparo estable":"sin sincronización")+"</text></svg>"+
  "<figcaption class='muted small'>Ventana generada a partir del modelo de senoide de AutoLab. La escala de pantalla cambia, no el período ni la amplitud físicos del modelo.</figcaption></figure>";
}
export function mountScopeControls(root){
 if(!root)return;
 const trace=generateInquiryTrace("scope",1,800);
 let settings={timeDiv:1,voltsDiv:1,referenceOffset:0,trigger:"stable"};
 function field(id,title,values){
  return "<label for='"+id+"'>"+title+"</label><select class='field' id='"+id+"'>"+
   values.map(([v,label])=>"<option value='"+v+"' "+(String(v)===String(settings[id.replace('scope-','')])?"selected":"")+">"+label+"</option>").join("")+"</select>";
 }
 function render(){
  const m=scopeDisplayModel(settings);
  root.innerHTML="<section class='panel stack' aria-label='Control de escala de osciloscopio virtual'><h3>Mismo sensor, distintos ajustes de pantalla</h3>"+
   "<p>Modificá un ajuste por vez. La fuente del simulador queda fijada en <strong>200 Hz y 2,4 Vpp</strong>: evaluá si el cambio observado pertenece a la señal o al instrumento.</p>"+
   "<div class='grid two'>"+
   field("scope-timeDiv","Tiempo por división",[[0.5,"0,5 ms/div"],[1,"1 ms/div"],[2,"2 ms/div"]])+
   field("scope-voltsDiv","Voltios por división",[[0.5,"0,5 V/div"],[1,"1 V/div"],[2,"2 V/div"]])+
   field("scope-referenceOffset","Desplazamiento de referencia",[[0,"0 V"],[-1,"−1 V"],[1,"+1 V"]])+
   field("scope-trigger","Captura/disparo",[["stable","Estable"],["free","Sincronización libre"]])+
   "</div>"+svgScope(trace,m)+
   "<div id='scope-control-readings' role='status' aria-live='polite'>"+
   "<strong>Período de la señal:</strong> "+m.periodMs+" ms · <strong>frecuencia real del modelo:</strong> "+m.frequencyHz+" Hz. "+
   "<strong>En pantalla:</strong> "+m.periodDiv.toFixed(2).replace(".",",")+" div/ciclo y "+
   m.amplitudeDiv.toFixed(2).replace(".",",")+" div pico a pico. "+
   "<strong>Nivel medio aparente:</strong> "+m.offsetV.toFixed(1).replace(".",",")+" V.</div>"+
   "<p class='muted small'>"+esc(m.warning)+"</p></section>";
 }
 root.addEventListener("change",e=>{
  const id=e.target.id;
  if(!["scope-timeDiv","scope-voltsDiv","scope-referenceOffset","scope-trigger"].includes(id))return;
  const fieldName=id.slice("scope-".length);
  settings={...settings,[fieldName]:fieldName==="trigger"?e.target.value:Number(e.target.value)};
  render();
 });
 render();
}
