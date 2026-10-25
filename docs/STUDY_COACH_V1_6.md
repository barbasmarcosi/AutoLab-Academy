# AutoLab Academy v1.6 — Orientador de estudio basado en registros

## Objetivo

Sin modelos de IA de pago, servidores, cuentas, ni inferencia de habilidades no observadas. Esta versión introduce un **plan de estudio local de 15, 30 o 45 minutos** y un diagnóstico descriptivo de evidencias existentes por especialidad.

La PWA reusa únicamente las estructuras almacenadas en IndexedDB y compatibles con el respaldo JSON versión 1. No se agrega esquema, tabla, analítica remota ni identificador de usuario.

## Qué información utiliza y qué no

Por cada una de las cinco áreas:

- Preguntas existentes en el banco y cantidad de tarjetas conocidas por FSRS.
- Tarjetas de repaso vencidas en la fecha local actual, y próximas; usa la fecha guardada de cada tarjeta.
- Cantidad de **últimas respuestas incorrectas** de las tarjetas con una revisión registrada. No asigna un juicio a las tarjetas sin registro.
- Último porcentaje de exámenes **explícitamente rendidos por especialidad**. Los exámenes `all`, `cumulative`, `review` no se desagregan en puntuaciones temáticas inventadas porque el respaldo conserva solamente el resultado total.
- Última práctica ficticia cuyo ID se encuentra en un catálogo de casos con especialidad declarada, incluyendo si alcanzó o no los criterios automáticos. Los casos sin ID reconocible no se adjudican a un área arbitraria.
- Primera lección sin lectura registrada dentro del área.

Si faltan pruebas o datos de repaso, muestra **sin datos**. No clasifica al alumno como incompetente ni interpreta la lectura o el tiempo de estudio como evidencia de dominio.

## Prioridad matemática, pública y sencilla

La prioridad se calcula por área según:

`5 × preguntas vencidas + 3 × últimas respuestas incorrectas + 8 si último examen específico < 85% + 6 si última práctica sintética no cumple criterios + 2 si no hay ninguna evidencia objetiva`.

En empate, se usa el orden fijo de las cinco especialidades.

No hay puntuación de dominio, inteligencia artificial que califique prosa, ni ajuste estadístico validado. Los coeficientes solo ordenan tareas y pueden refinarse tras evaluación pedagógica. Las notas de los distintos laboratorios no se promedian entre sí.

## Acciones concretas

Se proponen bloques con estimaciones orientativas:

- 10 minutos: repaso FSRS vencido, de cualquier especialidad; la pantalla advierte que no siempre corresponde al área principal.
- 15 minutos: primera lección pendiente en la especialidad priorizada.
- 10 minutos: examen específico del área.
- 20 minutos: caso de práctica sintética asignado a esa especialidad.

Se ofrecen únicamente pasos que caben dentro del período elegido, sin afirmar que las duraciones constituyan un cronometraje o que las acciones se hayan realizado. El usuario puede seleccionar manualmente una especialidad y navegar directamente a la actividad. El plan se puede exportar como Markdown con método y señales de seguimiento.

## Calidad y casos de prueba

- Sin registros: sin deducciones de debilidad, sin falsa nota.
- Exámenes agregados y de repaso: excluidos de atribución temática.
- Tarjetas desconocidas: ignoradas antes de calcular vencimientos.
- Práctica no catalogada: excluida de la especialidad y visible como excluida.
- Caso fallido con 100 puntos pero `passed=false`: se respeta la evaluación estructurada y no se deduce aptitud.
- Restricciones y presupuesto de 15/30/45 minutos.
- Igualdad de recomendaciones después de exportar y restaurar JSON.
- Navegación a las herramientas existentes y service worker actualizado.

## Riesgos y próximos pasos

Faltan pruebas de interfaz reales con Safari/iPhone y VoiceOver. El resumen de intentos anteriores no conserva una matriz por pregunta y área en exámenes globales; para desarrollar analítica histórica fiable sería necesaria una migración **retrocompatible y explícita**, sin fabricar resultados pasados.

Se necesita un diseño de evaluación práctica supervisado y criterios pedagógicos validados antes de hablar de dominio experto. **Ninguna recomendación o nota acredita capacidad para intervenir un vehículo, un sistema de combustible o alta tensión.**
