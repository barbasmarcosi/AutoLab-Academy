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
  explain:'En el modelo I = V/R, usando V=0,050 V y R en Ω; incertidumbre, conexiones Kelvin y autocalentamiento requieren ensayos externos.'},
 {lessonId:'pullups',caseId:'lab-numeric-pullup-v1',title:'Pull-up: el nivel lógico depende del camino a masa',
  units:'V',description:'Entrada ideal con referencia 5 V y pull-up de 10 kΩ. Seleccioná una resistencia de retorno a masa NO IDEAL: 5, 10 o 20 kΩ. Con circuito realmente abierto el nodo tendería a 5 V.',
  options:[{value:5,label:'Retorno a masa de 5 kΩ'},{value:10,label:'Retorno a masa de 10 kΩ'},{value:20,label:'Retorno a masa de 20 kΩ'}],
  hypotheses:['Aumentar el retorno a masa reduce la tensión de nodo','Un pull-up convierte todo circuito abierto en 0 V','Aumentar el retorno a masa eleva la tensión del nodo en el divisor ideal'],answer:2,
  falsifiers:['Una resistencia más grande deja el nodo más alto','Con referencia fija y pull-up constante, mayor resistencia a masa produce voltaje menor','Un esquema de pines identifica la resistencia nominal'],falsifierAnswer:1,
  explain:'Con Rpull=10 kΩ y Rmasa conocida, Vnodo=5·Rmasa/(10+Rmasa). Un circuito abierto y un contacto cerrado ideal no son los tres retornos resistivos aquí estudiados.'},
 {lessonId:'actuator-power',caseId:'lab-numeric-pwm-v1',title:'PWM: promedio matemático versus corriente de actuador',
  units:'V',description:'Señal cuadrada ideal de mando de 12 V a 0 V. Elegí duty cycle 25/50/75 % para calcular su tensión promedio temporal; no se modela el driver ni la corriente de una carga.',
  options:[{value:25,label:'Duty ideal 25 %'},{value:50,label:'Duty ideal 50 %'},{value:75,label:'Duty ideal 75 %'}],
  hypotheses:['El promedio siempre es 12 V para cualquier duty','La tensión media ideal crece proporcionalmente al duty','La tensión media demuestra el par del actuador real'],answer:1,
  falsifiers:['Un duty mayor produce mayor promedio dentro del modelo','El osciloscopio muestra frecuencia PWM estable','Con niveles y fuente constantes, promedios iguales para 25 % y 75 %'],falsifierAnswer:2,
  explain:'El promedio de una onda cuadrada ideal que conmuta entre 0 y 12 V vale 12·duty/100. No establece corriente, torque ni accionamiento real.'},
 {lessonId:'can',caseId:'lab-numeric-can-termination-v1',title:'Terminación CAN: resistencia equivalente ideal en paralelo',
  units:'Ω',description:'Red desconectada de toda energía dentro de un MODELO. Calculá la resistencia equivalente de 1, 2 o 3 terminaciones idénticas de 120 Ω en paralelo. Tres terminaciones son una situación hipotética, no una recomendación de modificación de buses.',
  options:[{value:1,label:'Una resistencia de 120 Ω'},{value:2,label:'Dos resistencias de 120 Ω'},{value:3,label:'Tres resistencias de 120 Ω (hipotético)'}],
  hypotheses:['Más resistencias iguales en paralelo aumentan R equivalente','La resistencia equivalente es 120 Ω para cualquier número','Más resistencias iguales en paralelo disminuyen R equivalente'],answer:2,
  falsifiers:['El circuito tiene una ECU en cada extremo','Al agregar un resistor paralelo idéntico, la resistencia equivalente aumenta con el resto aislado','Dos resistores nominales son de 120 Ω'],falsifierAnswer:1,
  explain:'Req=120 Ω/n en paralelo ideal. Esta cuenta aislada no certifica integridad de CAN ni permite inferir resistencias conectadas a vehículos energizados.'}
,
 {lessonId:'resistive-loss',caseId:'lab-numeric-resistive-loss-v1',title:'Pérdida I²R: corriente, contacto y calor ideal',
  units:'W',description:'Contacto ficticio de 0,25 Ω a resistencia constante, sin circuito energizado. Elegí corriente sintética de 2, 4 o 6 A y predecí la potencia resistiva.',
  options:[{value:2,label:'Corriente modelo 2 A'},{value:4,label:'Corriente modelo 4 A'},{value:6,label:'Corriente modelo 6 A'}],
  hypotheses:['Si I se duplica con R fija, la pérdida se cuadruplica','P crece linealmente con I aunque R sea fija','No se libera energía en ninguna resistencia'],answer:0,
  falsifiers:['Un contacto que se calienta en uso real','Con R fija y condición controlada, duplicar I produce una pérdida dos veces mayor','Un cable está rotulado cobre'],falsifierAnswer:1,
  explain:'P=I²R con resistencia CONSTANTE de 0,25 Ω; al duplicar I, P se cuadruplica. No se predice temperatura del conector, incendio ni disipación real.'},
 {lessonId:'mosfet-control',caseId:'lab-numeric-mosfet-v1',title:'MOSFET low-side: pérdida de conducción no es umbral de puerta',
  units:'W',description:'MOSFET IDEALMENTE saturado en conducción con RDS(on) ficticia fija de 0,050 Ω. Simulá corriente de 2, 4 o 6 A: calculá solamente la pérdida resistiva.',
  options:[{value:2,label:'Corriente modelo 2 A'},{value:4,label:'Corriente modelo 4 A'},{value:6,label:'Corriente modelo 6 A'}],
  hypotheses:['VGS(th) garantiza baja RDS(on) en cualquier equipo','Pconducción=I²RDS(on) suponiendo MOSFET totalmente excitado','No existen pérdidas al encender un MOSFET real'],answer:1,
  falsifiers:['A mayor I con RDS fija crece I²R','La puerta recibe una orden PWM','Con RDS comprobada fija, el doble de corriente produce el doble de pérdida y no cuatro veces'],falsifierAnswer:2,
  explain:'Pcond=I²·0,05 Ω para un dispositivo completamente excitado y con RDS fija; no calcula carga de puerta, transitorios, pérdidas de conmutación ni temperatura.'},
 {lessonId:'inductive-load',caseId:'lab-numeric-inductor-energy-v1',title:'Bobina: la energía almacenada no es solo corriente',
  units:'J',description:'Inductancia ideal L=0,20 H en un modelo sin hardware. Variá I=2, 4 o 6 A y predecí la energía magnética almacenada en régimen.',
  options:[{value:2,label:'Corriente ideal 2 A'},{value:4,label:'Corriente ideal 4 A'},{value:6,label:'Corriente ideal 6 A'}],
  hypotheses:['E aumenta en forma cuadrática con I para L constante','E es independiente de I','E se reduce si la corriente crece'],answer:0,
  falsifiers:['Una bobina precisa protección de apagado','Un valor nominal de inductancia','Con L constante, el doble de I implica solo el doble de energía y no cuatro veces'],falsifierAnswer:2,
  explain:'E=1/2·L·I². Describe energía ideal almacenada, NO velocidad de desmagnetización, flyback real ni tensiones peligrosas de desconexión.'},
 {lessonId:'ground-reference-network',caseId:'lab-numeric-shared-return-v1',title:'Masa compartida: corriente ajena puede desplazar la referencia',
  units:'V',description:'Retorno común de 50 mΩ con corriente total sintética de 2, 4 o 6 A. Calculá exclusivamente el salto de potencial I·R del retorno, NO una falla CAN.',
  options:[{value:2,label:'Corriente de retorno 2 A'},{value:4,label:'Corriente de retorno 4 A'},{value:6,label:'Corriente de retorno 6 A'}],
  hypotheses:['La referencia local es idéntica a cualquier masa bajo carga','La caída I·R aumenta proporcionalmente con la corriente si R es constante','Una caída positiva prueba el fallo de una ECU determinada'],answer:1,
  falsifiers:['Una etiqueta de gateway','La presencia de mensajes CAN','Con R estable y la misma condición, el doble de corriente mantiene exactamente la misma caída'],falsifierAnswer:2,
  explain:'ΔV=I·0,050 Ω. La referencia local puede moverse respecto de otro punto; no determina el origen de síntomas CAN, offsets reales ni las rutas físicas de masa.'},
 {lessonId:'dcdc-switches',caseId:'lab-numeric-buck-v1',title:'Buck DC/DC: promedio ideal con duty y fuente LV',
  units:'V',description:'Convertidor BUCK ideal ficticio de 12 V de entrada en conducción continua, sin pérdidas ni rizado. Elegí duty 25, 50 o 75 % y predecí Vout ideal.',
  options:[{value:25,label:'Duty modelo 25 %'},{value:50,label:'Duty modelo 50 %'},{value:75,label:'Duty modelo 75 %'}],
  hypotheses:['Vout se iguala siempre a Vin en cualquier duty','Vout ideal aumenta con duty según D·Vin bajo estas hipótesis','El duty determina por sí solo temperatura y calidad de regulación real'],answer:1,
  falsifiers:['Dos duty distintos generan Vout diferentes en el modelo','El inductor está representado esquemáticamente','Con Vin fija y condiciones ideales, duty 75 % entrega menos voltaje que duty 25 %'],falsifierAnswer:2,
  explain:'Vout≈D·Vin en un buck IDEAL de conducción continua, Vin=12 V. No simula conmutación, control de corriente, saturación, BMS, pérdidas o tensión HV.'}

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
 if(lessonId==='pullups')return 5*variant/(10+variant);
 if(lessonId==='actuator-power')return 12*variant/100;
 if(lessonId==='can')return 120/variant;
 if(lessonId==='resistive-loss')return variant*variant*0.25;
 if(lessonId==='mosfet-control')return variant*variant*0.05;
 if(lessonId==='inductive-load')return 0.1*variant*variant;
 if(lessonId==='ground-reference-network')return 0.05*variant;
 if(lessonId==='dcdc-switches')return 12*variant/100;
 throw RangeError('Experimento no disponible');
}
/** Sensitivity table revealed only AFTER the learner freezes a prediction. */
export function numericBenchSensitivity(lessonId){
 const bench=numericBenchFor(lessonId);
 if(!bench)throw RangeError('Experimento no disponible');
 return Object.freeze(bench.options.map(option=>Object.freeze({
  value:option.value,label:option.label,result:computeNumericBench(lessonId,option.value),
  units:bench.units
 })));
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
 const maximum=Math.max(1000,4*Math.max(...numericBenchSensitivity(bench.lessonId).map(x=>x.result)));
 if(!Number.isFinite(input.predicted)||input.predicted<0||input.predicted>maximum)
  throw RangeError('La predicción debe ser un número finito y no negativo dentro de la escala del banco.');
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
  'Modelo: '+NUMERIC_BENCH_MODEL,
  'Lección: '+b.lessonId,'Caso: '+b.title,
  'Condición seleccionada: '+selection.label,
  'Hipótesis congelada: '+b.hypotheses[input.hypothesis],
  'Predicción numérica congelada: '+input.predicted+' '+b.units,
  'Criterio refutador congelado: '+b.falsifiers[input.falsifier],
  'Resultado CALCULADO del modelo: '+result.result.toFixed(4)+' '+b.units,
  'Error absoluto: '+result.difference.toFixed(4)+' '+b.units,
  'Predicción dentro de tolerancia declarada: '+result.withinTolerance,
  'Hipótesis objetiva compatible: '+result.hypothesisCorrect,
  'Criterio de hipótesis en el modelo: '+b.hypotheses[b.answer],
  'Criterio refutador objetivo compatible: '+result.falsifierCorrect,
  'Refutador correcto del modelo: '+b.falsifiers[b.falsifierAnswer],
  'Fundamento físico-matemático del modelo: '+b.explain,
  'Sensibilidad PARAMÉTRICA (modelo, NO mediciones):',
  ...numericBenchSensitivity(b.lessonId).map(row=>row.label+': '+row.result.toFixed(4)+' '+row.units),
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
   '<p><strong>Hipótesis compatible:</strong> '+escapeHtml(bench.hypotheses[bench.answer])+'</p>'+
   '<p><strong>Refutador conceptual:</strong> '+escapeHtml(bench.falsifiers[bench.falsifierAnswer])+'</p>'+
   '<p>'+escapeHtml(bench.explain)+'</p>'+
   '<table class="numeric-sensitivity"><caption>Ensayo de sensibilidad (resultados calculados, no mediciones)</caption><thead><tr><th scope="col">Parámetro</th><th scope="col">Resultado ideal</th></tr></thead><tbody>'+
   numericBenchSensitivity(lessonId).map(row=>'<tr><th scope="row">'+escapeHtml(row.label)+'</th><td>'+row.result.toFixed(4)+' '+escapeHtml(row.units)+'</td></tr>').join('')+
   '</tbody></table>'+
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
