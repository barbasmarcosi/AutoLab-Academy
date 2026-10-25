import{differentialCases}from'./fault-discrimination.js';
/**
 * Read-only portfolio built exclusively from locally persisted data.
 * No claim that completion or scoring equals supervised qualification.
 */
const differentialTitles=new Map(differentialCases.map(c=>[c.id,c.title]));
const sortDescending=(a,b)=>String(b.at||'').localeCompare(String(a.at||''));
export function portfolioSnapshot(progress,lessons=[]){
 const attempts=(progress.attempts||[]).map(a=>({
  kind:'exam',id:a.id,topic:a.topic,at:a.at,score:a.percentage,
  title:a.topic==='cumulative'?'Examen acumulativo':a.topic==='review'?'Repaso FSRS':'Examen: '+a.topic,
  evidence:[],reasoning:'',passed:a.percentage>=85
 }));
 const cases=(progress.cases||[]).map(c=>({
  kind:c.id.startsWith('mf-')?'multifault':c.id.startsWith('di-')?'differential':c.id.startsWith('lab-')?'lab':c.id.startsWith('measure-')?'quantitative':'diagnostic',
  id:c.id,topic:c.id.split('-')[1]||'varios',at:c.at,score:c.score,
  title:differentialTitles.get(c.id)||c.id.replace(/^lab-|^measure-/,'').replaceAll('-',' '),
  evidence:Array.isArray(c.used)?c.used:[],
  reasoning:String(c.reasoning||''),
  hypothesis:String(c.hypothesis||''),conclusion:String(c.conclusion||''),
  passed:!!c.passed
 }));
 const events=[...attempts,...cases].sort(sortDescending).slice(0,500);
 const completed=lessons.filter(l=>Boolean(progress.notes?.['lesson-'+l.id]));
 const reviews=Object.values(progress.reviews||{});
 const scheduled=reviews.filter(r=>Number.isFinite(Date.parse(r?.due))).length;
 const reviewed=reviews.filter(r=>r?.algorithm==='ts-fsrs-5').length;
 return {events,totals:{
  exams:attempts.length,practices:cases.length,completedLessons:completed.length,knownLessons:lessons.length,
  reviewItems:scheduled,fsrsItems:reviewed,studyMinutes:Number(progress.studyMinutes)||0
 },lessons:completed.map(l=>({id:l.id,title:l.title,topic:l.topic,at:progress.notes['lesson-'+l.id]}))};
}
export function portfolioMarkdown(progress,lessons=[],date=new Date()){
 const snapshot=portfolioSnapshot(progress,lessons);
 const lines=['# AutoLab Academy — Portafolio personal de entrenamiento','',
  'Generado: '+date.toISOString(),
  '**Importante:** este archivo resume ejercicios y lecturas registrados localmente; NO acredita competencias de taller, práctica supervisada ni certificación HV.',
  'Las notas entre exámenes, laboratorios y casos no son comparables como medida uniforme de dominio.','',
  '## Resumen de actividad',
  '- Exámenes teóricos: '+snapshot.totals.exams,
  '- Prácticas y laboratorios: '+snapshot.totals.practices,
  '- Lecciones con lectura registrada: '+snapshot.totals.completedLessons+' / '+snapshot.totals.knownLessons,
  '- Repasos programados: '+snapshot.totals.reviewItems,
  '- Tarjetas con historial FSRS: '+snapshot.totals.fsrsItems,
  '- Minutos estimados de lectura anotados: '+snapshot.totals.studyMinutes,
  '','## Registro de lecciones'];
 for(const l of snapshot.lessons)lines.push('- '+l.title+' ('+l.topic+'), registro: '+l.at);
 if(!snapshot.lessons.length)lines.push('(Sin lecturas registradas.)');
 lines.push('','## Historial de evaluaciones y prácticas');
 for(const e of snapshot.events){
  lines.push('### '+e.title,'- Fecha: '+e.at,'- Tipo: '+e.kind,'- Código: '+e.id,
   '- Puntaje interno: '+e.score+'/100'+(e.passed?' (criterios automáticos alcanzados)':''),
   '- Instrumentos/evidencias registradas: '+(e.evidence.length?e.evidence.join(', '):'sin detalle'),
   '- Hipótesis: '+(e.hypothesis||'no registrada'),
   '- Conclusión: '+(e.conclusion||'no registrada'),
   '- Justificación de estudiante (sin evaluación semántica): '+(e.reasoning||'sin registro'),'');
 }
 if(!snapshot.events.length)lines.push('(Sin evaluaciones registradas.)','');
 lines.push('---','La experiencia práctica solo puede ser acreditada mediante criterios, observación y supervisión profesionales.','');
 return lines.join('\n');
}
