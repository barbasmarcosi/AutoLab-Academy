# Modelo de registro pedagógico individual — diseño, no sincronización implementada

## Por qué registrar
Recordar **preguntas, razonamientos, errores útiles, recursos y evolución** para adaptar próximas conversaciones. No necesitamos guardar cada mensaje: resumimos lo que explica decisiones pedagógicas y conservamos respuestas textuales exactas solo cuando sea importante y se haya acordado.

## Destinos y privacidad
- Los documentos de esta rama son **plantillas públicas sin progreso personal real**.
- AutoLab PWA dispone de IndexedDB y exportación JSON local; **este PR no conecta los chats con ese almacenamiento** y no modifica su esquema.
- El repositorio GitHub es público: **no publicar registros personales ni transcripciones sin autorización informada específica**.
- Destino predeterminado futuro: archivo exportable **privado en poder del estudiante**, con control explícito para importar, exportar y borrar. Un almacenamiento privado remoto o mecanismo de sincronización requiere diseño y validación posteriores.
- Guardar mínima información útil, sin credenciales, datos de clientes, patentes ni información privada de terceros.

## Entidades / campos del contrato propuesto
- `learnerId`: pseudónimo local no identificable; no commit público.
- `sessionId`, `date`, `roadmapStage`, `topicIds`, `durationMinutes` (solo observados, no inferidos).
- `priorKnowledge`: explicación o síntesis sin ayudas; `confidence` opcional y autorreportada.
- `resources`: URL verificada, tramo reproducido, para qué sirvió, dudas surgidas.
- `questions`: enunciado, respuesta original del estudiante (si se autorizó guardar), pistas recibidas, justificación, feedback, revisión posterior. Nunca inventar una respuesta no expresada.
- `misconceptions`: ID de concepto, error observado, explicación de por qué es falso, evidencia de corrección, estado actual.
- `evidence`: `independent` vs `assisted`, tipo (`explanation`, `prediction`, `transfer`, `calculation`, `simulation`, `supervised-physical`), procedencia y límites.
- `nextReview`: fecha sugerida, preguntas aún no reveladas y criterio de salida; puede cambiar por evidencia.
- `decisions`: por qué avanzamos, repetimos o insertamos un prerrequisito; autor de la decisión.
- `validation`: `learnerReviewed` y `persisted`; hasta guardarse efectivamente, marcar `persisted:false`.

### Plantilla resumida de sesión (copiable, sin datos reales)
```yaml
schema: autolab-tutored-learning-session-v1
session_id: "example-000"
date: null
roadmap_stage: F00
topic_ids: []
question_generadora: ""
explicacion_previa_sin_ayudas: null
confianza_inicial: null
recursos_utilizados: []     # {url, fragmento, objetivo, nota}
preguntas_respuestas: []    # {pregunta, respuesta_textual, pistas, feedback, revision}
modelo_causal_final: null
evidencia_independiente: []
errores_conceptuales: []
seguridad_y_limites: []
proxima_revision: null
ajuste_roadmap: null
evaluacion_docente: "pendiente"
registro_revisado_por_estudiante: false
persisted: false
```

### Registro de cambios curriculares (solo genérico, apto para GitHub)
`fecha | etapa | brecha pedagógica observada sin identificar alumno | cambio del material | fuente | criterio de éxito | verificación`.
No alterar retrospectivamente una respuesta histórica. Versionar evaluaciones y rúbricas.

## Flujo de cada cierre de sesión
1. El tutor propone un resumen breve de progresos y dudas, con respuestas pertinentes si el alumno autorizó registrarlas.
2. El estudiante puede corregir interpretación o pedir omitir datos.
3. Se guarda en el destino elegido mediante acción ejecutada; confirmar ruta/fecha y mecanismo de respaldo.
4. En la próxima conversación se lee el último registro **realmente disponible**; cuando no esté accesible se solicita un resumen o exportación. Nunca afirmar que se sincronizó automáticamente.

## Trabajo futuro (no realizado en este PR)
P0: validar el protocolo con tres conversaciones y corregir la taxonomía.
P1: formato de exportación e importación individual, privado, compatible con portafolio existente.
P2: panel de progreso explicable por etapa y conceptos dependientes.
P3: propuesta opcional de integración/sincronización, cifrado, consentimiento, backup y pruebas de recuperación.
