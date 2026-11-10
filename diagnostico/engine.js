/**
 * AutoLab Modo Taller — simulación determinista de bajo voltaje.
 * Todos los números son ejemplos sintéticos, no especificaciones OEM.
 * El motor de casos no conoce el DOM; se puede verificar con node --test.
 */
export const CASES = [
  {
    id:'ect', area:'Sensores', title:'Arranque en frío',
    subtitle:'Una lectura imposible', vehicle:'Hatchback naftero · 4 cilindros',
    minutes:8, level:1,
    story:'Después de una noche a 20 °C, el motor arranca mal, enriquece demasiado y el escáner muestra ECT = −40 °C. La estrategia de emergencia de esta ECU virtual activa el electroventilador.',
    lesson:'Un sensor NTC forma un divisor con el pull-up de la ECU. Una lectura extrema no identifica por sí sola la pieza dañada.',
    choices:[
      {id:'sensor',label:'Termistor ECT abierto',mechanism:'El termistor no conduce: la entrada queda elevada por el pull-up de 5 V.',fix:'Verificar y sustituir el ECT defectuoso.'},
      {id:'signal',label:'Cable de señal ECT abierto',mechanism:'El termistor está sano, pero la entrada de ECU queda aislada del sensor.',fix:'Reparar la continuidad del conductor de señal.'},
      {id:'ground',label:'Retorno de sensor abierto',mechanism:'El termistor pierde el retorno a masa de sensores y no circula corriente por el divisor.',fix:'Reparar el retorno de sensores y comprobar que no existan otras entradas afectadas.'}
    ],
    probes:[
      {id:'scan',kind:'Escáner',label:'Leer ECT con motor frío',cost:1,note:'La información leída no demuestra por sí sola la causa.'},
      {id:'ecu',kind:'Multímetro',label:'Tensión de señal en ECU, contacto ON',cost:1,note:'Divisor ideal: Vsig = 5 V × Rntc / (2490 Ω + Rntc).'},
      {id:'sensor',kind:'Multímetro',label:'Resistencia del ECT desconectado',cost:1,note:'Con circuito aislado y sin alimentación.'},
      {id:'signal',kind:'Multímetro',label:'Continuidad del conductor de señal',cost:1,note:'Con ECU y sensor desconectados.'},
      {id:'ground',kind:'Multímetro',label:'Continuidad del retorno de sensor',cost:1,note:'Con circuito sin tensión.'},
      {id:'sub',kind:'Banco virtual',label:'Simular resistencia conocida en entrada ECU',cost:2,note:'Solo banco de baja tensión, no conectar cargas a pines desconocidos.'}
    ],
    confirm:{sensor:'sensor',signal:'signal',ground:'ground'},
    exclude:{sensor:'signal',signal:'sensor',ground:'sensor'},
    reference:'Para este banco virtual: pull-up 2,49 kΩ, NTC ≈ 2,5 kΩ a 20 °C.'
  },
  {
    id:'ecu-power',area:'Electricidad',title:'ECU se reinicia',
    subtitle:'La falla aparece al exigir corriente',vehicle:'Motor naftero · banco de 12 V',
    minutes:10,level:1,
    story:'Una ECU virtual se reinicia al conectar una carga auxiliar. En reposo todo parece normal. Se necesita identificar dónde se pierde tensión bajo demanda.',
    lesson:'Medir caída de tensión bajo carga permite ubicar una resistencia indeseada. En vacío puede pasar inadvertida.',
    choices:[
      {id:'feed',label:'Resistencia excesiva en alimentación',mechanism:'La caída resistiva ocurre antes de llegar al positivo de la ECU.',fix:'Reparar la conexión de alimentación con resistencia elevada.'},
      {id:'ground',label:'Resistencia excesiva en masa',mechanism:'El retorno se eleva respecto al negativo de batería al circular corriente.',fix:'Reparar el punto o conductor de masa defectuoso.'},
      {id:'battery',label:'Fuente/batería incapaz de sostener carga',mechanism:'La tensión ya cae en los propios bornes cuando circula corriente.',fix:'Evaluar la fuente y su capacidad de entregar corriente; corregir la causa de la caída.'}
    ],
    probes:[
      {id:'rest',kind:'Multímetro',label:'Tensión en batería en reposo',cost:1,note:'Una lectura sin carga no determina la resistencia interna.'},
      {id:'battery',kind:'Multímetro',label:'Tensión entre bornes con carga',cost:1,note:'Medir directamente en los bornes.'},
      {id:'feed',kind:'Multímetro',label:'Caída entre batería + y ECU +',cost:1,note:'Medir sobre el tramo, con corriente circulando.'},
      {id:'ground',kind:'Multímetro',label:'Caída entre masa ECU y batería −',cost:1,note:'Medir sobre el retorno, bajo carga.'},
      {id:'ecu',kind:'Multímetro',label:'Tensión útil entre pines ECU + y −',cost:1,note:'Se obtiene por conservación de tensiones: Vútil = Vbat − ΔV+ − ΔV−.'},
      {id:'scope',kind:'Osciloscopio',label:'Observar alimentación durante el evento',cost:2,note:'Se representa una caída transitoria ilustrativa.'}
    ],
    confirm:{feed:'feed',ground:'ground',battery:'battery'},
    exclude:{feed:'battery',ground:'feed',battery:'feed'},
    reference:'Banco sintético de 10 A: Vútil = Vbornes − I × Rpositivo − I × Rretorno.'
  },
  {
    id:'injector',area:'Actuadores',title:'Inyector sin aporte',
    subtitle:'La ECU solicita inyección',vehicle:'MPI naftero · cilindro 1',
    minutes:12,level:2,
    story:'Hay falla de aporte del cilindro 1. La ECU virtual solicita pulsos de inyección, pero el actuador no produce el efecto esperado. No alcanza con leer P0201.',
    lesson:'El mando de la ECU, la alimentación de la carga y la corriente real son evidencias diferentes.',
    choices:[
      {id:'coil',label:'Bobinado del inyector abierto',mechanism:'El circuito de potencia no se cierra a través del bobinado.',fix:'Comprobar especificación del fabricante y sustituir el inyector con bobinado abierto.'},
      {id:'feed',label:'Alimentación positiva ausente',mechanism:'El actuador carece de +12 V; un mando correcto no puede generar corriente.',fix:'Reparar el circuito de alimentación protegido del inyector.'},
      {id:'driver',label:'Etapa de potencia ECU sin conmutación',mechanism:'La orden lógica existe pero el driver no cierra el circuito.',fix:'Confirmar condiciones y reparar la etapa o módulo según procedimiento especializado.'}
    ],
    probes:[
      {id:'scan',kind:'Escáner',label:'Leer DTC del circuito',cost:1,note:'Un DTC localiza una condición, no siempre la causa.'},
      {id:'command',kind:'Escáner',label:'Ver orden lógica de inyección',cost:1,note:'Es una señal interna sintética; no equivale a corriente real.'},
      {id:'current',kind:'Osciloscopio',label:'Capturar corriente del inyector',cost:2,note:'Una bobina sin corriente no permite identificar cuál tramo está interrumpido.'},
      {id:'feed',kind:'Multímetro',label:'Medir alimentación del inyector',cost:1,note:'Medición virtual con carga y condiciones definidas.'},
      {id:'coil',kind:'Multímetro',label:'Resistencia del bobinado aislado',cost:1,note:'Solo sin alimentación y con conector desconectado.'},
      {id:'driver',kind:'Banco virtual',label:'Probar driver con carga patrón protegida',cost:2,note:'Prueba estrictamente simulada, no una conexión recomendada sobre ECU real.'}
    ],
    confirm:{coil:'coil',feed:'feed',driver:'driver'},
    exclude:{coil:'feed',feed:'driver',driver:'feed'},
    reference:'Modelo ficticio de inyector de 14 Ω a 12,2 V; corriente instantánea real depende de su inductancia.'
  }
];
export function getCase(id){return CASES.find(c=>c.id===id)??null;}
export function getCause(c,id){return c.choices.find(x=>x.id===id)??null;}
export function makeSession(caseId,causeId,mode='guia'){
 const c=getCase(caseId);if(!c)throw Error('Caso inexistente');
 const cause=getCause(c,causeId);if(!cause)throw Error('Avería desconocida');
 return {version:1,caseId,causeId,mode,hypothesis:'',measurements:[],diagnosis:'',reasoning:'',status:'active',startedAt:new Date().toISOString()};
}
export function renderReading(caseId,causeId,probeId){
 const c=getCase(caseId);if(!c||!getCause(c,causeId))throw Error('Escenario inexistente');
 const p=c.probes.find(q=>q.id===probeId);if(!p)throw Error('Prueba inexistente');
 let value='',abnormal=false;
 if(caseId==='ect'){
  const split=2490, ntc=2500;
  const ecu=(5*ntc/(split+ntc)).toFixed(2);
  const map={
    scan:['−40 °C',true],
    ecu:['5,00 V (pull-up sin carga)',true],
    sensor:[causeId==='sensor'?'OL / circuito abierto':'2,50 kΩ',causeId==='sensor'],
    signal:[causeId==='signal'?'OL / circuito abierto':'0,3 Ω',causeId==='signal'],
    ground:[causeId==='ground'?'OL / circuito abierto':'0,3 Ω',causeId==='ground'],
    sub:[ecu.replace('.',',')+' V con resistencia patrón de 2,50 kΩ',false]
  };[value,abnormal]=map[probeId];
 } else if(caseId==='ecu-power'){
  const vb=causeId==='battery'?9.8:12.4;
  const feed=causeId==='feed'?3.6:.08,ground=causeId==='ground'?3.2:.06;
  const format=v=>v.toFixed(2).replace('.',',')+' V';
  const map={
    rest:['12,55 V',false],
    battery:[format(vb),vb<11],
    feed:[format(feed),feed>1],
    ground:[format(ground),ground>1],
    ecu:[format(vb-feed-ground),true],
    scope:[format(vb-feed-ground)+' durante carga → reinicio',true]
  };[value,abnormal]=map[probeId];
 } else {
  const map={
    scan:['P0201 · circuito de inyector 1 (código simulado)',true],
    command:['Orden lógica activa · 3,0 ms',false],
    current:['0 A durante el pulso',true],
    feed:[causeId==='feed'?'0,0 V':'12,2 V',causeId==='feed'],
    coil:[causeId==='coil'?'OL / circuito abierto':'14,0 Ω',causeId==='coil'],
    driver:[causeId==='driver'?'Sin conmutación con carga patrón':'Conmuta normalmente con carga patrón',causeId==='driver']
  };[value,abnormal]=map[probeId];
 }
 return {id:probeId,kind:p.kind,label:p.label,value,abnormal,cost:p.cost,note:p.note};
}
export function takeMeasurement(session,probeId,prediction='nose'){
 if(session.status!=='active')throw Error('Caso terminado');
 if(!session.hypothesis)throw Error('Primero registrá una hipótesis inicial.');
 const c=getCase(session.caseId);
 if(!c.probes.some(p=>p.id===probeId))throw Error('Prueba inexistente');
 if(session.measurements.some(p=>p.id===probeId))throw Error('Prueba ya realizada');
 if(!['normal','anormal','nose'].includes(prediction))throw Error('Pronóstico inválido');
 const reading=renderReading(session.caseId,session.causeId,probeId);
 return {...session,measurements:[...session.measurements,{...reading,prediction,predictionCorrect:prediction!=='nose'&&(prediction==='anormal')===reading.abnormal}]};
}
export function evaluate(session,diagnosis,reasoning){
 if(session.status!=='active')throw Error('Caso terminado');
 const c=getCase(session.caseId);if(!getCause(c,diagnosis))throw Error('Seleccioná una causa.');
 if(reasoning.trim().length<30)throw Error('Explicá tu razonamiento en al menos 30 caracteres.');
 const used=session.measurements.map(x=>x.id);
 const correct=session.causeId===diagnosis;
 const decisive=used.includes(c.confirm[session.causeId]);
 const contrast=used.includes(c.exclude[session.causeId]);
 const predicted=session.measurements.some(x=>x.predictionCorrect);
 const first=Boolean(session.hypothesis);
 const score=Math.min(!correct||!decisive?64:100,
  (correct?50:0)+(decisive?25:0)+(contrast?10:0)+(first?5:0)+(predicted?5:0)+(used.length<=4?5:0));
 const passed=correct&&decisive&&contrast&&score>=85;
 return {...session,diagnosis,reasoning:reasoning.trim(),status:'done',finishedAt:new Date().toISOString(),
  result:{score,passed,correct,decisive,contrast,predicted,used,requiresExpertReview:true}};
}
export function explain(session){
 if(session.status!=='done')return null;
 const c=getCase(session.caseId),cause=getCause(c,session.causeId);
 return {cause:cause.label,mechanism:cause.mechanism,fix:cause.fix,
  decisive:c.probes.find(x=>x.id===c.confirm[session.causeId]).label,
  contrast:c.probes.find(x=>x.id===c.exclude[session.causeId]).label};
}
export function chooseCause(caseId,random=Math.random){
 const c=getCase(caseId);if(!c)throw Error('Caso inexistente');
 const sample=random();return c.choices[Math.min(c.choices.length-1,Math.floor(Math.max(0,sample)*c.choices.length))].id;
}
