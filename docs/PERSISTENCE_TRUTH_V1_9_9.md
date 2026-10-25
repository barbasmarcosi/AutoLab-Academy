# AutoLab Academy v1.9.9 — Errores de almacenamiento

Cuando IndexedDB rechaza guardar (p. ej., cuota agotada), la pantalla presenta un aviso persistente con rol accesible alert, explica que los datos que siguen en memoria pueden perderse al cerrar y ofrece un botón para volver a guardar. El botón solo anuncia éxito si la transacción de IndexedDB termina correctamente. Las notas dejan de mostrar una falsa confirmación positiva al fallar el guardado.

Una excepción QuotaExceededError se inyecta durante las pruebas de navegador para comprobar notas, cierre de un examen acumulativo de 15 preguntas, ausencia del registro en disco antes del reintento, recuperación y lectura tras una recarga. No simula literalmente un dispositivo sin espacio. El backup JSON schema 1 no cambia; no se añaden credenciales ni servicios externos. La prueba física en Safari/VoiceOver queda pendiente.
