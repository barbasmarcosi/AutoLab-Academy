/** Synthetic MPI closed-loop fixtures, no OEM data, hardware, or universal pressure targets. */
export const FUEL_CASES=[
  {
    "id": "fuel-air-leak",
    "title": "Correcciones elevadas al ralentí",
    "topic": "motor",
    "symptom": "Las correcciones positivas aumentan al ralentí y disminuyen al sostener crucero en este modelo.",
    "cause": "air",
    "options": [
      [
        "air",
        "Aire adicional no registrado"
      ],
      [
        "pressure",
        "Presión de combustible insuficiente"
      ],
      [
        "maf",
        "Sublectura MAF"
      ],
      [
        "injector",
        "Exceso por inyector sin estanqueidad"
      ]
    ],
    "explanation": "La admisión ficticia deja pasar aire no incluido en la medición principal. La prueba de aislamiento del ramal devuelve STFT de +28% a +3% al ralentí; el patrón por sí solo no confirma una pieza real.",
    "frames": [
      {
        "id": "idle",
        "label": "Ralentí",
        "rpm": 800,
        "loadPct": 17,
        "stftPct": 28,
        "ltftPct": 12,
        "mapKpa": 33,
        "mafGps": 3.8,
        "lambda": 1.01,
        "loop": "closed"
      },
      {
        "id": "cruise",
        "label": "Crucero",
        "rpm": 2400,
        "loadPct": 34,
        "stftPct": 5,
        "ltftPct": 10,
        "mapKpa": 47,
        "mafGps": 14.5,
        "lambda": 1,
        "loop": "closed"
      },
      {
        "id": "load",
        "label": "Demanda moderada",
        "rpm": 3300,
        "loadPct": 66,
        "stftPct": 4,
        "ltftPct": 8,
        "mapKpa": 76,
        "mafGps": 31,
        "lambda": 1,
        "loop": "closed"
      }
    ],
    "probes": [
      {
        "id": "isolate",
        "label": "Aislar virtualmente un ramal de admisión",
        "classification": "anormal",
        "reading": "STFT al ralentí cambia de +28% a +3% al aislar el ramal ficticio.",
        "confirm": true,
        "unsafe": false
      },
      {
        "id": "pressure",
        "label": "Medir presión de combustible en el banco",
        "classification": "normal",
        "reading": "380 kPa en este banco, coincide con su referencia interna.",
        "confirm": false,
        "unsafe": false
      },
      {
        "id": "code",
        "label": "Volver a leer el DTC almacenado",
        "classification": "normal",
        "reading": "P0171 ficticio; no discrimina el origen del síntoma.",
        "confirm": false,
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Provocar físicamente una fuga en motor encendido",
        "classification": "peligrosa",
        "reading": "Maniobra bloqueada.",
        "confirm": false,
        "unsafe": true
      }
    ],
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "fuel-pressure",
    "title": "Correcciones crecen bajo demanda",
    "topic": "motor",
    "symptom": "La compensación positiva aumenta cuando el banco requiere mayor entrega de combustible.",
    "cause": "pressure",
    "options": [
      [
        "air",
        "Aire adicional no registrado"
      ],
      [
        "pressure",
        "Presión de combustible insuficiente"
      ],
      [
        "maf",
        "Sublectura MAF"
      ],
      [
        "injector",
        "Exceso por inyector sin estanqueidad"
      ]
    ],
    "explanation": "La presión simulada queda debajo de la referencia de este banco. El patrón de trims sugiere una hipótesis de suministro que se discrimina midiendo presión virtual; no presupone que el parámetro esté disponible vía OBD en todos los vehículos.",
    "frames": [
      {
        "id": "idle",
        "label": "Ralentí",
        "rpm": 800,
        "loadPct": 19,
        "stftPct": 15,
        "ltftPct": 12,
        "mapKpa": 32,
        "mafGps": 3.9,
        "lambda": 1.01,
        "loop": "closed"
      },
      {
        "id": "cruise",
        "label": "Crucero",
        "rpm": 2400,
        "loadPct": 44,
        "stftPct": 26,
        "ltftPct": 15,
        "mapKpa": 56,
        "mafGps": 20,
        "lambda": 1.02,
        "loop": "closed"
      },
      {
        "id": "load",
        "label": "Demanda moderada",
        "rpm": 3300,
        "loadPct": 76,
        "stftPct": 30,
        "ltftPct": 18,
        "mapKpa": 81,
        "mafGps": 34,
        "lambda": 1.02,
        "loop": "closed"
      }
    ],
    "probes": [
      {
        "id": "pressure",
        "label": "Contrastar presión en el circuito de combustible virtual",
        "classification": "anormal",
        "reading": "265 kPa frente a 380 kPa de referencia en el banco.",
        "confirm": true,
        "unsafe": false
      },
      {
        "id": "intake",
        "label": "Aislar virtualmente un tramo de admisión",
        "classification": "normal",
        "reading": "Las correcciones permanecen elevadas en este modelo.",
        "confirm": false,
        "unsafe": false
      },
      {
        "id": "maf",
        "label": "Comparar la señal MAF con referencia independiente",
        "classification": "normal",
        "reading": "Flujo informado coincide con la referencia ficticia.",
        "confirm": false,
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Abrir una línea real de combustible presurizada",
        "classification": "peligrosa",
        "reading": "Maniobra bloqueada.",
        "confirm": false,
        "unsafe": true
      }
    ],
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "fuel-maf",
    "title": "Sublectura del medidor MAF simulado",
    "topic": "motor",
    "symptom": "Las correcciones aumentan con la demanda; el valor MAF parece plausible, pero no coincide con un medidor de referencia.",
    "cause": "maf",
    "options": [
      [
        "air",
        "Aire adicional no registrado"
      ],
      [
        "pressure",
        "Presión de combustible insuficiente"
      ],
      [
        "maf",
        "Sublectura MAF"
      ],
      [
        "injector",
        "Exceso por inyector sin estanqueidad"
      ]
    ],
    "explanation": "La comparación simultánea revela 12 g/s reportados versus 25 g/s en el medidor independiente del banco a crucero. No se deriva ese valor de MAP ni se pretende calibración OEM.",
    "frames": [
      {
        "id": "idle",
        "label": "Ralentí",
        "rpm": 800,
        "loadPct": 16,
        "stftPct": 6,
        "ltftPct": 9,
        "mapKpa": 31,
        "mafGps": 3.1,
        "lambda": 1,
        "loop": "closed"
      },
      {
        "id": "cruise",
        "label": "Crucero",
        "rpm": 2400,
        "loadPct": 49,
        "stftPct": 22,
        "ltftPct": 14,
        "mapKpa": 61,
        "mafGps": 12,
        "lambda": 1.01,
        "loop": "closed"
      },
      {
        "id": "load",
        "label": "Demanda moderada",
        "rpm": 3300,
        "loadPct": 82,
        "stftPct": 25,
        "ltftPct": 16,
        "mapKpa": 86,
        "mafGps": 21,
        "lambda": 1.01,
        "loop": "closed"
      }
    ],
    "probes": [
      {
        "id": "flow",
        "label": "Comparar MAF con medidor de flujo independiente",
        "classification": "anormal",
        "reading": "A crucero: MAF 12 g/s, referencia de banco 25 g/s.",
        "confirm": true,
        "unsafe": false
      },
      {
        "id": "pressure",
        "label": "Medir presión en banco virtual",
        "classification": "normal",
        "reading": "380 kPa, nominal únicamente en esta instalación ficticia.",
        "confirm": false,
        "unsafe": false
      },
      {
        "id": "supply",
        "label": "Comprobar alimentación y masa del emulador MAF",
        "classification": "normal",
        "reading": "Valores previstos en el emulador, sin discriminar el error de escala.",
        "confirm": false,
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Aplicar 12 V a una salida simulada de 5 V",
        "classification": "peligrosa",
        "reading": "Maniobra bloqueada.",
        "confirm": false,
        "unsafe": true
      }
    ],
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  },
  {
    "id": "fuel-rich",
    "title": "Correcciones negativas al ralentí",
    "topic": "motor",
    "symptom": "La ECU ficticia reduce el combustible comandado, pero una carga del banco aporta combustible adicional.",
    "cause": "injector",
    "options": [
      [
        "air",
        "Aire adicional no registrado"
      ],
      [
        "pressure",
        "Presión de combustible insuficiente"
      ],
      [
        "maf",
        "Sublectura MAF"
      ],
      [
        "injector",
        "Exceso por inyector sin estanqueidad"
      ]
    ],
    "explanation": "La prueba virtual aislada revela un inyector que pierde estanqueidad con mando apagado. La corrección negativa sola no identifica qué componente produjo el exceso.",
    "frames": [
      {
        "id": "idle",
        "label": "Ralentí",
        "rpm": 800,
        "loadPct": 18,
        "stftPct": -24,
        "ltftPct": -11,
        "mapKpa": 35,
        "mafGps": 4.2,
        "lambda": 0.99,
        "loop": "closed"
      },
      {
        "id": "cruise",
        "label": "Crucero",
        "rpm": 2400,
        "loadPct": 36,
        "stftPct": -9,
        "ltftPct": -9,
        "mapKpa": 49,
        "mafGps": 16,
        "lambda": 0.99,
        "loop": "closed"
      },
      {
        "id": "load",
        "label": "Demanda moderada",
        "rpm": 3300,
        "loadPct": 68,
        "stftPct": -4,
        "ltftPct": -7,
        "mapKpa": 75,
        "mafGps": 33,
        "lambda": 1,
        "loop": "closed"
      }
    ],
    "probes": [
      {
        "id": "seal",
        "label": "Verificar estanqueidad del emulador aislado de inyector",
        "classification": "anormal",
        "reading": "Una carga pierde presión virtual con el comando apagado; otras permanecen estables.",
        "confirm": true,
        "unsafe": false
      },
      {
        "id": "map",
        "label": "Contrastar MAP con carga de referencia",
        "classification": "normal",
        "reading": "MAP coherente en estas tres condiciones del banco.",
        "confirm": false,
        "unsafe": false
      },
      {
        "id": "command",
        "label": "Comprobar mando lógico del inyector",
        "classification": "normal",
        "reading": "Orden lógica esperada, que no prueba cierre mecánico.",
        "confirm": false,
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Tocar línea real presurizada para evaluar una fuga",
        "classification": "peligrosa",
        "reading": "Maniobra bloqueada.",
        "confirm": false,
        "unsafe": true
      }
    ],
    "source": "https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/0134893492.pdf"
  }
];

const states=new Set(['idle','cruise','load']);
function findCase(id){const c=FUEL_CASES.find(x=>x.id===id);if(!c)throw Error('Caso de inyección inexistente');return c;}
export function validateFuelCase(c){
 if(!c||!/^fuel-[a-z0-9-]+$/.test(c.id)||c.frames.length!==3||c.probes.length!==4||c.options.length!==4)throw Error('Caso incompleto');
 if(new Set(c.options.map(x=>x[0])).size!==4||!c.options.some(x=>x[0]===c.cause))throw Error('Hipótesis inconsistentes');
 if(new Set(c.probes.map(p=>p.id)).size!==4||!c.probes.some(p=>p.confirm&&!p.unsafe))throw Error('Sin evidencia independiente');
 for(const f of c.frames)if(!states.has(f.id)||f.loop!=='closed'||![f.rpm,f.stftPct,f.ltftPct,f.mapKpa,f.mafGps,f.lambda].every(Number.isFinite))throw Error('Frame inválido');
 for(const p of c.probes)if(!['normal','anormal','peligrosa'].includes(p.classification)||p.unsafe&&p.confirm)throw Error('Prueba inconsistente');
 return true;
}
export function createFuelSession(id){
 const c=findCase(id);validateFuelCase(c);
 return {caseId:id,initial:'',opened:[],probes:[],pending:'',prediction:'',final:'',reasoning:''};
}
export function fuelFrame(id,frameId){
 const f=findCase(id).frames.find(x=>x.id===frameId);
 if(!f)throw Error('Estado de funcionamiento inválido');return f;
}
export function fuelProbe(id,probeId){
 const p=findCase(id).probes.find(x=>x.id===probeId);
 if(!p)throw Error('Prueba de inyección inválida');return p;
}
export function gradeFuelSession(session){
 const c=findCase(session?.caseId);
 const opened=[...new Set(session.opened||[])].filter(id=>states.has(id));
 const compared=opened.includes('idle')&&opened.includes('cruise');
 const probes=(session.probes||[]).filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i&&c.probes.some(x=>x.id===p.id));
 const unsafe=probes.some(o=>fuelProbe(c.id,o.id).unsafe);
 const confirmed=probes.some(o=>fuelProbe(c.id,o.id).confirm);
 const predicted=probes.some(o=>o.prediction===fuelProbe(c.id,o.id).classification&&!fuelProbe(c.id,o.id).unsafe);
 const correct=session.final===c.cause;
 const documented=String(session.reasoning||'').trim().length>=90&&String(session.reasoning||'').trim().length<=3000;
 const score=unsafe?0:(correct?45:0)+(confirmed?25:0)+(compared?15:0)+(predicted?5:0)+(documented?10:0);
 return {score,passed:!unsafe&&correct&&confirmed&&compared&&predicted&&documented,
  correct,confirmed,compared,predicted,documented,unsafe,textReviewed:false,expectedCause:c.cause};
}
export function fuelReport(session,result,date=new Date()){
 const c=findCase(session.caseId),lines=['# AutoLab Academy - Diagnóstico de inyección sintético','',
 'Fecha: '+date.toISOString(),'Caso: '+c.title,'Hipótesis inicial: '+session.initial,
 '## Condiciones inspeccionadas (valores ficticios)'];
 for(const id of session.opened||[]){
  const f=fuelFrame(c.id,id);
  lines.push('- '+f.label+': '+f.rpm+' rpm, carga '+f.loadPct+'%, STFT '+f.stftPct+'%, LTFT '+f.ltftPct+'%, MAP '+f.mapKpa+' kPa, MAF '+f.mafGps+' g/s, lambda ilustrativa '+f.lambda);
 }
 lines.push('## Pruebas y predicciones');
 for(const o of session.probes||[]){
  const p=fuelProbe(c.id,o.id);
  lines.push('- '+p.label+' | previsto '+o.prediction+' | observado '+p.classification+' | '+p.reading);
 }
 lines.push('## Diagnóstico final',String(session.final),'## Explicación no revisada',String(session.reasoning||'').slice(0,3000),
 '## Interpretación de referencia',c.explanation,'Puntuación: '+result.score+'/100. No acredita competencia real.',
 'Fuente conceptual: '+c.source,'Los valores, la presión y las señales son del banco MPI ficticio; no son PIDs universales ni datos OEM.','');
 return lines.join('\n');
}
