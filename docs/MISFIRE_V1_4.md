# AutoLab Academy v1.4 — Fallas de encendido y balance por cilindro

## Naturaleza del laboratorio

Cuatro casos de un **motor ficticio de gasolina de cuatro cilindros**. El monitor se presenta como P0301, P0302, P0303 o P0300, con contadores de eventos y un índice de contribución 0–100 diseñado exclusivamente para entrenamiento. **No se implementa ni imita un algoritmo OEM de detección de misfires, no se mide torque, presión ni oscilogramas de un vehículo.**

Las etiquetas de cilindro son nombres definidos manualmente por el autor del caso y **no** el resultado de identificar picos de una compresión relativa con fase sincronizada. En instrumentación real, una comparación relativa de compresión requiere correlación de fase para atribuir eventos a un cilindro y no determina presión absoluta. No deben interpretarse 0–100 como porcentaje certificado de compresión o desempeño.

## Cuatro escenarios

| Caso | Dato inicial | Prueba confirmatoria ficticia | Prueba independiente de contraste |
|---|---|---|---|
| C2 / P0302 | Mando de bobina presente, contribución reducida | Corriente primaria C2 ausente frente a C4 | Corriente de inyector C2/C4 normal |
| C3 / P0303 | Mando de inyector presente, aporte reducido | Corriente de carga del inyector C3 = 0 A | Corriente primaria de bobina C3 normal |
| C1 / P0301 | Circuitos eléctricos aparentan normales | Índice relativo de compresión C1 reducido | Bobina e inyector C1 muestran mandos y corrientes equivalentes |
| Múltiples / P0300 | Aporte irregular en cuatro cilindros en ralentí | Aislar **virtualmente** un ramal de admisión restaura índices | Presión ficticia del banco sin caída |

### Flujo de aprendizaje

1. Seleccionar una hipótesis inicial **antes de consultar el monitor por régimen**.
2. Comparar valores ficticios de contadores e índices para ralentí y demanda moderada.
3. Elegir pruebas de banco y **predecir normal/anómala/peligrosa antes de revelar el resultado**.
4. Buscar una prueba que confirme la causa del modelo y **otra independiente que contraste una explicación alternativa**.
5. Seleccionar una conclusión, documentar al menos 100 caracteres de argumento y obtener la rúbrica e informe Markdown.

### Puntuación

- 40 puntos: causa correspondiente al escenario generado.
- 25 puntos: prueba confirmatoria virtual utilizada.
- 15 puntos: segunda prueba de contraste independiente.
- 10 puntos: se inspeccionaron ambos regímenes.
- 5 puntos: al menos una predicción previa correcta.
- 5 puntos: justificación escrita de 100 a 3000 caracteres.

**Cualquier elección insegura = cero puntos** y rechazo de práctica. La justificación NO se revisa semánticamente y no acredita competencia técnica: un resultado de 100 solo significa haber cumplido controles estructurados de una simulación. Se guardan hipótesis, pruebas y explicación en IndexedDB con el esquema y respaldo JSON existentes.

## Contenidos

5 lecciones y 10 preguntas originales, repartidas entre motor, electricidad, señales, redes y electromovilidad. **Total: 56 lecciones y 140 preguntas**, ocho etapas del itinerario. Se conservaron los IDs existentes y FSRS.

## Referencias de conceptos, no de contadores sintéticos

- Pico Technology: [Compression testing](https://www.picoauto.com/library/picoscope-automotive-training/training/compression-testing-by-pico-technology): compresión relativa como *orientación*, necesidad de sincronización y confirmación.
- Pico Technology: [Cylinder balance test](https://www.picoauto.com/library/picoscope-automotive-training/knowledge-base/picodiagnostics-compression-test).
- Pico: [Injector current vs primary ignition](https://www.picoauto.com/library/automotive-guided-tests/system-tests/primary-ignition-timing-vs.-injector-current/AGT-391-injector-current-vs-primary-ignition/).
- HSE: [Electric and hybrid vehicles](https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm).

El funcionamiento del monitor, la forma de onda de bobinas e inyectores, y la estrategia de desactivación de cilindros pueden diferir por marca y modelo. Los datos no reemplazan manuales de diagnóstico OEM.

## QA

Pruebas del motor: casos, unicidad de hipótesis, datos por cilindro, necesidad de confirmación y descarte, comparación de condiciones, bloqueo de unsafe, informe y conservación JSON/Portafolio. Precaché de los nuevos módulos en PWA y cobertura editorial del total de lecciones/preguntas.

**Pendientes:** QA táctil y con lector de pantalla en Safari/iPhone, pruebas offline sobre instalaciones antiguas, validación con especialista, instrumentos y trazas reales licenciadas, rúbrica humana de razonamiento. No existe integración con vehículo, hardware de osciloscopio, presión, CAN de control o sistemas HV.
