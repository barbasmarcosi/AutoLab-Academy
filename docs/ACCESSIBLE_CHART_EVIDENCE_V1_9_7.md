# v1.9.7 — Acceso a la evidencia detrás de las curvas

## Necesidad

Las curvas ya se etiquetaban como imágenes SVG, pero para interpretar la medición se necesitaba visión. Una descripción simple no transmite los valores trazados ni sus límites. Este cambio introduce una representación textual y tabular de **las mismas observaciones** que se dibujan en cada gráfico, sin atribuirles exactitud física u OEM.

## Implementación

- Osciloscopio virtual: tabla de tiempo y cada canal trazado; cantidad de registros, primer y último tiempo, mínimos y máximos por canal.
- BMS: SOC estimado, voltaje y, cuando existe, referencia sintética o declarada no verificada. Se conservan unidades, cantidades y procedencia; no se presenta ningún SOH certificado.
- Curva RC: tensión nominal y modelo de la condición seleccionada frente al tiempo.
- Las muestras visibles se distribuyen a lo largo del registro, máximo 9 por defecto y 20 como cota de la biblioteca. Mínimo/máximo se calculan **sobre la serie completa**, no solamente la muestra. No hay interpolación ni reconstrucción inventada; valores no finitos se declaran faltantes.
- \`<details>\` nativo, tabla con \`caption\`, encabezados y región desplazable enfocable por teclado. No se requieren bibliotecas externas.
- Pruebas Node para cardinalidad, extremos, huecos y límites; E2E dinámicas que abren tablas y validan WCAG 2.1 A/AA en Chromium, WebKit y WebKit móvil.

## Alcance y límites

La fuente puede ser un modelo sintético o un CSV aportado por el estudiante; la plataforma no verifica calibración, química, tolerancias ni procedencia. Las tablas no equivalen a mediciones de un vehículo real. El resultado no constituye revisión humana de accesibilidad en Safari/VoiceOver físico ni certificación técnica.
