# v1.9.17 — Lectura robusta de tiempos en capturas CAN

## Hallazgo

El parser candump aceptaba timestamps arbitrariamente grandes siempre que cumplieran la expresión regular. Un número de cientos de dígitos se convertía en `Infinity` al interpretar JavaScript; otro mayor a la escala de un tiempo en segundos perdía precisión. El análisis calculaba el rango temporal sobre cualquier marca distinta de null, por lo que podía publicar `Infinity` o `NaN` en duración/graficación.

## Corrección

Solo se admiten marcas de tiempo finitas entre 0 y 10^12 segundos (margen mucho más amplio que cualquier captura común); las inválidas se contabilizan como líneas omitidas. Los cálculos de intervalos y duración vuelven a filtrar datos no finitos para evitar corrupción estadística incluso si un llamador integra filas externas al parser. No se inventan datos de tramas rechazadas.

Los límites originales de longitud de archivo, líneas, CAN clásico y DLC se mantienen. La aplicación sigue sin transmitir CAN ni inferir señales OEM. Pruebas negativas cubren epoch desbordado e inyección de `NaN/Infinity` en el analizador. SW v38→v39 y backup JSON permanecen compatibles; se requieren CI y Pages verdes antes de declararlo publicado.
