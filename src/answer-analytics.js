/**
 * Honest, per-question diagnostic evidence. Only newly saved attempt.details
 * support item-level statements; prior aggregate scores remain aggregate.
 * Concept labels below reflect editorial provenance, NOT semantic AI grading.
 */
const CONCEPTS=[
 ['diff-q-','Diagnóstico diferencial'],
 ['time-q-','Correlación temporal'],
 ['fuel-q-','Control de mezcla e inyección'],
 ['misfire-q-','Fallas de combustión'],
 ['integral-q-','Trazabilidad y evidencias']
];
export function questionConcept(question){
 if(!question?.id)return 'Sin etiqueta conceptual';
 return CONCEPTS.find(([prefix])=>question.id.startsWith(prefix))?.[1]||'Fundamentos del área (sin etiqueta fina)';
}
export function summarizeAnswerEvidence(progress,bank){
 const known=new Map(bank.map(q=>[q.id,q]));
 const entries=(progress.attempts||[]).map((a,index)=>({a,index}))
  .filter(({a})=>Array.isArray(a.details))
  .sort((x,y)=>String(y.a.at||'').localeCompare(String(x.a.at||''))||y.index-x.index);
 const latest=new Map(),wrongCounts=new Map(),answered= new Set();
 let observations=0,highConfidenceWrong=0,lowConfidenceCorrect=0,unknown=0;
 for(const {a} of entries){
  const within=new Set();
  for(const d of a.details){
   if(!d||typeof d.id!=='string'||within.has(d.id))continue;
   within.add(d.id);
   const q=known.get(d.id);
   if(!q){unknown++;continue;}
   if(d.selected===null||!Number.isInteger(d.selected)||d.selected<0||d.selected>=q.options.length)continue;
   const correct=d.selected===q.answer;
   const confidence=['low','normal','high'].includes(d.confidence)?d.confidence:'normal';
   observations++;answered.add(d.id);
   if(!correct){wrongCounts.set(d.id,(wrongCounts.get(d.id)||0)+1);
    if(confidence==='high')highConfidenceWrong++;
   }
   if(correct&&confidence==='low')lowConfidenceCorrect++;
   if(!latest.has(d.id))latest.set(d.id,{q,at:a.at,selected:d.selected,correct,confidence});
  }
 }
 const missed=[...latest.entries()].filter(([,v])=>!v.correct).map(([id,v])=>({
  id,topic:v.q.topic,concept:questionConcept(v.q),question:v.q.question,
  explanation:v.q.explanation,source:v.q.source,selected:v.selected,
  chosenText:v.q.options[v.selected],correctText:v.q.options[v.q.answer],
  at:v.at,confidence:v.confidence,wrongCount:wrongCounts.get(id)||0
 })).sort((a,b)=>b.wrongCount-a.wrongCount||b.at.localeCompare(a.at)||a.id.localeCompare(b.id));
 const hesitant=[...latest.entries()].filter(([,v])=>v.correct&&v.confidence==='low')
  .map(([id,v])=>({id,topic:v.q.topic,question:v.q.question,concept:questionConcept(v.q),at:v.at}));
 const concepts=[];
 for(const entry of missed){
  const key=entry.concept;
  let group=concepts.find(x=>x.name===key);
  if(!group){group={name:key,count:0,ids:[]};concepts.push(group);}
  group.count++;group.ids.push(entry.id);
 }
 concepts.sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'es'));
 return {recordedAttempts:entries.length,
  legacyAttempts:(progress.attempts||[]).length-entries.length,
  observedAnswers:observations,unknownQuestionRecords:unknown,
  uniqueAnswered:answered.size,activeErrors:missed.length,
  repeatedErrors:missed.filter(m=>m.wrongCount>=2).length,
  highConfidenceWrong,lowConfidenceCorrect,
  missed,hesitant,concepts,
  caveat:'Se consideran únicamente respuestas detalladas de exámenes nuevos. Un error activo es una pregunta incorrecta en su respuesta registrada más reciente, no una laguna demostrada en un vehículo. Las etiquetas conceptuales proceden de módulos editoriales; no se analiza semánticamente el razonamiento.'};
}
export function selectErrorRetake(report,bank,count=10){
 if(!Number.isInteger(count)||count<1||count>30)throw Error('Tamaño de repaso inválido');
 const lookup=new Map(bank.map(q=>[q.id,q]));
 return report.missed.slice(0,count).map(e=>lookup.get(e.id)).filter(Boolean);
}
export function exportErrorEvidence(report,date=new Date()){
 const lines=['# AutoLab Academy — Análisis de respuestas observadas','',
  'Fecha: '+date.toISOString(),
  'Exámenes con detalles registrados: '+report.recordedAttempts,
  'Exámenes históricos solo con nota global: '+report.legacyAttempts,
  'Respuestas detalladas válidas: '+report.observedAnswers,
  'Preguntas incorrectas en su última respuesta: '+report.activeErrors,
  'Últimos errores repetidos (2+): '+report.repeatedErrors,
  'Respuestas incorrectas de confianza alta: '+report.highConfidenceWrong,
  'Aciertos con confianza baja: '+report.lowConfidenceCorrect,'',
  '## Preguntas por revisar'];
 for(const x of report.missed){
  lines.push('- '+x.id+' ['+x.concept+'] '+x.question,
   '  - Elegida: '+x.chosenText,
   '  - Respuesta correcta actual del banco: '+x.correctText,
   '  - Referencia pedagógica: '+x.explanation,
   '  - Veces incorrecta en los registros detallados: '+x.wrongCount,
   '  - Fecha última respuesta: '+x.at);
 }
 lines.push('','## Límites',report.caveat,
  'No se reinterpretan los exámenes agregados antiguos ni se deduce competencia o aptitud de diagnóstico físico.','');
 return lines.join('\n');
}
