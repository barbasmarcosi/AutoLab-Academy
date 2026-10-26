const normalized=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('es');
const present=(v,n=1)=>typeof v==='string'&&v.trim().length>=n;
function unique(values,label,errors){const ids=new Set();for(const v of values){if(!present(v)){errors.push(label+': ID vacío');continue}if(ids.has(v))errors.push(label+': ID duplicado '+v);ids.add(v)}return ids}
function https(v){try{const u=new URL(v);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch{return false}}
/** Estructura y trazabilidad solamente: NO verifica el contenido técnico/OEM. */
export function auditCurriculum({tracks=[],lessons=[],questions=[],cases=[],learningStages=[]}={}){
 const errors=[],warnings=[];
 const topics=unique(tracks.map(x=>x.id),'áreas',errors);
 if(topics.size!==5)errors.push('Se esperaban cinco especialidades');
 const lessonIds=unique(lessons.map(x=>x.id),'lecciones',errors);
 unique(questions.map(x=>x.id),'preguntas',errors);
 unique(cases.map(x=>x.id),'casos',errors);
 const lessonTitles=new Map(),questionTexts=new Map(),assigned=new Map();
 for(const l of lessons){
  const key='lección '+l.id;
  if(!topics.has(l.topic))errors.push(key+': área inexistente');
  if(!present(l.title,8))errors.push(key+': título insuficiente');
  const title=normalized(l.title);
  if(lessonTitles.has(title))errors.push(key+': título repetido con '+lessonTitles.get(title));
  lessonTitles.set(title,l.id);
  if(!Number.isInteger(l.minutes)||l.minutes<5||l.minutes>180)errors.push(key+': duración inválida');
  if(!Array.isArray(l.sections)||l.sections.length<2)errors.push(key+': faltan secciones');
  else for(const [i,s] of l.sections.entries())if(!Array.isArray(s)||s.length!==2||!present(s[0],4)||!present(s[1],20))errors.push(key+': sección incompleta '+(i+1));
  if(!https(l.url))errors.push(key+': fuente HTTPS inválida');
 }
 for(const q of questions){
  const key='pregunta '+q.id;
  if(!topics.has(q.topic))errors.push(key+': área inexistente');
  if(!present(q.question,15))errors.push(key+': enunciado insuficiente');
  if(!Array.isArray(q.options)||q.options.length!==4)errors.push(key+': cuatro opciones requeridas');
  else{if(q.options.some(x=>!present(x,2)))errors.push(key+': opción vacía');if(new Set(q.options.map(normalized)).size!==4)errors.push(key+': opciones indistinguibles')}
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)errors.push(key+': índice de respuesta inválido');
  if(!present(q.explanation,20))errors.push(key+': explicación insuficiente');
  if(!https(q.source))errors.push(key+': fuente HTTPS inválida');
  const signature=normalized(q.question);if(questionTexts.has(signature))errors.push(key+': enunciado repetido de '+questionTexts.get(signature));questionTexts.set(signature,q.id);
 }
 const stageIds=unique(learningStages.map(x=>x.id),'etapas',errors);
 if(!stageIds.size)errors.push('Itinerario vacío');
 const orders=new Set();
 for(const s of learningStages){
  if(!Number.isInteger(s.order)||s.order<1||orders.has(s.order))errors.push('etapa '+s.id+': orden inválido');orders.add(s.order);
  if(!present(s.goal,25))errors.push('etapa '+s.id+': objetivo insuficiente');
  if(!Array.isArray(s.lessons)||!s.lessons.length)errors.push('etapa '+s.id+': sin lecciones');
  for(const id of s.lessons||[]){if(!lessonIds.has(id))errors.push('etapa '+s.id+': referencia inexistente '+id);if(assigned.has(id))errors.push('lección '+id+': asignada dos veces');assigned.set(id,s.id)}
 }
 for(const l of lessons)if(!assigned.has(l.id))errors.push('lección '+l.id+': fuera del itinerario');
 for(const t of tracks){if(!lessons.some(x=>x.topic===t.id))errors.push('área '+t.id+': sin lecciones');if(!questions.some(x=>x.topic===t.id))errors.push('área '+t.id+': sin preguntas')}
 for(const item of cases){
  const key='caso '+item.id;
  if(!topics.has(item.topic))errors.push(key+': área inexistente');
  if(!present(item.title,8)||!present(item.reason,20))errors.push(key+': sin título o razonamiento');
  if(!Array.isArray(item.choices)||!item.choices.some(p=>Array.isArray(p)&&p[0]===item.solution))errors.push(key+': solución fuera de alternativas');
  if(!Array.isArray(item.probes)||!item.probes.some(p=>p.critical))errors.push(key+': sin prueba confirmatoria');
  if(Array.isArray(item.probes)){unique(item.probes.map(p=>p.id),key+' pruebas',errors);if(item.probes.some(p=>!present(p.label,4)||!present(p.result,8)))errors.push(key+': prueba incompleta')}
  if(!https(item.source))warnings.push(key+': sin fuente HTTPS contextual');
 }
 return {ok:errors.length===0,errors,warnings,summary:{tracks:tracks.length,lessons:lessons.length,questions:questions.length,cases:cases.length,stages:learningStages.length,uncoveredLessons:lessons.filter(l=>!assigned.has(l.id)).length,distinctSourceURLs:new Set([...lessons.map(l=>l.url),...questions.map(q=>q.source),...cases.map(x=>x.source)].filter(https)).size}};
}
