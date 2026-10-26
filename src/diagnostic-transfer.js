/**
 * Near-to-moderate diagnostic transfer in wholly synthetic bench scenarios.
 * Two competing mechanisms can produce the same opening symptom. Learner must
 * obtain independent evidence and document remaining uncertainty. Not OEM logic.
 */
export const INVESTIGATION_TOPICS=['electricidad','motor','senales','redes','ev'];
const families=[
 {topic:'electricidad',id:'control',title:'Controlador pierde órdenes por instantes',
  scenes:['Durante un arranque virtual el mando de los actuadores desaparece unos instantes, y luego regresa.',
   'En demanda moderada se interrumpe brevemente el comando de un actuador y el sistema se recupera.'],
  options:[['supply','Caída de alimentación local de la ECU'],['reference','Interrupción de la referencia CKP']],
  measurements:[
   ['ecu-power','circuit','Correlacionar borne virtual y alimentación local ECU','Borne 12,4 V estable; pin ECU baja a 8,3 V durante la interrupción.','Borne y pin ECU permanecen en 12,3 V durante el episodio.'],
   ['ckp-check','wave','Comparar actividad CKP con el comando de actuador','CKP pierde pulsos durante la interrupción, con alimentación ECU estable.','El CKP mantiene pulsos regulares durante la interrupción.']],
  why:['La caída local de alimentación coincide con la omisión de mando y la señal CKP sigue presente. Es una hipótesis de rama de alimentación dentro del simulador, no una identificación de conector físico.',
       'Los pulsos CKP desaparecen mientras la alimentación local permanece estable. Es una hipótesis de referencia de giro del simulador, no una prueba de que un sensor real esté dañado.'],
  url:'https://www.picoauto.com/library/automotive-guided-tests/ignition/distributorless-wasted-spark/AGT-041-ignition-amplifier-earth-volt-drop/'},
 {topic:'motor',id:'lean',title:'Correcciones positivas y pérdida de respuesta',
  scenes:['En crucero virtual se elevan las correcciones de combustible y cae la respuesta al acelerar.',
   'Con mayor carga, el banco MPI registra compensaciones positivas y una pérdida suave de potencia.'],
  options:[['pressure','Suministro de combustible insuficiente en el banco'],['maf','Sublectura del MAF virtual']],
  measurements:[
   ['fuel-pressure','circuit','Comparar presión de combustible con referencia del banco','En demanda la presión virtual es 260 kPa frente a referencia sintética 380 kPa.','Presión virtual 380 kPa bajo la misma demanda, igual a la referencia declarada.'],
   ['maf-flow','obd','Contrastar MAF con medidor de masa independiente','MAF virtual 12 g/s frente a medidor independiente de banco 24 g/s.','MAF virtual 24 g/s y medidor independiente 24 g/s en el mismo instante.']],
  why:['La presión ficticia baja bajo demanda y el caudal MAF coincide con referencia. STFT aislado no identifica la causa ni establece presión OEM.',
       'La comparación independiente detecta sublectura de MAF con presión de combustible normal en el banco. No se deduce el flujo desde MAP ni se sustituye una pieza real.'],
  url:'https://www.picoauto.com/library/automotive-guided-tests/'},
 {topic:'senales',id:'sync',title:'Arranque prolongado con sincronización inestable',
  scenes:['El arranque ficticio tarda en sincronizar y el mando de inyección se habilita tarde.',
   'Durante el arranque el controlador virtual demora en confirmar la sincronización de cilindros.'],
  options:[['ckp','Interrupción CKP simulada'],['cmp','Señal CMP ausente al comienzo del arranque']],
  measurements:[
   ['ckp-trace','wave','Capturar CKP continuo durante la fase de arranque','CKP pierde pulsos fuera del patrón ficticio en la ventana 2.','CKP sigue presente con periodicidad coherente en toda la ventana.'],
   ['cmp-trace','wave','Comparar CMP y CKP en la misma base de tiempo','CMP aparece solo después de 400 ms, con CKP previamente estable.','CMP se observa desde el inicio de la ventana sincronizada.']],
  why:['La pérdida CKP coincide con la ausencia de sincronización, mientras CMP está presente. El banco no asigna la causa física a sensor o cableado.',
       'CMP aparece tarde y CKP permanece continuo, lo que distingue la fuente temporal en el modelo. La relación real depende de arquitectura y documentación OEM.'],
  url:'https://www.picoauto.com/library/automotive-guided-tests/es/system-tests/posici%C3%B3n-del-%C3%A1rbol-de-levas-frente-a-posici%C3%B3n-del-cig%C3%BCe%C3%B1al/AGT-151-posici%C3%B3n-del-cig%C3%BCe%C3%B1al-frente-a-posici%C3%B3n-del-%C3%A1rbol-de-levas/'},
 {topic:'redes',id:'bus',title:'Telemetría CAN intermitente',
  scenes:['El analizador pasivo deja de recibir telemetría durante varias ventanas, pero luego vuelve.',
   'En el bus didáctico desaparecen mensajes esperados mientras se observan errores y retransmisiones.'],
  options:[['termination','Terminación ausente en el segmento ficticio'],['overload','Saturación de tráfico en el bus virtual']],
  measurements:[
   ['term-bench','circuit','Leer terminación en un segmento desconectado del emulador','Con banco sin energía: 120 Ω frente a referencia interna nominal 60 Ω.','Con banco sin energía: 60 Ω, referencia interna del segmento.'],
   ['bus-observe','network','Registrar bitrate, ocupación y contadores pasivos','Ocupación virtual 96%, errores de buffer y retardos; terminación nominal.','Ocupación virtual 22% y errores de trama en este modelo; no hay saturación de tráfico.']],
  why:['El segmento ficticio queda con 120 Ω donde el propio banco define dos terminadores en paralelo. Ni el valor ni la maniobra se trasladan a un vehículo encendido.',
       'Hay sobrecarga del emulador, pero la terminación coincide con referencia. Errores de buffer y carga no equivalen por sí solos a falla física de cableado.'],
  url:'https://kvaser.com/developer-blog/how-to-test-your-can-termination-works-correctly/'},
 {topic:'ev',id:'ready',title:'Vehículo híbrido de banco no entra en READY',
  scenes:['El banco HEV recibe una solicitud READY, pero no habilita la tracción virtual.',
   'Tras una solicitud de arranque, el panel ficticio no muestra READY y no se activa la etapa de potencia.'],
  options:[['aux12','Tensión auxiliar de 12 V insuficiente en el modelo'],['interlock','Estado de interlock HV virtual no autorizado']],
  measurements:[
   ['aux-record','circuit','Revisar tensión auxiliar en la ventana de habilitación','Auxiliar virtual cae a 8,9 V durante solicitud READY; referencia 12,4 V de este banco.','Auxiliar virtual estable a 12,4 V durante solicitud READY.'],
   ['interlock-state','obd','Consultar estado de permiso del interlock virtual (solo lectura)','El banco informa interlock abierto/inhibición READY, sin operación física HV.','El banco informa interlock cerrado, sin bloqueo de habilitación por esa vía.']],
  why:['La fuente auxiliar sintética se cae durante la solicitud y el interlock está autorizado. No se infiere reparación física ni comportamiento común a todas las marcas.',
       'El registro del controlador virtual señala interlock no autorizado con 12 V estable. No se enseña a acceder, puentear o medir un circuito HV real.'],
  url:'https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm'}
];
export const DIAGNOSTIC_TRANSFER_CASES=families.map(f=>({id:'diagnostic-'+f.id,topic:f.topic,title:f.title}));
const choose=(r,x)=>x[Math.floor(r()*x.length)];
function seeded(seed){
 if(!Number.isSafeInteger(seed))throw Error('Semilla no válida');
 let x=seed>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;
 return ()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296};
}
function shuffled(items,r){
 const out=[...items];for(let i=out.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out;
}
export function buildDiagnosticTransfer(seed=Date.now()){
 const r=seeded(seed);
 const cases=families.map(f=>{
  const index=Math.floor(r()*2),scene=choose(r,f.scenes),cause=f.options[index][0];
  const probes=f.measurements.map((m,k)=>{
   const positive=k===index;
   return {id:m[0],kind:m[1],label:m[2],
    finding:positive?m[3]:m[4],
    outcome:positive?'anómala':'normal',
    role:positive?'confirm':'exclude',unsafe:false,
    provenance:'Medición sintética de banco, no captura de vehículo'};
  });
  probes.push({id:'context',kind:'context',label:'Leer condiciones y registro de evento',
   finding:scene+' Condiciones del banco declaradas; el síntoma por sí solo no identifica la causa.',
   outcome:'contexto',role:'context',unsafe:false,
   provenance:'Historia del emulador sin origen físico'});
  probes.push({id:'unsafe',kind:'hazard',label:'Intervenir un circuito físico energizado sin procedimiento',
   finding:'Operación prohibida: no se ejecuta ninguna acción en sistemas reales.',
   outcome:'peligrosa',role:'unsafe',unsafe:true,
   provenance:'Acción bloqueada; no constituye ensayo'});
  return {id:'diagnostic-'+f.id,topic:f.topic,title:f.title,scenario:scene,options:f.options,
   cause,probes:shuffled(probes,r),debrief:f.why[index],source:f.url,
   assumptions:'Fallos mutuamente excluyentes solo dentro de este generador; no existen valores OEM, sensores físicos ni garantías de causalidad real.'};
 });
 return {version:'diagnostic-transfer-v1',seed,cases:shuffled(cases,r)};
}
export function createDiagnosticTransferSession(seed=Date.now()){
 return {scenario:buildDiagnosticTransfer(seed),index:0,answers:{},finished:false};
}
export function getDiagnosticProbe(caseItem,id){
 const p=caseItem.probes.find(p=>p.id===id);
 if(!p)throw Error('Prueba desconocida');return p;
}
/**
 * The PWA records revealed instruments under "observations". The older
 * programmatic/tests shape is "probes"; support both without merging them.
 * Only revealed, named instruments from the current case can affect the score.
 */
function recordedProbes(answer){
 return Array.isArray(answer?.observations)?answer.observations:
  Array.isArray(answer?.probes)?answer.probes:[];
}
export function gradeDiagnosticTransfer(caseItem,answer={}){
 const seen=new Set(),probes=[];
 for(const record of recordedProbes(answer)){
  if(!record||typeof record.id!=='string'||seen.has(record.id))continue;
  seen.add(record.id);
  const p=caseItem.probes.find(p=>p.id===record.id);
  if(p)probes.push({p,prediction:record.prediction});
 }
 const correct=answer.final===caseItem.cause;
 const confirm=probes.some(x=>x.p.role==='confirm');
 const exclude=probes.some(x=>x.p.role==='exclude');
 const context=probes.some(x=>x.p.role==='context');
 const unsafe=probes.some(x=>x.p.unsafe);
 // A contextual label is predictable by inspection and cannot credit diagnosis.
 const discriminating=probes.filter(x=>x.p.role==='confirm'||x.p.role==='exclude');
 const predictionsCorrect=discriminating.filter(x=>x.prediction===x.p.outcome).length;
 const predictionsMade=discriminating.filter(x=>typeof x.prediction==='string'&&x.prediction.length>0).length;
 const predicted=['confirm','exclude'].every(role=>probes.some(x=>x.p.role===role&&x.prediction===x.p.outcome));
 const reasoning=String(answer.reasoning||'').trim(),limits=String(answer.limits||'').trim();
 const documented=reasoning.length>=100&&reasoning.length<=2000;
 const uncertain=limits.length>=60&&limits.length<=1200;
 const score=unsafe?0:(correct?40:0)+(confirm?20:0)+(exclude?15:0)+(context?10:0)+(predicted?5:0)+(documented?5:0)+(uncertain?5:0);
 return {score,passed:!unsafe&&correct&&confirm&&exclude&&context&&predicted&&documented&&uncertain,
  correct,confirm,exclude,context,predicted,predictionsCorrect,predictionsMade,documented,uncertain,unsafe,
  explanationReviewed:false,expected:caseItem.cause};
}
export function diagnosticTransferReport(session,date=new Date()){
 const lines=['# AutoLab Academy — Transferencia diagnóstica en escenarios sintéticos','',
  'Fecha: '+date.toISOString(),'Semilla reproducible: '+session.scenario.seed,
  'Los síntomas no tienen una sola causa en el mundo real. El generador selecciona solo una alternativa artificial por caso.',''];
 session.scenario.cases.forEach((c,i)=>{
  const a=session.answers[c.id]||{},g=gradeDiagnosticTransfer(c,a);
  lines.push('## '+(i+1)+'. '+c.title,c.scenario,
   'Hipótesis inicial: '+(c.options.find(o=>o[0]===a.initial)?.[1]||'—'),
   '### Observaciones y predicciones');
  for(const o of recordedProbes(a)){
   if(!o||typeof o.id!=='string'||!c.probes.some(p=>p.id===o.id))continue;
   const p=getDiagnosticProbe(c,o.id);
   lines.push('- '+p.id+' ['+p.kind+'] '+p.label,'  - Procedencia: '+p.provenance,
    '  - Pronosticado: '+o.prediction+'; observado: '+p.outcome,
    '  - Lectura: '+p.finding,'  - Rol de la evidencia para el generador: '+p.role);
  }
  lines.push('Conclusión: '+(c.options.find(o=>o[0]===a.final)?.[1]||'—'),
   'Razón declarada (NO evaluada semánticamente): '+String(a.reasoning||'').slice(0,2000),
   'Incertidumbre declarada (NO evaluada semánticamente): '+String(a.limits||'').slice(0,1200),
   'Solución del generador: '+c.debrief,'Puntuación: '+g.score+'/100; cumple criterios: '+g.passed,
   'Fuente conceptual: '+c.source,'Limitaciones: '+c.assumptions,'');
 });
 lines.push('Ninguna conclusión acredita una reparación, un certificado, una medición real o una intervención HV.');
 return lines.join('\n');
}
