# MA00 R3 — Capturador serial ELM327 experimental (solo lectura)

**Estado (28/10/2026):** se implementó un cliente local de captura serial en tools/ma00_elm327_serial.py, con pySerial opcional y pruebas automatizadas sobre bytes simulados. **Todavía no se conectó ni validó con una ECU o un vehículo físico.** No hay cálculo de desgaste ni edad mecánica.

## Propósito

Evitar reconstruir una falsa «instantánea» de múltiples PIDs leídos en secuencia. Se reutiliza pyserial==3.5, una biblioteca existente: https://pyserial.readthedocs.io/en/latest/pyserial_api.html

Solo interroga los PID estándar del Servicio 01: 010C RPM, 0105 ECT, 0104 carga calculada, 0106 STFT banco 1, 0107 LTFT banco 1, 010F IAT. Ningún comando suministrado por el usuario llega al bus sin pasar por el allowlist. No envía servicios para borrar DTC, reprogramar ECU ni controlar actuadores. Los únicos comandos de configuración ELM son ATE0, ATL0, ATS0, ATH0 y ATSP0, de presentación/adaptador.

## Instalación local y prueba

En una computadora con Python 3.10+ y un ELM327 serial (USB o Bluetooth SPP vinculado a un puerto COM/tty):

~~~sh
python -m pip install -r requirements-ma00-serial.txt
python tools/ma00_elm327_serial.py --port COM3 --session aa-session-001 --vehicle anon-auto-001 --engine motor-familia-001 --adapter "ELM327 USB experimental" --cycles 32 --out ma00-session-001.json
~~~

En Linux usar /dev/ttyUSB0 o /dev/rfcomm0 si está configurado. No se implementó Bluetooth BLE o Wi-Fi; esta herramienta corre en la computadora, no directamente en la PWA. Solo permite puertos locales explícitos y nunca busca dispositivos ni conecta automáticamente. No usar durante la conducción; probar con el vehículo detenido y ventilación adecuada, lejos de componentes calientes o móviles.

## Significado y límites de timestamps

Cada respuesta produce:
- PID, unidad, valor si pudo verificarse la trama, o estado error/timeout sin valor;
- requestAtMs: tiempo monotónico del proceso **antes de escribir** al puerto serial;
- receivedAtMs: tiempo monotónico del proceso **al recibir el prompt ELM**;
- rawResponseHex y rawFrameSizeBytes: bytes originales para auditoría posterior, incluso en caso de fallo, y parseError cuando corresponda.

Estos tiempos incluyen transporte USB/Bluetooth, serial, ELM, procesamiento en ECU y scheduling del host. **NO** son el tiempo real de sensado interno de la ECU ni una medición aislada de su latencia. Tampoco demuestran que STFT y RPM se hayan obtenido al mismo instante.

## Seguridad e integridad

- Respuestas con varios mensajes ECU, PID incorrecto, hex truncado, encabezado inesperado, texto de error, prompt faltante o formato no ASCII son errores: no se inventan muestras.
- Hay límites de tamaño de trama, duración de cada solicitud, número de ciclos y velocidades seriales; el adaptador no recibe comandos OBD arbitrarios.
- Los datos físicos se marcan provided_obd_unverified. Nunca se convierten a synthetic por elegir una opción de UI.
- El registro deja conditions y referencia mecánica independientes como null. El operador debe documentar físicamente las condiciones antes de aplicar el protocolo A–A; el programa no se atribuye una verificación inexistente.
- Los archivos son locales, se crean sin sobrescritura con permisos restringidos. No incluir VIN, patente, nombres ni datos personales; no subir capturas a repositorios públicos.

## Pruebas de software

Ejecutar:

~~~sh
python -m unittest discover -s tests/science -p 'test_ma00_elm327_serial.py'
~~~

Pruebas deterministas con un FakeSerial que simula respuestas, errores, tramas ambiguas, eco, PIDs incorrectos, unidades, protocolo de handshake y whitelists. Esas pruebas verifican lógica de software, **NO** comportamiento sobre un auto.

## Investigación posterior

Primero: verificar varios adaptadores concretos en modo solo lectura, tiempos host, pérdida de datos y compatibilidad PID. Segundo: repetir A–A en motores reales **sin intervención** entre sesiones y con contexto documentado; contar sesiones independientes, no filas. Tercero: comparar contra instrumentos y wear ground truth físico. **No hay todavía base científica para edad equivalente en kilómetros, porcentaje de salud ni vida remanente.**

Documentos relacionados: MECHANICAL_AGE_RAW_CAPTURE_AA_V1.md y MECHANICAL_AGE_ACQUISITION_PROTOCOL_V1.md. CI de la rama de investigación sin merge y sin deploy de producción.


## R3.1 — Revisión adversarial del enlace (28/10/2026)

**Riesgo identificado:** un timeout parcial puede dejar bytes atrasados; continuar consultando otro PID sería inseguro para la integridad de la evidencia. El programa **aborta** al primer timeout o trama inválida, conserva la respuesta incompleta y el motivo de interrupción; no inventa lecturas ni ejecuta reintentos automáticos.

**Preflight obligatorio:** antes de capturar consulta el PID de capacidad 0100 (Servicio 01) y valida la máscara de sensores. Si no están anunciados los cinco PIDs requeridos (010C RPM, 0105 ECT, 0104 carga, 0106 STFT, 0107 LTFT), rechaza la sesión. El 010F IAT se consulta únicamente si figura en la máscara. El anuncio de soporte no demuestra por sí mismo que una señal esté calibrada, sea confiable o esté disponible en cualquier régimen del motor.

**Evidencia en el expediente:** se añaden los campos captureAborted, abortReason, supportedPidMaskRawHex y supportedPids. El comparador A–A excluye toda captura interrumpida, incluso cuando tenga numerosas muestras. La lista serviceCommandsSent enumera los comandos permitidos por la configuración de esa sesión, no una traza exhaustiva de cada trama enviada.

**Pruebas:** rechazo de máscara ambigua o incompatible, falta de PIDs indispensables, canal IAT opcional, timeout incompleto y prohibición de consultar otro PID después de una trama no confiable.

Todo esto se verificó con un adaptador falso en software: el funcionamiento físico, la latencia real, el estado de lazo cerrado y la exactitud del sensor **siguen sin validarse**. Un fallo real debe dar lugar a una nueva captura identificada por un nuevo sessionId.


## R3.3 — Contrato de evidencia entre Python y AutoLab

**Hallazgo adversarial:** escribir el texto hexadecimal original y, separadamente, el número decodificado no obliga a que ambos representen el mismo valor. Un archivo transformado podría mostrar 800 RPM mientras sus bytes describen otra velocidad. También podría declararse una captura completa aunque falten respuestas.

**Corrección implementada:** src/mechanical-age-serial-integrity.js decodifica de nuevo los bytes originales del Servicio 01 dentro de la PWA, sin consultar el algoritmo Python. Si el valor y los bytes no coinciden, los eventos exceden el plan, la máscara de compatibilidad no corresponde, se fabrican PIDs, se altera el estado de aborto o hay muestras después de una trama fallida, **se rechaza todo el expediente**. El capturador añade plannedCycles y expectedEventCount para impedir que una serie truncada se presente como completa. El auditor JS ya ejecuta este contrato al importar registros con schema ma00-local-serial-receipts-v1.

**Prueba cruzada reproducible:** tests/science/ma00_fake_serial_fixture.py ejecuta el *mismo capturador serial Python* sobre bytes ELM simulados, generando 32 ciclos. tests/mechanical-age-python-serial.test.js procesa esa captura directamente con el auditor JS y ensaya manipulaciones maliciosas/accidentales de valores, HEX, cantidad de muestras, máscara, timestamps y estado de interrupción. La interfaz también se prueba con esos datos. Un marcador testOnlyFakeTransport prohíbe tomar el dispositivo falso como evidencia física A–A. La CI corre Python y Node, y el módulo JS se incluye en la caché offline.

**Límite explícito:** consistencia interna no equivale a autenticidad, integridad criptográfica, calibración instrumental, simultaneidad de PIDs o verdad-terreno del desgaste. Si un tercero manipula coherentemente todos los campos, la validación interna no puede detectarlo; para autenticidad se necesitarían protocolos externos y evidencia independiente. No hay ningún indicador de edad mecánica disponible para capturas reales.
