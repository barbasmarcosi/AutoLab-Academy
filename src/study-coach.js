/**
 * Explainable study suggestions based solely on local records; not a mastery model.
 * Aggregate exams are excluded from topic-specific performance claims.
 */
export const STUDY_PLAN_MINUTES=[15,30,45];
const validDate=value=>Number.isFinite(Date.parse(value));
const newest=(a,b)=>String(b.at||'').localeCompare(String(a.at||''));
export function analyzeStudyEvidence(progress,questions,lessons,tracks,caseCatalog=[],now=new Date()){
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))throw Error('Fecha de diagnóstico inválida');
 const topicIds=new Set(tracks.map(t=>t.id)),questionById=new Map(questions.map(q=>[q.id,q]));
 const caseById=new Map(caseCatalog.filter(c=>topicIds.has(c.topic)).map(c=>[c.id,c]));
 const reviews=Object.entries(progress.reviews||{}).filter(([id,r])=>questionById.has(id)&&r&&validDate(r.due));
 const attempts=(progress.attempts||[]).filter(a=>topicIds.has(a.topic)&&Number.isInteger(a.percentage)&&a.percentage>=0&&a.percentage<=100);
 const typedCases=(progress.cases||[]).map(record=>({record,definition:caseById.get(record.id)})).filter(item=>item.definition);
 const topics=tracks.map((track,order)=>{
  const qs=questions.filter(q=>q.topic===track.id);
  const cards=reviews.filter(([id])=>questionById.get(id).topic===track.id);
  const due=cards.filter(([,r])=>Date.parse(r.due)<=now.getTime()).length;
  const incorrect=cards.filter(([,r])=>r.last&&r.correct===false).length;
  const future=cards.filter(([,r])=>Date.parse(r.due)>now.getTime()).length;
  const exams=attempts.filter(a=>a.topic===track.id).sort(newest);
  const practices=typedCases.filter(x=>x.definition.topic===track.id).map(x=>x.record).sort(newest);
  const latestExam=exams[0]||null,latestPractice=practices[0]||null;
  const nextLesson=lessons.find(l=>l.topic===track.id&&!progress.notes?.['lesson-'+l.id])||null;
  const noEvidence=cards.length===0&&exams.length===0&&practices.length===0;
  const signals=[];
  if(due)signals.push(due+' pregunta(s) de repaso vencida(s)');
  if(incorrect)signals.push(incorrect+' última(s) respuesta(s) incorrecta(s) en repaso');
  if(latestExam&&latestExam.percentage<85)signals.push('último examen del área: '+latestExam.percentage+'% (umbral interno 85%)');
  if(latestPractice&&!latestPractice.passed)signals.push('última práctica ficticia sin criterios completos');
  if(noEvidence)signals.push('sin evaluaciones específicas ni repasos registrados');
  if(!signals.length)signals.push('sin alertas registradas; esto no demuestra dominio');
  const priority=due*5+incorrect*3+(latestExam&&latestExam.percentage<85?8:0)+
   (latestPractice&&!latestPractice.passed?6:0)+(noEvidence?2:0);
  const catalog=caseCatalog.filter(c=>c.topic===track.id);
  const untried=catalog.find(c=>!practices.some(p=>p.id===c.id));
  return {id:track.id,title:track.title,order,questionCount:qs.length,
   reviewed:cards.length,untested:Math.max(0,qs.length-cards.length),due,future,incorrect,
   examCount:exams.length,latestExamPct:latestExam?.percentage??null,
   practiceCount:practices.length,latestPracticePassed:latestPractice?.passed??null,
   noEvidence,signals,priority,nextLessonId:nextLesson?.id??null,nextLessonTitle:nextLesson?.title??null,
   recommendedPracticeId:untried?.id??(latestPractice&&!latestPractice.passed?latestPractice.id:catalog[0]?.id??null)};
 });
 const ranked=[...topics].sort((a,b)=>b.priority-a.priority||a.order-b.order);
 return {topics,ranked,focus:ranked[0]??null,dueTotal:topics.reduce((s,x)=>s+x.due,0),
  knownQuestions:topics.reduce((s,x)=>s+x.questionCount,0),reviewedQuestions:topics.reduce((s,x)=>s+x.reviewed,0),
  knownCaseRecords:typedCases.length,excludedCaseRecords:(progress.cases||[]).length-typedCases.length,
  excludedAggregateExams:(progress.attempts||[]).filter(a=>!topicIds.has(a.topic)).length,
  explanation:'Prioridad = 5×repasos vencidos + 3×últimas respuestas incorrectas + 8 si el último examen específico es menor al umbral interno + 6 si la última práctica ficticia no cumplió criterios + 2 si no hay evidencia. Los empates siguen el orden de áreas. Solo organiza actividades; no estima competencia.'};
}
export function makeDailyStudyPlan(analysis,topicId='auto',minutes=30){
 if(!STUDY_PLAN_MINUTES.includes(minutes))throw Error('Duración inválida');
 const focus=topicId==='auto'?analysis.focus:analysis.topics.find(t=>t.id===topicId);
 if(!focus)throw Error('Especialidad desconocida');
 const actions=[];
 if(analysis.dueTotal>0)actions.push({type:'review',id:'due',minutes:10,title:'Repasar preguntas vencidas FSRS',
  why:'Hay '+analysis.dueTotal+' preguntas vencidas en todas las áreas; el repaso puede incluir otras especialidades.'});
 if(focus.nextLessonId)actions.push({type:'lesson',id:focus.nextLessonId,minutes:15,title:'Leer: '+focus.nextLessonTitle,
  why:'Lectura pendiente. Completarla no acredita dominio.'});
 actions.push({type:'exam',id:focus.id,minutes:10,title:'Examen de '+focus.title,
  why:focus.latestExamPct===null?'Sin examen específico registrado.':'Último examen específico: '+focus.latestExamPct+'%.'});
 if(focus.recommendedPracticeId)actions.push({type:'practice',id:focus.recommendedPracticeId,minutes:20,
  title:'Caso sintético de '+focus.title,
  why:'Practicar mediciones y descarte de hipótesis, no certificar diagnóstico real.'});
 const steps=[];let allocated=0;
 for(const step of actions)if(allocated+step.minutes<=minutes){steps.push(step);allocated+=step.minutes;}
 return {topic:focus.id,topicTitle:focus.title,requestedMinutes:minutes,
  plannedMinutes:allocated,steps,reason:focus.signals,
  generatedFrom:'Datos locales, sin predicción de aptitud ni evaluación de texto libre.'};
}
export function formatStudyPlan(analysis,plan,date=new Date()){
 const lines=['# AutoLab Academy — Plan de estudio orientativo','',
  'Generado: '+date.toISOString(),'Área: '+plan.topicTitle,'Tiempo disponible: '+plan.requestedMinutes+' min',
  'Bloques sugeridos: '+plan.plannedMinutes+' min','','## Señales de seguimiento',
  ...plan.reason.map(s=>'- '+s),'','## Acciones sugeridas'];
 for(const step of plan.steps)lines.push('- '+step.title+' ('+step.minutes+' min): '+step.why);
 lines.push('','## Método transparente',analysis.explanation,'',
  'Solo se utilizaron registros guardados localmente. Los exámenes globales no se desglosan por especialidad y las prácticas sintéticas no demuestran aptitud profesional.','');
 return lines.join('\n');
}
