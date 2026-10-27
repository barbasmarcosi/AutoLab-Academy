/**
 * Three transparent low-voltage MATHEMATICAL experiments integrated in lessons.
 * Calculated values are model outputs, NEVER simulated instrument observations,
 * OEM specifications, or evidence of physical automotive competence.
 */
export const NUMERIC_BENCH_MODEL='autolab-numeric-bench-v1';
const experiments=[
 {lessonId:'voltage-dividers',caseId:'lab-numeric-divider-v1',title:'Divisor con carga: modelá el efecto de la impedancia',
  units:'V',description:'Fuente ideal 5 V; R superior=10 kΩ; R inferior=10 kΩ. Elegí una carga resistiva en paralelo a la inferior. Sin carga Vout=2,50 V.',
  options:[{value:5,label:'Carga 5 kΩ'},{value:10,label:'Carga 10 kΩ'},{value:20,label:'Carga 20 kΩ'}],
  hypotheses:['Una carga paralela finita reduce la salida','La salida no cambia con la carga','Una carga paralela aumenta la salida'],answer:0,
  falsifiers:['Con Vin fija, una carga finita reproduce la misma salida que un divisor sin carga','Con Vin fija, la salida cae al conectar una carga finita','Una etiqueta nominal especifica 5 V'],falsifierAnswer:0,
  explain:'La rama inferior equivalente es el paralelo de R inferior con la carga; el modelo usa la ley de Ohm y no contempla tolerancias ni ruido.'},
 {lessonId:'rc-input',caseId:'lab-numeric-rc-v1',title:'Filtro RC: anticipá la constante de tiempo',
  units:'s',description:'Capacitancia ideal fija C=100 µF. Elegí la resistencia de la entrada y predecí τ = R·C (no el tiempo de asentamiento completo).',
  options:[{value:1,label:'Resistencia 1 kΩ'},{value:2,label:'Resistencia 2 kΩ'},{value:4,label:'Resistencia 4 kΩ'}],
  hypotheses:['Duplicar R reduce τ','τ es independiente de R','τ crece proporcionalmente con R'],answer:2,
  falsifiers:['La señal alcanza el valor final instantáneamente','Una constante τ que no varía con R, con C realmente constante y referencia temporal válida','El instrumento registra el número de parte'],falsifierAnswer:1,
  explain:'τ = R·C; el modelo supone fuente ideal, capacitor ideal, ausencia de carga y unidades SI. Un RC real puede agregar impedancia y tolerancia.'},
 {lessonId:'current-shunt',caseId:'lab-numeric-shunt-v1',title:'Shunt: calculá corriente desde caída diferencial',
  units:'A',description:'En un circuito LV teórico se mantienen 50 mV diferenciales constantes. Elegí el valor REAL del shunt (no su etiqueta nominal de 10 mΩ).',
  options:[{value:12.5,label:'Shunt real 12,5 mΩ'},{value:20,label:'Shunt real 20 mΩ'},{value:25,label:'Shunt real 25 mΩ'}],
  hypotheses:['A igual ΔV, mayor R implica menor corriente inferida','A igual ΔV, mayor R implica mayor corriente','La resistencia no afecta el cociente ΔV/R'],answer:0,
  falsifiers:['Una corriente inferida menor al aumentar R','Una etiqueta de color de la resistencia','Con ΔV fija, una R mayor medida da una corriente mayor a la R menor'],falsifierAnswer:2,
  explain:'En el modelo I = V/R, usando V=0,050 V y R en Ω; incertidumbre, conexiones Kelvin y autocalentamiento requieren ensayos externos.'}
];
export const NUMERIC_BENCHES=Object.freeze(experiments.map(x=>Object.freeze({...x,
 options:Object.freeze(x.options.map(v=>Object.freeze(v))),hypotheses:Object.freeze(x.hypotheses),
 falsifiers:Object.freeze(x.falsifiers)})));
const catalog=new Map(NUMERIC_BENCHES.map(x=>[x.lessonId,x]));
export const numericBenchFor=id=>catalog.get(id)||null;
export function computeNumericBench(lessonId,variant){
 const bench=numericBenchFor(lessonId);
 const option=bench?.options.find(o=>o.value===variant);
 if(!option||!Number.isFinite(variant))throw RangeError('Seleccioná una condición disponible en el banco');
 if(lessonId==='voltage-dividers'){
  const lower=10*variant/(10+variant);
  return 5*lower/(10+lower);
 }
 if(lessonId==='rc-input')return variant*0.1;
 if(lessonId==='current-shunt')return 50/variant;
 throw RangeError('Experimento no disponible');
}
const textAtLeast=(value,min)=>{
 if(typeof value!=='string'||value.trim().length<min||value.length>2500)
  throw RangeError('Explicá el criterio (mínimo '+min+' caracteres y máximo 2500).');
 return value.trim();
};
export function gradeNumericBench(input){
 const bench=numericBenchFor(input?.lessonId);
 if(!bench)throw RangeError('Banco inexistente');
 const result=computeNumericBench(bench.lessonId,input.variant);
 if(!Number.isFinite(input.predicted)||input.predicted<0||input.predicted>100)
  throw RangeError('La predicción debe ser un número válido y no negativo.');
 if(!Number.isInteger(input.hypothesis)||input.hypothesis<0||input.hypothesis>2||
    !Number.isInteger(input.falsifier)||input.falsifier<0||input.falsifier>2)
  throw RangeError('Congelá hipótesis y refutador antes de observar');
 const explanation=textAtLeast(input.explanation,80);
 const limitations=textAtLeast(input.limitations,60);
 const difference=Math.abs(input.predicted-result);
 const withinTolerance=difference<=Math.max(0.02,Math.abs(result)*0.03);
 const hypothesisCorrect=input.hypothesis===bench.answer;
 const falsifierCorrect=input.falsifier===bench.falsifierAnswer;
 const score=40*Number(withinTolerance)+25*Number(hypothesisCorrect)+25*Number(falsifierCorrect)+10;
 return Object.freeze({model:NUMERIC_BENCH_MODEL,lessonId:bench.lessonId,variant:input.variant,
  result,units:bench.units,difference,withinTolerance,hypothesisCorrect,falsifierCorrect,
  score,passed:withinTolerance&&hypothesisCorrect&&falsifierCorrect,
  explanation,limitations,
  warning:'Evidencia de predicción y cálculo con un modelo matemático ideal; el texto no fue corregido semánticamente. No equivale a medición, práctica física, certificación ni pericia HV.'});
}
export function numericBenchRecord(input,result){
 const b=numericBenchFor(input.lessonId);
 if(!b||result.model!==NUMERIC_BENCH_MODEL||result.lessonId!==b.lessonId||
    result.variant!==input.variant)throw RangeError('Resultado y ejercicio incompatibles');
 const selection=b.options.find(x=>x.value===input.variant);
 return {id:b.caseId,date:new Date().toISOString(),score:result.score,passed:result.passed,
  model:NUMERIC_BENCH_MODEL,report:[
  '# AutoLab — banco numérico de baja tensión (modelo ideal)',
  'Lección: '+b.lessonId,'Caso: '+b.title,
  'Condición seleccionada: '+selection.label,
  'Hipótesis congelada: '+b.hypotheses[input.hypothesis],
  'Predicción numérica congelada: '+input.predicted+' '+b.units,
  'Criterio refutador congelado: '+b.falsifiers[input.falsifier],
  'Resultado CALCULADO del modelo: '+result.result.toFixed(4)+' '+b.units,
  'Error absoluto: '+result.difference.toFixed(4)+' '+b.units,
  'Predicción dentro de tolerancia declarada: '+result.withinTolerance,
  'Hipótesis objetiva compatible: '+result.hypothesisCorrect,
  'Criterio refutador objetivo compatible: '+result.falsifierCorrect,
  'Explicación libre NO evaluada semánticamente: '+result.explanation,
  'Límites declarados NO evaluados semánticamente: '+result.limitations,
  'Nota estructurada: '+result.score+'/100','Aprobación del cálculo: '+result.passed,
  result.warning].join('\n')};
}
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountNumericBench(root,{lessonId,record,onSaved=()=>{}}){
 const bench=numericBenchFor(lessonId);
 if(!bench||!root||typeof record!=='function')throw RangeError('Banco numérico no disponible');
 let locked=null,result=null,saving=false,saved=false,error='';
 const option=(values)=>values.map((v,i)=>'<option value="'+i+'">'+escapeHtml(v)+'</option>').join('');
 const draw=()=>{
  let html='<div class="panel stack numeric-bench"><div class="eyebrow">LABORATORIO NUMÉRICO · MODELO IDEAL DE BAJA TENSIÓN</div>'+
    '<h3>'+escapeHtml(bench.title)+'</h3><p>'+escapeHtml(bench.description)+'</p>'+
    '<p class="muted">Primero congelá la predicción, la causa y qué refutaría el modelo. Después se revela un cálculo determinista: NO es una medición de instrumento ni un ensayo HV.</p>';
  if(!locked){
   html+='<label for="nb-variant">Condición para investigar</label><select class="field" id="nb-variant">'+
     bench.options.map(o=>'<option value="'+o.value+'">'+escapeHtml(o.label)+'</option>').join('')+'</select>'+
    '<label for="nb-hypothesis">Hipótesis de comportamiento</label><select class="field" id="nb-hypothesis"><option value="">Elegí una hipótesis</option>'+option(bench.hypotheses)+'</select>'+
    '<label for="nb-predicted">Predicción numérica ('+escapeHtml(bench.units)+')</label>'+
    '<input class="field" id="nb-predicted" type="number" step="any" inputmode="decimal" placeholder="Valor que esperás antes de revelar"/>'+
    '<label for="nb-falsifier">¿Qué hallazgo refutaría tu criterio?</label><select class="field" id="nb-falsifier"><option value="">Elegí un refutador</option>'+option(bench.falsifiers)+'</select>'+
    '<label for="nb-explanation">Justificación de la predicción (mínimo 80 caracteres)</label>'+
    '<textarea class="field" id="nb-explanation" rows="3" maxlength="2500"></textarea>'+
    '<label for="nb-limitations">Fuentes de incertidumbre y límites (mínimo 60 caracteres)</label>'+
    '<textarea class="field" id="nb-limitations" rows="3" maxlength="2500"></textarea>'+
    '<button class="button" type="button" data-numeric="lock">Congelar predicción y calcular el modelo</button>';
  }else{
   html+='<p><strong>Condición congelada:</strong> '+escapeHtml(bench.options.find(x=>x.value===locked.variant)?.label)+'</p>'+
   '<p><strong>Hipótesis congelada:</strong> '+escapeHtml(bench.hypotheses[locked.hypothesis])+'</p>'+
   '<p><strong>Predicción congelada:</strong> '+locked.predicted+' '+escapeHtml(bench.units)+'</p>'+
   '<p><strong>Resultado matemático:</strong> '+result.result.toFixed(4)+' '+escapeHtml(bench.units)+'</p>'+
   '<p><strong>Contraste estructurado:</strong> '+result.score+'/100 · '+(result.passed?'cálculo compatible':'revisar la hipótesis o el valor predicho')+'</p>'+
   '<p class="muted">'+escapeHtml(result.warning)+'</p>'+
   '<button class="button" type="button" data-numeric="save" '+(saved||saving?'disabled':'')+'>'+(saved?'Cálculo guardado':'Guardar evidencia del banco numérico')+'</button> '+
   '<button class="button alt" type="button" data-numeric="reset">Realizar otro contraste</button>';
  }
  html+='<p role="status" aria-live="polite" class="muted">'+escapeHtml(error)+'</p></div>';
  root.innerHTML=html;
 };
 root.addEventListener('click',async e=>{
  const button=e.target.closest('[data-numeric]');if(!button||!root.contains(button))return;
  const action=button.dataset.numeric;error='';
  if(action==='reset'){locked=null;result=null;saved=false;draw();return;}
  if(action==='lock'&&!locked){
   try{
    const get=id=>root.querySelector('#nb-'+id)?.value??'';
    const h=get('hypothesis'),f=get('falsifier'),v=get('predicted');
    if(h===''||f===''||v.trim()==='')throw RangeError('Definí hipótesis, predicción y criterio refutador antes de calcular.');
    locked={lessonId,variant:Number(get('variant')),hypothesis:Number(h),predicted:Number(v),
     falsifier:Number(f),explanation:get('explanation'),limitations:get('limitations')};
    result=gradeNumericBench(locked);
   }catch(x){locked=null;result=null;error=x instanceof RangeError?x.message:'No se pudo calcular el banco.';}
  }else if(action==='save'&&locked&&result&&!saved&&!saving){
   saving=true;try{await record(numericBenchRecord(locked,result));saved=true;onSaved(result);}
   catch{error='No se confirmó la persistencia de la evidencia.';}finally{saving=false;}
  }
  if(root.isConnected)draw();
 });
 draw();
}
