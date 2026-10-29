/**
 * Hypothesis-first waveform experiments reuse the academy's synthetic trace
 * generator; transformed traces are MODEL DATA, never sensor/OEM captures.
 * Do not connect these computations or examples to live vehicle networks.
 */
import{generateWaveform}from'./waveform-lab.js';
export const WAVE_INQUIRY_MODEL='autolab-waveform-inquiry-v1';
const experiments=[
 {lessonId:'scope',caseId:'lab-scope-waveform-v1',waveform:'sine',
  title:'Señal senoidal: período y frecuencia no son amplitud',
  description:'Señal ficticia centrada en 2,5 V. Seleccioná el factor temporal sobre un seno base de 200 Hz; predecí su frecuencia.',
  unit:'Hz',options:[{value:0.5,label:'Escala temporal ×0,5'},{value:1,label:'Escala temporal ×1'},{value:2,label:'Escala temporal ×2'}],
  hypotheses:['Comprimir el tiempo aumenta la frecuencia sin alterar la amplitud','Cambiar el tiempo obliga a aumentar la amplitud','La frecuencia no depende del período'],answer:0,
  falsifiers:['Un oscilograma con amplitud igual','Con amplitud fija, una base temporal duplicada da una frecuencia mayor','La frecuencia calculada disminuye al aumentar el período bajo un reloj contrastado'],falsifierAnswer:1,
  explain:'El modelo preserva voltajes y escala el eje temporal. f=1/T; a mayor período, menor frecuencia. El eje temporal mal calibrado puede falsear inferencias.'},
 {lessonId:'pwm-scope',caseId:'lab-pwm-waveform-v1',waveform:'pwm',
  title:'PWM de banco: ancho alto, período y duty real',
  description:'Mando cuadrado de 0 a 5 V con período fijo de 8 ms. Variá solo el ciclo de trabajo para medir la fracción activa.',
  unit:'%',options:[{value:25,label:'Alto 2 ms sobre 8 ms'},{value:50,label:'Alto 4 ms sobre 8 ms'},{value:75,label:'Alto 6 ms sobre 8 ms'}],
  hypotheses:['La frecuencia disminuye si aumenta duty a período constante','Duty es fracción de tiempo alto, no prueba movimiento del actuador','Duty se define como tensión máxima dividida por 5 V'],answer:1,
  falsifiers:['Mayor fracción alta con el mismo período','La carga no realiza trabajo mecánico','Con el período fijo, variar el tiempo alto no cambia la fracción activa observada'],falsifierAnswer:2,
  explain:'duty=ton/T·100%; PWM de mando no demuestra corriente en carga ni torque. La forma de onda no es captura de actuador real.'},
 {lessonId:'ckp-cmp',caseId:'lab-ckp-waveform-v1',waveform:'ckp',
  title:'CKP ficticio: inferí RPM desde la ventana de revolución',
  description:'Una rueda sintética con 60 posiciones, 2 ausentes y pulsos digitales de amplitud ideal. Variá el tiempo de una vuelta completa.',
  unit:'rpm',options:[{value:0.8,label:'80 ms por vuelta'},{value:1,label:'100 ms por vuelta'},{value:1.2,label:'120 ms por vuelta'}],
  hypotheses:['Menor tiempo por revolución indica menos RPM','Una única ausencia de pulso demuestra sensor defectuoso','Menor tiempo de revolución aumenta las RPM si es una vuelta real'],answer:2,
  falsifiers:['Cambiar amplitud de 5 a 4 V','Con vuelta bien identificada, una duración menor produce un cálculo de RPM menor','El modelo muestra las dos posiciones ausentes'],falsifierAnswer:1,
  explain:'RPM=60 000 ms/min ÷ tiempo por vuelta en ms. El hueco simula referencia de rueda; no se modelan sensores inductivos reales ni correlación CMP.'},
 {lessonId:'physical-can',caseId:'lab-can-differential-waveform-v1',waveform:'can',
  title:'CAN-H frente a CAN-L: discriminación diferencial',
  description:'Tramas de bits sintéticos con nivel recesivo de 2,5 V en ambas líneas. Variá el diferencial dominante sin alterar la secuencia temporal.',
  unit:'V',options:[{value:1,label:'Dominante diferencial 1 V'},{value:2,label:'Dominante diferencial 2 V'},{value:3,label:'Dominante diferencial 3 V'}],
  hypotheses:['La diferencia se calcula sumando CAN-H y CAN-L','Un par diferencial de 2 V implica necesariamente una ECU sana','La diferencia dominante es CAN-H menos CAN-L, independientemente del modo común ideal'],answer:2,
  falsifiers:['Un nivel recesivo cercano a 2,5 V en ambas líneas','Durante dominante, las dos señales coinciden en el mismo potencial pese al diferencial positivo supuesto','Una trama sintética posee 16 bits'],falsifierAnswer:1,
  explain:'Diferencial dominante = CAN-H − CAN-L; los valores sintéticos usan 2,5 V ± Δ/2 y no demuestran topología, terminación, bitrate ni integridad del bus.'}
];
export const WAVE_INQUIRIES=Object.freeze(experiments.map(x=>Object.freeze({...x,
 options:Object.freeze(x.options.map(y=>Object.freeze(y))),
 hypotheses:Object.freeze(x.hypotheses),falsifiers:Object.freeze(x.falsifiers)})));
const byLesson=new Map(WAVE_INQUIRIES.map(x=>[x.lessonId,x]));
export const waveInquiryFor=id=>byLesson.get(id)||null;
export function generateInquiryTrace(lessonId,variant,count=320){
 const e=waveInquiryFor(lessonId);
 if(!e||!e.options.some(o=>o.value===variant)||!Number.isFinite(variant))
  throw RangeError('Condición de oscilograma no disponible');
 const base=generateWaveform(e.waveform,count);
 const duration=base.scenario.duration*(e.waveform==='sine'||e.waveform==='ckp'?variant:1);
 const series=base.series.map(s=>{
  const t=s.t*(e.waveform==='sine'||e.waveform==='ckp'?variant:1);
  let values=s.values;
  if(e.waveform==='pwm')values=[(s.t%8)<8*variant/100?5:0];
  if(e.waveform==='can'){
   const dominant=s.values[0]>2.5;
   values=dominant?[2.5+variant/2,2.5-variant/2]:[2.5,2.5];
  }
  return {t,values};
 });
 const expected=e.waveform==='sine'?200/variant:
  e.waveform==='pwm'?variant:e.waveform==='ckp'?600/variant:variant;
 return {lessonId,variant,duration,unit:base.scenario.unit,
  labels:base.labels,series,expected,expectedUnit:e.unit,
  source:'GENERADO POR MODELO AUTOLAB; no proviene de ningún instrumento, vehículo ni OEM'};
}
const minText=(s,n)=>{
 if(typeof s!=='string'||s.trim().length<n||s.length>2500)
  throw RangeError('Explicá con al menos '+n+' caracteres (máximo 2500).');
 return s.trim();
};
export function evaluateInquiryTrace(input){
 const e=waveInquiryFor(input?.lessonId);
 if(!e)throw RangeError('Investigación de señales desconocida');
 const trace=generateInquiryTrace(e.lessonId,input.variant);
 if(!Number.isFinite(input.predicted)||input.predicted<0||input.predicted>1e5)
  throw RangeError('Introducí una predicción numérica finita y no negativa');
 if(!Number.isInteger(input.hypothesis)||input.hypothesis<0||input.hypothesis>2||
    !Number.isInteger(input.falsifier)||input.falsifier<0||input.falsifier>2)
  throw RangeError('Hipótesis o refutador inválidos');
 const explanation=minText(input.explanation,80),limits=minText(input.limits,60);
 const predictionCorrect=Math.abs(input.predicted-trace.expected)<=Math.max(0.05,0.025*trace.expected);
 const hypothesisCorrect=input.hypothesis===e.answer;
 const falsifierCorrect=input.falsifier===e.falsifierAnswer;
 return {model:WAVE_INQUIRY_MODEL,lessonId:e.lessonId,variant:input.variant,
  expected:trace.expected,unit:e.unit,predictionCorrect,hypothesisCorrect,falsifierCorrect,
  explanation,limits,score:40*Number(predictionCorrect)+25*Number(hypothesisCorrect)+25*Number(falsifierCorrect)+10,
  passed:predictionCorrect&&hypothesisCorrect&&falsifierCorrect,
  warning:'Captura dibujada con cálculos ideales, no osciloscopia real. Los textos libres no tienen evaluación semántica; no acredita diagnóstico, práctica física ni seguridad HV.'};
}
export function inquiryTraceRecord(input,result){
 const e=waveInquiryFor(input.lessonId);
 if(!e||result.model!==WAVE_INQUIRY_MODEL||result.lessonId!==e.lessonId||result.variant!==input.variant)
  throw RangeError('Evaluación e investigación incompatibles');
 const trace=generateInquiryTrace(e.lessonId,input.variant);
 return {id:e.caseId,date:new Date().toISOString(),score:result.score,passed:result.passed,report:[
  '# AutoLab — investigación de señal temporal',
  'Modelo: '+WAVE_INQUIRY_MODEL,'Lección: '+e.lessonId,
  'Condición: '+e.options.find(o=>o.value===input.variant).label,
  'H1 elegida y congelada: '+e.hypotheses[input.hypothesis],
  'Predicción congelada: '+input.predicted+' '+e.unit,
  'Criterio de falsación elegido: '+e.falsifiers[input.falsifier],
  'Resultado CALCULADO tras congelar: '+result.expected.toFixed(4)+' '+e.unit,
  'Duración de ventana del modelo: '+trace.duration+' '+trace.unit,
  'Hipótesis compatible con este modelo: '+e.hypotheses[e.answer],
  'Criterio que refutaría este modelo: '+e.falsifiers[e.falsifierAnswer],
  'Fundamento didáctico: '+e.explain,
  'Predicción compatible: '+result.predictionCorrect,
  'Hipótesis compatible: '+result.hypothesisCorrect,
  'Falsador compatible: '+result.falsifierCorrect,
  'Justificación libre NO evaluada semánticamente: '+result.explanation,
  'Límites y procedencia NO evaluados semánticamente: '+result.limits,
  'Nota objetiva: '+result.score+'/100','Aprobación: '+result.passed,result.warning
 ].join('\n')};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export function renderInquiryOscillogram(trace){
 const W=600,H=230,L=48,R=18,T=16,B=38,plotW=W-L-R,plotH=H-T-B;
 const xmax=trace.duration,ymax=6,coord=(x,y)=>[
  (L+x/xmax*plotW).toFixed(2),(T+(ymax-y)/ymax*plotH).toFixed(2)];
 const colors=['#60d9c7','#ffba73'];
 const guides=[0,1.5,3,4.5,6].map(y=>{
  const v=coord(0,y)[1];
  return '<line x1="'+L+'" y1="'+v+'" x2="'+(W-R)+'" y2="'+v+'" stroke="#476073" stroke-width="0.7"/>'+
   '<text x="4" y="'+(Number(v)+4)+'" fill="#d4e6f5" font-size="11">'+y.toFixed(1)+' V</text>';
 }).join('');
 const paths=trace.labels.map((label,channel)=>{
  const d=trace.series.map((s,i)=>{const [x,y]=coord(s.t,s.values[channel]);return (i?'L':'M')+x+','+y;}).join(' ');
  return '<path d="'+d+'" stroke="'+colors[channel]+'" stroke-width="2.6" fill="none" stroke-linejoin="round"/>';
 }).join('');
 return '<figure class="inquiry-oscillogram"><svg viewBox="0 0 600 230" role="img" aria-label="Señal sintética con eje temporal en '+esc(trace.unit)+' y eje vertical en voltios">'+
 '<rect x="'+L+'" y="'+T+'" width="'+plotW+'" height="'+plotH+'" fill="#0b1e2e" />'+guides+paths+
 '<text x="'+L+'" y="221" fill="#d4e6f5" font-size="12">0</text>'+
 '<text x="'+(W-R)+'" y="221" text-anchor="end" fill="#d4e6f5" font-size="12">'+trace.duration.toFixed(2)+' '+esc(trace.unit)+'</text></svg>'+
 '<figcaption class="muted">Oscilograma GENERADO, sin hardware ni vehículo. '+trace.labels.map((label,i)=>'<span style="color:'+colors[i]+'">'+esc(label)+'</span>').join(' · ')+'</figcaption></figure>';
}
export function mountWaveInquiry(root,{lessonId,record,onSaved=()=>{}}){
 const e=waveInquiryFor(lessonId);
 if(!e||!root||typeof record!=='function')throw RangeError('Oscilograma de lección inválido');
 let locked=null,grade=null,error='',saving=false,saved=false;
 const options=v=>v.map((name,i)=>'<option value="'+i+'">'+esc(name)+'</option>').join('');
 function render(){
  let html='<div class="panel stack waveform-inquiry"><div class="eyebrow">OSCILOSCOPÍA · PREDICCIÓN ANTES DE REVELAR</div>'+
   '<h3>'+esc(e.title)+'</h3><p>'+esc(e.description)+'</p>'+
   '<p class="muted">La captura permanece oculta hasta congelar hipótesis, valor y falsador. Los datos provienen solo de modelos digitales didácticos.</p>';
  if(!locked){
   html+='<label for="wi-variant">Parámetro a investigar</label><select class="field" id="wi-variant">'+e.options.map(o=>'<option value="'+o.value+'">'+esc(o.label)+'</option>').join('')+'</select>'+
    '<label for="wi-hypothesis">Hipótesis conceptual</label><select class="field" id="wi-hypothesis"><option value="">Elegí</option>'+options(e.hypotheses)+'</select>'+
    '<label for="wi-predicted">Valor predicho ('+esc(e.unit)+')</label><input class="field" id="wi-predicted" type="number" step="any" inputmode="decimal" placeholder="Predecí antes de ver la forma de onda"/>'+
    '<label for="wi-falsifier">¿Qué resultado refutaría el criterio?</label><select class="field" id="wi-falsifier"><option value="">Elegí</option>'+options(e.falsifiers)+'</select>'+
    '<label for="wi-explanation">Justificación y prueba (mínimo 80 caracteres)</label><textarea class="field" id="wi-explanation" rows="3" maxlength="2500"></textarea>'+
    '<label for="wi-limits">Fuentes de incertidumbre y límites (mínimo 60 caracteres)</label><textarea class="field" id="wi-limits" rows="3" maxlength="2500"></textarea>'+
    '<button type="button" class="button" data-wave-inquiry="freeze">Congelar predicción y revelar oscilograma</button>';
  }else{
   const trace=generateInquiryTrace(lessonId,locked.variant);
   html+='<p><strong>Condición congelada:</strong> '+esc(e.options.find(o=>o.value===locked.variant).label)+'</p>'+
    '<p><strong>Hipótesis congelada:</strong> '+esc(e.hypotheses[locked.hypothesis])+'</p>'+
    '<p><strong>Predicción congelada:</strong> '+locked.predicted+' '+esc(e.unit)+'</p>'+
    renderInquiryOscillogram(trace)+
    '<p><strong>Resultado del modelo:</strong> '+grade.expected.toFixed(3)+' '+esc(e.unit)+' · '+grade.score+'/100</p>'+
    '<p><strong>Interpretación:</strong> '+esc(e.explain)+'</p>'+
    '<p><strong>Hipótesis compatible:</strong> '+esc(e.hypotheses[e.answer])+'</p>'+
    '<p><strong>Refutador conceptual:</strong> '+esc(e.falsifiers[e.falsifierAnswer])+'</p>'+
    '<p class="muted">'+esc(grade.warning)+'</p>'+
    '<div class="row"><button type="button" class="button" data-wave-inquiry="save" '+(saving||saved?'disabled':'')+'>'+(saved?'Evidencia guardada':'Guardar evidencia del oscilograma')+'</button>'+
    '<button type="button" class="button alt" data-wave-inquiry="reset">Replantear investigación</button></div>';
  }
  html+='<p role="status" aria-live="polite" class="muted">'+esc(error)+'</p></div>';
  root.innerHTML=html;
 }
 root.addEventListener('click',async ev=>{
  const button=ev.target.closest('[data-wave-inquiry]');if(!button||!root.contains(button))return;
  const action=button.dataset.waveInquiry;error='';
  if(action==='reset'){locked=null;grade=null;saved=false;render();return;}
  if(action==='freeze'&&!locked){
   try{
    const get=id=>root.querySelector('#wi-'+id)?.value??'';
    if(get('hypothesis')===''||get('falsifier')===''||get('predicted').trim()==='')
     throw RangeError('Completá hipótesis, predicción y falsador antes de revelar');
    const value={lessonId,variant:Number(get('variant')),hypothesis:Number(get('hypothesis')),
     falsifier:Number(get('falsifier')),predicted:Number(get('predicted')),
     explanation:get('explanation'),limits:get('limits')};
    grade=evaluateInquiryTrace(value);locked=value;
   }catch(e){error=e instanceof RangeError?e.message:'No se pudo evaluar la señal.';locked=null;grade=null;}
  }else if(action==='save'&&locked&&grade&&!saved&&!saving){
   saving=true;try{await record(inquiryTraceRecord(locked,grade));saved=true;onSaved(grade);}
   catch{error='No se confirmó el guardado del expediente.';}finally{saving=false;}
  }
  if(root.isConnected)render();
 });
 render();
}
