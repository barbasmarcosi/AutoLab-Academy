// Entrenamiento ECU exclusivamente virtual. No hay intervenciones físicas.
export const ecuCases=[
  {
    "id": "ecu-supply",
    "topic": "electricidad",
    "title": "ECU reinicia al aplicar una carga",
    "symptom": "Controlador virtual se reinicia mientras los bornes de batería permanecen estables.",
    "context": "Banco didáctico y datos sintéticos, sin intervención sobre vehículos, CAN real ni alta tensión.",
    "options": [
      [
        "drop",
        "Caída resistiva en la línea protegida de ECU"
      ],
      [
        "processor",
        "Procesador ECU averiado"
      ],
      [
        "battery",
        "Batería agotada"
      ]
    ],
    "solution": "drop",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "rationale": "El trayecto de alimentación muestra caída localizada mientras la fuente se mantiene estable. No implica avería del procesador.",
    "probes": [
      {
        "id": "battery",
        "label": "Tensión en bornes durante carga",
        "result": "12,3 V estables",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "pin",
        "label": "Alimentación en pin ECU durante evento",
        "result": "8,7 V en el pin ECU",
        "observed": "abnormal",
        "supports": [
          "drop"
        ],
        "unsafe": false
      },
      {
        "id": "ground",
        "label": "Retorno ECU durante carga",
        "result": "0,06 V de caída",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Puentear protecciones o conectar terminales desconocidos",
        "result": "Acción insegura bloqueada; no se realiza.",
        "observed": "abnormal",
        "supports": [],
        "unsafe": true
      }
    ]
  },
  {
    "id": "ecu-sensors",
    "topic": "motor",
    "title": "Dos sensores pierden plausibilidad",
    "symptom": "Dos entradas analógicas del banco tienen lectura incoherente al mismo tiempo.",
    "context": "Banco didáctico y datos sintéticos, sin intervención sobre vehículos, CAN real ni alta tensión.",
    "options": [
      [
        "sensor",
        "Un sensor externo carga la referencia común"
      ],
      [
        "ecu",
        "Regulador ECU necesariamente averiado"
      ],
      [
        "both",
        "Dos sensores fallaron a la vez"
      ]
    ],
    "solution": "sensor",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "rationale": "La referencia compartida recupera su nivel cuando se aísla la carga externa. Esa prueba separa causa de síntoma.",
    "probes": [
      {
        "id": "reference",
        "label": "Referencia común de sensores",
        "result": "1,1 V al conectar ambos sensores",
        "observed": "abnormal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "isolate",
        "label": "Retirar virtualmente sensor de pruebas",
        "result": "Referencia se recupera a 5 V y segunda señal vuelve",
        "observed": "abnormal",
        "supports": [
          "sensor"
        ],
        "unsafe": false
      },
      {
        "id": "ground",
        "label": "Masa de sensores",
        "result": "Caída 0,04 V",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Puentear protecciones o conectar terminales desconocidos",
        "result": "Acción insegura bloqueada; no se realiza.",
        "observed": "abnormal",
        "supports": [],
        "unsafe": true
      }
    ]
  },
  {
    "id": "ecu-actuator",
    "topic": "senales",
    "title": "PWM correcto, actuador sin corriente",
    "symptom": "El controlador simulado emite PWM y el actuador no responde.",
    "context": "Banco didáctico y datos sintéticos, sin intervención sobre vehículos, CAN real ni alta tensión.",
    "options": [
      [
        "coil",
        "Bobinado abierto en la carga"
      ],
      [
        "driver",
        "Driver ECU incapaz de conmutar"
      ],
      [
        "supply",
        "Fuente del actuador ausente"
      ]
    ],
    "solution": "coil",
    "source": "https://www.picoauto.com/library/automotive-guided-tests/",
    "rationale": "El mando PWM solo demuestra conmutación de señal, no corriente. La carga del banco está abierta.",
    "probes": [
      {
        "id": "command",
        "label": "Forma de onda en el mando",
        "result": "100 Hz y duty correctos para este banco",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "current",
        "label": "Corriente durante comando activo",
        "result": "0 A a pesar de los pulsos",
        "observed": "abnormal",
        "supports": [
          "coil"
        ],
        "unsafe": false
      },
      {
        "id": "supply",
        "label": "Fuente del actuador",
        "result": "12 V estables",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Puentear protecciones o conectar terminales desconocidos",
        "result": "Acción insegura bloqueada; no se realiza.",
        "observed": "abnormal",
        "supports": [],
        "unsafe": true
      }
    ]
  },
  {
    "id": "ecu-gateway",
    "topic": "redes",
    "title": "Gateway sin respuesta en CAN operativo",
    "symptom": "El gateway virtual no responde, pero otros nodos intercambian tramas.",
    "context": "Banco didáctico y datos sintéticos, sin intervención sobre vehículos, CAN real ni alta tensión.",
    "options": [
      [
        "power",
        "Gateway sin alimentación protegida"
      ],
      [
        "term",
        "Los dos terminadores ausentes"
      ],
      [
        "dbc",
        "DBC errónea impide transmisión física"
      ]
    ],
    "solution": "power",
    "source": "https://kvaser.com/knowledge-base/get-error-frames/",
    "rationale": "La actividad de otros nodos no demuestra alimentación del gateway. Su suministro local está ausente.",
    "probes": [
      {
        "id": "termination",
        "label": "Resistencia bus apagado",
        "result": "60 Ω en banco de dos terminadores",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "traffic",
        "label": "Registro pasivo entre otros nodos",
        "result": "Tramas A y C sin errores sintéticos",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "gateway",
        "label": "Alimentación de gateway",
        "result": "0 V en el pin protegido",
        "observed": "abnormal",
        "supports": [
          "power"
        ],
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Puentear protecciones o conectar terminales desconocidos",
        "result": "Acción insegura bloqueada; no se realiza.",
        "observed": "abnormal",
        "supports": [],
        "unsafe": true
      }
    ]
  },
  {
    "id": "ecu-dcdc",
    "topic": "ev",
    "title": "Bus auxiliar LV cae en EV de banco",
    "symptom": "El sistema auxiliar ficticio muestra bajo voltaje con carga; no hay mediciones HV.",
    "context": "Banco didáctico y datos sintéticos, sin intervención sobre vehículos, CAN real ni alta tensión.",
    "options": [
      [
        "return",
        "Retorno de baja tensión resistivo"
      ],
      [
        "pack",
        "Degradación de celdas HV comprobada"
      ],
      [
        "inverter",
        "Motor de tracción abierto"
      ]
    ],
    "solution": "return",
    "source": "https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm",
    "rationale": "La fuente de baja tensión está estable, pero su retorno pierde tensión. No hay evidencia de falla de tracción.",
    "probes": [
      {
        "id": "source",
        "label": "Salida virtual LV de DC/DC",
        "result": "13,8 V estables",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "return",
        "label": "Caída en retorno LV bajo demanda",
        "result": "1,6 V de caída en sistema auxiliar",
        "observed": "abnormal",
        "supports": [
          "return"
        ],
        "unsafe": false
      },
      {
        "id": "pack",
        "label": "Indicador informativo de HV",
        "result": "Sin evidencia suficiente para inferir SOH",
        "observed": "normal",
        "supports": [],
        "unsafe": false
      },
      {
        "id": "unsafe",
        "label": "Abrir una batería HV real",
        "result": "Acción insegura bloqueada; no se realiza.",
        "observed": "abnormal",
        "supports": [],
        "unsafe": true
      }
    ]
  }
];

export function validateEcuCase(c){
 if(!c||!/^ecu-[a-z0-9-]+$/.test(c.id)||!c.options.some(o=>o[0]===c.solution)||c.probes.length<4)throw Error('Caso ECU inválido');
 if(new Set(c.options.map(x=>x[0])).size!==c.options.length||new Set(c.probes.map(x=>x.id)).size!==c.probes.length)throw Error('Opciones duplicadas');
 if(!c.probes.some(p=>!p.unsafe&&p.supports.includes(c.solution)))throw Error('Sin prueba discriminante');
 for(const p of c.probes)if(!['normal','abnormal'].includes(p.observed)||!Array.isArray(p.supports)||p.unsafe&&p.supports.length)throw Error('Prueba inconsistente');
 return true;
}
export function evaluateEcu(c,s){
 validateEcuCase(c);
 const probes=(s.observations||[]).filter((o,i,a)=>a.findIndex(x=>x.id===o.id)===i&&c.probes.some(p=>p.id===o.id));
 const unsafe=probes.some(o=>c.probes.find(p=>p.id===o.id).unsafe);
 const evidence=probes.some(o=>c.probes.find(p=>p.id===o.id).supports.includes(c.solution));
 const prediction=probes.some(o=>{const p=c.probes.find(x=>x.id===o.id);return !p.unsafe&&o.prediction===p.observed});
 const correct=s.final===c.solution,documented=String(s.reasoning||'').trim().length>=80&&String(s.reasoning||'').trim().length<=3000;
 const score=unsafe?0:(correct?45:0)+(evidence?30:0)+(prediction?15:0)+(documented?10:0);
 return {score,passed:!unsafe&&correct&&evidence&&prediction&&documented,unsafe,correct,evidence,prediction,documented,reasoningReviewed:false};
}
export function ecuReport(c,s,r,date=new Date()){
 return ['# AutoLab Academy - Simulación de diagnóstico ECU','Fecha: '+date.toISOString(),'Caso: '+c.title,c.symptom,'Hipótesis inicial: '+s.initial,
  '## Mediciones y pronósticos',...(s.observations||[]).map(o=>{const p=c.probes.find(x=>x.id===o.id);return p?'- '+p.label+'; previsto '+o.prediction+'; observado '+p.observed+'; '+p.result:'';}),
  'Diagnóstico final: '+s.final,'Explicación escrita: '+String(s.reasoning||'').slice(0,3000),
  'Resultado automático: '+r.score+'/100',c.rationale,
  'La explicación escrita no fue evaluada semánticamente y exige revisión humana.',
  'Los valores son sintéticos; ninguna competencia profesional o HV resulta acreditada.',c.source,''].join('\n');
}
