// Taller integral ficticio con cuatro fuentes de evidencia y reportes auditables.
export const INTEGRATIVE_CASES=[
  {
    "id": "integral-power",
    "topic": "electricidad",
    "title": "P0300 bajo carga y reinicio de ECU",
    "dtc": "P0300 (monitor ficticio)",
    "symptom": "El motor de banco presenta una pérdida ocasional de mando bajo demanda y vuelve a responder después. Un único P0300 no permite atribuir la causa.",
    "cause": "ecu-supply",
    "explanation": "El voltaje de alimentación local de ECU cae bajo demanda mientras la tensión en bornes permanece estable. La forma de onda del mando se omite durante el evento. La evidencia eléctrica confirma la causa definida en este banco, sin identificar qué conector o componente OEM falló.",
    "alternatives": [
      [
        "ecu-supply",
        "Caída de alimentación local de ECU"
      ],
      [
        "fuel-delivery",
        "Entrega de combustible insuficiente en el banco"
      ],
      [
        "ckp-branch",
        "Interrupción intermitente de la rama CKP ficticia"
      ],
      [
        "compression",
        "Baja compresión relativa como explicación principal"
      ]
    ],
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "readings": [
      {
        "id": "power-context",
        "kind": "context",
        "label": "Carga aplicada",
        "provenance": "Registro de condición virtual",
        "value": "El evento aparece a 2600 rpm y 54% de carga durante 150 ms; a ralentí estabilizado no se reproduce.",
        "classification": "observación",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "power-obd",
        "kind": "obd",
        "label": "Monitor de la ECU",
        "provenance": "Freeze-frame didáctico",
        "value": "P0300 ficticio, 2600 rpm, 54% carga y contador sintético de reinicios: 1.",
        "classification": "observación",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "power-wave",
        "kind": "wave",
        "label": "Mando de inyector durante la anomalía",
        "provenance": "Oscilograma lógico ilustrativo",
        "value": "Durante la caída local no se observa el pulso de mando; el patrón normal regresa fuera del evento.",
        "classification": "anómala",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "power-supply",
        "kind": "circuit",
        "label": "Comparar bornes y pin de alimentación ECU",
        "provenance": "Dos nodos virtuales bajo demanda",
        "value": "Bornes ficticios 12,4 V estables; pin ECU 8,2 V durante 150 ms. La caída queda localizada en la rama virtual ECU.",
        "classification": "anómala",
        "confirm": true,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "power-fuel",
        "kind": "circuit",
        "label": "Presión de combustible frente a referencia de banco",
        "provenance": "Instrumento sintético separado",
        "value": "Presión 380 kPa durante demanda, igual a la referencia interna del modelo; no descarta todas las fallas posibles.",
        "classification": "normal",
        "confirm": false,
        "exclude": true,
        "unsafe": false
      },
      {
        "id": "power-ckp",
        "kind": "wave",
        "label": "CKP durante la caída de alimentación",
        "provenance": "Captura ficticia correlacionada",
        "value": "Patrón CKP presente durante el evento; no se ve una pérdida selectiva de CKP en esta simulación.",
        "classification": "normal",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "power-unsafe",
        "kind": "circuit",
        "label": "Puentear fusible o alimentación del controlador real",
        "provenance": "Prueba prohibida",
        "value": "Acción insegura bloqueada: no se realiza ensayo físico.",
        "classification": "peligrosa",
        "confirm": false,
        "exclude": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "integral-fuel",
    "topic": "motor",
    "title": "P0171 y pérdida de potencia bajo demanda",
    "dtc": "P0171 (código didáctico)",
    "symptom": "Correcciones de combustible crecientes en un banco MPI y aporte de cilindros irregular al aumentar la demanda; no aparece una falla de mando evidente.",
    "cause": "fuel-delivery",
    "explanation": "STFT cambia al aumentar demanda, mientras el banco registra una presión de combustible ficticia inferior a la referencia declarada. Las órdenes eléctricas de inyección siguen presentes; la confirmación es la comparación independiente de presión, no el DTC ni los trims por sí solos.",
    "alternatives": [
      [
        "ecu-supply",
        "Caída de alimentación local de ECU"
      ],
      [
        "fuel-delivery",
        "Entrega de combustible insuficiente en el banco"
      ],
      [
        "ckp-branch",
        "Interrupción intermitente de la rama CKP ficticia"
      ],
      [
        "compression",
        "Baja compresión relativa como explicación principal"
      ]
    ],
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "readings": [
      {
        "id": "fuel-context",
        "kind": "context",
        "label": "Comparar ralentí y demanda",
        "provenance": "Dos condiciones de funcionamiento",
        "value": "A 800 rpm / 18% carga el ajuste es menor que a 2900 rpm / 78% carga.",
        "classification": "observación",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "fuel-obd",
        "kind": "obd",
        "label": "Correcciones y monitor de mezcla",
        "provenance": "Datos OBD sintéticos",
        "value": "STFT +11% en ralentí, +29% en demanda; LTFT +12%; λ ilustrativa próxima a 1.",
        "classification": "anómala",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "fuel-wave",
        "kind": "wave",
        "label": "Mando y corriente primaria de inyector",
        "provenance": "Captura sintética en condición de demanda",
        "value": "Se observan pulsos de mando y de corriente de inyector durante el intervalo con pérdida de potencia.",
        "classification": "normal",
        "confirm": false,
        "exclude": true,
        "unsafe": false
      },
      {
        "id": "fuel-pressure",
        "kind": "circuit",
        "label": "Presión de riel en el instrumento independiente",
        "provenance": "Sensor ficticio de banco, no PID OEM",
        "value": "260 kPa frente a 380 kPa de referencia interna en demanda. El valor no es objetivo universal de reparación.",
        "classification": "anómala",
        "confirm": true,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "fuel-maf",
        "kind": "obd",
        "label": "Contraste de flujo MAF con banco",
        "provenance": "Comparación controlada de señales",
        "value": "El MAF ficticio coincide con una referencia de caudal independiente para la condición definida.",
        "classification": "normal",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "fuel-ckp",
        "kind": "wave",
        "label": "Correlación CKP con el evento",
        "provenance": "Registro ficticio temporal",
        "value": "Tren CKP no presenta huecos añadidos durante el episodio de pérdida de potencia.",
        "classification": "normal",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "fuel-unsafe",
        "kind": "circuit",
        "label": "Abrir la línea de combustible presurizada en un vehículo real",
        "provenance": "Prueba prohibida",
        "value": "No se permite manipulación de combustible real. Se bloquea la maniobra.",
        "classification": "peligrosa",
        "confirm": false,
        "exclude": false,
        "unsafe": true
      }
    ]
  },
  {
    "id": "integral-ckp",
    "topic": "senales",
    "title": "P0335 intermitente y silencio momentáneo de encendido",
    "dtc": "P0335 (monitor ficticio)",
    "symptom": "En una ventana de adquisición el controlador de banco omite la orden de bobina. El diagnóstico necesita distinguir si desapareció la referencia CKP o si cayó la alimentación local.",
    "cause": "ckp-branch",
    "explanation": "La alimentación local ficticia permanece estable, pero el CKP pierde pulsos en una ventana mientras CMP conserva actividad. La correlación eléctrica excluye una caída local de alimentación en el modelo y confirma una interrupción de la señal CKP; no diferencia sensor de cableado físico.",
    "alternatives": [
      [
        "ecu-supply",
        "Caída de alimentación local de ECU"
      ],
      [
        "fuel-delivery",
        "Entrega de combustible insuficiente en el banco"
      ],
      [
        "ckp-branch",
        "Interrupción intermitente de la rama CKP ficticia"
      ],
      [
        "compression",
        "Baja compresión relativa como explicación principal"
      ]
    ],
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "readings": [
      {
        "id": "ckp-context",
        "kind": "context",
        "label": "Alinear eventos y estados",
        "provenance": "Reloj compartido del emulador",
        "value": "El fallo se registra en la ventana 4 de 6, durante 120 ms a velocidad de giro nominal de banco.",
        "classification": "observación",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "ckp-obd",
        "kind": "obd",
        "label": "DTC y freeze-frame sintético",
        "provenance": "Archivo de diagnóstico ficticio",
        "value": "P0335 con 2100 rpm y evento único en ventana 4; un DTC por sí solo no demuestra cable roto.",
        "classification": "observación",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "ckp-command",
        "kind": "wave",
        "label": "Mando primario de bobina",
        "provenance": "Captura virtual sincronizada",
        "value": "Falta un pulso de mando durante la ventana 4; el resto del buffer recupera la pauta normal.",
        "classification": "anómala",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "ckp-probe",
        "kind": "wave",
        "label": "CKP frente a CMP en la misma ventana",
        "provenance": "Dos canales sintéticos sincronizados",
        "value": "CKP pierde pulsos en ventana 4 mientras CMP continúa dentro del patrón del generador.",
        "classification": "anómala",
        "confirm": true,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "ckp-supply",
        "kind": "circuit",
        "label": "Tensión de alimentación ECU durante el evento",
        "provenance": "Instrumento virtual de dos nodos",
        "value": "Pin ECU 12,3 V y retorno dentro de referencia del banco durante ventana 4.",
        "classification": "normal",
        "confirm": false,
        "exclude": true,
        "unsafe": false
      },
      {
        "id": "ckp-fuel",
        "kind": "circuit",
        "label": "Presión de combustible virtual en ventana 4",
        "provenance": "Instrumento de banco ficticio",
        "value": "El modelo mantiene presión interna constante; no explica la interrupción de pulsos CKP.",
        "classification": "normal",
        "confirm": false,
        "exclude": false,
        "unsafe": false
      },
      {
        "id": "ckp-unsafe",
        "kind": "circuit",
        "label": "Inyectar señales arbitrarias en un CKP de vehículo en marcha",
        "provenance": "Prueba prohibida",
        "value": "Intervención no permitida; ninguna señal física se genera.",
        "classification": "peligrosa",
        "confirm": false,
        "exclude": false,
        "unsafe": true
      }
    ]
  }
];

export const EVIDENCE_KINDS=['context','obd','wave','circuit'];
function findCase(id){const c=INTEGRATIVE_CASES.find(x=>x.id===id);if(!c)throw Error('Expediente integral desconocido');return c;}
export function validateIntegrativeCase(c){
 if(!c||!/^integral-[a-z0-9-]+$/.test(c.id)||c.alternatives.length<3||c.readings.length<6)throw Error('Expediente incompleto');
 if(new Set(c.alternatives.map(x=>x[0])).size!==c.alternatives.length||!c.alternatives.some(x=>x[0]===c.cause))throw Error('Hipótesis incoherentes');
 if(new Set(c.readings.map(r=>r.id)).size!==c.readings.length)throw Error('IDs de evidencia repetidos');
 if(!EVIDENCE_KINDS.every(kind=>c.readings.some(r=>r.kind===kind&&!r.unsafe)))throw Error('Faltan fuentes de observación');
 if(!c.readings.some(r=>r.confirm&&!r.unsafe)||!c.readings.some(r=>r.exclude&&!r.unsafe)||!c.readings.some(r=>r.unsafe))throw Error('Rúbrica sin confirmación, descarte o bloqueo');
 if(c.readings.some(r=>!EVIDENCE_KINDS.includes(r.kind)||!['normal','anómala','observación','peligrosa'].includes(r.classification)||r.confirm&&r.exclude||r.unsafe&&(r.confirm||r.exclude)))throw Error('Lecturas incompatibles');
 return true;
}
export function startIntegrativeCase(id){
 const c=findCase(id);validateIntegrativeCase(c);
 return {caseId:id,initial:'',locked:false,observations:[],pending:'',prediction:'',final:'',reasoning:'',uncertainty:''};
}
export function integrativeReading(caseId,id){
 const r=findCase(caseId).readings.find(r=>r.id===id);
 if(!r)throw Error('Lectura inexistente');return r;
}
export function validateObservation(session,id,prediction){
 const p=integrativeReading(session.caseId,id);
 if(!['normal','anómala','observación','peligrosa'].includes(prediction))throw Error('El resultado previsto no es válido');
 if((session.observations||[]).some(o=>o.id===id))throw Error('Esta medición ya fue consultada');
 return {id:p.id,prediction};
}
export function evaluateIntegrativeCase(session){
 const c=findCase(session?.caseId);
 const obs=(session.observations||[]).filter((o,i,a)=>o&&a.findIndex(x=>x.id===o.id)===i&&c.readings.some(r=>r.id===o.id));
 const seen=obs.map(o=>integrativeReading(c.id,o.id));
 const unsafe=seen.some(p=>p.unsafe);
 const cause=session.final===c.cause;
 const confirm=seen.some(p=>p.confirm&&!p.unsafe);
 const exclude=seen.some(p=>p.exclude&&!p.unsafe);
 const kinds=[...new Set(seen.filter(p=>!p.unsafe).map(p=>p.kind))];
 const coverage=EVIDENCE_KIN.every(k=>kinds.includes(k));
 const predicted=obs.some(o=>{const p=integrativeReading(c.id,o.id);return !p.unsafe&&o.prediction===p.classification;});
 const reasoning=String(session.reasoning||'').trim();
 const uncertainty=String(session.uncertainty||'').trim();
 const documented=reasoning.length>=120&&reasoning.length<=3000;
 const qualified=uncertainty.length>=60&&uncertainty.length<=1200;
 const score=unsafe?0:(cause?35:0)+(confirm?20:0)+(exclude?15:0)+(coverage?15:0)+(predicted?5:0)+(documented?5:0)+(qualified?5:0);
 return {score,passed:!unsafe&&cause&&confirm&&exclude&&coverage&&predicted&&documented&&qualified,
  cause,confirm,exclude,coverage,kinds,predicted,documented,qualified,unsafe,textReviewed:false,
  expectedCause:c.cause,sourceCounts:Object.fromEntries(EVIDENCE_KIN.map(k=>[k,seen.filter(p=>p.kind===k).length]))};
}
export function buildIntegrativeReport(session,result,date=new Date()){
 const c=findCase(session.caseId);
 const lines=['# AutoLab Academy — Expediente integrador (solo simulación)','',
  'Fecha de exportación: '+date.toISOString(),'Caso: '+c.title,'Código didáctico: '+c.dtc,
  'Modelo: datos ficticios sin instrumento, ECU, presión o fabricante reales.','',
  '## 1. Situación',c.symptom,
  'Hipótesis inicial: '+(c.alternatives.find(x=>x[0]===session.initial)?.[1]||'no registrada'),
  '## 2. Cadena de evidencia con procedencia'];
 for(const o of session.observations||[]){
  const r=integrativeReading(c.id,o.id);
  lines.push('- '+r.id+' ['+r.kind+'] '+r.label,
   '  - Procedencia: '+r.provenance,
   '  - Condición y resultado virtual: '+r.value,
   '  - Predicción del estudiante: '+o.prediction+'; clasificación del banco: '+r.classification,
   '  - Papel **según la solución del modelo**: '+(r.unsafe?'maniobra insegura; sin lectura real':r.confirm?'confirma la hipótesis correcta':r.exclude?'contrasta una hipótesis alternativa':'contexto; no discrimina por sí solo'));
 }
 lines.push('','## 3. Conclusión y alternativas',
  'Diagnóstico final: '+(c.alternatives.find(x=>x[0]===session.final)?.[1]||'no seleccionado'),
  'Causa esperada del generador: '+(c.alternatives.find(x=>x[0]===c.cause)?.[1]||c.cause),
  'Interpretación de referencia: '+c.explanation,'',
  '## 4. Argumento del estudiante (no evaluado semánticamente)',String(session.reasoning||'').slice(0,3000),
  '## 5. Incertidumbres / datos faltantes',String(session.uncertainty||'').slice(0,1200),
  '## 6. Auditoría objetiva',
  'Puntuación: '+result.score+'/100; criterios automáticos alcanzados: '+result.passed,
  'Causa: '+result.cause+'; confirmación: '+result.confirm+'; descarte: '+result.exclude+
   '; cuatro fuentes: '+result.coverage+'; pronóstico: '+result.predicted+'; acción insegura: '+result.unsafe,
  'Fuentes inspeccionadas: '+result.kinds.join(', '),
  '## 7. Fuente conceptual y alcance',c.source,
  'El reporte se genera a partir de datos sintéticos; las fuentes públicas solo sustentan conceptos de instrumentación.',
  'Ni esta calificación ni este expediente acreditan diagnóstico real, reparación, seguridad HV o experiencia supervisada.','');
 return lines.join('\n');
}
