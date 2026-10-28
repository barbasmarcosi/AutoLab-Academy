# MA00 R2 — Lecturas OBD por PID y ensayo A–A sin mantenimiento

**Estado (2026-10-28): prototipo de recepción implementado, sin integración directa a ELM327 ni ensayos en un vehículo real.** No se ha validado una edad mecánica ni un índice funcional de datos externos.

## Por qué no reconstruimos muestras «simultáneas»

Muchos lectores OBD solicitan PIDs en secuencia. Una fila de RPM + STFT + ECT con una sola marca horaria introduce una simultaneidad que no ha sido demostrada. MA00 ahora dispone de dos modelos separados:

- v0 legado: fotografías agrupadas, solo desviación sintética, sin reloj por PID.
- **R2 raw PID:** cada evento guarda PID (servicio 01), unidad, valor o fallo, instante de recepción del host y opcionalmente instante de solicitud recibido por el mismo proceso. Ninguna marca representa el instante de adquisición física en la ECU.

Los PIDs admitidos por el prototipo son 010C (RPM), 0105 (ECT), 0104 (carga calculada), 0106 (STFT banco 1), 0107 (LTFT banco 1), 010F (IAT). Son solo señales de prueba, no todos los PIDs que podría exponer un vehículo. Un diésel sin trims no puede pasar este protocolo; se necesita otro modelo y calibración por motor.

## Capturador de puente (sin controlador de hardware)

El archivo tools/ma00-capture-stdin.mjs recibe NDJSON por stdin de un proceso/adaptador **externo**, procesa pares de solicitud-respuesta y escribe un JSON local **sin sobreescribir** archivos existentes (permiso 0600). No abre puertos seriales, no consulta la ECU, no controla seguridad del vehículo y **no implica acceso a un scanner**.

Ejemplo de prueba de extremo a extremo en una consola (las líneas juntas NO representan muestreo real):

~~~sh
printf '%s\n' \
 '{"kind":"request","requestId":"query-001","pid":"010C"}' \
 '{"kind":"response","requestId":"query-001","pid":"010C","status":"ok","value":812,"unit":"rpm"}' \
 | node tools/ma00-capture-stdin.mjs \
   --session aa-run-001 --vehicle anon-001 --engine engine-family-demo \
   --adapter "external research bridge" --software "bridge-v0" --out ./ma00-local-receipts.json
~~~

La salida incluye un expediente estructurado; **no sirve para validar A–A** porque contiene una sola lectura y ningún contexto de conducción independiente. No subir esos archivos al repositorio ni incluir VIN, patente o identificadores personales.

**Interpretación temporal:** el proceso Node asigna marcas de tiempo *cuando recibe cada línea*, tanto request como response. La diferencia incluye colas y latencias de procesos; ni siquiera es necesariamente el tiempo total de comunicación ECU/adaptador. Un análisis metrológico real deberá usar un logger con monotonic clock y timestamps **antes de transmitir** la solicitud y al recibir físicamente la respuesta, más caracterización del retardo de cada enlace. Los tiempos del puente son útiles para ensayar el formato y flujo, NO para demostrar latencia real del sensor.

**Integridad:** respuesta sin solicitud enlazada, requestId duplicado, PID o unidad no admitidos, valor incompatible, respuesta de error con valor, reloj invertido o solicitudes pendientes → rechazo. No se fabrican timeouts ni valores ausentes; no se genera fichero parcial cuando falla una captura. Conservar y etiquetar datos crudos con procedencia explícita.

## Protocolo A–A sin intervención

1. Seleccionar **un mismo vehículo** y familia de motor. Definir un protocolo con condiciones reproducibles y sin cambios de mantenimiento ni adaptaciones realizadas entre A1 y A2.
2. Registrar dos o más sesiones independientes, no meros fragmentos copiados de una sola serie. Tomar notas de adaptador, versión, temperatura ambiente, estado de lazo cerrado, climatización y cargas eléctricas; hay que verificar físicamente las condiciones declaradas si se pretende publicar conclusiones.
3. En el laboratorio «Edad mecánica R&D» usar el apartado **A–A: repetibilidad sin intervención**, ejecutar el ejemplo sintético o importar un array JSON de sesiones raw PID, siempre anónimas.
4. Reportar diferencias de **mediana por canal** y rango descriptivo entre sesiones, no un indicador 0–100 ni una edad. Con dos sesiones no es posible estimar una incertidumbre poblacional bien caracterizada.
5. Con registros externos incompletos se debe **abstener**: se exige, solo para esta prueba educativa, al menos 10 éxitos por canal principal (RPM, ECT, carga, STFT y LTFT), ≤20 % de respuestas fallidas, latencia documentada, compatibilidad de temperatura/carga, contexto de no intervención y sesiones no reproducidas por cambio de timestamps. Ningún umbral es OEM ni científicamente calibrado.

**Controles negativos:** offsets y retrasos, respuesta sin request, error etiquetado como lectura, canal ausente, meseta de cuantización, variación de temperatura/carga, cambio de adaptador, intervención real, timestamps invertidos y secuencias repetidas con reloj desplazado. Las alertas de meseta no son pruebas de sensor defectuoso.

## Qué falta para un verdadero estudio de campo

- Implementar con librerías existentes un **adaptador serial/USB/Bluetooth** seguro, en modo solo lectura, sin automatizar pruebas que accionen actuadores. Primero acordar hardware y plataforma concreta; no se suponen capacidades del navegador móvil.
- Evidencia de estado cerrado de mezcla y control de cargas mediante PIDs/observaciones fiables; versión del logger y relojes sincronizados.
- Captura longitudinal A–A en vehículos reales con diversas condiciones y operadores; perfilado de sesgo y repetibilidad **por unidad física**.
- Comparación con instrumentos independientes y tolerancias del fabricante. Un estudio con solo dos capturas no puede determinar la variabilidad completa de un motor.
- Nunca describir el resultado actual como «edad mecánica», «salud %», deterioro estructural o vida remanente.

**Código:** src/mechanical-age-raw-obd.js, tools/ma00-capture-stdin.mjs, src/mechanical-age-aa-view.js; pruebas tests/mechanical-age-raw-obd.test.js, tests/mechanical-age-bridge.test.js, tests/mechanical-age-aa-view.test.js y tests/e2e/mechanical-age.spec.js. Todo se implementa en research/mechanical-age-obd-v0 sin fusionar ni desplegar.
