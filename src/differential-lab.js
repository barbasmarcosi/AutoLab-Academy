// Two independent synthetic defects per case; not real OEM diagnostic guidance.
export const multiFaultCases=[
 {id:'mf-charge-drain',topic:'electricidad',title:'Carga deficiente y consumo al estacionar',symptom:'El alternador funciona, pero la batería no se recupera; además se descarga estacionada tras la noche.',context:'Banco de 12 V completamente sintético, cargas y referencias constantes.',solutions:['connection','parasitic'],causes:[['connection','Alta resistencia en conexión positiva de carga'],['parasitic','Accesorio permanece consumiendo luego del reposo'],['alternator','Alternador no genera tensión'],['battery','Únicamente batería agotada']],
 probes:[{id:'alternator',label:'Medir B+ alternador bajo carga',result:'14,2 V estabilizados.',supports:[]},{id:'drop',label:'Caída positiva bajo 35 A entre alternador y batería',result:'Caída 1,8 V bajo carga.',supports:['connection']},{id:'sleep',label:'Corriente residual luego de 40 minutos',result:'0,64 A, frente a referencia de 0,035 A.',supports:[]},{id:'isolate',label:'Aislar virtualmente circuito de accesorios',result:'Corriente cae a 0,035 A, localizando circuito pero no una pieza.',supports:['parasitic']},{id:'unsafe',label:'Puentear fusible para acelerar la prueba',result:'Acción insegura bloqueada.',supports:[],unsafe:true}],
 rationale:'Dos causas independientes: conexión positiva resistiva con pérdida bajo carga y consumo parásito de accesorios después del reposo. Ninguna explica por sí sola ambos síntomas.',source:'https://www.picoauto.com/library/automotive-guided-tests/'},
 {id:'mf-ground-ckp',topic:'senales',title:'Motor gira lento y ECU no recibe CKP',symptom:'Arranque lento y sin encendido; ECU detecta 0 RPM, aunque existe señal CKP en el sensor.',context:'Modelo sintético de 12 V, mazo CKP y sensor inductivo de banco.',solutions:['ground','ckp-open'],causes:[['ground','Masa resistiva del motor de arranque'],['ckp-open','Conductor CKP abierto entre sensor y ECU'],['sensor','Sensor CKP sin señal en origen'],['ecu','ECU necesariamente defectuosa']],
 probes:[{id:'battery',label:'Medir tensión en bornes durante arranque',result:'11,1 V en bornes bajo condición simulada.',supports:[]},{id:'ground-drop',label:'Medir caída entre motor y negativo durante arranque',result:'1,5 V en retorno bajo carga.',supports:['ground']},{id:'sensor-wave',label:'Inspeccionar CKP en el sensor',result:'Tren de pulsos presente con motor girando.',supports:[]},{id:'ecu-wave',label:'Comprobar CKP al conector ECU',result:'La señal desaparece entre sensor y ECU.',supports:['ckp-open']},{id:'unsafe',label:'Conectar masa de osciloscopio a terminal HV desconocido',result:'Acción insegura bloqueada.',supports:[],unsafe:true}],
 rationale:'La resistencia de masa limita el arranque y, por separado, el conductor CKP abierto impide que la ECU observe la señal. Una sola causa no explica ambas pruebas.',source:'https://www.picoauto.com/library/automotive-guided-tests/'},
 {id:'mf-can-supply',topic:'redes',title:'Terminación CAN incorrecta y nodo sin alimentación',symptom:'Un módulo del banco no comunica y existen errores esporádicos en los restantes nodos.',context:'Banco CAN totalmente aislado, nominal dos resistencias terminales de 120 Ω.',solutions:['power','terminal'],causes:[['power','Ausencia de alimentación del nodo B'],['terminal','Falta un terminador CAN de 120 Ω'],['dbc','DBC de señales equivocado'],['software','Todas las ECUs requieren firmware nuevo']],
 probes:[{id:'traffic',label:'Escucha pasiva del bus de laboratorio',result:'Tramas A/C con errores; sin actividad de B.',supports:[]},{id:'node-power',label:'Medir pin de alimentación protegido del nodo B',result:'Se observan 0 V donde el esquema exige 12 V.',supports:['power']},{id:'resistance',label:'Medir CAN H/L con todo el banco apagado',result:'120 Ω frente al nominal 60 Ω de esta topología.',supports:['terminal']},{id:'restore',label:'Restituir alimentación del nodo en simulación',result:'B vuelve a comunicar, pero errores físicos del bus persisten.',supports:[]},{id:'unsafe',label:'Inyectar mensajes desconocidos a un vehículo circulando',result:'Acción insegura bloqueada.',supports:[],unsafe:true}],
 rationale:'El nodo ausente no está alimentado; el error físico de la red se debe independientemente a una terminación faltante. El restablecimiento de un subsistema no corrige el otro.',source:'https://kvaser.com/can-protocol-tutorial/'}
];
export function verifyMultiFaultCase(c){
 if(!c||!/^mf-[a-z0-9-]+$/.test(c.id)||!Array.isArray(c.solutions)||c.solutions.length!==2)throw Error('Caso multifalla inválido');
 const ids=new Set(c.causes.map(x=>x[0]));
 if(ids.size!==c.causes.length||c.causes.length<4||new Set(c.probes.map(p=>p.id)).size!==c.probes.length)throw Error('Opciones duplicadas');
 for(const id of c.solutions)if(!ids.has(id)||!c.probes.some(p=>!p.unsafe&&p.supports.includes(id)))throw Error('Sin evidencia para '+id);
 for(const p of c.probes)if(!p.id||!p.label||!p.result||!Array.isArray(p.supports)||p.supports.some(id=>!ids.has(id)))throw Error('Prueba inválida');
 return true;
}
export function evaluateMultiFault(c,session){
 verifyMultiFaultCase(c);
 const selected=[...new Set(session.selected||[])].filter(id=>c.causes.some(x=>x[0]===id));
 const used=[...new Set(session.used||[])].filter(id=>c.probes.some(p=>p.id===id));
 const unsafe=used.some(id=>c.probes.find(p=>p.id===id).unsafe);
 const exact=selected.length===c.solutions.length&&c.solutions.every(id=>selected.includes(id));
 const proven=c.solutions.filter(id=>used.some(p=>c.probes.find(x=>x.id===p).supports.includes(id)));
 const documented=String(session.reasoning||'').trim().length>=80&&String(session.reasoning||'').trim().length<=3000;
 const score=unsafe?0:(exact?50:0)+20*proven.length+(documented?10:0);
 return {score,passed:exact&&proven.length===2&&documented&&!unsafe,exact,proven,documented,unsafe,
  selected,used,evaluatedText:false,reviewPending:true};
}
export function multiFaultReport(c,session,result,date=new Date()){
 const names=new Map(c.causes);
 return ['# AutoLab Academy - Diagnóstico multifalla','',
  'Fecha: '+date.toISOString(),'Caso: '+c.id+' - '+c.title,
  'Caso sintético, no diagnóstico de vehículo real.','',
  '## Síntoma',c.symptom,
  '## Causas seleccionadas',...(session.selected||[]).map(id=>'- '+(names.get(id)||id)),
  '## Mediciones',...(session.used||[]).map(id=>c.probes.find(p=>p.id===id)).filter(Boolean).map(p=>'- '+p.label+': '+p.result),
  '## Justificación',String(session.reasoning||'').slice(0,3000),'',
  '## Solución explicada',c.rationale,
  'Puntos: '+result.score+'/100. Evidencias independientes: '+result.proven.length+'/2.',
  'Acción insegura: '+(result.unsafe?'sí':'no'),
  'Explicación no evaluada semánticamente: requiere revisión humana. No acredita competencia profesional.',
  'Referencia conceptual: '+c.source,''].join('\n');
}
