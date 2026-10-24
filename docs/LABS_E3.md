# E3 — Laboratorios de circuitos y CAN (primer incremento)

## Implementado

1. **Laboratorio CAN clásico de solo lectura:** importar registros compatibles con can-utils candump y analizar localmente timestamp, interfaz, ID, DLC, payload, recuentos, intervalos por ID y pausas inusuales. Permite filtrado y paginación de hasta 80 filas. No envía tráfico ni conecta hardware.
2. **Captura sintética reproducible:** vcan0, IDs de práctica 0x120 y 0x220; 0x120 simula RPM (uint16 little-endian * 0,25), 0x220 simula temperatura. Una pausa diseñada para aprender a comparar periodicidad; se evalúa una pregunta y queda en el historial.
3. **CircuitJS1:** acceso a herramienta original mediante iframe de carga explícita y enlace externo, con ejercicios sugeridos. No se aloja ni redistribuye CircuitJS todavía. Requiere Internet y puede ser bloqueado por políticas de terceros.
4. **Sin backend:** el archivo CAN se procesa solamente en memoria del navegador; no se envía a AutoLab ni se incluye en el backup. Las respuestas de la práctica se guardan en IndexedDB mediante el sistema existente.

## Compatibilidad de formato

La importación admite hasta 1 MB / 12.000 líneas de **tramas clásicas de datos CAN** en formato candump:
- (1720000000.001000) can0 123#DEADBEEF
- can0 18DAF110#01020304

IDs de 11 bits con 3 dígitos hexadecimales y de 29 bits con 8 dígitos. DLC 0–8, timestamps opcionales. Se descartan y contabilizan (no se reinterpretan) CAN FD con ##, tramas remotas RTR, error frames y formatos desconocidos. La información temporal solo existe cuando la captura incluye timestamps.

El cálculo de intervalos por ID usa la mediana de diferencias positivas de timestamps ordenados; marca un posible gap cuando hay al menos cuatro intervalos y el máximo supera 2,5 veces la mediana y al menos 5 ms adicionales. **Es una heurística de estudio**, no una prueba de fallo del bus, ni una métrica de rendimiento de vehículo.

No hay decodificación de señales propietarias, DBC, identificación de marcas ni diagnóstico OEM. El ejemplo sintético emplea un mapa propio y **no debe aplicarse a otras capturas con el mismo ID**.

## Dependencias y licencias

- [CircuitJS1 / Falstad](https://www.falstad.com/circuit/): aplicación externa usada bajo demanda. No se copia su código ni se empaqueta como propio. Para usar su [API JavaScript](https://www.falstad.com/circuit/doc/js-interface.html), el simulador debe alojarse bajo el mismo origen que AutoLab; eso obliga a revisar con detalle la distribución y licencia GPL y a incorporar créditos y código fuente correspondiente. Este trabajo permanece **pendiente**, no se declara cumplido.
- [can-utils](https://github.com/linux-can/can-utils): definición del formato de intercambio para archivos .log, sin copiar el motor de CAN ni implementar funciones de transmisión.
- [python-can](https://python-can.readthedocs.io/) y [cantools](https://cantools.readthedocs.io/): herramientas recomendadas **externas para laboratorio de escritorio**. No están integradas en la PWA.

## Seguridad y privacidad

- No admite transmisión ni inyección CAN.
- No interpreta capturas como autorización para modificar ECUs, inmovilizadores o protocolos.
- El contenido real de capturas permanece en memoria, no se guarda en nube ni en el respaldo.
- No cargar logs de clientes sin autorización, y revisar si contienen identificadores u otros datos sensibles antes de compartirlos.
- No experimentación sobre sistemas de alta tensión reales sin formación, equipo y supervisión.

## Pruebas y pendientes

Tests Node de parsing, límites, timestamps, DLC, ID extendido, formato excluido, muestra reproducible y ausencia de inferencia temporal. Las pruebas no sustituyen la validación visual en Safari iOS o Android.

Siguiente iteración:
- Probar experiencia y accesibilidad móvil con navegador real.
- Agregar análisis de DBC **mediante librería existente**, con documentación y licencia, no implementar la semántica desde cero.
- Producir catálogo de datasets CAN con claves didácticas y archivos descargables.
- Evaluar empaquetado same-origin de CircuitJS con licencia GPL, recursos completos y offline.
- Incorporar notebooks reproducibles de PyBaMM en equipo personal con importación de resultados.
