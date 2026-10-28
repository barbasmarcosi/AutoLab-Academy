# MA00 — Protocolo prospectivo de captura y evidencia (v1: propuesto, NO validado)

**Alcance:** motores de encendido por chispa con STFT/LTFT OBD disponibles, en ralentí controlado. No es tolerancia OEM, diagnóstico, certificación ni procedimiento obligatorio de servicio.

## Preguntas separadas para no confundir salud con edad

1. **Sensor:** ¿la lectura representa la magnitud? Verificar calibración, canal congelado, resolución, latencia, timestamps y redundancia.
2. **Entorno:** ¿las condiciones son comparables? Registrar carga, refrigeración, clima, combustible, lazo de control y accesorios.
3. **Función:** ¿el cambio observado supera la variabilidad A–A sin intervención? La mejora funcional no prueba rejuvenecimiento.
4. **Estructura:** ¿la condición física cambió? Requiere compresión, leak-down, blow-by, presión de aceite, análisis de lubricante y/o inspección independientes.

Una lectura OBD normal no demuestra ausencia de desgaste; una anomalía no demuestra que exista.

## Contrato de metadatos (afirmaciones del operador)

Para capturas externas, el evaluador necesita un measurementContext en cada JSON. Ejemplo totalmente ficticio:

~~~json
{
  "vehicleAlias": "unit-anon-001",
  "engineFamily": "family-inline4-gas",
  "source": "provided_obd_unverified",
  "protocol": "warm-idle-fixed-load-v0",
  "phase": "before_service",
  "measurementContext": {
    "sessionId": "oct-28-baseline-01",
    "capturedAt": "2026-10-28T10:30:00-03:00",
    "adapterModel": "Research logger v1",
    "softwareVersion": "Capture 0.1",
    "serviceEventId": "service-plan-001",
    "ambientC": 22,
    "clock": "monotonic_observed",
    "fuelControl": "closed_loop_observed",
    "ac": "off_observed",
    "coolingFan": "stable_observed",
    "electricalLoads": "stable_observed"
  },
  "samples": [
    {"timeMs":0,"rpm":800,"ectC":90,"loadPct":17,"stftPct":2,"ltftPct":3,"iatC":27}
  ]
}
~~~

**Este ejemplo no es una captura válida**: contiene una sola muestra; el ensayo requiere al menos 20 y duración de 19 s. El segundo registro tendría fase after_service, otro sessionId, hora posterior, mismo serviceEventId, contexto y familia compatible. No ingresar VIN, patente ni datos del propietario.

La terminación _observed significa **declarado por el operador, no verificado por el software**.

**Gates actuales:**
- Alias, familia y protocolo del vehículo coinciden; sesión distinta y fecha válida con zona horaria.
- Mismo adaptador y versión de capturador, mismo evento de mantenimiento declarado y ambiente con diferencia máxima de 5 °C (umbral experimental, no OEM).
- Reloj de adquisición monotónico declarado, lazo cerrado observado, A/C apagado, ventilador y carga eléctrica estables.
- Ventana que satisface estabilidad, tiempos, muestreo, RPM, refrigerante, carga y disponibilidad de trims descritos en el módulo MA00.
- Ausencia de campos u observaciones contradictorias: **abstenerse**, sin completar con valores imaginados.

Aun con todos los campos presentes, el sistema solo certifica **coherencia de los metadatos declarados**, nunca calibración o autenticidad de un instrumento.

## Problema instrumental crítico: los PIDs no siempre son simultáneos

Adaptadores OBD que interrogan PIDs secuencialmente pueden registrar RPM, STFT/LTFT y temperaturas con distintas latencias y frecuencias. Una fila con un mismo timeMs **no acredita sincronía física**. Esto invalida tratar de medir oscilaciones rápidas de RPM con capturas lentas o cuantizadas.

Para la siguiente versión del capturador:
- Registrar un timestamp **monotónico por respuesta de cada PID**, unidad, fuente, valor bruto si existe, latencia, timeout y versión del logger.
- Conservar el porcentaje de huecos y la edad del último dato usado por canal.
- Distinguir lecturas reales de valores interpolados, reconstruidos o re-muestreados.
- Evitar interpretar un canal congelado como motor estable; añadir instrumento redundante.
- Identificar lazo abierto/cerrado durante toda la ventana y posibles adaptaciones de ECU; no basta una declaración sin trazas de respaldo.

El protocolo v0 **no dispone todavía de prueba de simultaneidad por canal**; por ello ningún resultado de datos externos obtiene un score de envejecimiento.

## Diseño pre-registrado para evaluación posterior

**A–A sin intervención:** varias sesiones en distintos días, registrando operador y contexto, para obtener repetibilidad y tasa de falsos positivos.

**A–B intervenido:** múltiples sesiones antes/después con descripción precisa del trabajo, control A–A, posibles cambios de combustible y adaptaciones ECU. No seleccionar solo vehículos que muestran mejora.

**Control ciego instrumental:** sesgo, drift, canal congelado y lecturas desfasadas; confirmar contra otra herramienta antes de culpar al motor.

**Referencia mecánica ciega:** compresión, fugas, blow-by, presión real de aceite y pruebas físicas validadas para la familia; usar motores independientes y registrar incertidumbre.

**Validación externa:** separar por motor, taller, fecha y condiciones, reportar baseline por odómetro/DTC, falsos positivos e intervalos por motor, nunca por fila. Si no supera referencias simples, no publicar edad.

## Regla de publicación

Permitido: estadísticas descriptivas, sensibilidades sintéticas, auditoría de calidad de captura y comparación documental sin score de datos externos.

Prohibido por ahora: porcentajes de salud, edad en km/años, vida útil remanente, causalidad del service o diagnóstico certificado.

**Implementación:** src/mechanical-age-evidence.js, tests/mechanical-age-evidence.test.js, src/mechanical-age-research.js y src/mechanical-age-repeatability.js. El catálogo y auditorías empíricas están en docs/MECHANICAL_AGE_RESEARCH_V0.md.
