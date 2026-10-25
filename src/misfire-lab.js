// Datos completamente sintéticos de cuatro cilindros, sin algoritmo OEM de misfire ni valores de presión real.
export const MISFIRE_CASES=[
  {
    "id": "misfire-ignition",
    "title": "Falla repetida del cilindro 2: mando sin corriente primaria",
    "topic": "motor",
    "symptom": "El monitor ficticio registra pérdida de contribución del cilindro 2, con mando de bobina pero sin corriente primaria en esa carga.",
    "cause": "coil-feed",
    "dtc": "P0302",
    "cylinders": [
      1,
      2,
      3,
      4
    ],
    "hypotheses": [
      [
        "coil-feed",
        "Alimentación ausente en circuito primario de bobina"
      ],
      [
        "injector-open",
        "Circuito eléctrico abierto de inyector"
      ],
      [
        "compression-low",
        "Compresión insuficiente en el modelo mecánico"
      ],
      [
        "air-leak",
        "Aire adicional sin registrar en admisión simulada"
      ]
    ],
    "explanation": "El modelo deja intacto el mando de control, pero retira la corriente primaria a C2. Verificar la corriente y comparar con un inyector que sí recibe carga discrimina un problema eléctrico de esta rama. No se concluye una pieza OEM ni se ensaya alta tensión.",
    "frames": [
      {
        "id": "idle",
        "label": "Ralentí",
        "rpm": 810,
        "misfires": [
          0,
          18,
          1,
          0
        ],
        "contribution": [
          97,
          41,
          96,
          98
        ],
        "stftPct": 5,
        "ltftPct": 6
      },
      {
        "id": "load",
        "label": "Demanda moderada",
        "rpm": 2600,
        "misfires": [
          0,
          46,
          2,
          1
        ],
        "contribution": [
          95,
          25,
          94,
          97
        ],
        "stftPct": 6,
        "ltftPct": 6
      }
    ],
    "probes": [
      {
        "id": "coil",
        "label": "Comparar corriente primaria de bobina del cilindro 2 con cilindro de referencia",
        "classify": "anómala",
        "reading": "C2: 0 A; referencia sintética C4: pulso primario presente.",
        "confirm": true,
        "crosscheck": false,
        "unsafe": false
      },
      {
        "id": "injector",
        "label": "Comparar corriente de inyector de C2 y C4",
        "classify": "normal",
        "reading": "Ambas cargas presentan respuesta virtual de corriente semejante.",
        "confirm": false,
        "crosscheck": true,
        "unsafe": false
      },
      {
        "id": "compression",
        "label": "Comparar compresión relativa ficticia de los cuatro cilindros",
        "classify": "normal",
        "reading": "Índice relativo de arranque 99, 100, 99, 100. No se mide presión absoluta.",
        "confirm": false,
        "crosscheck": false,
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Manipular salida real de alta tensión de encendido energizada",
        "classify": "peligrosa",
        "reading": "Maniobra insegura bloqueada, sin conexión física.",
        "confirm": false,
        "crosscheck": false,
        "unsafe": true
      }
    ],
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/training/compression-testing-by-pico-technology"
  },
  {
    "id": "misfire-injector",
    "title": "Pérdida de aporte de cilindro 3 con circuito de inyector abierto",
    "topic": "motor",
    "symptom": "El monitor simulado indica contribución reducida del cilindro 3 y un pulso lógico del inyector que no produce corriente de carga.",
    "cause": "injector-open",
    "dtc": "P0303",
    "cylinders": [
      1,
      2,
      3,
      4
    ],
    "hypotheses": [
      [
        "coil-feed",
        "Alimentación ausente en circuito primario de bobina"
      ],
      [
        "injector-open",
        "Circuito eléctrico abierto de inyector"
      ],
      [
        "compression-low",
        "Compresión insuficiente en el modelo mecánico"
      ],
      [
        "air-leak",
        "Aire adicional sin registrar en admisión simulada"
      ]
    ],
    "explanation": "El controlador ficticio envía comando de inyector, pero la carga virtual no circula corriente. La referencia de bobina independiente es coherente, por lo que la hipótesis del banco es un circuito abierto de inyector. El resultado no certifica funcionamiento hidráulico real.",
    "frames": [
      {
        "id": "idle",
        "label": "Ralentí",
        "rpm": 810,
        "misfires": [
          0,
          1,
          15,
          0
        ],
        "contribution": [
          98,
          96,
          46,
          97
        ],
        "stftPct": 3,
        "ltftPct": 5
      },
      {
        "id": "load",
        "label": "Demanda moderada",
        "rpm": 2600,
        "misfires": [
          1,
          0,
          38,
          1
        ],
        "contribution": [
          95,
          98,
          26,
          97
        ],
        "stftPct": 4,
        "ltftPct": 6
      }
    ],
    "probes": [
      {
        "id": "injector-current",
        "label": "Comparar corriente de inyector C3 con el mando virtual activo",
        "classify": "anómala",
        "reading": "Mando C3 presente, corriente de carga C3 = 0 A; C1 responde.",
        "confirm": true,
        "crosscheck": false,
        "unsafe": false
      },
      {
        "id": "ignition",
        "label": "Comparar corriente primaria de bobinas C1 y C3",
        "classify": "normal",
        "reading": "Se registran pulsos equivalentes de bobina en la referencia del banco.",
        "confirm": false,
        "crosscheck": true,
        "unsafe": false
      },
      {
        "id": "compression",
        "label": "Inspeccionar índice relativo de compresión de C3",
        "classify": "normal",
        "reading": "Comparación de arranque virtual entre cilindros sin anomalía relevante.",
        "confirm": false,
        "crosscheck": false,
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Abrir una línea real de combustible presurizada",
        "classify": "peligrosa",
        "reading": "La maniobra queda bloqueada.",
        "confirm": false,
        "crosscheck": false,
        "unsafe": true
      }
    ],
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/training/compression-testing-by-pico-technology"
  },
  {
    "id": "misfire-mechanical",
    "title": "Cilindro 1 con contribución baja y circuito eléctrico normal",
    "topic": "motor",
    "symptom": "Las señales primarias eléctricas del cilindro 1 son normales en el modelo, pero su índice de compresión de arranque es inferior.",
    "cause": "compression-low",
    "dtc": "P0301",
    "cylinders": [
      1,
      2,
      3,
      4
    ],
    "hypotheses": [
      [
        "coil-feed",
        "Alimentación ausente en circuito primario de bobina"
      ],
      [
        "injector-open",
        "Circuito eléctrico abierto de inyector"
      ],
      [
        "compression-low",
        "Compresión insuficiente en el modelo mecánico"
      ],
      [
        "air-leak",
        "Aire adicional sin registrar en admisión simulada"
      ]
    ],
    "explanation": "La compresión relativa menor sugiere un desequilibrio mecánico del banco, y la comparación eléctrica no muestra anomalías. La compresión relativa orienta, pero no identifica qué elemento mecánico falló; confirmaciones físicas requieren instrumental, métodos y supervisión.",
    "frames": [
      {
        "id": "idle",
        "label": "Ralentí",
        "rpm": 810,
        "misfires": [
          21,
          0,
          0,
          0
        ],
        "contribution": [
          38,
          99,
          97,
          98
        ],
        "stftPct": 2,
        "ltftPct": 3
      },
      {
        "id": "load",
        "label": "Demanda moderada",
        "rpm": 2600,
        "misfires": [
          39,
          0,
          0,
          0
        ],
        "contribution": [
          23,
          96,
          95,
          97
        ],
        "stftPct": 4,
        "ltftPct": 4
      }
    ],
    "probes": [
      {
        "id": "relative-compression",
        "label": "Comparación relativa de corriente de arranque: C1 versus C2/C3/C4",
        "classify": "anómala",
        "reading": "Índice relativo C1=62; C2=100; C3=98; C4=99 (magnitudes sin unidad física).",
        "confirm": true,
        "crosscheck": false,
        "unsafe": false
      },
      {
        "id": "electric",
        "label": "Correlacionar bobina e inyector de C1 con referencia C4",
        "classify": "normal",
        "reading": "Ambos mandos y corrientes del banco muestran patrones equivalentes.",
        "confirm": false,
        "crosscheck": true,
        "unsafe": false
      },
      {
        "id": "in-cylinder",
        "label": "Consultar resultado de transductor virtual aislado, sin conexión física",
        "classify": "anómala",
        "reading": "La presión máxima ficticia de C1 está por debajo de la referencia interna; no es un valor OEM.",
        "confirm": false,
        "crosscheck": false,
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Forzar arranque de un motor real con elementos expuestos",
        "classify": "peligrosa",
        "reading": "Acción insegura bloqueada.",
        "confirm": false,
        "crosscheck": false,
        "unsafe": true
      }
    ],
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/training/compression-testing-by-pico-technology"
  },
  {
    "id": "misfire-multiple",
    "title": "P0300 simulado con aporte irregular de varios cilindros",
    "topic": "motor",
    "symptom": "La contribución disminuye en varios cilindros a ralentí con correcciones positivas; al aumentar carga se atenúa en este modelo.",
    "cause": "air-leak",
    "dtc": "P0300",
    "cylinders": [
      1,
      2,
      3,
      4
    ],
    "hypotheses": [
      [
        "coil-feed",
        "Alimentación ausente en circuito primario de bobina"
      ],
      [
        "injector-open",
        "Circuito eléctrico abierto de inyector"
      ],
      [
        "compression-low",
        "Compresión insuficiente en el modelo mecánico"
      ],
      [
        "air-leak",
        "Aire adicional sin registrar en admisión simulada"
      ]
    ],
    "explanation": "En el modelo, una entrada de aire adicional produce una compensación positiva y pérdidas en varios cilindros, que se reducen al aislar el ramal ficticio. El P0300 no identifica una fuga y los contadores que mostramos son inventados para el ejercicio.",
    "frames": [
      {
        "id": "idle",
        "label": "Ralentí",
        "rpm": 810,
        "misfires": [
          11,
          9,
          13,
          10
        ],
        "contribution": [
          72,
          74,
          69,
          70
        ],
        "stftPct": 25,
        "ltftPct": 18
      },
      {
        "id": "load",
        "label": "Demanda moderada",
        "rpm": 2600,
        "misfires": [
          2,
          1,
          4,
          2
        ],
        "contribution": [
          93,
          96,
          91,
          94
        ],
        "stftPct": 5,
        "ltftPct": 12
      }
    ],
    "probes": [
      {
        "id": "intake-isolate",
        "label": "Aislar únicamente la rama de admisión ficticia en emulador",
        "classify": "anómala",
        "reading": "STFT cae de +25% a +3% y el índice de aporte sube en los cuatro cilindros.",
        "confirm": true,
        "crosscheck": false,
        "unsafe": false
      },
      {
        "id": "fuel-pressure",
        "label": "Comprobar presión de combustible virtual respecto de este banco",
        "classify": "normal",
        "reading": "380 kPa para la referencia ficticia, sin especificación OEM aplicable.",
        "confirm": false,
        "crosscheck": true,
        "unsafe": false
      },
      {
        "id": "ignition",
        "label": "Comparar energía de corriente primaria ficticia en cuatro bobinas",
        "classify": "normal",
        "reading": "No se detectan diferencias en el circuito primario del emulador.",
        "confirm": false,
        "crosscheck": false,
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Provocar un escape real de admisión con motor funcionando",
        "classify": "peligrosa",
        "reading": "Prueba insegura bloqueada.",
        "confirm": false,
        "crosscheck": false,
        "unsafe": true
      }
    ],
    "source": "https://www.picoauto.com/library/picoscope-automotive-training/training/compression-testing-by-pico-technology"
  }
];

const states=new Set(['idle','load']);
export function misfireCase(id){
 const c=MISFIRE_CASES.find(x=>x.id===id);
 if(!c)throw Error('Caso de balance de cilindros inexistente');
 return c;
}
export function verifyMisfireCase(c){
 if(!c||!/^misfire-[a-z0-9-]+$/.test(c.id)||c.frames.length!==2||c.probes.length!==4||c.hypotheses.length!==4)throw Error('Caso de cilindros incompleto');
 if(new Set(c.hypotheses.map(x=>x[0])).size!==4||!c.hypotheses.some(x=>x[0]===c.cause))throw Error('Hipótesis inconsistentes');
 if(new Set(c.probes.map(x=>x.id)).size!==4||!c.probes.some(p=>p.confirm&&!p.unsafe)||!c.probes.some(p=>p.crosscheck&&!p.unsafe))throw Error('No hay pruebas confirmatorias y de contraste');
 if(new Set(c.frames.map(f=>f.id)).size!==2)throw Error('Estados repetidos');
 for(const f of c.frames)if(!states.has(f.id)||f.misfires.length!==4||f.contribution.length!==4||![...f.misfires,...f.contribution].every(v=>Number.isInteger(v)&&v>=0&&v<=100))throw Error('Registros de cilindros inválidos');
 for(const p of c.probes)if(!['normal','anómala','peligrosa'].includes(p.classify)||p.unsafe&&(p.confirm||p.crosscheck))throw Error('Prueba inválida');
 return true;
}
export function misfireFrame(id,state){
 const f=misfireCase(id).frames.find(f=>f.id===state);
 if(!f)throw Error('Estado no disponible');return f;
}
export function misfireProbe(id,probe){
 const p=misfireCase(id).probes.find(p=>p.id===probe);
 if(!p)throw Error('Prueba inexistente');return p;
}
export function newMisfireSession(id){
 verifyMisfireCase(misfireCase(id));
 return {caseId:id,initial:'',locked:false,viewed:[],observations:[],pending:'',prediction:'',final:'',reasoning:''};
}
export function evaluateMisfire(session){
 const c=misfireCase(session?.caseId);
 const viewed=[...new Set(session.viewed||[])].filter(x=>states.has(x));
 const compared=viewed.includes('idle')&&viewed.includes('load');
 const observations=(session.observations||[]).filter((o,i,all)=>all.findIndex(x=>x.id===o.id)===i&&c.probes.some(p=>p.id===o.id));
 const unsafe=observations.some(o=>misfireProbe(c.id,o.id).unsafe);
 const confirming=observations.some(o=>misfireProbe(c.id,o.id).confirm);
 const contrary=observations.some(o=>misfireProbe(c.id,o.id).crosscheck);
 const predicted=observations.some(o=>!misfireProbe(c.id,o.id).unsafe&&o.prediction===misfireProbe(c.id,o.id).classify);
 const correct=session.final===c.cause;
 const documented=String(session.reasoning||'').trim().length>=100&&String(session.reasoning||'').trim().length<=3000;
 const score=unsafe?0:(correct?40:0)+(confirming?25:0)+(contrary?15:0)+(compared?10:0)+(predicted?5:0)+(documented?5:0);
 return {score,passed:!unsafe&&correct&&confirming&&contrary&&compared&&predicted&&documented,
   correct,confirming,contrary,compared,predicted,documented,unsafe,textReviewed:false,expectedCause:c.cause};
}
export function misfireReport(session,result,date=new Date()){
 const c=misfireCase(session.caseId);
 const lines=['# AutoLab Academy — Correlación de cilindros (banco sintético)','',
 'Fecha: '+date.toISOString(),'Caso: '+c.title,'Monitor didáctico: '+c.dtc,
 'Hipótesis inicial: '+String(session.initial||''),'',
 '## Estados examinados'];
 for(const state of session.viewed||[]){
  const f=misfireFrame(c.id,state);
  lines.push('- '+f.label+' ('+f.rpm+' rpm). Contadores ficticios: '+f.misfires.join(', ')+'. Índices de aporte arbitrarios: '+f.contribution.join(', ')+'. STFT: '+f.stftPct+'%; LTFT: '+f.ltftPct+'%.');
 }
 lines.push('','## Instrumentos del banco');
 for(const obs of session.observations||[]){
  const p=misfireProbe(c.id,obs.id);
  lines.push('- '+p.label+'; pronóstico '+obs.prediction+'; observado '+p.classify+'; '+p.reading);
 }
 lines.push('','## Conclusión',String(session.final||''),'## Argumentación sin revisión técnica',String(session.reasoning||'').slice(0,3000),
 '## Solución del modelo',c.explanation,'Puntuación automática: '+result.score+'/100.',
 'Conceptos de referencia: '+c.source,
 'Este material no interpreta contadores OEM, ángulos de cilindro o presión absoluta ni acredita diagnóstico real.','');
 return lines.join('\n');
}
