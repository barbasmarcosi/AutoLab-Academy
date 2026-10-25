/** Modelos algebraicos didácticos de baja tensión: sin SPICE, OEM ni vehículo. */
export const componentScenarios=[
 {id:'divider',title:'Divisor de tensión de entrada',topic:'electricidad',unit:'V',measure:'Tensión del nodo respecto de masa',description:'Fuente 5 V, superior 3000 Ω, inferior 2000 Ω y voltímetro ideal sin carga.',fault:'Resistencia inferior abierta: nodo a 5 V por el tramo superior.',path:['5 V','R superior','Nodo sensor','R inferior / masa'],formula:'Vnodo = 5 × Rinf / (Rsup + Rinf). Para tramo inferior abierto, nodo ideal a 5 V.',compute:c=>c==='fault'?5:5*2000/5000,source:'https://www.nexperia.com/applications/automotive',
  options:[['confirm','Medir nodo de entrada respecto de masa y examinar su retorno inferior.'],['weak','Mirar solo la tensión de batería en reposo.'],['unsafe','Aplicar 12 V a una entrada diseñada para 5 V.']]},
 {id:'wire',title:'Caída de tensión en terminal resistivo',topic:'electricidad',unit:'V',measure:'Caída entre los extremos del cable',description:'Fuente ideal 12 V y carga resistiva 6 Ω, cable 0,1 Ω normal.',fault:'Tramo resistivo sube de 0,1 a 1 Ω bajo carga.',path:['12 V','Cable resistivo','Carga 6 Ω','Masa'],formula:'I = 12 / (6 + Rcable), Vcable = I × Rcable.',compute:c=>{let r=c==='fault'?1:0.1;return 12*r/(6+r);},source:'https://www.picoauto.com/library/automotive-guided-tests/',
  options:[['confirm','Comparar extremos del tramo durante corriente estable del banco.'],['weak','Medir continuidad del cable sin demanda.'],['unsafe','Puentear fusibles y protecciones de la rama.']]},
 {id:'mosfet',title:'MOSFET low-side en conducción',topic:'motor',unit:'V',measure:'VDS en estado encendido',description:'Fuente 12 V, carga resistiva 8 Ω, RDS equivalente normal 0,04 Ω.',fault:'La resistencia de conducción efectiva aumenta a 1,2 Ω, sin determinar causa interna.',path:['12 V','Carga 8 Ω','MOSFET low-side','Retorno'],formula:'I = 12 / (8 + RDS), VDS = I × RDS. No se modela puerta ni conmutación.',compute:c=>{let r=c==='fault'?1.2:0.04;return 12*r/(8+r);},source:'https://www.nexperia.com/applications/interactive-app-notes/IAN50020_Power_Switch_MOSFETs',
  options:[['confirm','Comparar VGS, VDS y corriente con referencia del banco.'],['weak','Usar VGS(th) como prueba de conducción total.'],['unsafe','Cortocircuitar drenador y fuente sin protección.']]},
 {id:'shunt',title:'Shunt para lectura de corriente',topic:'senales',unit:'V',measure:'Tensión diferencial del shunt',description:'Fuente 12 V, carga 10 Ω y shunt serie 0,1 Ω.',fault:'Shunt cambia a 0,5 Ω: altera corriente y caída.',path:['12 V','Carga 10 Ω','Shunt','Masa'],formula:'I = 12 / (10 + Rshunt), Vshunt = I × Rshunt.',compute:c=>{let r=c==='fault'?0.5:0.1;return 12*r/(10+r);},source:'https://www.nexperia.com/applications/automotive',
  options:[['confirm','Medir diferencial del shunt y verificar resistencia efectiva.'],['weak','Considerar solo la corriente solicitada por una ECU.'],['unsafe','Conectar instrumento a terminal de potencia desconocido.']]},
 {id:'rc',title:'Filtro RC de entrada',topic:'senales',unit:'V',measure:'Tensión del capacitor a los 100 ms',description:'Escalón ideal 12 V; R 1000 Ω; C normal 100 µF; capacitor inicialmente descargado.',fault:'La capacidad cambia a 20 µF; la carga responde más rápidamente.',path:['Escalón 12 V','R 1 kΩ','Nodo RC','Capacitor a masa'],formula:'Vc(t)=12 × (1 − exp(−t/(R×C))). Modelo sin carga del instrumento.',compute:c=>12*(1-Math.exp(-0.1/(1000*(c==='fault'?20e-6:100e-6)))),source:'https://www.nexperia.com/applications/automotive',
  options:[['confirm','Capturar tensión de capacitor durante el transitorio con base temporal.'],['weak','Medir solo el valor tras carga completa.'],['unsafe','Inyectar una fuente arbitraria en terminales ECU reales.']]},
 {id:'inductor',title:'Energía almacenada en bobina',topic:'motor',unit:'J',measure:'Energía de campo a corriente previa a desconexión',description:'Bobina ideal de 0,15 H y 2 A iniciales. Solo se calcula energía almacenada.',fault:'La corriente inicial duplica a 4 A; energía se cuadruplica.',path:['Fuente ideal','Bobina 0,15 H','Conmutación','Camino de protección'],formula:'E = ½ × L × I². No predice tensión de pico ni decaimiento inductivo.',compute:c=>0.5*0.15*(c==='fault'?4:2)**2,source:'https://www.nexperia.com/applications/interactive-app-notes/IAN50003_driving-automotive-solenoids.html',
  options:[['confirm','Conocer inductancia y corriente inicial del banco virtual.'],['weak','Suponer que resistencia DC determina toda la energía.'],['unsafe','Desconectar una bobina real sin protección para ver sobretensión.']]}
];
export function componentModel(id,condition='nominal'){
 const s=componentScenarios.find(x=>x.id===id);
 if(!s||!['nominal','fault'].includes(condition))throw Error('Componente o condición desconocidos.');
 const expected=s.compute(condition);
 if(!Number.isFinite(expected)||expected<0)throw Error('Modelo numérico inválido.');
 return {id,condition,expected,baseline:s.compute('nominal'),tolerance:Math.max(.005,expected*.005),unit:s.unit};
}
export function parseComponentNumber(text){
 if(typeof text!=='string'||text.length>40||!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text.trim()))throw Error('Ingresá un número con coma o punto decimal.');
 const n=Number(text.trim().replace(',','.'));if(!Number.isFinite(n))throw Error('Número inválido.');return n;
}
export function gradeComponent(id,condition,answer={}){
 const m=componentModel(id,condition);
 let entered=null,correct=false;
 try{entered=parseComponentNumber(answer.value);correct=Math.abs(entered-m.expected)<=m.tolerance+1e-10;}catch{}
 const evidence=answer.evidence==='confirm';
 const reasoning=String(answer.reasoning||'').trim();
 const documented=reasoning.length>=70&&reasoning.length<=2000;
 const unsafe=answer.evidence==='unsafe';
 const score=unsafe?0:(correct?70:0)+(evidence?30:0);
 return {...m,entered,correct,evidence,documented,unsafe,score,passed:!unsafe&&correct&&evidence&&documented,textReviewed:false};
}
export function rcSamples(condition,count=80){
 if(!['nominal','fault'].includes(condition)||!Number.isInteger(count)||count<10||count>500)throw Error('Curva inválida.');
 return Array.from({length:count},(_,i)=>{
  const t=0.2*i/(count-1);
  return {t,nominal:12*(1-Math.exp(-t/(1000*100e-6))),observed:12*(1-Math.exp(-t/(1000*(condition==='fault'?20e-6:100e-6))))};
 });
}
export function componentReport(id,condition,answer,result,date=new Date()){
 const s=componentScenarios.find(x=>x.id===id);if(!s)throw Error('Componente no existe.');
 return ['# AutoLab — Banco de componentes (sintético)','Fecha: '+date.toISOString(),
  'Caso: '+s.title,'Condición: '+condition,'Descripción: '+s.description,
  'Trayecto funcional: '+s.path.join(' → '),
  'Respuesta: '+String(answer.value||'')+' '+s.unit,
  'Referencia del modelo: '+result.expected.toFixed(5)+' '+s.unit,
  'Resultado nominal: '+result.baseline.toFixed(5)+' '+s.unit,
  'Evidencia seleccionada: '+(s.options.find(o=>o[0]===answer.evidence)?.[1]||'Sin selección'),
  'Razón escrita: '+String(answer.reasoning||'').slice(0,2000),
  'Puntaje: '+result.score+'/100. Texto no revisado semánticamente.',
  'Ecuación: '+s.formula,'Falla simulada: '+s.fault,'Referencia conceptual: '+s.source,
  'No es medición, dato OEM ni acreditación técnica.',''].join('\n');
}
