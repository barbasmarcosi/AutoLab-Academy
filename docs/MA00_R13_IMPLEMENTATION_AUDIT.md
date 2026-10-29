# MA00 R13 — Auditoría de implementación de evidencia (primera tanda)

**Estado al 29/10/2026 UTC:** R13 **PARCIAL**, con contratos implementados; **no se declara cumplido el gate total de R13**. Código y documentación en research/mechanical-age-obd-v0, issue #58, programa R13–R22. Sin merge ni producción.

## Cambios implementados y su evidencia

1. Contratos runtime en src/mechanical-age-r13-claims.js: 7 tipos principales de informes (snapshot, comparación, sesión OBD raw, A–A, multisesión R12, repetibilidad, falsación). **115 campos raíz explícitamente clasificados** y **46 subcampos estáticos** registrados. Campos nuevos no tipados, faltantes, inferencias físicas no nulas, intervalos/efectos causales sin validación, o un índice sintético aplicado a fuente externa => RangeError antes de entregar el informe. En reportes dinámicos aún quedan controles pendientes.
2. Registro machine-readable en docs/ma00/claims.json con E0–E5, clasificaciones, lista de claims bloqueados y nota de evidencia insuficiente. El test compara automáticamente las listas con el módulo runtime, para evitar divergencia entre código y documento.
3. Matriz de observabilidad en src/mechanical-age-r13-observability.js y docs/ma00/observability.md: tecnologías declaradas gasoline_ice, diesel_ice, hybrid, battery_electric, unknown; combustible gasolina/GNC/diésel/eléctrico/mixed/unknown; lazo de control observado/abierto/desconocido. **Solo** gasolina ICE + gasolina + lazo cerrado declarado + RPM/ECT/carga/STFT/LTFT completos habilita una comparación descriptiva bajo el resto de los filtros de calidad. Cualquier otro caso permite lectura digital de señales por separado, NO inferencia con reglas de gasolina.
4. Contrato mínimo de hipótesis competidoras no diagnósticas: casos positivos de trims, variabilidad de RPM y cambio térmico incluyen mecanismo alternativo, prueba discriminante propuesta y explicitan no-identificabilidad con los PIDs actuales.
5. Integración en los informes JSON principales y en la vista snapshot: se muestra tipo/combustible declarado, nivel E0 o unverified, contrato de evidencia y restricciones. Sin habilitar certificados físicos por etiquetas de usuario.
6. El validador solo permite declaraciones nuevas con nivel **E0**. No hay autoridad de verificación para E1–E5; están prohibidas expresamente hasta implementar verificación independiente. Esto evita auto-certificación por simples sourceIds.
7. Tests JS R13: clasificación de todas las salidas primarias; sincronización de docs JSON; enriquecimiento con campos prohibidos/extra; prueba de subcampos nuevos; pruebas de GNC, diésel, HEV y BEV sin fuga de reglas gasolina; fuente externa no puede conservar puntuación sintética; hipótesis sin alternativa o prueba se rechazan; capturas raw no autentican ECU.
8. Playwright E2E adicional: verifica el nivel E0 en demo sin editar y que modificar un campo degrade ambas muestras a unverified, sin índice externo. Conserva E2E offline anterior.

## Rúbrica crítica (sin auto-aprobación)

| Gate R13 | Estado | Prueba o deuda |
| --- | --- | --- |
| Reportes principales clasificados y bloqueos de desgaste | IMPLEMENTADO en 7 tipos | Registro 115 campos raíz / 46 subcampos con enforcement |
| Falsificación de origen y puntuaciones externas | IMPLEMENTADO en UI y reportes principales | Test de edición y JS adversarial |
| Tipos de motorización / combustible / control | IMPLEMENTADO como contrato restrictivo | GNC, diésel, HEV, BEV se abstienen de razonamiento trims gasolina |
| Hipótesis alternativas y falsación | IMPLEMENTADO como esqueleto educativo, incompleto | Tres mecanismos con alternativas; falta DAG y biblioteca técnica R16 |
| Clasificar 100% de todas las salidas MA00 | **PENDIENTE** | JSON internos anidados, warnings dinámicos, objetos de módulos auxiliares, serial Python, artifacts científicos separados |
| Fuente/observación autenticada por terceros | **NO DISPONIBLE** | No hay autoridad ni metrología física, no puede alcanzarse con solo software |
| Protocolo diferenciado GNC/diésel/HEV/BEV | **PENDIENTE** | La abstención está implementada; falta instrumentación/adaptador y banco específico |
| QA CI en SHA final | **POR VERIFICAR EN EJECUCIÓN** | Actualizar evidencia concreta de CI al cerrar la tanda |

## Riesgos pendientes que condicionan el cierre R13

- Los campos internos de colecciones dinámicas (events, channels por PID, individual hypothesis tests y tramas seriales) requieren contratos tipados propios, límites de profundidad, tamaño y pruebas de inyección. No se declara cobertura 100% al haber auditado 115 campos raíz y 46 subcampos.
- El dato source='synthetic' es una declaración dentro de un objeto JS; **no es una firma criptográfica**. La UI etiqueta todo JSON editado como provided_obd_unverified, pero bibliotecas embebidas podrían inyectar demos falsas; E0 significa DEMO, jamás dato físico.
- La estructura de R12 usa un número pequeño de sesiones: las bandas observadas no son intervalos de confianza ni umbrales de falla, incluso cuando se cumplen contratos.
- Las normas SAE/ASAM y el simulador externo Ircama se usarán en R14 y posteriores solo tras verificar licencias, versión y compatibilidad. El contrato R13 no declara conformidad.
- No existe ground truth mecánico, test físico ni integración con vehículos; ningún resultado autoriza edad equivalente, salud %, desgaste, vida restante, causalidad o diagnóstico confirmado.
- Los conjuntos NASA FD001–FD004 TEST están consumidos. No se utilizaron para R13 ni se reutilizarán para tuning.

## Siguiente tanda R13.1, antes de R14

1. Contratos de subestructuras y arrays (transacciones seriales, canales por PID, mediciones de contexto), no solo campos raíz.
2. Inventario exhaustivo de superficies de UI/exports/scripts y auditoría independiente de ausencias, duplicados o discrepancias de niveles; no permitir reporte sin evidencia tipada.
3. Definir source IDs inmutables por evento/sesión y rastreo claim→observación sin exponer datos personales.
4. Cerrar lagunas de tech context y migraciones de los fixtures de adquisición Python; pruebas de interoperabilidad sin hardware.
5. Scorecard de gates y E2E en SHA exacto; solo declarar R13 completo si realmente alcanza 100% de salidas afectadas.

**La excelencia científica de software antes de autos reales no crea una validación física: esa frontera es innegociable.**


## R13.1 — Segunda tanda: estructuras dinámicas y rastreo de origen (29/10/2026)

**Implementado en código:** src/mechanical-age-r13-structure.js, actualizaciones de src/mechanical-age-r13-claims.js, src/mechanical-age-raw-obd.js y src/mechanical-age-r12-quality.js, tests/mechanical-age-r13-dynamic.test.js y CI.

1. **Contratos dinámicos (fail-closed).** El validador inspecciona canales PID 0103/0104/0105/0106/0107/010C/010F, diferencias A–A, reportes R12 por PID, QA multisesión, trazas seriales, escenarios de falsación y fases de repetibilidad. Rechaza campos sin registrar, valores físicos inventados, PIDs desconocidos, arrays excesivos y estructuras incompletas. La especificación dinámica está sincronizada en docs/ma00/claims.json con pruebas automáticas.
2. **Rastreo al expediente:** cada auditoría RAW contiene un registro sourceTrace con ID de sesión, cantidad de eventos e **índices originales de eventos por PID**. Se exige que los índices sean válidos, crecientes, globalmente únicos, completos y consistentes con los recuentos de cada PID. Las diferencias A–A y R12 contienen referencias ordenadas a las sesiones que sustentan cada canal observado.
3. **Sin autenticación.** Los IDs ordinales permiten encontrar eventos dentro del mismo archivo de entrada; **no** demuestran que ese archivo sea inmutable. Un operador puede reescribir tanto eventos como índices. No hay hashes firmados, identificación de ECU física, tiempo de adquisición ECU, calibración instrumental independiente ni evidencia E4/E5. Un futuro repositorio de evidencias tendrá que verificar integridad mediante fuentes externas.
4. **Validación de entrada:** las tramas Mode 01 y sus contextos no admiten campos ajenos al contrato, por ejemplo atributos inventados de salud mecánica. Las declaraciones instrumentales también están limitadas a una lista conocida. Esto no verifica físicamente los valores del sensor, pero evita colar conclusiones inventadas a través de campos desconocidos.
5. **Tecnologías y combustible:** las comparaciones A–A de correcciones requieren gasolina ICE, combustible gasolina, lazo cerrado declarado y PIDs completos. No se aplican reglas de gasolina a GNC, diésel, híbridos, EV o tecnologías desconocidas.
6. **Batería adversarial:** tests para health/wear falsos, recuentos y referencias inconsistentes, offsets duplicados entre dos PIDs, falsa autenticación serial, hipótesis de falsación manipuladas, contextos no registrados y tecnología incorrecta.
7. **Compatibilidad:** se preservan las demos sintéticas y los flujos Python/Node/JS existentes. No hubo pruebas en autos reales ni relecturas de los TEST NASA ya consumidos.

**Revisión crítica:** falta todavía la auditoría integral del resto de exportaciones, registros de terceros, privacidad de identidad y trazabilidad fuerte entre archivos/canales. Por lo tanto **R13 no cumple aún el 100 % de su gate**, aunque esta tanda cierra múltiples riesgos de integridad en los siete reportes principales.

**CI final:** registrar SHA y run verificables al concluir la validación. Hasta entonces este documento no declara aprobado el cierre R13.1. Sin merge ni deploy.
