# AutoLab Academy v85 — bancos numéricos dentro de lecciones

## Alcance real

Se incorporaron **tres bancos matemáticos de baja tensión** dentro de las lecciones existentes:

| Lección | Entrada controlada | Resultado del modelo ideal | Método |
| --- | --- | --- | --- |
| `voltage-dividers` | Carga en paralelo de 5/10/20 kΩ | Vout cargada desde Vin=5 V, R1=R2=10 kΩ | Paralelo + divisor resistivo |
| `rc-input` | Resistencia 1/2/4 kΩ con C=100 µF | Constante de tiempo τ en segundos | τ=R·C |
| `current-shunt` | Shunt real 12,5/20/25 mΩ con ΔV=50 mV | Corriente I en amperios | I=ΔV/R |

Los parámetros son numéricos sintéticos, **no lecturas instrumentales** ni datos OEM. Las magnitudes reales dependen de tolerancia, ruido, carga, conexión, temperatura y circunstancias de medición. No hay experimentos sobre alta tensión.

## Secuencia pedagógica

1. El estudiante selecciona una condición experimental.
2. **Antes de revelar** un resultado, elige hipótesis y refutador, introduce una predicción numérica, justifica su cálculo y declara límites de evidencia.
3. El banco congela esos datos y calcula la salida ideal de forma determinista, sin aleatoriedad ni una supuesta lectura instrumental.
4. Contrasta hipótesis (25 puntos), predicción dentro de tolerancia (40), falsador (25) y presencia formal de documentación (10). **Los textos libres no se califican semánticamente**.
5. Puede guardar evidencia aprobada o no aprobada bajo un ID de caso independiente por lección, reintentar y exportar el resultado en el respaldo normal.
6. La lectura teórica, el razonamiento contrafactual y el experimento numérico son estados separados. Aprobar un cálculo virtual **no certifica** pericia técnica real.

## Arquitectura y compatibilidad

- Modelo y UI: `src/numeric-inquiry.js`
- Puente lección-práctica: `src/lesson-practice.js` + `src/app.js`
- IDs estables: `lab-numeric-divider-v1`, `lab-numeric-rc-v1`, `lab-numeric-shunt-v1`
- Service worker: caché `autolab-academy-v85`
- Mismo esquema de respaldo JSON/IndexedDB; sin migración destructiva
- Pruebas: `tests/numeric-inquiry.test.js` y `tests/e2e/numeric-inquiry.spec.js` (incluye Chromium/WebKit, predicción errónea, persistencia, exportación y recarga)

## Cobertura al concluir la implementación

94/94 cuadernos científicos sin acreditación; 32/94 microcasos de razonamiento con transferencia; **7 laboratorios embebidos + 12 vínculos contextuales**, por lo que **75 lecciones siguen sin laboratorio vinculado o embebido**. El próximo avance requiere bancos específicos seguros por fenómeno, no incrementar contadores mediante enlaces irrelevantes.

## Publicación controlada

La rama `feature/engineering-mindset-rd-vision` despliega automáticamente un **preview Git-only** en `autolab-academy-rd-preview` (Vercel). `READY` en Vercel acredita compilación del artefacto, no ejecución de la suite Playwright. Mantener PR Draft; sin merge ni Pages producción.
