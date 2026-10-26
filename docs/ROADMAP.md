# AutoLab Academy — Plan de implementación

## Extensión de visión — Diagnostic Engineering + Automotive R&D (propuesta)

AutoLab evoluciona también hacia la **ingeniería inversa, optimización multiobjetivo e invención de herramientas**, en paralelo con el diagnóstico basado en evidencia. El documento [ENGINEERING_MINDSET_RD_VISION.md](ENGINEERING_MINDSET_RD_VISION.md) define el perfil profesional objetivo, itinerarios, experimentos, roadmap R0–R5, criterios de aceptación, validación y límites de seguridad. **Es planificación: no son funcionalidades implementadas.** Se priorizará sin desplazar la estabilización y calidad de la PWA existente.

## Estado real al 25/10/2026

- v1.9.17 (candidato en validación): saneamiento de timestamps de candump no finitos o excesivos, cálculos estadísticos finitos ante entradas externas corruptas, dos regresiones unitarias y SW v38→v39. Ver docs/CAN_INPUT_HARDENING_V1_9_17.md.


- v1.9.16 (candidato en validación): GitHub Actions fijadas a SHA de commit, comprobación npm audit high/critical, Dependabot semanal con PR limitados y sin merge automático, tests de política CI, SW v37→v38. Ver docs/SUPPLY_CHAIN_HARDENING_V1_9_16.md.


- v1.9.15 (candidato en validación): pantalla de recuperación de respaldo JSON si IndexedDB contiene progreso incompatible, sin limpieza automática y confirmación explícita; integración de importación local y pruebas de recuperación, rechazo de archivo inválido y fallo de cuota. Ver docs/RECOVERY_BOOTSTRAP_V1_9_15.md.


- v1.9.14 (candidato en validación): auditoría global de IDs/temas/validador de 13 catálogos de escenarios, reusa verificadores de ECU, multifallas, inyección, misfire, diferenciales e integrador; gate en npm build, regression SW v35→v36. Ver docs/SCENARIO_AUDIT_V1_9_14.md.


- v1.9.13 (candidato en validación): dependencias transitivas bloqueadas en package-lock v3 (Node 22); CI npm ci reproduce el árbol sin nuevas resoluciones, verificación del lockfile y SW v34→v35. Workflow temporal para generar el lock eliminado. Ver docs/REPRODUCIBLE_BUILD_V1_9_13.md.


- v1.9.12 (candidato en validación): exige predecir correctamente resultados tanto de confirmación como de descarte para acreditar los 5 puntos discriminantes; revisión formativa explica los aciertos parciales sin afirmar comprensión textual. Regresión de 100 semillas × 5 familias × 2 errores y SW upgrade v33→v34. Ver docs/DIAGNOSTIC_PREDICTION_INTEGRITY_V1_9_12.md.


- v1.9.11 (candidato en validación): auditoría CI de relaciones y estructura de todo el currículo, fuentes HTTPS, identidad y cobertura de itinerarios; calificación estricta que no concede crédito a null/'' para respuesta 0; regresión SW v32→v33. Ver docs/CURRICULUM_AUDIT_V1_9_11.md. No es auditoría semántica independiente.


- v1.9.10: SW devuelve HTML válida aunque Cache Storage falle; solo el inicio de la PWA actualiza index.html, no páginas ajenas ni JSON. Tests de cuota simulada, navegación ajena, caída real de red y upgrade offline v31→v32. Ver docs/SERVICE_WORKER_RELIABILITY_V1_9_10.md.


- v1.9.9: aviso persistente de cambios sin guardar cuando IndexedDB rechaza una transacción, reintento confirmable, sin falsa confirmación de guardado de notas; pruebas E2E de recuperación de notas y finalización de examen. Ver docs/PERSISTENCE_TRUTH_V1_9_9.md.


- v1.9.8 (corrección focalizada): prioridades por área y errores declarados como «Muy seguro» en exámenes completos, acceso directo al repaso del registro real, foco al encabezado de resultados y pruebas de reflow de 320/640 px sobre rutas clave; no infiere comprensión ni cambia notas. Ver docs/EXAM_FEEDBACK_REFLOW_V1_9_8.md.


- v1.9.7 (evidencia accesible en gráficos): tablas numéricas desplegables para osciloscopio, SOC/BMS, tensión y RC; mínimo/máximo calculados sobre la totalidad de muestras válidas, tabla acotada para lectores de pantalla, fuente y límites explícitos. Auditoría E2E de estados abiertos en Chromium, WebKit y WebKit móvil. Ver docs/ACCESSIBLE_CHART_EVIDENCE_V1_9_7.md.


- v1.9.6 (auditoría transversal): chequeos axe WCAG 2.1 A/AA sobre 17 nuevas secciones, cinco modos de laboratorio y formularios activos, con Chromium/WebKit/WebKit móvil; guía formativa por omisiones observables en la rúbrica sin evaluar semánticamente el texto. Ver docs/QUALITY_AND_FORMATIVE_REVIEW_V1_9_6.md.


- v1.9.5 (actualización y recuperación): escrituras IndexedDB en secuencia, errores recuperables, upgrade de caché offline v26→v27 comprobado con SW real en navegador y emulación de iPhone/WebKit. Pendiente validación en iPhone físico y VoiceOver. Ver docs/OFFLINE_STORAGE_QA_V1_9_5.md.


- v1.9.4 (respaldo y durabilidad): evita que un portafolio legítimo de hasta 500 expedientes choque prematuramente con el límite antiguo de 2 MB; se mantienen barreras de entrada. Guardado explícito de borrador con confirmación solo tras IndexedDB, y reinicio que no anuncia éxito si falló escribir. Ver docs/BACKUP_RELIABILITY_V1_9_4.md.

- v1.9.3 (accesibilidad y compatibilidad de navegador): auditoría automatizada WCAG con axe, navegación por teclado con enlace de salto, retención de foco en formularios, ejecución E2E sobre Chromium y WebKit, y validación de caché PWA v25. Prueba manual Safari/iPhone/VoiceOver sigue pendiente.

- v1.9.2 (sesiones retomables): borrador pequeño y validado con semilla y respuestas, almacenado en IndexedDB e incluido opcionalmente en JSON schema v1. Retomar tras recargar, pausar y cambiar de sección. Nunca se acreditan mediciones reales. Ver docs/RESUMABLE_DIAGNOSTICS_V1_9_2.md.

- E0 (base): 61 lecciones estructuradas y 150 preguntas con fuentes contextuales distribuidas en cinco especialidades (incremento v0.7); quedan pendientes revisión experta y ampliar progresión a itinerarios profesionales completos.
- E1.9 (transferencia diagnóstica): 5 familias, 2 causas y 2 presentaciones por familia; 20 combinaciones deterministas, predicción de pruebas, confirmación, descarte, contexto, incertidumbres, informe trazable y registro por área. Sin datos OEM. Ver docs/DIAGNOSTIC_TRANSFER_V1_9.md.
- E1.8 (transferencia entre problemas): cinco pares sintéticos (primero guiado y luego otra variable despejada), generación reproducible por semilla, resultado objetivo por cada área, evidencia, explicación no corregida, informe Markdown y compatibilidad con Portafolio/backup. No prueba transferencia a un vehículo. Ver docs/TRANSFER_V1_8.md.
- E1.7 (evidencia por pregunta): nuevos intentos guardan respuestas/opciones/confianza y análisis de errores activos/repetidos, conceptos con etiquetas editoriales, repetición focalizada y exportación. El orientador usa fallos realmente observados sin atribuir notas globales a áreas. Ver docs/ANSWER_EVIDENCE_V1_7.md.
- E1.6 (orientación formativa): módulo offline de prioridad por datos reales FSRS/exámenes específicos/prácticas sintéticas, planes de 15/30/45 min, acceso a actividad y descarga de plan. No interpreta semántica ni infiere aptitud. Ver docs/STUDY_COACH_V1_6.md.
- E1.5 (taller integrador): tres casos multifuente sintéticos, hipótesis previa, evidencia de contexto/OBD/ondas/circuitos, confirmación, descarte e incertidumbre escrita. Informe completo persistido en respaldo y Portafolio sin cambiar esquema. Cinco lecciones, diez preguntas y noveno nivel. Ver docs/INTEGRATIVE_V1_5.md.
- E1.4 (combustión y balance): 4 modelos sintéticos de P030x, tabla de cilindros y dos condiciones, 2 pruebas independientes para cada hipótesis y octavo nivel de enseñanza. +5 lecciones/+10 preguntas. No hay contadores OEM ni presión real. Ver docs/MISFIRE_V1_4.md.
- E1.3 (inyección y combustible): 4 casos sintéticos MPI, condiciones de ralentí/crucero/carga, STFT/LTFT, MAP/MAF y lambda ilustrativa, pruebas confirmatorias independientes y siete niveles. +5 lecciones / +10 preguntas. No valores OEM ni intervención física. Ver docs/FUEL_V1_3.md.
- E1.2 (diagnóstico temporal): seis capturas por escenario con falla única intermitente en 4 bancos ficticios (CKP, CMP, inyección y alimentación ECU), comparación multicanal y documentación de fuentes. +5 lecciones, +10 preguntas, sexto nivel. PWA sin hardware ni validación profesional. Ver docs/TEMPORAL_V1_2.md.
- E1.1 (diagnóstico diferencial): 3 prácticas con dos causas distintas para una misma lectura o curva (MOSFET, RC y caída bajo carga), evidencia discriminante y predicciones previas, quinto nivel de itinerario, 5 lecciones y 10 preguntas nuevas. Datos únicamente sintéticos. Ver docs/DIFFERENTIAL_V1_1.md.
- E1.0 (componentes): seis circuitos algebraicos sintéticos de baja tensión (divisor, caída en línea, MOSFET, shunt, RC, energía inductiva), resultados con tolerancia, evidencia y reportes. Se suman 10 lecciones y 20 preguntas; itinerario de cuatro etapas. **No es simulador SPICE ni instrumento real.** Ver docs/COMPONENTS_V1.md.
- E0.9 (recorrido ECU): 3 etapas de aprendizaje, banco ECU con 5 escenarios de instrumentación virtual, pronósticos previos a revelar mediciones, 10 lecciones y 20 preguntas nuevas. Los indicadores distinguen lecturas de exámenes. Quedan pendientes validación externa y E2E iPhone.
- E1 (PWA): implementación MVP en GitHub Pages por Actions, exámenes, repaso con FSRS (ts-fsrs 5.4.2) basado en respuesta objetiva + confianza, evaluación acumulativa por cinco áreas, progreso local IndexedDB y backup JSON compatible con los intervalos anteriores. **Pendiente QA E2E iOS y revisión de calidad editorial de preguntas.** Ver docs/FSRS_E1.md.
- E2 (taller virtual): **incremento v0.8:** 3 casos multifalla adicionales (18 casos en total), exigen dos causas con evidencia confirmatoria independiente para cada una; bloquean acciones inseguras y exportan informe. Razonamiento libre no evaluado semánticamente. Incremento cuantitativo v0.6: cinco retos nuevos con valores variables, mediciones justificadas, puntuación determinista y exportación de resultados; argumentos registrados para revisión humana. El banco actual aún requiere revisión de expertos. Primera versión ampliada con 15 casos deterministas, hipótesis inicial, pruebas, razonamiento escrito, informes Markdown, nota con reglas y tests. **Faltan revisión externa de expertos, instrumentación calibrada, múltiples fallas y QA E2E. No hay motor físico automotriz, telemetría real ni DTC OEM.**
- E3 (simuladores): **incremento v0.7**: osciloscopio virtual de cuatro señales didácticas (PWM, CKP, CAN diferencial y senoidal) con ejercicios de cálculo y registro de resultados; no se afirma conexión a instrumentos reales. **Primer incremento implementado**: analizador candump offline de CAN clásico, muestra sintética con práctica guiada y CircuitJS externo bajo demanda. **Incremento 2:** importación y decodificación DBC con Candied mediante bundle local; ejemplo didáctico con 0x120/0x220. **Pendientes:** integración real same-origin/offline y revisión de licencia GPL CircuitJS; validación DBC extendida, laboratorios con SocketCAN/cantools en escritorio. Ver docs/LABS_E3.md.
- E4 (HEV/EV): **incremento 1 implementado**: análisis BMS educativo con integración de corriente, 3 escenarios sintéticos, curvas, CSV, SOC/SOH ilustrativo y ejercicios. Script PyBaMM validado en workflow científico separado: modelos SPM/DFN, compatibilidad de CSV con el parser JS y proveniencia con SHA-256. **La validación es de ejecución y consistencia, no experimental ni de vehículos reales**. Quedan pendientes datasets científicos/experimentales verificados, validación visual iPhone, estimadores avanzados y evaluación experta. Ver docs/LABS_E4.md.
- E5 (tutor IA): pendiente, opcional, sin API keys en frontend.
- E6 (portafolio y experiencia real): **incremento inicial v0.8** disponible en PWA: vista offline de exámenes, prácticas, tarjetas FSRS y lecciones, con exportación Markdown y filtros. No afirma experiencia real, certificación HV ni informes auditados por profesionales. Pendientes: revisión externa de evidencia, portafolio supervisado, anexos de instrumentos y calificaciones de taller.

## Prioridades de producto

1. Persistencia robusta, exportar/restaurar, soporte iPhone y accesibilidad.
2. Examinar dominios con variantes de preguntas, claves auditadas y comprensión, no repetición memorística.
3. Casos con instrumentos ficticios calibrados, fallas múltiples y rúbricas que exijan evidencias.
4. Incorporar recursos abiertos existentes, sin desarrollar nuevos motores de física, CAN o baterías.
5. Escalar a horas supervisadas, portafolio y validación externa de competencias.

## Requisitos de salida de E1

- Tests de contenido y motor de evaluación pasan en Actions.
- Las seis lecciones, 30 preguntas y tres casos están realmente disponibles.
- App shell precargado mediante SW en origen Pages (comprobar offline en dispositivo).
- Exportar, importar y restaurar exactamente los datos de progreso (comprobar en iPhone).
- No se muestra ninguna certificación oficial interna ni se habilitan maniobras de HV.
- Documentar limitaciones y riesgos de almacenamiento local.

## Seguridad

- Los datos están en IndexedDB local al origen, no sincronizados. El sistema no cifra el respaldo; conservarlo de forma privada.
- Los casos son sintéticos; no deben interpretarse como especificaciones de marca ni autorizaciones de reparaciones.
- No conectar un adaptador CAN de escritura ni intervenir HV desde ninguna práctica de la PWA.
- Antes de integrar contenidos, revisar licencia y derecho de redistribución de cada fuente.

## Arquitectura actual

PWA estática sin backend: HTML, CSS y JS modular ESM, service worker y IndexedDB.
La propuesta original React/TypeScript, Dexie y FSRS queda como evaluación de evolución después de validar el MVP; **no se afirma implementada**. Esta elección reduce el riesgo de despliegue y mantiene el proyecto funcional sin servicios de terceros. El repaso actual usa ts-fsrs 5.4.2; las tarjetas heredadas conservan intervalos previos hasta el siguiente repaso real.

## Deploy GitHub Pages

Settings → Pages → Build and deployment → GitHub Actions.

Workflow: .github/workflows/pages.yml
- verify: node --check, node --test y consistencia de archivos.
- deploy: actions/upload-pages-artifact + actions/deploy-pages.
- URL esperada una vez configurado y desplegado: https://barbasmarcosi.github.io/AutoLab-Academy/

La URL no implica que el deploy haya sido comprobado.
