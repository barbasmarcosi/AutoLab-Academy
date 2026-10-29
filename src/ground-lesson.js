/**
 * Lesson 07 — Low-voltage return paths, contact resistance, and test conditions.
 * Reuses the validated DC series model, not a new circuit solver.
 * Only fictional 12 V circuit models; no dangerous physical test steps.
 */
import{voltageDropModel}from'./volt-drop-lesson.js';
export const GROUND_GUIDED_ID='lab-ground-test-guided-v1';
export const GROUND_HOLDOUT_ID='lab-ground-test-holdout-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=n=>Number(n).toFixed(2).replace('.',',');
const answers=Object.freeze({
 return:'Resistencia adicional en el retorno del modelo',
 positive:'Resistencia adicional en el positivo del modelo',
 load:'Demanda de carga diferente, sin defecto de contacto demostrado',
 unknown:'Causa todavía no identificable'
});
export const GROUND_BASELINE=Object.freeze([
 {id:'idle',q:'Una unión de retorno muestra 0 V de caída sin consumo. ¿Qué demuestra?',options:['Que es ideal y no tiene resistencia','Que no puede descartarse un problema sin contrastar bajo carga de banco','Que la batería está descargada'],answer:1,why:'Con corriente cero, I×R puede ser cero aun con resistencia de contacto anómala.'},
 {id:'location',q:'¿Qué dato distingue la caída del retorno de la del positivo en un circuito de banco?',options:['Voltaje de batería sin carga','Las tensiones entre los extremos de cada tramo bajo la misma condición de corriente','El nombre de la ECU'],answer:1,why:'Una medida entre extremos identificados de cada tramo localiza dónde aparece la pérdida de potencial en ese modelo.'},
 {id:'current',q:'Una caída de 0,80 V aparece a 4 A. ¿Qué resistencia equivalente se infiere?',options:['3,2 Ω','0,20 Ω','0,80 Ω'],answer:1,why:'R = ΔV/I = 0,80/4 = 0,20 Ω. El valor físico de contacto no se diagnostica sin condiciones y repetición.'},
 {id:'safety',q:'¿Una continuidad aparente permite desconectar o puentear masas críticas de un vehículo activo?',options:['Sí, sin consultar documentación','Sí, si no aparece DTC','No: no deben interrumpirse protecciones ni retornos críticos durante funcionamiento'],answer:2,why:'AutoLab solo usa modelos ficticios. No recomienda desconectar retornos críticos ni puentear protecciones.'}
].map(x=>Object.freeze({...x,options:Object.freeze(x.options)})));
export function evaluateGroundBaseline(values={}){
 if(!values||typeof values!=='object'||Array.isArray(values))throw RangeError('Respuestas inválidas');
 return GROUND_BASELINE.map(q=>{
  const a=values[q.id];if(!Number.isInteger(a)||a<0||a>=q.options.length)throw RangeError('Respondé cuatro ideas previas');
  return Object.freeze({id:q.id,correct:a===q.answer,why:q.why});
 });
}
export function mountGroundBaseline(root){
 if(!root)return;
 root.innerHTML="<section class='panel stack' aria-label='Conocimientos previos de caída de masa'><h2>Antes de leer: un contacto con continuidad puede fallar bajo demanda</h2><p>Comprobación conceptual sin nota ni registro.</p>"+
  GROUND_BASELINE.map(q=>"<fieldset class='panel'><legend>"+esc(q.q)+"</legend>"+q.options.map((t,i)=>"<label class='option'><input type='radio' name='ground-pre-"+q.id+"' value='"+i+"'>"+esc(t)+"</label>").join('')+"</fieldset>").join('')+
  "<button type='button' id='ground-pre-check' class='button alt'>Comparar mis ideas</button><div id='ground-pre-feedback' role='status' aria-live='polite'>Sin revisar.</div></section>";
 root.querySelector('#ground-pre-check').addEventListener('click',()=>{
  const feedback=root.querySelector('#ground-pre-feedback');
  try{const r=Object.fromEntries(GROUND_BASELINE.map(q=>{const selected=root.querySelector("input[name='ground-pre-"+q.id+"']:checked");
    if(!selected)throw RangeError('Respondé las cuatro ideas antes de revisar');return[q.id,Number(selected.value)];}));
   feedback.innerHTML="<ol>"+evaluateGroundBaseline(r).map(x=>"<li><strong>"+(x.correct?'Concepto compatible':'Concepto para revisar')+"</strong>: "+esc(x.why)+"</li>").join('')+
    "</ol><p>Este resultado no acredita competencia instrumental.</p>";
  }catch(e){feedback.textContent=e.message;}
 });
}
const cases=[
 ['R01','return',0.05,0.35,2.0,'Una carga ficticia presenta menor tensión bajo demanda. El origen no se conoce todavía.'],
 ['R02','positive',0.45,0.05,2.0,'El sistema ideal de 12 V alimenta una carga con pérdida de potencia aparente.'],
 ['R03','load',0.05,0.05,1.1,'Se informa una variación de corriente respecto de un ensayo anterior.'],
 ['R04','return',0.05,0.55,2.0,'Aumenta la diferencia entre un punto del circuito y la referencia del banco.'],
 ['R05','positive',0.65,0.05,2.0,'Se observa un cambio de tensión terminal de un consumidor ideal.'],
 ['R06','load',0.05,0.05,1.5,'El consumo varía entre dos condiciones sintéticas.'],
 ['R07','return',0.05,0.75,2.0,'Una captura ideal muestra pérdidas de tensión que requieren localización.'],
 ['R08','positive',0.30,0.05,2.0,'El circuito presenta desviaciones respecto de la referencia sin causa identificada.'],
 ['R09','load',0.05,0.05,2.6,'Se modifica la corriente aparente durante una condición de prueba de banco.']
];
export const GROUND_HOLDOUT_CASES=Object.freeze(cases.map(([id,cause,positiveOhm,returnOhm,loadOhm,story])=>
 Object.freeze({id,cause,positiveOhm,returnOhm,loadOhm,story})));
export const GROUND_PROBES=Object.freeze([
 ['current','Corriente bajo condición de carga del modelo'],
 ['positive','Caída entre extremos del positivo ficticio'],
 ['return','Caída entre extremos del retorno ficticio'],
 ['load','Tensión entre extremos de la carga ficticia']
]);
const groundCase=id=>{const c=GROUND_HOLDOUT_CASES.find(x=>x.id===id);if(!c)throw RangeError('Caso de retorno desconocido');return c;};
export function groundLabModel({positiveOhm=0.05,returnOhm=0.05,loadOhm=2,energized=true}={}){
 return Object.freeze(voltageDropModel({sourceV:12,positiveOhm,returnOhm,loadOhm,energized}));
}
export function groundObservation(caseId,probe){
 const c=groundCase(caseId),m=groundLabModel(c);
 if(probe==='current')return "Corriente registrada por el banco ideal: "+format(m.currentA)+" A. Fuente: 12,00 V.";
 if(probe==='positive')return "Diferencia en tramo positivo: "+format(m.positiveV)+" V, entre dos extremos identificados.";
 if(probe==='return')return "Diferencia en retorno: "+format(m.returnV)+" V, entre dos extremos identificados.";
 if(probe==='load')return "Tensión sobre carga: "+format(m.loadV)+" V. Referencia nominal de dos tramos de 0,05 Ω.";
 throw RangeError('Observable no identificado');
}
export function groundTheoryIllustration(){
 const nominal=groundLabModel(),fault=groundLabModel({returnOhm:0.4}),open=groundLabModel({returnOhm:0.4,energized:false});
 return "<section class='panel stack' aria-label='Ejemplo resuelto de resistencia de contacto'><h2>Ejemplo resuelto: continuidad no es caída bajo carga</h2>"+
  "<ol><li><strong>Definí el circuito ficticio:</strong> fuente ideal de 12 V, R positiva de 0,05 Ω, R retorno de 0,05 Ω y R carga de 2 Ω. La corriente de referencia es "+format(nominal.currentA)+" A, con caída de retorno "+format(nominal.returnV)+" V.</li>"+
  "<li><strong>Hipótesis alternativa:</strong> elevar solo la resistencia del retorno a 0,40 Ω cambia la corriente a "+format(fault.currentA)+" A, la caída del retorno a "+format(fault.returnV)+" V y la tensión de carga a "+format(fault.loadV)+" V.</li>"+
  "<li><strong>Contraste sin corriente:</strong> si la carga del modelo está desconectada, I = "+format(open.currentA)+" A y la caída del retorno = "+format(open.returnV)+" V; ese cero no demuestra ausencia de resistencia parásita.</li>"+
  "<li><strong>Prueba discriminante:</strong> en el laboratorio de baja tensión sintético se conocen los dos extremos del positivo y del retorno, y la condición de carga. Se mide la diferencia de potencial de ambos tramos con referencia estable, no se cambia un componente por un solo síntoma.</li>"+
  "<li><strong>Incertidumbre:</strong> el simulador no incorpora calentamiento, fluctuaciones, contactos no lineales, bornes OEM ni incertidumbre del instrumento. Las condiciones de corriente y fuente deben documentarse al contrastar un modelo.</li></ol>"+
  "<p><strong>Falsación:</strong> ¿qué harías si en la comparación el retorno se mantiene nominal, pero aumenta la caída del positivo?</p>"+
  "<p class='muted small'>No realizamos mediciones sobre vehículos. No desconectes masas críticas con el sistema en funcionamiento ni puentes protecciones.</p></section>";
}
export const GROUND_FALSIFIERS=Object.freeze({
 return:Object.freeze({options:Object.freeze(['El retorno ficticio tiene una caída mayor que la referencia','El retorno sigue nominal, pero el positivo muestra una caída adicional','La corriente cambia cuando el consumidor modifica su demanda']),answer:1}),
 positive:Object.freeze({options:Object.freeze(['El positivo permanece nominal y es el retorno el que presenta caída adicional','El positivo aumenta su caída, manteniéndose nominal el retorno','La carga consume corriente positiva']),answer:0}),
 load:Object.freeze({options:Object.freeze(['El cambio de corriente aparece con caídas nominales en ambos tramos','El valor de carga se mantiene igual al patrón y hay una pérdida adicional localizada en un conductor','El voltaje de carga es mayor que cero']),answer:1})
});
const discriminatory=Object.freeze({return:'return',positive:'positive',load:'current'});
export function freezeGroundPlan({caseId,hypothesis,firstProbe,predictedReturnV}={}){
 groundCase(caseId);
 if(!Object.hasOwn(answers,hypothesis)||!GROUND_PROBES.some(p=>p[0]===firstProbe)||!Number.isFinite(predictedReturnV)||predictedReturnV<0||predictedReturnV>12)
  throw RangeError('Congelá hipótesis, primera prueba y pronóstico del retorno');
 return Object.freeze({caseId,hypothesis,firstProbe,predictedReturnV});
}
export function gradeGroundHoldout({caseId,prior,observations,returnV,cause,decisiveProbe,falsifier,reasoning,alternative}={}){
 const c=groundCase(caseId),p=freezeGroundPlan(prior),m=groundLabModel(c);
 if(p.caseId!==caseId)throw RangeError('La predicción pertenece a otro caso');
 if(!Array.isArray(observations)||observations.length!==4||observations[0]!==p.firstProbe||
  new Set(observations).size!==4||observations.some(x=>!GROUND_PROBES.some(p=>p[0]===x)))
  throw RangeError('Debés revelar cuatro observaciones únicas comenzando con la fuente comprometida');
 if(!Number.isFinite(returnV)||returnV<0||returnV>12||!Object.hasOwn(GROUND_FALSIFIERS,cause)||
  !GROUND_PROBES.some(p=>p[0]===decisiveProbe)||!Number.isInteger(falsifier)||falsifier<0||falsifier>2)
  throw RangeError('Falta cálculo, conclusión o refutación');
 if(typeof reasoning!=='string'||reasoning.trim().length<25||typeof alternative!=='string'||alternative.trim().length<20)
  throw RangeError('Justificá el modelo y una alternativa, sin corrección semántica');
 const numeric=Math.abs(returnV-m.returnV)<=0.06,causal=cause===c.cause,discriminated=decisiveProbe===discriminatory[c.cause],
  falsified=falsifier===GROUND_FALSIFIERS[cause].answer,score=30*Number(numeric)+40*Number(causal)+20*Number(discriminated)+10*Number(falsified);
 return Object.freeze({score,passed:score===100,numeric,causal,discriminated,falsified,
  initial:p.hypothesis,changed:p.hypothesis!==cause,expected:Object.freeze({returnV:m.returnV,cause:c.cause}),
  qualitativeReview:'pending',disclaimer:'Circuito LV sintético. No acredita competencia física ni diagnóstico de vehículo.'});
}
