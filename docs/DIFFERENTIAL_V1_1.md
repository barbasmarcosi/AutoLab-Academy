# AutoLab Academy v1.1 — Diagnóstico diferencial e identificabilidad

## Propósito

No basta con que una medida coincida con el síntoma. Una **prueba discriminante** es la que ofrece resultados diferentes entre las causas plausibles. Se introduce una pantalla de práctica completamente offline con tres circuitos sintéticos y dos fallas posibles por circuito.

El sistema conserva la hipótesis inicial antes de revelar ningún resultado; el alumno propone normal/anómalo/unsafe para cada prueba antes de verla, consulta datos y elige una causa final. La explicación escrita se registra, sin fingir que existe evaluación semántica automática.

## Casos

### 1. MOSFET low-side: mando correcto, carga sin trabajo
- Dos hipótesis: carga abierta o resistencia equivalente de conducción elevada.
- **Observación compartida:** puerta PWM de 5 V, 100 Hz, 30% duty.
- **Observaciones diferenciadoras:** corriente de carga y VDS cuando está encendido.
- El modelo resistivo no incorpora conmutación inductiva, física de puerta, protección ni control térmico.

### 2. Filtro RC: curva idéntica, componentes distintos
- Caso A: R=1000 Ω, C=20 µF; caso B: R=200 Ω, C=100 µF.
- Ambos tienen τ=R×C=20 ms y generan matemáticamente **la misma curva** para un escalón de 12 V.
- Repetir la captura de Vc no discrimina las hipótesis: se requiere medir R o C de forma independiente en el banco virtual y aislado.
- La forma de onda SVG no proviene de un instrumento ni representa tolerancias reales de sondas o componentes.

### 3. Tensión de carga 4,286 V: dos trayectos
- Banco 5 V, caso A: cable 10 Ω y carga 60 Ω; caso B: cable 1 Ω y carga 6 Ω.
- La tensión de la carga es igual en ambos casos por las proporciones, pero la corriente cambia: aproximadamente 0,0714 A frente a 0,7143 A.
- La medición de corriente o resistencia del tramo discrimina; una lectura repetida de tensión no.
- No se implementan ni autorizan ensayos físicos con carga real.

## Rúbrica y evidencia

- 50 puntos: seleccionar exactamente la causa definida en la sesión.
- 30 puntos: consultar **al menos una** medición que discrimine ambas causas.
- 10 puntos: registrar al menos una predicción previa normal/anómalo correcta.
- 10 puntos: escribir justificación de entre 100 y 3000 caracteres.
- La práctica supera los criterios estructurados solo si cumple todo lo anterior, y **cualquier acción insegura puntúa cero**.
- La longitud de la justificación no indica validez técnica, y no existe evaluación semántica: requiere tutor o revisión experta.
- Los valores se generan de modo determinista desde la semilla de cada intento. El informe Markdown contiene la semilla, lecturas, pronósticos, explicación y modelo. El registro local en IndexedDB conserva el resumen e IDs de medidas para el portafolio y JSON, sin cambiar el esquema de respaldo.

Los escenarios tienen fuentes de fundamentos generales de [Pico Automotive](https://www.picoauto.com/library/automotive-guided-tests/); **no** describen un procedimiento OEM ni una reparación real.

## Formación

Se incluyen cinco lecciones y diez preguntas adicionales, una lección y dos preguntas por especialidad. Total de la plataforma: **41 lecciones, 110 preguntas y cinco etapas**. La quinta etapa no bloquea acceso; el avance continúa distinguiendo lectura, puntuación de exámenes y práctica supervisada.

## Pruebas y pendientes

Tests de integridad, reproducibilidad por semilla, superposición de curva RC, mismo voltaje con distinta corriente, necesidad de evidencia discriminante, control de acciones inseguras y exportación. PWA y service worker precachean módulos nuevos.

Queda pendiente una **prueba táctil real en iPhone/Safari**, comprobación offline del ciclo de actualización, revisión del contenido por profesional y evaluación supervisada de explicación. No se simulan vehículos reales, alta tensión, hardware, sistemas de control OEM ni certificación técnica.
