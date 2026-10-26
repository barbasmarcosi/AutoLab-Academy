# Rotary Engineering Lab — laboratorio de motores Wankel

> **Estado:** RW0/RW1 disponen de primer visor cinemático offline; RW2–RW10 continúan planificados. [Contrato científico del modelo](ROTARY_GEOMETRY_MODEL.md).
> **Vinculación:** [visión de ingeniería e I+D](ENGINEERING_MINDSET_RD_VISION.md), [formación de mecánica integral](AUTOMOTIVE_MECHANICS_CURRICULUM.md), [roadmap](ROADMAP.md).
> **Propósito:** convertir la curiosidad por los motores rotativos en comprensión mecánica profunda, investigación reproducible, diagnóstico e invención; no en mitología de potencia.

## 1. Pregunta fundacional

> ¿Por qué una arquitectura Wankel consigue una entrega de movimiento tan particular, cuáles son las ventajas reales frente a motores alternativos y qué límites físicos, geométricos, térmicos, de emisiones y de manufactura impiden que domine el mercado?

No asumir que el Wankel es intrínsecamente mejor o peor ni tratar la elección del pistón alternativo como una victoria definitiva. Comparar hipótesis, condicionantes de uso, datos y trade-offs: la solución superior depende de la función objetivo y de las restricciones.

**Precisión conceptual esencial:** «Otto» identifica un modelo de ciclo termodinámico asociado a encendido provocado; «Wankel» identifica una arquitectura mecánica de motor rotativo. Un Wankel de encendido por chispa usualmente implementa admisión, compresión, combustión/expansión y escape; **no es lo opuesto termodinámico al ciclo Otto**. El contraste didáctico será Wankel vs. motor alternativo bajo ciclos y condiciones comparables, y **geometría real vs. idealización termodinámica**.

**Caso contemporáneo de investigación:** Mazda comunicó el restablecimiento de un grupo de desarrollo rotativo en febrero de 2024 y el uso del motor rotativo como generador en el MX-30 e-SKYACTIV R-EV. Esto permite contrastar «motor de tracción directa» y «extensor de autonomía con punto de operación acotado», sin inferir superioridad universal.

## 2. Competencias terminales (simulación primero)

El alumno debe poder:

1. Describir y dibujar la trocoide, movimiento del rotor, eje excéntrico, engranaje estacionario, puertos y tres cámaras, con convenciones de referencia explícitas.
2. Relacionar ángulo del eje, ángulo del rotor, volumen de cámara y eventos de admisión/compresión/combustión/escape.
3. Comparar con motores de pistones **sin trucar el denominador**: masa, volumen desplazado declarado, régimen, potencia efectiva, consumo específico (BSFC), eficiencia, relación potencia/masa, respuesta, emisiones, costos y confiabilidad.
4. Identificar hipótesis y signos de fugas en sellos de ápice/laterales, desgaste de housing, lubricación deficiente, fallas de encendido/inyección, temperatura y restricción de escape.
5. Predecir qué mediciones de compresión, temperatura, presión, señal de encendido, lambda y patrones de funcionamiento **discriminan** dos causas posibles (sin inventar valores OEM).
6. Proponer alternativas de puertos, tiempos, refrigeración, materiales, sellado, encendido y estrategias de control, **explicando el costo** que introducen.
7. Construir un experimento virtual reproducible y justificar límites de modelo, medición y extrapolación.
8. Argumentar cuándo un Wankel sirve mejor para un objetivo concreto (densidad de potencia, empaquetado o generación constante) y cuándo no.

No se afirma aptitud real para abrir, medir o reconstruir un motor Wankel a partir de una simulación. Esa competencia requiere instrumentación, procedimientos, valores de servicio fiables y supervisión.

## 3. Programa de módulos y laboratorios

| ID | Núcleo de enseñanza | Experimento/desafío propuesto | Evidencia objetiva |
| --- | --- | --- | --- |
| **RW0** | Mecánica previa: torque, potencia, termodinámica, fricción, ciclos | Comparar un reciprocante y un rotativo con condiciones y magnitudes equivalentes | Unidades, supuestos, criterios de normalización |
| **RW1** | Geometría de epitrocoide, rotor y eje excéntrico | Explorador cinemático con fase del rotor, volumen ilustrativo y superposición de cámaras | Predicción de movimiento y fase antes de reproducir |
| **RW2** | Admisión, transferencia de masa y puertos | Comparar puertos laterales/periféricos en modelos pedagógicos de llenado, con pérdidas modeladas | Curvas vs. régimen y explicación de trade-offs |
| **RW3** | Compresión, combustión y encendido | Investigar retrasos de combustión, geometría de cámara y sensibilidad de parámetros | Hipótesis alternativas y sensibilidad reproducible |
| **RW4** | Sellos de ápice, laterales, lubricación y desgaste | Banco sintético de pérdida de sellado y patrones de medición | Pruebas discriminantes y límites de diagnóstico |
| **RW5** | Refrigeración, gradientes térmicos y materiales | Caso de fallo térmico en condiciones variables | Balance térmico declarado y límites de seguridad |
| **RW6** | Inyección, encendido, sensores y ECU | Estrategias virtuales de respuesta y eficiencia con protecciones activas | Baseline, límites, comparación de perfiles |
| **RW7** | Sobrealimentación, conductos y escape | Comparador conceptual de restricciones y respuesta sin mapas reales | Curvas normalizadas, pérdidas y condición adversarial |
| **RW8** | Emisiones, economía y durabilidad | Multiobjetivo: potencia/masa, BSFC, temperatura, emisiones simuladas y vida útil ilustrativa | Frontera de compromisos y rechazo de límites incumplidos |
| **RW9** | Arquitecturas de vehículo: tracción directa vs. generación eléctrica | Modelo simplificado de Wankel como extensor de autonomía en operación acotada | Balance energético total y pérdidas de conversión |
| **RW10** | Proyecto de inventor | Rediseñar *virtualmente* un subsistema o proponer instrumento nuevo para diagnosticarlo | Bitácora, tests, métricas, fallos, portafolio y revisión |

**Dependencias:** RW0 exige fundamentos de mecánica general, lectura de gráficos, física elemental y seguridad; RW4 exige medición y diagnóstico; RW6/8 exigen control, inyección, consumo y emisiones. Se puede **explorar** RW1 desde temprano, pero no certificar dominio avanzado sin los prerequisitos.

## 4. Diseño del primer simulador — «Rotary Geometry Explorer»

**MVP viable en la PWA offline:**

- Representación SVG/Canvas estática o animada de carcasa, rotor, eje excéntrico y cámaras, conservando la relación cinemática física correspondiente.
- Slider de posición angular y reproducción paso a paso, con marcas de puertos y eventos por cámara.
- Gráfico de volumen relativo de **una** cámara vs. ángulo (primero mediante geometría aproximada transparente o curvas demostrativas etiquetadas; jamás presentarlas como metrología Mazda).
- Panel dual Wankel/alternativo con igual descripción de ciclo y registro de qué se está comparando.
- «Pronosticá y revelá»: el estudiante predice cuál cámara aumenta/disminuye volumen, fase de funcionamiento y resultado de alterar una variable *de simulación*.
- Modo desacelerado con pausas, contraste apto para daltonismo, controles de teclado, texto alternativo, tabla accesible de fases y opción de reducir movimiento.
- Ninguna dependencia externa para las funciones básicas; integrar resultados al actual portafolio con contrato y migraciones cuidadosamente verificadas.

**Regla científica:** si el motor gráfico utiliza aproximaciones no derivadas de una geometría validada, mostrarlo explícitamente. No generar curvas de presión, rendimiento o emisiones a partir de un dibujo geométrico sin un modelo físico independiente.

## 5. Laboratorio avanzado — «Rotary Research Bench»

### Hipótesis y metodología

Cada ejercicio exige **objetivo, baseline, variables controladas, modelo, predicción, medición virtual, incertidumbre y conclusión** antes de optimizar.

Opciones de investigación:

- **Sellado:** comparar dos mecanismos de fuga sintéticos con observaciones aparentemente iguales; discriminar mediante segunda prueba.
- **Temperatura:** estudiar intercambios térmicos y pérdidas de calor en una cámara simplificada; analizar límites de materiales.
- **Porting:** comparar cambios de llenado y sus efectos secundarios en emisiones/torque de bajo régimen con modelo documentado.
- **Combustión:** variar parámetros de un modelo reducido y estimar sensibilidad; no se simula detonación real salvo modelo revisado.
- **Híbridos:** contrastar eficiencia de operación acotada del generador frente a demanda variable del vehículo (incluir pérdidas eléctricas/batería/inversor).
- **Calibración:** perfiles **puramente virtuales** ECO, DAILY, SPORT y DIAGNOSTIC; rechazar cualquier perfil que viole límites de seguridad, térmicos o de emisiones definidos en el modelo.

### Metría e integridad

- No inventar mediciones de compresión, torque, BSFC, consumo, emisiones ni durabilidad de motores reales.
- Separar categorías de datos: `derived_from_geometry`, `synthetic_model`, `literature`, `measured_verified`, con enlace de procedencia, fecha y limitaciones.
- No asignar notas sobre una conclusión en lenguaje natural sin evaluador real o revisión humana.
- Versionar semilla, dataset, parámetros, condiciones, unidades, modelo, baseline y resultados.
- Ejecutar pruebas adversariales (temperatura, carga, perturbaciones, cambio de modelo, incertidumbre, datos corruptos).
- Rechazar comparaciones que omitan condiciones de referencia o cambien variables simultáneamente sin diseño experimental.
- No convertir métricas normalizadas ficticias en datos publicitarios reales.

## 6. Herramientas existentes: revisar antes de construir

**Inventario y decisión usar/adaptar/construir requeridos:**

1. Bibliografía y geometría: materiales educativos de fabricantes y artículos revisados, con licencia de redistribución estudiada; desarrollar visualizador educativo propio **solo** si no hay alternativa integrable y libre adecuada.
2. Cinemática/termodinámica: bibliotecas matemáticas pequeñas y reproducibles; simuladores/solvers validados cuando corresponda, evaluados por offline, peso y licencia.
3. Análisis: aprovechar las tablas, gráficos, exportes, IndexedDB, hipótesis y evaluación por evidencias ya presentes en AutoLab.
4. Modelos complejos: separar cálculo Python/desktop/CI (y exportes verificables) de interfaz web offline; no inventar CFD/FEA de calidad industrial en JavaScript.
5. Referencias y datalogging: datasets de libre uso o proporcionados con autorización; nunca extraer ni redistribuir contenidos OEM privados.

## 7. Backlog incremental y criterios de aceptación

| Entrega | Implementación prevista | Gate verificable |
| --- | --- | --- |
| **RW-P0** | Investigación técnica, bibliografía, comparador de referencias, modelo de actividades y matriz de licencias | Revisión de términos, unidades, cinemática y alcances; sin afirmaciones no sustentadas |
| **RW-P1** | Primer explorador geométrico offline + RW0/RW1 | Ángulos periódicos coherentes, tres cámaras sincronizadas, accesibilidad, tests en Chromium y WebKit; móvil físico pendiente identificado |
| **RW-P2** | Experimentos de sellado/fallas RW4 y variables sintéticas | Diferenciación de hipótesis, ruido y errores, sin fuga de respuestas, 100+ semillas repetibles |
| **RW-P3** | Optimización de sistemas RW2/RW3/RW5/RW6/RW7/RW8 | Baselines idénticos, restricciones fail-closed y resultados con incertidumbre |
| **RW-P4** | Extensor de autonomía RW9 y proyecto RW10 | Balance energético integral, escenarios no vistos, informes auditables y revisión independiente |
| **RW-P5** | Estudios supervisados con equipos reales, fuera de la PWA | Instrumentos calibrados, control de riesgos, autorización, trazas reales y revisión especializada |

**Primer PR de software sugerido:** RW-P1, con un único laboratorio que realmente funcione offline y 6–10 preguntas con trazabilidad a fuentes; no desplegar cincuenta pantallas vacías.

## 8. Requisitos de seguridad y límites

- Cero capacidad de escribir/flashear ECU, cambiar calibraciones de carretera, transmitir CAN o desactivar protecciones en la PWA.
- Experimentos de emisiones o combustión **simulados**, nunca instrucciones para evadir controles de emisiones ni ensayos en vía pública.
- Maquetas y prototipos educativos de baja tensión inicialmente; pruebas físicas de combustión, combustible a presión, sistemas calientes/rotativos y HV requieren instalaciones y personas competentes.
- Información explícita sobre incendios, piezas giratorias, presión, gases de escape, atrapamiento, electricidad, temperatura y EPP antes de actividades presenciales.
- Afirmaciones «mejor que un motor de pistones» solo si se declara **bajo qué objetivo y condiciones** se obtuvo esa comparación.

## 9. Materiales de consulta iniciales (fuentes, no aval de resultados del simulador)

- Mazda, 2024: [restablecimiento del grupo de I+D del motor rotativo y generador MX-30 R-EV](https://newsroom.mazda.com/en/publicity/release/2024/202402/240201b.html).
- SAE International, 1992: [Mazda 4-Rotor Rotary Engine for Le Mans](https://saemobilus.sae.org/papers/mazda-4-rotor-rotary-engine-le-mans-24-hour-endurance-race-920309); trabajo técnico sobre ingeniería y compromisos del R26B, acceso sujeto a licencia.
- NASA Glenn Research Center: [ciclo Otto ideal y sus límites](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/internal-combustion-engine-otto-cycle/).
- Artículo académico 2019: [estudio de motor rotativo tipo Wankel y principios de funcionamiento](https://www.mdpi.com/1996-1073/12/21/4096). Verificar supuestos antes de aprovechar modelos.
- Material histórico Mazda sobre geometrías de sellos, combustión y refrigeración solo como fuente referencial, sujeto a derechos y versión de producto.

## 10. Definición de éxito

RW-P1 solo está terminado cuando hay un **explorador real**, sin conexión, con predicciones, feedback correcto, pruebas y resultados conservables. El programa completo solo es excelente si enseña a cuestionar, construir, refutar, optimizar y reproducir, **sin disfrazar una animación de gemelo digital validado**.

**El Wankel no se enseña como dogma: se convierte en el caso perfecto para aprender a encontrar el límite de una arquitectura y preguntarse cómo superarlo.**
