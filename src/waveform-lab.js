/**
 * Synthetic waveforms for training visual interpretation; NO hardware capture.
 * NOT an OEM waveform library, CAN protocol decoder, or electrical safety tool.
 */
export const WAVEFORM_LAB_VERSION='waveforms-v1';
export const WAVEFORM_SCENARIOS=[
 {id:'pwm',title:'PWM · ciclo de trabajo',topic:'senales',duration:16,unit:'ms',yMax:6,
  description:'Actuador de banco simulado con 5 V y período de 8 ms. Tiempo activo: 2 ms. Observá la proporción de señal alta.',
  question:'¿Qué porcentaje de duty tiene esta señal en un ciclo completo?',
  target:25,answerUnit:'%',tolerance:0.1,formula:'(2 ms ÷ 8 ms) × 100 = 25%',
  source:'https://www.picoauto.com/library/automotive-guided-tests/'},
 {id:'ckp',title:'CKP · referencia de rueda fónica',topic:'senales',duration:100,unit:'ms',yMax:6,
  description:'Rueda didáctica de 60 posiciones, con dos ausentes. La captura dura una revolución completa de 100 ms, con amplitud digital ficticia.',
  question:'Si una revolución completa dura 100 ms, ¿cuál es la velocidad de giro?',
  target:600,answerUnit:'rpm',tolerance:1,formula:'60 000 ms/min ÷ 100 ms/vuelta = 600 rpm',
  source:'https://www.picoauto.com/library/automotive-guided-tests/'},
 {id:'can',title:'CAN · señal diferencial simplificada',topic:'redes',duration:32,unit:'µs',yMax:5,
  description:'Bus CAN clásico sintético, velocidad 500 kbit/s. CAN-H está en 3,5 V durante dominante y CAN-L en 1,5 V; ambos en 2,5 V durante recesivo.',
  question:'Durante un bit dominante, ¿cuál es la diferencia CAN-H menos CAN-L?',
  target:2,answerUnit:'V',tolerance:0.05,formula:'3,5 V − 1,5 V = 2,0 V',
  source:'https://kvaser.com/can-protocol-tutorial/'},
 {id:'sine',title:'Onda senoidal · frecuencia',topic:'senales',duration:20,unit:'ms',yMax:6,
  description:'Sensor ficticio de 0,5 a 4,5 V, centrado en 2,5 V. La curva repite un ciclo cada 5 ms.',
  question:'¿Qué frecuencia corresponde al período observado de 5 ms?',
  target:200,answerUnit:'Hz',tolerance:0.5,formula:'f = 1 ÷ 0,005 s = 200 Hz',
  source:'https://www.picoauto.com/library/automotive-guided-tests/'}
];
const patterns=[1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,0];
export function generateWaveform(id,count=600){
 const scenario=WAVEFORM_SCENARIOS.find(x=>x.id===id);
 if(!scenario)throw Error('Escenario de osciloscopio desconocido');
 if(!Number.isInteger(count)||count<100||count>2000)throw Error('Cantidad de muestras inválida');
 const series=[];
 for(let i=0;i<count;i++){
  const t=i*(scenario.duration/(count-1));
  let values;
  if(id==='pwm')values=[(t%8)<2?5:0];
  else if(id==='ckp'){
   const pos=t/100*60;
   const index=Math.min(59,Math.floor(pos));
   values=[index<58&&(pos-index)<0.43?5:0];
  }else if(id==='can'){
   const bit=Math.min(15,Math.floor(t/2));
   const dominant=patterns[bit]===1;
   values=[dominant?3.5:2.5,dominant?1.5:2.5];
  }else values=[2.5+2*Math.sin(2*Math.PI*t/5)];
  series.push({t,values});
 }
 return {scenario,series,labels:id==='can'?['CAN-H','CAN-L']:['Señal A'],source:'AutoLab · forma de onda sintética, sin equipo conectado'};
}
export function parseWaveAnswer(value){
 if(typeof value!=='string'||value.length>30||!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim()))throw Error('Introducí solo un número, con punto o coma decimal.');
 const parsed=Number(value.replace(',','.'));
 if(!Number.isFinite(parsed))throw Error('El valor debe ser finito');
 return parsed;
}
export function gradeWaveform(id,value){
 const scenario=WAVEFORM_SCENARIOS.find(x=>x.id===id);
 if(!scenario)throw Error('Escenario de osciloscopio desconocido');
 const parsed=parseWaveAnswer(value);
 const success=Math.abs(parsed-scenario.target)<=scenario.tolerance+1e-10;
 return {id,entered:parsed,success,score:success?100:0,expected:scenario.target,
  tolerance:scenario.tolerance,unit:scenario.answerUnit,formula:scenario.formula,
  humanReviewRequired:true};
}
