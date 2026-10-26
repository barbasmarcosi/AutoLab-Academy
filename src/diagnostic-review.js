/**
 * Formative feedback, intentionally separate from grading.
 * Every suggestion is grounded in documented scoring flags; never claims to
 * understand the content of free-text explanations or physical diagnostics.
 */
export function diagnosticReview(grade){
 if(!grade||typeof grade!=='object')return [];
 const items=[];
 if(grade.initialRecorded===false)items.push({
  id:'initial',
  label:'Registrar una hipótesis inicial antes de las pruebas',
  guidance:'No consta una hipótesis inicial válida en este expediente. El resultado final no sustituye el planteo previo: registrá la hipótesis antes de revelar las lecturas. El evaluador no puede verificar retrospectivamente el orden temporal.'
 });
 if(grade.unsafe)items.push({
  id:'safety',
  label:'Revisar primero el criterio de seguridad',
  guidance:'Se eligió una maniobra marcada como insegura por este banco. No la ejecutes en un vehículo: identificá una alternativa de observación no invasiva y supervisada.'
 });
 if(!grade.correct)items.push({
  id:'hypothesis',
  label:'Contrastar la conclusión con la hipótesis rival',
  guidance:'La causa final no coincide con la configurada en el simulador. Revisá qué observación distingue ambos mecanismos y evitá reemplazar una pieza a partir de un único síntoma.'
 });
 if(!grade.confirm)items.push({
  id:'confirm',
  label:'Buscar evidencia confirmatoria independiente',
  guidance:'Faltó consultar una prueba que, en este banco sintético, apoya el mecanismo activo. Describí qué resultado esperarías antes de verla.'
 });
 if(!grade.exclude)items.push({
  id:'exclude',
  label:'Intentar descartar una explicación alternativa',
  guidance:'Faltó un resultado que, bajo los supuestos del modelo, refute la hipótesis rival. Compará la predicción inicial con la lectura y explicá sus límites.'
 });
 if(!grade.context)items.push({
  id:'context',
  label:'Contextualizar las condiciones de prueba',
  guidance:'Faltó registrar el estado o contexto en que se interpretaron las lecturas; una medición sin condiciones de referencia puede resultar engañosa.'
 });
 if(!grade.predicted)items.push({
  id:'prediction',
  label:'Practicar un pronóstico discriminante antes de medir',
  guidance:'Faltó registrar correctamente ambos pronósticos discriminantes: el que confirma y el que descarta una causa rival. Antes de revelar cada lectura, anticipá qué esperarías con cada hipótesis.'
 });
 // Even a perfect generated score cannot validate reasoning or real practice.
 items.push({
  id:'review',
  label:'Validación externa del razonamiento',
  guidance:'Contrastá por escrito causa, confirmación, descarte e incertidumbre con un docente o profesional. La aplicación solo verifica selecciones y longitud del texto; no su precisión técnica.'
 });
 return items;
}
