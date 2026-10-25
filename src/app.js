import{tracks,lessons,questions,cases as baseCases,resources}from'./content.js';
import{additionalCases}from'./cases-advanced.js';
import{assessCase,caseReport}from'./workshop-engine.js';
import{parseCandump,analyzeCanFrames,sampleCandump,decodeSyntheticSample,MAX_CAN_INPUT}from'./can-lab.js';
import{loadDbc,decodeFramesWithDbc,MAX_DBC_BYTES}from'./dbc-lab.js';
import{BMS_SCENARIOS,generateSyntheticBms,parseBmsCsv,formatBmsCsv,analyzeBms,bmsQuestion,capacitySohPct,MAX_BMS_FILE_BYTES}from'./bms-lab.js';
const cases=[...baseCases,...additionalCases];
let bmsState={scenarioId:'nominal',dataset:generateSyntheticBms('nominal'),capacityAh:60,initialSocPct:100,biasCorrectionA:0,answer:'',feedback:'',name:'Ejemplo nominal',fullCapacityAh:48,baselineCapacityAh:60};
let labState={mode:'can',sample:true,capture:parseCandump(sampleCandump()),selectedId:'all',offset:0,circuitLoaded:false,answer:'',feedback:'',dbc:null,dbcLabel:'',dbcError:'',dbcAnswer:'',dbcFeedback:''};
import{emptyProgress,scoreExam,dueReviews,completedTopics,calculateCase,loadProgress,saveProgress,serializeBackup,parseBackup}from'./core.js';
import{recordReview,selectCumulativeQuestions,reviewOverview}from'./repetition.js';
import{buildQuantitativeSession,parseNumericAnswer,gradeQuantitative,formatQuantitativeReport}from'./measurement-challenges.js';
const root=document.getElementById('app');
let quantitative=null;let quantitativeResults=null;
let data=emptyProgress();let page='home';let selectedLesson=null;let exam=null;let training=null;let examResult=null;let caseResult=null;
function esc(value){return String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));}
function attr(value){return esc(value);}
function button(text,action,extra='',kind=''){return '<button class="button '+kind+'" data-action="'+attr(action)+'" '+extra+'>'+text+'</button>';}
function link(url,label){return '<a target="_blank" rel="noopener noreferrer" href="'+attr(url)+'">'+esc(label)+'</a>';}
function toast(message,error=false){document.querySelectorAll('.toast').forEach(n=>n.remove());const node=document.createElement('div');node.className='toast'+(error?' error':'');node.textContent=message;node.role='status';document.body.append(node);setTimeout(()=>node.remove(),4200);}
async function persist(){try{await saveProgress(data);}catch(e){toast('No se pudieron guardar los cambios: '+e.message,true);}}
function nav(next){page=next;exam=null;training=null;examResult=null;caseResult=null;render();window.scrollTo({top:0,behavior:'instant'});}
function heading(label,title,description=''){return '<div class="eyebrow">'+esc(label)+'</div><h1>'+esc(title)+'</h1>'+(description?'<p class="muted lead">'+esc(description)+'</p>':'');}
function layout(body){const menus=[['home','Panel'],['learn','Academia'],['exams','Exámenes'],['challenges','Retos medidos'],['cases','Taller virtual'],['labs','Laboratorios'],['resources','Recursos'],['data','Mis datos']];root.innerHTML='<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">A</span><div>AutoLab<span class="brand-accent"> Academy</span><small>ENGINEERING LEARNING LAB</small></div></div><nav class="nav" aria-label="Navegación principal">'+menus.map(([id,label])=>'<button class="'+(page===id?'active':'')+'" data-action="nav" data-id="'+id+'" '+(page===id?'aria-current="page"':'')+'>'+label+'</button>').join('')+'</nav><div class="sidebar-footer"><span class="tag">Versión 0.6</span><p>Progreso local, sin cuenta ni servidor. Guardá un respaldo periódicamente.</p></div></aside><main class="main"><div class="topbar"><div class="eyebrow">DIAGNÓSTICO ELECTRÓNICO · HEV/EV</div><span class="tag dim">Modo offline</span></div>'+body+'<footer>AutoLab Academy · Formación y simulación educativa. No acredita intervenciones de alta tensión ni reemplaza supervisión profesional.</footer></main></div>';}
function home(){const attempted=data.attempts.length;const average=attempted?Math.round(data.attempts.reduce((a,x)=>a+x.percentage,0)/attempted):0;const due=reviewOverview(data,questions).due;const topics=completedTopics(data,questions);return '<section class="hero"><div><div class="eyebrow">TU CENTRO DE ENTRENAMIENTO</div><h1>Aprendé a encontrar la causa, no solo el código.</h1><p>Estudiá electrónica automotriz, entrená con fallas reproducibles y evaluá tu razonamiento antes de trabajar con vehículos reales.</p><div class="row">'+button('Iniciar examen diagnóstico','start-exam','data-topic="all"')+button('Retos de medición','nav','data-id="challenges"','alt')+button('Explorar lecciones','nav','data-id="learn"','alt')+'</div></div><div class="hero-icon" aria-hidden="true">⌁</div></section><section class="grid"><div class="panel"><div class="stat-number">'+attempted+'</div><div class="stat-label">Exámenes rendidos</div></div><div class="panel"><div class="stat-number">'+average+'%</div><div class="stat-label">Promedio de evaluaciones</div></div><div class="panel"><div class="stat-number">'+due+'</div><div class="stat-label">Preguntas para repasar</div></div></section><div class="section"><h2>Mapa de competencias</h2></div><section class="grid two">'+tracks.map(t=>{const s=topics.find(x=>x.topic===t.id);const last=data.attempts.filter(a=>a.topic===t.id).at(-1);return '<article class="panel"><div class="row spaced"><span class="tag dim">'+t.id.toUpperCase()+'</span><span class="muted">'+(last?last.percentage+'%':'Sin evaluar')+'</span></div><h3>'+esc(t.title)+'</h3><p class="muted">'+esc(t.subtitle)+'</p><div class="progress"><span style="width:'+(last?last.percentage:0)+'%"></span></div><p class="muted small">'+(s?.passed||0)+' exámenes aprobados con ≥85%</p>'+button('Entrenar este tema','start-exam','data-topic="'+t.id+'"','alt small')+'</article>';}).join('')+'</section><div class="section"><h2>Próximo desafío</h2></div><div class="panel row spaced"><div><h3>Diagnóstico: arranque lento</h3><p class="muted">Caso práctico con hipótesis, mediciones y diagnóstico de causa raíz.</p></div>'+button('Abrir caso','start-case','data-id="case-ground"')+'</div>';}
function learn(){return heading('ACADEMIA','Tu biblioteca técnica','Seis lecciones de introducción aplicada, con fuentes públicas. El programa crecerá por etapas.')+'<section class="cards">'+lessons.map(l=>'<article class="panel lesson-card"><div><span class="tag dim">'+esc(tracks.find(t=>t.id===l.topic)?.title)+'</span><h3>'+esc(l.title)+'</h3><p class="muted">'+l.minutes+' minutos estimados</p></div>'+button('Estudiar','lesson','data-id="'+attr(l.id)+'"','alt')+'</article>').join('')+'</section>';}
function lessonView(){const l=lessons.find(x=>x.id===selectedLesson);if(!l)return learn();return button('← Volver a academia','nav','data-id="learn"','alt small')+'<div class="section"></div>'+heading('LECCIÓN · '+l.topic.toUpperCase(),l.title,'Lectura orientada a diagnóstico y evidencia.')+'<article class="panel lesson-body">'+l.sections.map(([h,t])=>'<h2>'+esc(h)+'</h2><p>'+esc(t)+'</p>').join('')+'<div class="notice">La teoría y las simulaciones de la academia no habilitan prácticas reales peligrosas. Para alta tensión seguí capacitación, equipos y procedimientos profesionales.</div><hr class="divider"/>'+link(l.url,'Abrir fuente y lecturas relacionadas')+'<div class="section">'+button('Registrar lectura y volver','complete-lesson','data-id="'+attr(l.id)+'"')+'</div></article>';}

function examMenu(){
 const stats=reviewOverview(data,questions);
 return heading('EVALUACIÓN','Exámenes y memoria de largo plazo','Corrección razonada, repasos programados con FSRS y pruebas acumulativas. La nota interna no acredita competencia profesional.')+
 '<section class="grid"><div class="panel"><div class="stat-number">'+stats.due+'</div><div class="stat-label">Preguntas vencidas para repasar</div></div>'+
 '<div class="panel"><div class="stat-number">'+stats.upcoming+'</div><div class="stat-label">Programadas para los próximos 7 días</div></div>'+
 '<div class="panel"><div class="stat-number">'+stats.untested+'</div><div class="stat-label">Preguntas sin historial</div></div></section>'+
 '<div class="section"><h2>Evaluación acumulativa</h2></div>'+
 '<div class="panel"><h3>15 preguntas · Todas las áreas</h3><p class="muted">Tres preguntas de cada una de las cinco especialidades. Las respuestas y explicaciones se muestran al finalizar. Objetivo interno: ≥85%.</p>'+
 button('Iniciar evaluación acumulativa','start-exam','data-topic="cumulative"')+'</div>'+
 '<div class="section"><h2>Exámenes por área</h2></div><div class="grid two">'+tracks.map(t=>'<div class="panel"><span class="tag dim">'+esc(t.id.toUpperCase())+'</span><h3>'+esc(t.title)+'</h3><p class="muted">'+questions.filter(q=>q.topic===t.id).length+' preguntas disponibles</p>'+button('Examinar área','start-exam','data-topic="'+t.id+'"','alt')+'</div>').join('')+'</div>'+
 '<div class="section"><h2>Repaso personalizado FSRS</h2></div>'+
 '<div class="panel"><p class="muted">'+stats.due+' preguntas vencidas; '+stats.upcoming+' próximas durante la semana. El calendario se adapta después de cada respuesta, tomando también tu confianza declarada.</p>'+
 '<div class="row">'+button('Repasar preguntas vencidas','review',stats.due===0?'disabled':'','alt')+
 button('Examen corto integral','start-exam','data-topic="all"','alt')+'</div>'+
 (stats.legacy?'<p class="muted small">'+stats.legacy+' preguntas aún conservan sus fechas del sistema anterior. Pasarán a FSRS cuando las respondas nuevamente, sin inventar un historial previo.</p>':'')+
 '<p class="muted small">FSRS es un algoritmo de programación, no una medición certificada de comprensión. Responder una opción correcta no demuestra habilidad en taller.</p></div>';
}
function startExam(topic,review=false){
 const dueSet=new Set(dueReviews(data));
 const pool=review?questions.filter(q=>dueSet.has(q.id)):questions.filter(q=>topic==='all'||topic==='cumulative'||q.topic===topic);
 if(!pool.length){toast('No hay preguntas disponibles para este repaso.');return;}
 const selected=topic==='cumulative'&&!review?selectCumulativeQuestions(pool,15):[...pool].sort(()=>Math.random()-.5).slice(0,review?15:topic==='all'?10:6);
 exam={topic,questions:selected,at:0,answers:{},confidence:{},review};
 examResult=null;page='exams';render();
}
function examView(){
 if(examResult)return examSummary();
 const q=exam.questions[exam.at],selected=exam.answers[q.id],confidence=exam.confidence[q.id]||'normal';
 const options=q.options.map((option,i)=>'<label class="option"><input type="radio" name="answer" value="'+i+'" '+(selected===i?'checked':'')+'><span>'+esc(option)+'</span></label>').join('');
 const confidenceOptions=[['low','Dudé'],['normal','Seguridad normal'],['high','Muy seguro']].map(([value,label])=>
 '<label class="option"><input type="radio" name="confidence" value="'+value+'" '+(confidence===value?'checked':'')+'><span>'+label+'</span></label>').join('');
 return '<div class="row spaced"><div class="eyebrow">'+(exam.review?'REPASO FSRS':exam.topic==='cumulative'?'EVALUACIÓN ACUMULATIVA':'EXAMEN EN CURSO')+'</div>'+button('Salir del examen','quit-exam','','alt small')+'</div>'+
 '<h1>Pregunta '+(exam.at+1)+' de '+exam.questions.length+'</h1><div class="progress"><span style="width:'+Math.round(exam.at/exam.questions.length*100)+'%"></span></div>'+
 '<section class="panel quiz"><span class="tag dim">'+esc(tracks.find(t=>t.id===q.topic)?.title)+'</span><h2>'+esc(q.question)+'</h2>'+
 '<fieldset><legend class="sr-only">Elegí una respuesta</legend>'+options+'</fieldset>'+
 '<hr class="divider"/><fieldset><legend><strong>¿Con qué seguridad respondiste?</strong></legend>'+
 '<p class="muted small">Se usa para programar el próximo repaso, nunca para convertir una respuesta incorrecta en correcta.</p>'+
 '<div class="confidence-options">'+confidenceOptions+'</div></fieldset>'+
 '<div class="row spaced" style="margin-top:18px"><p class="muted small">La corrección se muestra cuando termina el examen.</p>'+
 button(exam.at===exam.questions.length-1?'Finalizar examen':'Siguiente pregunta','advance-exam',selected===undefined?'disabled':'')+'</div></section>';
}
async function finishExam(){
 const current=exam; if(!current)return;
 const graded=scoreExam(current.questions,current.questions.map(q=>current.answers[q.id]));
 const at=new Date(),date=at.toISOString();
 data.attempts.push({id:'exam-'+Date.now(),topic:current.review?'review':current.topic,percentage:graded.percentage,at:date});
 data.attempts=data.attempts.slice(-500);
 for(const row of graded.details){
  data.reviews[row.id]=recordReview(data.reviews[row.id],row.correct,current.confidence[row.id]||'normal',at);
 }
 examResult=graded;
 await persist();render();
}
function examSummary(){
 const graded=examResult;
 const topics=[...new Set(exam.questions.map(q=>q.topic))];
 const breakdown=topics.map(topic=>{const selected=exam.questions.filter(q=>q.topic===topic);const ids=new Set(selected.map(q=>q.id));const hit=graded.details.filter(d=>ids.has(d.id)&&d.correct).length;return {topic,correct:hit,total:selected.length};});
 return heading('RESULTADOS','Evaluación finalizada','El resultado es una medición teórica y no constituye una acreditación profesional.')+
 '<div class="panel"><div class="stat-number">'+graded.percentage+'%</div><p class="muted">'+graded.correct+' de '+graded.total+' respuestas correctas</p>'+
 '<span class="tag '+(graded.percentage>=85?'':'amber')+'">'+(graded.percentage>=85?'Objetivo teórico alcanzado':'Necesitás reforzar contenidos')+'</span>'+
 '<p class="muted small" style="margin-top:15px">Las preguntas respondidas se reprogramaron con FSRS. Tus respuestas incorrectas siempre se califican como «Again» sin importar tu confianza.</p>'+
 '<div class="row" style="margin-top:16px">'+button('Volver a evaluaciones','quit-exam')+button('Estudiar módulos','nav','data-id="learn"','alt')+'</div></div>'+
 '<div class="section"><h2>Resultado por especialidad</h2></div><div class="grid">'+breakdown.map(x=>'<div class="panel"><strong>'+esc(tracks.find(t=>t.id===x.topic)?.title||x.topic)+'</strong><div class="stat-number">'+x.correct+'/'+x.total+'</div><div class="stat-label">Respuestas correctas</div></div>').join('')+'</div>'+
 '<div class="section"><h2>Corrección razonada</h2></div><section class="cards">'+exam.questions.map((q,i)=>{
  const answer=graded.details[i];
  return '<div class="panel"><div class="row spaced"><span class="tag dim">'+esc(q.topic)+'</span><strong class="'+(answer.correct?'outcome-good':'outcome-bad')+'">'+(answer.correct?'Correcta':'Incorrecta')+'</strong></div>'+
  '<h3>'+esc(q.question)+'</h3><p>Tu respuesta: '+esc(q.options[answer.selected]??'Sin responder')+'</p>'+
  '<p>Respuesta esperada: <strong>'+esc(q.options[q.answer])+'</strong></p><p class="muted">'+esc(q.explanation)+'</p>'+
  '<p class="muted small">Próximo repaso: '+esc(new Date(data.reviews[q.id].due).toLocaleString('es-AR'))+'</p>'+link(q.source,'Fuente de referencia')+'</div>';
 }).join('')+'</section>';
}

function challengeMenu(){
 return heading('RETOS DE MEDICIÓN','Pensar, calcular, justificar','Cinco situaciones sintéticas con parámetros variables. No hay opciones numéricas: escribí un resultado, seleccioná la medición relevante y fundamentá tu decisión.')+
 '<div class="panel"><span class="tag">Evaluación cuantitativa</span><h2>Una prueba por especialidad</h2>'+
 '<p class="muted">Entrená caídas de tensión, señales de actuadores, interpretación CKP, ocupación CAN y estado de carga de baterías. Cada intento cambia los valores para evitar responder de memoria.</p>'+
 '<p class="muted small">70 puntos por el cálculo dentro de la tolerancia; 30 por elegir la medición pertinente. La justificación es obligatoria pero <strong>no se evalúa semánticamente</strong>. Se exige revisión humana para validar el razonamiento.</p>'+
 button('Iniciar reto técnico','challenge-start')+'</div>';
}
function challengeView(){
 if(!quantitative)return challengeMenu();
 if(quantitativeResults)return challengeSummary();
 const q=quantitative.items[quantitative.index];
 const answer=quantitative.answers[q.id]||{value:'',measurement:'',reasoning:''};
 return '<div class="row spaced"><div class="eyebrow">ENTRENAMIENTO CUANTITATIVO</div>'+button('Abandonar intento','challenge-quit','','alt small')+'</div>'+
 '<h1>Reto '+(quantitative.index+1)+' de '+quantitative.items.length+'</h1>'+
 '<div class="progress"><span style="width:'+quantitative.index/quantitative.items.length*100+'%"></span></div>'+
 '<article class="panel"><span class="tag dim">'+esc(tracks.find(t=>t.id===q.topic)?.title||q.topic)+'</span><h2 style="margin-top:16px">'+esc(q.title)+'</h2>'+
 '<p class="muted">'+esc(q.assumption)+'</p><p>'+esc(q.prompt)+'</p>'+
 '<label for="quant-value"><strong>Resultado numérico ('+esc(q.unit)+')</strong></label>'+
 '<input id="quant-value" type="text" inputmode="decimal" autocomplete="off" maxlength="32" class="field" placeholder="Ejemplo: 12,5" value="'+attr(answer.value)+'">'+
 '<p class="muted small">Tolerancia de corrección: ± '+q.tolerance+' '+esc(q.unit)+'. No ingreses unidades en este campo.</p>'+
 '<hr class="divider"/><fieldset style="border:0;padding:0;margin:0"><legend><strong>¿Qué medición usarías para comprobarlo?</strong></legend>'+
 q.measurementOptions.map(o=>'<label class="option"><input type="radio" name="quant-evidence" value="'+attr(o.id)+'" '+(answer.measurement===o.id?'checked':'')+'><span>'+esc(o.text)+'</span></label>').join('')+
 '</fieldset><hr class="divider"/><label for="quant-reason"><strong>Fundamentá la elección y el cálculo</strong></label>'+
 '<textarea id="quant-reason" class="field" maxlength="2000" rows="5" placeholder="Explicá qué medirías, dónde y por qué el resultado apoya tu hipótesis">'+esc(answer.reasoning)+'</textarea>'+
 '<p class="muted small">Al menos 70 caracteres. La presencia del texto se controla automáticamente; la validez técnica requiere revisión por un especialista.</p>'+
 '<div class="row spaced" style="margin-top:15px"><span class="muted small">Los resultados y el desarrollo se guardan al finalizar.</span>'+
 button(quantitative.index===quantitative.items.length-1?'Corregir sesión':'Siguiente reto','challenge-next')+'</div></article>';
}
async function finishQuantitative(){
 const now=new Date().toISOString();
 const results=quantitative.items.map(q=>gradeQuantitative(q,quantitative.answers[q.id]));
 quantitativeResults=results;
 for(let i=0;i<results.length;i++){
  const q=quantitative.items[i],r=results[i],a=quantitative.answers[q.id];
  data.cases.push({id:'measure-'+q.id+'-v1',score:r.score,at:now,conclusion:String(a.value).slice(0,32),
   hypothesis:a.measurement,reasoning:a.reasoning.slice(0,2000),used:[q.id],
   passed:r.meetsAutomaticCriteria});
 }
 data.cases=data.cases.slice(-500);
 await persist();
 render();
}
function challengeSummary(){
 const results=quantitativeResults;
 const total=results.reduce((sum,x)=>sum+x.score,0);
 const ready=results.filter(x=>x.meetsAutomaticCriteria).length;
 return heading('INFORME DE PRÁCTICA','Resultados cuantitativos','Puntuación de cálculos y selección de mediciones. La explicación escrita no fue revisada técnicamente.')+
 '<div class="grid two"><div class="panel"><div class="stat-number">'+Math.round(total/results.length)+'/100</div><p class="stat-label">Promedio de componentes objetivos</p></div>'+
 '<div class="panel"><div class="stat-number">'+ready+'/'+results.length+'</div><p class="stat-label">Retos con todos los criterios estructurados cumplidos</p></div></div>'+
 '<div class="notice" style="margin-top:18px">Una nota alta no es una certificación ni demuestra que la explicación es correcta. Los datos son sintéticos y los informes requieren revisión humana.</div>'+
 '<div class="section"><h2>Corrección técnica por desafío</h2></div>'+
 '<div class="cards">'+quantitative.items.map((q,i)=>{
 const r=results[i],a=quantitative.answers[q.id];
 return '<article class="panel"><div class="row spaced"><h3>'+esc(q.title)+'</h3><span class="tag '+(r.meetsAutomaticCriteria?'':'amber')+'">'+r.score+'/100</span></div>'+
 '<p>Ingresaste: <strong>'+esc(a.value)+' '+esc(q.unit)+'</strong> · Referencia: <strong>'+q.expected+' '+esc(q.unit)+'</strong></p>'+
 '<p class="'+(r.numericCorrect?'outcome-good':'outcome-bad')+'">Cálculo: '+(r.numericCorrect?'dentro de tolerancia':'incorrecto')+'</p>'+
 '<p class="'+(r.evidenceCorrect?'outcome-good':'outcome-bad')+'">Medición elegida: '+(r.evidenceCorrect?'pertinente':'no confirma lo solicitado')+'</p>'+
 '<p><strong>Medición de referencia:</strong> '+esc(q.measurementOptions.find(x=>x.id===q.evidenceAnswer)?.text)+'</p>'+
 '<p><strong>Fórmula:</strong> '+esc(q.formula)+'</p><p class="muted">'+esc(q.assumption)+'</p>'+
 '<p class="muted small">Tu justificación quedó registrada ('+a.reasoning.trim().length+' caracteres), sin evaluación semántica.</p>'+
 link(q.source,'Consultar fuente contextual')+'</article>';
 }).join('')+'</div>'+
 '<div class="row" style="margin-top:24px">'+button('Exportar informe Markdown','challenge-export')+
 button('Nuevo intento con otros valores','challenge-start','','alt')+
 button('Volver','challenge-quit','','alt')+'</div>';
}

function caseMenu(){
 const attempts=data.cases.length;
 const best=new Map();
 for(const row of data.cases) best.set(row.id,Math.max(best.get(row.id)||0,row.score));
 return heading('TALLER VIRTUAL','Laboratorio de diagnóstico','15 escenarios sintéticos. Formulá hipótesis ANTES de medir, contrastá evidencias y emití un informe. No equivale a práctica profesional real.')+
 '<div class="panel row spaced"><div><h3>'+cases.length+' casos disponibles</h3><p class="muted">'+attempts+' intentos registrados · Los resultados requieren revisión técnica externa.</p></div><span class="tag dim">Rúbrica por evidencias</span></div>'+
 '<div class="section"><h2>Elegí un problema</h2></div><div class="grid">'+cases.map(c=>
 '<article class="panel"><div class="row spaced"><span class="tag amber">'+esc(c.difficulty)+'</span><span class="muted small">'+esc(tracks.find(t=>t.id===c.topic)?.title||c.topic)+'</span></div><h3>'+esc(c.title)+'</h3><p class="muted">'+esc(c.symptom)+'</p>'+(best.has(c.id)?'<p class="muted small">Mejor puntaje: '+best.get(c.id)+'/100</p>':'')+button('Resolver caso','start-case','data-id="'+attr(c.id)+'"')+'</article>').join('')+'</div>';
}
function startCase(id){
 const c=cases.find(c=>c.id===id);if(!c)return;
 training={id,used:[],hypothesis:'',diagnosis:'',reasoning:''};
 caseResult=null;page='cases';render();
}
function caseView(){
 const c=cases.find(c=>c.id===training.id);if(!c)return caseMenu();
 if(caseResult)return caseSummary(c);
 const choose=(field,label)=>'<label for="'+field+'">'+label+'</label><select class="field" id="'+field+'"><option value="">Elegí una hipótesis…</option>'+c.choices.map(([id,text])=>'<option value="'+attr(id)+'" '+(training[field]===id?'selected':'')+'>'+esc(text)+'</option>').join('')+'</select>';
 let page='<div class="row spaced"><div class="eyebrow">CASO SINTÉTICO · '+esc(c.difficulty)+'</div>'+button('Salir','quit-case','','alt small')+'</div>'+
 '<h1>'+esc(c.title)+'</h1><div class="panel"><h3>Síntomas iniciales</h3><p>'+esc(c.symptom)+'</p><p class="muted">'+esc(c.context)+'</p></div>'+
 '<div class="section"><h2>1. Formular hipótesis antes de medir</h2></div><div class="panel"><p class="muted">Elegí una causa inicial; podés cambiarla en el diagnóstico final. Evitá seleccionar pruebas a ciegas.</p>'+choose('hypothesis','Hipótesis inicial')+'</div>';
 if(!training.hypothesis)return page+'<div class="notice">Seleccioná una hipótesis para habilitar los instrumentos virtuales.</div>';
 page+='<div class="section"><h2>2. Elegir mediciones</h2></div><p class="muted small">Las pruebas tienen resultados predeterminados. Pueden ser más o menos informativas. Una acción improcedente anula el ejercicio.</p>'+
 '<div class="grid two">'+c.probes.map(p=>'<button class="probe panel" data-action="probe" data-id="'+attr(p.id)+'" '+(training.used.includes(p.id)?'disabled':'')+'>'+esc(p.label)+(training.used.includes(p.id)?' ✓':'')+'</button>').join('')+'</div>'+
 '<div class="section"><h2>Registro de evidencia</h2></div><div class="panel stack">'+(training.used.length?training.used.map(id=>{const p=c.probes.find(p=>p.id===id);return '<div class="answer-card"><strong>'+esc(p.label)+'</strong><p class="muted">'+esc(p.result)+'</p></div>';}).join(''):'<p class="muted">Todavía no solicitaste ninguna prueba.</p>')+'</div>'+
 '<div class="section"><h2>3. Emitir conclusión documentada</h2></div>'+
 '<div class="panel">'+choose('diagnosis','Causa que mejor explica los resultados')+
 '<label for="reasoning" style="display:block;margin-top:18px">Explicá qué medición confirma la causa y qué alternativa descartaste</label>'+
 '<textarea class="field" id="reasoning" maxlength="3000" rows="5" placeholder="Registrá tu evidencia y razonamiento (mínimo 60 caracteres).">'+esc(training.reasoning)+'</textarea>'+
 '<div class="row spaced"><span id="case-reason-count" class="muted small">'+training.reasoning.trim().length+'/60 caracteres mínimos</span>'+
 '<span class="muted small">Puntaje interno, no acreditación profesional</span></div>'+
 button('Evaluar diagnóstico','finish-case',(!training.used.length||!training.diagnosis||training.reasoning.trim().length<60)?'disabled id="case-finish"':'id="case-finish"')+'</div>';
 return page;
}
function caseSummary(c){
 const s=caseResult;
 const note=s.unsafe?'Se seleccionó una acción insegura: el ejercicio queda automáticamente desaprobado.':
 !s.hasConfirm?'La causa no está respaldada por una prueba confirmatoria.':
 !s.accurate?'La hipótesis final no coincide con los resultados de este escenario.':
 !s.documented?'La documentación es insuficiente.':
 'La rúbrica automática se superó; falta revisión humana del razonamiento escrito.';
 const labels=[['Causa raíz','rootCause'],['Evidencia confirmatoria','confirmingEvidence'],['Hipótesis previa','initialHypothesis'],['Documentación presente','documentation'],['Disciplina de pruebas','measurementDiscipline']];
 return heading('INFORME DE SIMULACIÓN','Resultado: '+s.score+'/100','Este puntaje mide reglas observables, no la validez semántica de tu justificación ni competencia práctica acreditada.')+
 '<div class="panel"><div class="row spaced"><span class="tag '+(s.passed?'':'amber')+'">'+(s.passed?'Criterios automáticos superados':'Requiere más práctica')+'</span><strong>'+esc(c.title)+'</strong></div>'+
 '<p style="margin-top:18px">Causa seleccionada: '+esc(c.choices.find(x=>x[0]===training.diagnosis)?.[1])+'</p>'+
 '<p class="muted">'+esc(c.reason)+'</p><div class="notice">'+esc(note)+'</div>'+
 '<div class="section"><h2>Desglose automático</h2></div>'+
 labels.map(([name,key])=>'<div class="row spaced" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>'+esc(name)+'</span><strong>'+s.breakdown[key]+' puntos</strong></div>').join('')+
 '<div class="section"><h2>Tu razonamiento escrito</h2></div><p>'+esc(training.reasoning)+'</p>'+
 '<p class="muted small">La presencia y longitud del texto se evalúan automáticamente; no se verifica que sus afirmaciones sean correctas. Si querés acreditar competencia real, solicitá revisión a un profesional.</p>'+
 '<div class="row">'+button('Descargar informe (.md)','export-report')+button('Volver al taller','quit-case','','alt')+button('Reintentar','start-case','data-id="'+attr(c.id)+'"','alt')+'</div></div>';
}

function canSummary(){return analyzeCanFrames(labState.capture.frames);}
function canTableRows(){
 const frames=labState.capture.frames.filter(f=>labState.selectedId==='all'||f.id===labState.selectedId);
 const batch=frames.slice(labState.offset,labState.offset+80);
 return batch.length?batch.map(f=>'<tr><td>'+esc(f.time===null?'—':f.time.toFixed(3))+'</td><td>'+esc(f.interface)+'</td><td><strong>'+esc(f.id)+'</strong></td><td>'+f.bytes.length+'</td><td class="mono">'+esc(f.bytes.map(v=>v.toString(16).toUpperCase().padStart(2,'0')).join(' '))+'</td></tr>').join(''):'<tr><td colspan="5">No hay mensajes con ese filtro.</td></tr>';
}

function bmsPlot(points,key,title,min,max,referenceKey=null){
 const w=660,h=230,px=54,py=16,cw=570,ch=164;
 const values=points.map(p=>p[key]).filter(Number.isFinite),ref=referenceKey?points.map(p=>p[referenceKey]).filter(Number.isFinite):[];
 if(!values.length)return '<div class="panel"><p>No hay datos para graficar.</p></div>';
 const all=[...values,...ref];
 const lo=min===null?Math.min(...all):min,hi=max===null?Math.max(...all):max;
 const range=Math.max(1e-9,hi-lo);
 const t0=points[0].t_s,t1=points.at(-1).t_s,dt=Math.max(1e-9,t1-t0);
 const scaleX=t=>px+((t-t0)/dt)*cw;
 const scaleY=v=>py+ch-(v-lo)/range*ch;
 const path=k=>points.filter(p=>Number.isFinite(p[k])).map((p,i)=>(i===0?'M':'L')+scaleX(p.t_s).toFixed(2)+' '+scaleY(p[k]).toFixed(2)).join(' ');
 return '<div class="panel"><h3>'+esc(title)+'</h3><svg class="bms-chart" role="img" aria-label="'+esc(title)+'; curva basada en muestras del laboratorio" viewBox="0 0 '+w+' '+h+'">'+
 '<rect x="'+px+'" y="'+py+'" width="'+cw+'" height="'+ch+'" rx="7" fill="#0a1928"/>'+
 [0,0.25,0.5,0.75,1].map(f=>{const y=py+ch*(1-f);return '<line x1="'+px+'" y1="'+y.toFixed(1)+'" x2="'+(px+cw)+'" y2="'+y.toFixed(1)+'" stroke="#304b62" stroke-width="1"/><text x="'+(px-7)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end" font-size="11" fill="#a9becf">'+(lo+range*f).toFixed(1)+'</text>';}).join('')+
 '<path d="'+path(key)+'" stroke="#65dfc5" fill="none" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'+
 (referenceKey&&ref.length?'<path d="'+path(referenceKey)+'" stroke="#ffb76a" fill="none" stroke-dasharray="7 5" stroke-width="2.5"/>':'')+
 '<text x="'+px+'" y="'+(h-10)+'" font-size="11" fill="#a9becf">'+(t0/3600).toFixed(2)+' h</text>'+
 '<text x="'+(px+cw)+'" y="'+(h-10)+'" text-anchor="end" font-size="11" fill="#a9becf">'+(t1/3600).toFixed(2)+' h</text></svg>'+
 '<p class="muted small"><span style="color:var(--mint)">━━</span> Estimación/medición'+(referenceKey&&ref.length?' · <span style="color:var(--amber)">┅┅</span> '+(bmsState.dataset.scenarioId?'Referencia sintética':'Referencia declarada (sin verificar)'):'')+'</p></div>';
}
function bmsView(){
 const scenario=BMS_SCENARIOS.find(x=>x.id===bmsState.scenarioId);
 const result=analyzeBms(bmsState.dataset.rows,{capacityAh:bmsState.capacityAh,initialSocPct:bmsState.initialSocPct,biasCorrectionA:bmsState.biasCorrectionA});
 const q=bmsState.dataset.scenarioId?bmsQuestion(bmsState.dataset.scenarioId):null;
 const net=n=>Number(n).toFixed(2);
 let body='<h2>Laboratorio BMS y estimación de SOC/SOH</h2><p class="muted">Curvas, integración de corriente y fallas sintéticas. Los modelos físicos más avanzados se ejecutan con PyBaMM fuera del navegador.</p>';
 body+='<div class="notice"><strong>Laboratorio educativo, no instrumento de diagnóstico HV.</strong> Las señales son virtuales o provienen de CSV aportados por el usuario; no se verifica procedencia, química, calibración ni condiciones de ensayo. No abrir ni medir paquetes de alta tensión como parte de esta actividad.</div>';
 body+='<div class="grid two" style="margin-top:18px"><div class="panel"><h3>Escenario didáctico</h3><label for="bms-scenario">Conjunto de datos</label><select class="field" id="bms-scenario">'+
 BMS_SCENARIOS.map(x=>'<option value="'+x.id+'" '+(x.id===bmsState.scenarioId?'selected':'')+'>'+esc(x.title)+'</option>').join('')+'</select>'+
 '<p class="muted small">'+esc(scenario?.description||'Captura CSV personalizada')+'</p>'+
 '<div class="row">'+button('Restaurar muestra','bms-reset','','alt')+'<label for="bms-file" class="button">Importar CSV</label><input type="file" id="bms-file" class="sr-only" accept=".csv,text/csv"></div>'+
 '<p class="muted small">Formato: t_s,current_a,voltage_v y opcional soc_reference_pct. Corriente positiva = descarga. Hasta 2000 filas / 500 KB; se procesa solo en este navegador.</p>'+
 button('Descargar CSV del escenario','bms-export','','alt small')+
 '<p class="muted small">Origen: '+esc(bmsState.dataset.source)+'</p></div>'+
 '<div class="panel"><h3>Parámetros del estimador</h3>'+
 '<label for="bms-capacity">Capacidad supuesta (Ah)</label><input class="field" id="bms-capacity" type="number" min="0.1" max="2000" step="0.1" value="'+bmsState.capacityAh+'">'+
 '<label for="bms-initial">SOC inicial supuesto (%)</label><input class="field" id="bms-initial" type="number" min="0" max="100" step="1" value="'+bmsState.initialSocPct+'">'+
 '<label for="bms-bias">Corrección de sesgo sensor (A)</label><input class="field" id="bms-bias" type="number" min="-50" max="50" step="0.1" value="'+bmsState.biasCorrectionA+'">'+
 '<div class="row" style="margin-top:15px">'+button('Recalcular curva','bms-recalculate')+'</div>'+
 '<p class="muted small">Integración trapezoidal: SOC(t) = SOC₀ − ∫ I(t)dt / capacidad. No estima la capacidad real a partir de una descarga parcial.</p></div></div>';
 body+='<div class="section"><h2>Resultados de la simulación o captura</h2></div><div class="grid">'+
 [['SOC calculado',net(result.finalSocPct)+'%'],['Descarga acumulada',net(result.dischargeAh)+' Ah'],['Error frente a referencia',result.finalErrorPp===null?'Sin referencia':(result.finalErrorPp>=0?'+':'')+net(result.finalErrorPp)+' pp']].map(([label,value])=>'<div class="panel"><div class="stat-number">'+esc(value)+'</div><div class="stat-label">'+esc(label)+'</div></div>').join('')+'</div>';
 if(result.warnings.length)body+='<div class="notice" style="margin-top:16px">'+result.warnings.map(w=>esc(w)).join(' ')+'</div>';
 body+='<div class="grid two" style="margin-top:17px">'+bmsPlot(result.series,'soc_est_pct','Evolución SOC estimado (%)',0,100,'soc_reference_pct')+
 bmsPlot(result.series,'voltage_v','Tensión registrada (V)',null,null)+'</div>';
 body+='<div class="panel" style="margin-top:16px"><h3>Estado de salud por capacidad (SOH) — cálculo independiente</h3>'+
 '<p class="muted">El SOH por capacidad requiere un ensayo <strong>completo, comparable y validado externamente</strong>. No surge automáticamente de las curvas anteriores.</p><div class="grid two">'+
 '<div><label for="bms-full-measured">Capacidad útil en ensayo completo (Ah)</label><input id="bms-full-measured" class="field" type="number" min="0.01" step="0.1" value="'+bmsState.fullCapacityAh+'"></div>'+
 '<div><label for="bms-full-new">Capacidad de referencia del ensayo (Ah)</label><input id="bms-full-new" class="field" type="number" min="0.01" step="0.1" value="'+bmsState.baselineCapacityAh+'"></div></div>'+
 '<div class="row" style="margin-top:14px">'+button('Calcular relación de capacidades','bms-soh')+'<strong id="bms-soh-result">Ejemplo: '+net(capacitySohPct(bmsState.fullCapacityAh,bmsState.baselineCapacityAh))+'%</strong></div>'+
 '<p class="muted small">Ejemplo ilustrativo. No constituye un SOH certificado; otras definiciones usan resistencia, energía, temperatura y condiciones de prueba distintas.</p></div>';
 if(q){
  body+='<div class="section"><h2>Desafío de diagnóstico BMS</h2></div><div class="panel"><span class="tag amber">PRÁCTICA SINTÉTICA</span><h3>'+esc(q.prompt)+'</h3>'+
  '<div class="stack">'+q.options.map(([id,label])=>'<label class="option"><input type="radio" name="bms-answer" value="'+esc(id)+'" '+(bmsState.answer===id?'checked':'')+'>'+esc(label)+'</label>').join('')+'</div>'+
  '<div class="row" style="margin-top:15px">'+button('Corregir desafío','bms-grade')+'</div>'+
  (bmsState.feedback?'<div class="result">'+esc(bmsState.feedback)+'</div>':'')+'</div>';
 }else{
  body+='<div class="panel" style="margin-top:17px"><h3>Importación personalizada</h3><p class="muted">No se asigna una respuesta correcta sin conocer el origen y las condiciones de este conjunto de datos. Podés investigar sus curvas, pero una respuesta oficial sería especulativa.</p></div>';
 }
 body+='<div class="section"><h2>Modelado físico con PyBaMM</h2></div>'+
 '<div class="panel"><p>AutoLab <strong>no implementa por su cuenta un modelo electroquímico</strong>. Para modelos SPM/DFN, utilizá el script complementario en Python con PyBaMM, exportá su serie temporal a CSV y cargala en este laboratorio.</p>'+
 '<div class="row"><a class="button alt" href="https://github.com/barbasmarcosi/AutoLab-Academy/blob/main/tools/pybamm_export.py" target="_blank" rel="noopener noreferrer">Ver script PyBaMM</a>'+
 '<a class="button alt" href="https://docs.pybamm.org/" target="_blank" rel="noopener noreferrer">Documentación oficial</a>'+
 '<a class="button alt" href="https://github.com/barbasmarcosi/AutoLab-Academy/actions/workflows/science-pybamm.yml" target="_blank" rel="noopener noreferrer">Resultados PyBaMM verificados</a></div>'+
 '<p class="muted small">Para analizar modelos científicos sin instalar Python, abrí una ejecución exitosa de la CI científica, descargá el artefacto <strong>autolab-pybamm-validated-csv</strong>, extraé el archivo SPM o DFN e importalo aquí. Los artefactos vencen y cada CSV lleva un archivo .metadata.json con la versión del modelo y hash SHA-256.</p>'+
 '<p class="muted small">El modelo científico corre fuera de la PWA. Una exportación sin SOC de referencia se muestra únicamente como estimación por integración; jamás se atribuye una curva sintética a PyBaMM. Simulación ≠ validación experimental.</p></div>';
 return body;
}

function labView(){
 const mode=labState.mode;
 let body=heading('LABORATORIOS','Instrumentación y simulación','Entornos de entrenamiento. CAN es lectura de archivos sin conexión; CircuitJS es una herramienta externa y requiere Internet.');
 body+='<div class="row" style="margin:0 0 22px">'+button('Analizador CAN','lab-mode','data-id="can"',mode==='can'?'':'alt')+button('Baterías / BMS','lab-mode','data-id="bms"',mode==='bms'?'':'alt')+button('Circuitos con CircuitJS','lab-mode','data-id="circuit"',mode==='circuit'?'':'alt')+'</div>';
 if(mode==='bms')return body+bmsView();
 if(mode==='circuit'){
  body+='<div class="panel"><span class="tag dim">HERRAMIENTA EXISTENTE · EXTERNA</span><h2>Simulador CircuitJS1 / Falstad</h2>'+
  '<p class="muted">Estudiá circuitos de 12 V, divisores resistivos, transistores y señales. El motor pertenece a CircuitJS; AutoLab no lo reimplementa.</p>'+
  '<p class="notice">La integración a continuación carga un sitio de terceros y requiere Internet. No se garantiza uso offline ni control programático por la política de mismo origen. No simules conexiones reales a HV.</p>'+
  '<div class="row">'+(labState.circuitLoaded?button('Ocultar simulador','lab-toggle-circuit','','alt'):button('Cargar simulador externo','lab-toggle-circuit'))+
  '<a class="button alt" href="https://www.falstad.com/circuit/" target="_blank" rel="noopener noreferrer">Abrir en pestaña nueva</a></div>'+
  (labState.circuitLoaded?'<div class="circuit-frame"><iframe title="CircuitJS1 — simulador externo" src="https://www.falstad.com/circuit/circuitjs.html" loading="lazy" referrerpolicy="no-referrer" allowfullscreen></iframe></div><p class="muted small">Si el navegador bloquea el iframe, usá «Abrir en pestaña nueva». El simulador externo no comparte tu progreso local.</p>':'')+
  '</div><div class="section"><h2>Prácticas sugeridas</h2></div><div class="grid two">'+[
  ['Divisor resistivo 12 V','Construí un circuito de dos resistencias y compará tensiones en ambos nodos. Registrá cómo cambia al modificar una resistencia.'],
  ['Filtro RC y transitorios','Variá R y C para observar cómo cambia el tiempo de respuesta de una señal rectangular.'],
  ['Conmutación de carga de baja tensión','Probá un transistor como interruptor y compará corriente de base/gate, carga y disipación conceptual.']
  ].map(([name,description])=>'<article class="panel"><h3>'+esc(name)+'</h3><p class="muted">'+esc(description)+'</p></article>').join('')+'</div>';
  return body;
 }
 const stats=canSummary(),count=stats.frameCount,filtered=labState.selectedId==='all'?count:stats.ids.find(x=>x.id===labState.selectedId)?.count||0;
 body+='<div class="notice">Solo analiza capturas de CAN clásico en formato can-utils candump (.log/.txt). No transmite tramas, no interpreta DBC ni diagnostica automáticamente vehículos. No cargues datos privados de clientes sin autorización.</div>'+
 '<div class="panel"><div class="row spaced"><div><h2>Analizador CAN de solo lectura</h2><p class="muted">Entrenamiento con datos sintéticos o archivo local, sin carga a servidores.</p></div><span class="tag">'+(labState.sample?'Datos sintéticos':'Archivo local')+'</span></div>'+
 '<div class="row">'+button('Restaurar ejemplo','lab-sample','','alt')+'<label for="can-file" class="button">Importar candump</label><input id="can-file" class="sr-only" type="file" accept=".log,.txt,text/plain">'+
 '<a href="https://github.com/linux-can/can-utils" target="_blank" rel="noopener noreferrer" class="button alt">Documentación can-utils</a></div>'+
 '<p class="muted small">Admite timestamps opcionales, IDs CAN de 11/29 bits y hasta 8 bytes; máximo 1 MB / 12.000 líneas. CAN FD/RTR, errores y otras sintaxis se descartan con contador visible.</p></div>';
 body+='<div class="section"><h2>Resumen de captura</h2></div><div class="grid">'+[
  [String(count),'Tramas válidas'],[String(stats.uniqueIds),'IDs diferentes'],[String(labState.capture.skipped),'Líneas omitidas']
 ].map(([n,label])=>'<div class="panel"><div class="stat-number">'+n+'</div><div class="stat-label">'+esc(label)+'</div></div>').join('')+'</div>'+
 '<div class="panel" style="margin-top:14px"><p class="muted">Duración observada: '+(stats.durationSeconds===null?'sin timestamps':stats.durationSeconds.toFixed(3)+' s')+' · Canales: '+esc(stats.observedInterfaces.join(', ')||'ninguno')+'</p>'+
 '<p class="muted small">La separación temporal refleja timestamps del registro, no prueba pérdidas en la red. Los ID y la carga útil no identifican por sí solos sensores ni causas.</p></div>';
 body+='<div class="section"><h2>Decodificación DBC real</h2></div>'+
 '<div class="panel"><div class="row spaced"><div><h3>Interpretar señales CAN mediante un archivo DBC</h3><p class="muted">Motor de terceros: Candied 2.2.0. Los mensajes se interpretan solo si el archivo DBC cargado define ese ID y sus señales. No presupone equivalencias entre marcas.</p></div>'+
 (labState.dbc?'<span class="tag">DBC activo</span>':'<span class="tag dim">Sin DBC</span>')+'</div>'+
 '<div class="row">'+button('Cargar DBC didáctico','lab-load-dbc-sample','','alt')+
 '<label class="button" for="dbc-file">Importar archivo .dbc</label><input id="dbc-file" class="sr-only" type="file" accept=".dbc,text/plain">'+
 (labState.dbc?button('Quitar DBC','lab-clear-dbc','','alt'):'')+'</div>'+
 '<p class="muted small">Se procesa íntegramente en este navegador (máximo 600 KB). No almacena tu DBC ni lo envía a un servidor. La integración admite los formatos compatibles con Candied; revisá sus límites antes de analizar señales importantes.</p>'+
 (labState.dbc?'<p><strong>Base seleccionada: '+esc(labState.dbcLabel)+'</strong></p>':'')+
 (labState.dbcError?'<div class="notice">'+esc(labState.dbcError)+'</div>':'')+'</div>';
if(labState.dbc){
 let report;
 try{report=decodeFramesWithDbc(labState.dbc,labState.capture.frames,400);}catch(e){report={decoded:[],missing:[],errors:[],errorCount:0,examined:0};}
 const rows=report.decoded.slice(0,60);
 body+='<div class="panel" style="margin-top:14px"><div class="row spaced"><h3>Valores interpretados con la base cargada</h3><span class="tag dim">'+report.decoded.length+' tramas decodificadas</span></div>'+
 '<p class="muted small">Analiza como máximo las primeras '+report.examined+' tramas de la captura; presenta 60 filas. Sin definición DBC no es posible inferir unidades, escalas ni semántica.</p>'+
 (report.missing.length?'<p class="muted small">IDs sin definición: '+esc(report.missing.slice(0,20).join(', '))+(report.missing.length>20?'…':'')+'</p>':'')+
 (report.errorCount?'<div class="notice">'+report.errorCount+' tramas no se pudieron decodificar con este DBC; comprobá formato y DLC.</div>':'')+
 '<div class="table-wrap"><table class="frame-table"><thead><tr><th>ID</th><th>Mensaje</th><th>Señales según DBC</th></tr></thead><tbody>'+
 (rows.length?rows.map(r=>'<tr><td class="mono">0x'+esc(r.id)+'</td><td>'+esc(r.message)+'</td><td>'+r.signals.map(sig=>'<div><strong>'+esc(sig.name)+'</strong>: '+esc(sig.physical)+'</div>').join('')+'</td></tr>').join(''):'<tr><td colspan="3">No hay tramas decodificables con la base actual.</td></tr>')+
 '</tbody></table></div>'+
 (labState.sample&&labState.dbcLabel==='AutoLab synthetic v1 (educativa)'&&report.decoded.some(r=>r.id==='120')?'<div class="section"><h3>Práctica DBC: aplicar el factor de escala</h3></div><p class="muted">En la primera trama 0x120 de este ejemplo sintético, el valor bruto RPM es 3120. El factor de escala del DBC es 0,25 y el offset es 0. ¿Qué RPM física corresponde?</p><label for="lab-dbc-answer">Elegí el resultado</label><select class="field" id="lab-dbc-answer"><option value="">Seleccionar…</option><option value="780" '+(labState.dbcAnswer==='780'?'selected':'')+'>780 rpm</option><option value="3120" '+(labState.dbcAnswer==='3120'?'selected':'')+'>3120 rpm</option><option value="195" '+(labState.dbcAnswer==='195'?'selected':'')+'>195 rpm</option></select><div class="row" style="margin-top:12px">'+button('Corregir DBC','lab-grade-dbc')+'</div>'+(labState.dbcFeedback?'<div class="result">'+esc(labState.dbcFeedback)+'</div>':''):'')+
 '</div>';
}

body+='<div class="section"><h2>Análisis de mensajes por ID</h2></div><div class="grid two">'+stats.ids.slice(0,30).map(x=>
 '<div class="panel"><div class="row spaced"><h3>0x'+esc(x.id)+'</h3><span class="tag dim">'+x.count+' tramas</span></div><p class="muted small">DLC: '+esc(x.dlcs.join(', '))+' · Cargas distintas: '+x.distinctPayloads+'</p>'+
 '<p class="muted small">Intervalo mediano: '+(x.medianGapMs===null?'N/D':x.medianGapMs.toFixed(1)+' ms')+' · Máximo: '+(x.maxGapMs===null?'N/D':x.maxGapMs.toFixed(1)+' ms')+'</p>'+
 '<p class="'+(x.gapCandidate?'outcome-bad':'muted')+' small">'+(x.gapCandidate?'Pausa inusual por heurística: investigar':'Sin pausa marcada por la heurística')+'</p></div>').join('')+'</div>';
 if(!stats.ids.length)body+='<div class="panel"><p>No se encontraron tramas de datos CAN clásico. Verificá que sea un registro candump compatible.</p></div>';
 body+='<div class="section"><h2>Inspector de tramas</h2></div><div class="panel"><label for="lab-id-filter">Filtrar por ID de arbitraje</label>'+
 '<select id="lab-id-filter" class="field"><option value="all">Todos los IDs</option>'+stats.ids.map(x=>'<option value="'+esc(x.id)+'" '+(labState.selectedId===x.id?'selected':'')+'>0x'+esc(x.id)+'</option>').join('')+'</select>'+
 '<div class="table-wrap"><table class="frame-table"><thead><tr><th>Timestamp</th><th>Bus</th><th>ID</th><th>DLC</th><th>Payload (hex)</th></tr></thead><tbody>'+canTableRows()+'</tbody></table></div>'+
 '<div class="row spaced"><span class="muted small">Mostrando '+(filtered?labState.offset+1:0)+'–'+Math.min(filtered,labState.offset+80)+' de '+filtered+'</span>'+
 '<div class="row">'+button('Anterior','lab-prev',labState.offset===0?'disabled':'','alt small')+button('Siguiente','lab-next',labState.offset+80>=filtered?'disabled':'','alt small')+'</div></div></div>';
 if(labState.sample){
  const ex=decodeSyntheticSample(labState.capture.frames);
  body+='<div class="section"><h2>Práctica guiada: detectar una anomalía</h2></div><div class="panel">'+
  '<p>En esta captura <strong>completamente sintética</strong>, ID 0x120 contiene RPM codificadas como un entero little-endian de 16 bits multiplicado por 0,25; ID 0x220 transporta una temperatura ficticia. Esas convenciones no se aplican a vehículos reales.</p>'+
  '<p class="muted">Decodificación de muestra 0x120: '+ex.slice(0,5).map(x=>x.rpm+' rpm').join(' · ')+'</p>'+
  '<label for="lab-answer">¿Qué ID presenta una pausa inusual respecto de su periodicidad?</label>'+
  '<select id="lab-answer" class="field"><option value="">Seleccionar…</option><option value="120">0x120</option><option value="220">0x220</option><option value="both">Ambos por igual</option></select>'+
  '<div class="row" style="margin-top:12px">'+button('Corregir práctica','lab-grade')+'</div>'+
  (labState.feedback?'<div class="result">'+esc(labState.feedback)+'</div>':'')+
  '</div>';
 }
 return body;
}

function resourceView(){return heading('FUENTES Y HERRAMIENTAS','Biblioteca externa','Priorizamos documentación pública y software maduro. Algunos recursos requieren conexión o instalación en PC.')+'<section class="cards">'+resources.map(r=>'<div class="panel"><span class="tag dim">'+esc(r.topic)+'</span><h3>'+esc(r.title)+'</h3>'+link(r.url,'Abrir recurso oficial')+'</div>').join('')+'</section><div class="section"><h2>Laboratorios prácticos</h2></div><div class="panel"><p class="muted">Ya podés importar capturas candump y analizar una muestra CAN sintética; CircuitJS está disponible como herramienta externa integrada bajo demanda. PyBaMM continúa pendiente.</p>'+button('Ir a laboratorios','nav','data-id="labs"')+'</div>';}
function dataView(){return heading('DATOS PERSONALES','Tu progreso te pertenece','Se guarda en IndexedDB de este navegador. Si cambiás de equipo o borrás datos del sitio, necesitás un respaldo.')+'<div class="grid two"><div class="panel"><h3>Exportar respaldo</h3><p class="muted">Descarga un JSON portable con intentos, resultados de casos, repeticiones y notas.</p>'+button('Descargar respaldo','export')+'</div><div class="panel"><h3>Importar respaldo</h3><p class="muted">Reemplaza el progreso local luego de validar el archivo. Guardá una copia antes de importar.</p><label class="button alt" for="import-file">Elegir archivo JSON</label><input class="sr-only" type="file" id="import-file" accept=".json,application/json"></div></div><div class="section"><h2>Notas privadas</h2></div><div class="panel"><label for="notebook">Hipótesis, dudas y procedimientos aprendidos</label><textarea class="field" id="notebook" maxlength="10000">'+esc(data.notes.general||'')+'</textarea><div class="row" style="margin-top:14px">'+button('Guardar notas','save-notes')+'</div></div><div class="section"><h2>Reinicio</h2></div><div class="panel"><p class="muted">Borrar todo es irreversible si no conservás una exportación.</p>'+button('Borrar progreso local','reset','','danger')+'</div>';}
function render(){let body=page==='home'?home():page==='learn'?(selectedLesson?lessonView():learn()):page==='exams'?(exam?examView():examMenu()):page==='cases'?(training?caseView():caseMenu()):page==='challenges'?(quantitative?challengeView():challengeMenu()):page==='labs'?labView():page==='resources'?resourceView():dataView();layout(body);}
document.addEventListener('input',event=>{
 if(!quantitative||quantitativeResults)return;
 const id=event.target.id;
 if(id!=='quant-value'&&id!=='quant-reason')return;
 const q=quantitative.items[quantitative.index];
 const a=quantitative.answers[q.id]||(quantitative.answers[q.id]={value:'',measurement:'',reasoning:''});
 if(id==='quant-value')a.value=event.target.value;
 if(id==='quant-reason')a.reasoning=event.target.value;
});
document.addEventListener('change',event=>{if(event.target.name==='quant-evidence'&&quantitative&&!quantitativeResults){const q=quantitative.items[quantitative.index];const a=quantitative.answers[q.id]||(quantitative.answers[q.id]={value:'',measurement:'',reasoning:''});a.measurement=event.target.value;}if(event.target.name==='answer'&&exam){exam.answers[exam.questions[exam.at].id]=Number(event.target.value);render();}if(event.target.name==='confidence'&&exam){exam.confidence[exam.questions[exam.at].id]=event.target.value;render();}if(event.target.id==='hypothesis'&&training){training.hypothesis=event.target.value;render();}if(event.target.id==='diagnosis'&&training){training.diagnosis=event.target.value;render();}if(event.target.id==='lab-id-filter'){
 labState.selectedId=event.target.value;labState.offset=0;render();
}
if(event.target.id==='lab-answer'){labState.answer=event.target.value;}
if(event.target.id==='lab-dbc-answer'){labState.dbcAnswer=event.target.value;}
if(event.target.id==='dbc-file'){
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>MAX_DBC_BYTES){toast('La base DBC supera 600 KB',true);return;}
 file.text().then(t=>{
  const parsed=loadDbc(t);
  labState.dbc=parsed;labState.dbcLabel=file.name.slice(0,100);labState.dbcError='';labState.dbcAnswer='';labState.dbcFeedback='';render();
  toast('DBC cargado; las señales se interpretan en el navegador.');
 }).catch(error=>{labState.dbcError=String(error.message||error);render();toast('No se pudo interpretar el DBC',true);});
}
if(event.target.name==='bms-answer'){bmsState.answer=event.target.value;}
if(event.target.id==='bms-scenario'){
 bmsState.scenarioId=event.target.value;
 bmsState.dataset=generateSyntheticBms(bmsState.scenarioId);
 bmsState.capacityAh=60;bmsState.initialSocPct=100;bmsState.biasCorrectionA=0;
 bmsState.answer='';bmsState.feedback='';bmsState.name='Escenario sintético';
 render();
}
if(event.target.id==='bms-file'){
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>MAX_BMS_FILE_BYTES){toast('CSV superior a 500 KB',true);return;}
 file.text().then(t=>{
  bmsState.dataset=parseBmsCsv(t);bmsState.scenarioId='';bmsState.name=file.name.slice(0,100);bmsState.answer='';bmsState.feedback='';
  render();toast('Archivo BMS analizado localmente: '+bmsState.dataset.rows.length+' muestras.');
 }).catch(error=>toast('CSV incompatible: '+String(error?.message||error),true));
}
if(event.target.id==='can-file'){
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>MAX_CAN_INPUT){toast('El archivo supera 1 MB',true);return;}
 file.text().then(text=>{
  const parsed=parseCandump(text);
  if(!parsed.frames.length){toast('No se encontraron tramas CAN clásico compatibles.',true);return;}
  labState={...labState,mode:'can',sample:false,capture:parsed,selectedId:'all',offset:0,answer:'',feedback:''};
  render();toast('Captura importada localmente: '+parsed.frames.length+' tramas.');
 }).catch(error=>toast('No se pudo analizar la captura: '+error.message,true));
}
if(event.target.id==='import-file'){const file=event.target.files?.[0];if(!file)return;if(file.size>2000000){toast('Archivo demasiado grande',true);return;}file.text().then(async text=>{const recovered=parseBackup(text);if(!confirm('¿Restaurar el respaldo y reemplazar todos los datos actuales?'))return;await saveProgress(recovered);data=recovered;nav('home');toast('Respaldo restaurado correctamente');}).catch(e=>toast('No se pudo importar: '+e.message,true));}});
document.addEventListener('click',async event=>{const target=event.target.closest('[data-action]');if(!target||target.disabled)return;const act=target.dataset.action;const id=target.dataset.id;switch(act){case'nav':selectedLesson=null;nav(id);break;
case'challenge-start':
 quantitative={...buildQuantitativeSession(Date.now()),index:0,answers:{}};
 quantitativeResults=null;page='challenges';render();break;
case'challenge-quit':quantitative=null;quantitativeResults=null;render();break;
case'challenge-next':{
 if(!quantitative||quantitativeResults)return;
 const q=quantitative.items[quantitative.index],a=quantitative.answers[q.id]||{};
 try{parseNumericAnswer(a.value);}catch(e){toast(e.message,true);break;}
 if(!q.measurementOptions.some(o=>o.id===a.measurement)){toast('Elegí una medición para justificar el cálculo.',true);break;}
 if(String(a.reasoning||'').trim().length<70){toast('Agregá una justificación técnica de al menos 70 caracteres.',true);break;}
 if(quantitative.index<quantitative.items.length-1){quantitative.index++;render();}
 else await finishQuantitative();
 break;
}
case'challenge-export':{
 if(!quantitative||!quantitativeResults)return;
 const content=formatQuantitativeReport(quantitative,quantitative.answers,quantitativeResults);
 const file=new Blob([content],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(file),a=document.createElement('a');
 a.href=url;a.download='autolab-reto-mediciones-'+new Date().toISOString().slice(0,10)+'.md';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
}
case'lab-load-dbc-sample':{
 try{
  const r=await fetch('./samples/autolab-synthetic.dbc');
  if(!r.ok)throw Error('No se encuentra el DBC de ejemplo ('+r.status+')');
  labState.dbc=loadDbc(await r.text());
  labState.dbcLabel='AutoLab synthetic v1 (educativa)';labState.dbcError='';labState.dbcAnswer='';labState.dbcFeedback='';render();toast('DBC didáctico cargado.');
 }catch(e){labState.dbcError=String(e?.message||e);render();toast('Error al cargar DBC sintético',true);}
 break;
}
case'lab-grade-dbc':{
 if(!labState.sample||labState.dbcLabel!=='AutoLab synthetic v1 (educativa)'){toast('Esta práctica requiere la base DBC sintética incluida en AutoLab.');break;}
 if(!labState.dbcAnswer){toast('Elegí una respuesta antes de corregir.');break;}
 const ok=labState.dbcAnswer==='780';
 labState.dbcFeedback=ok?'Correcto. 3120 × 0,25 + 0 = 780 rpm. El DBC define la escala; otros vehículos pueden usar otra convención.':'Revisá factor y offset: valor físico = valor bruto × factor + offset.';
 data.cases.push({id:'lab-dbc-scaling-v1',score:ok?100:0,at:new Date().toISOString(),conclusion:labState.dbcAnswer});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'lab-clear-dbc':labState.dbc=null;labState.dbcLabel='';labState.dbcError='';labState.dbcAnswer='';labState.dbcFeedback='';render();break;
case'bms-reset':
 bmsState.dataset=generateSyntheticBms(bmsState.scenarioId||'nominal');bmsState.scenarioId=bmsState.dataset.scenarioId;
 bmsState.capacityAh=60;bmsState.initialSocPct=100;bmsState.biasCorrectionA=0;bmsState.answer='';bmsState.feedback='';
 render();break;
case'bms-recalculate':{
 const capacity=Number(document.getElementById('bms-capacity')?.value),initial=Number(document.getElementById('bms-initial')?.value),bias=Number(document.getElementById('bms-bias')?.value);
 try{
  analyzeBms(bmsState.dataset.rows,{capacityAh:capacity,initialSocPct:initial,biasCorrectionA:bias});
  bmsState.capacityAh=capacity;bmsState.initialSocPct=initial;bmsState.biasCorrectionA=bias;render();
 }catch(error){toast(String(error.message||error),true);}
 break;
}
case'bms-soh':{
 const measured=Number(document.getElementById('bms-full-measured')?.value),baseline=Number(document.getElementById('bms-full-new')?.value);
 try{
  const pct=capacitySohPct(measured,baseline);
  bmsState.fullCapacityAh=measured;bmsState.baselineCapacityAh=baseline;
  const el=document.getElementById('bms-soh-result');if(el)el.textContent=pct.toFixed(2)+'% (cálculo ilustrativo)';
 }catch(error){toast(String(error.message||error),true);}
 break;
}
case'bms-grade':{
 const q=bmsState.dataset.scenarioId?bmsQuestion(bmsState.dataset.scenarioId):null;
 if(!q||!bmsState.answer){toast('Elegí una opción antes de corregir.');break;}
 const ok=q.answer===bmsState.answer;
 bmsState.feedback=(ok?'Correcto. ':'Revisá tu hipótesis. ')+q.explanation;
 data.cases.push({id:'lab-bms-'+bmsState.dataset.scenarioId+'-v1',score:ok?100:0,at:new Date().toISOString(),conclusion:bmsState.answer});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'bms-export':{
 const text=formatBmsCsv(bmsState.dataset.rows);
 const blob=new Blob([text],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='autolab-bms-'+(bmsState.dataset.scenarioId||'captura')+'.csv';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
}

case'lab-mode':labState.mode=id==='circuit'?'circuit':id==='bms'?'bms':'can';render();break;
case'lab-toggle-circuit':labState.circuitLoaded=!labState.circuitLoaded;render();break;
case'lab-sample':labState={...labState,mode:'can',sample:true,capture:parseCandump(sampleCandump()),selectedId:'all',offset:0,answer:'',feedback:''};render();break;
case'lab-prev':labState.offset=Math.max(0,labState.offset-80);render();break;
case'lab-next':labState.offset+=80;render();break;
case'lab-grade':
 if(!labState.sample){toast('Práctica disponible solo para la muestra sintética.');break;}
 if(!labState.answer){toast('Elegí un ID antes de corregir.');break;}
 labState.feedback=labState.answer==='120'?'Correcto: el ID 0x120 presenta una separación mayor que su intervalo habitual. Eso no determina causa real.':'Revisá los intervalos medianos y máximos. La muestra inserta una pausa mayor en 0x120.';
 data.cases.push({id:'lab-can-periodicity-v1',score:labState.answer==='120'?100:0,at:new Date().toISOString(),conclusion:labState.answer});
 data.cases=data.cases.slice(-500);await persist();render();break;
case'lesson':selectedLesson=id;page='learn';render();break;case'complete-lesson':{const l=lessons.find(x=>x.id===id);if(l)data.studyMinutes+=l.minutes;await persist();selectedLesson=null;nav('learn');toast('Lectura registrada');break;}case'start-exam':startExam(target.dataset.topic);break;case'review':startExam('all',true);break;case'advance-exam':if(!exam)return;if(exam.at<exam.questions.length-1){exam.at++;render();}else finishExam();break;case'quit-exam':exam=null;examResult=null;render();break;case'start-case':startCase(id);break;case'probe':{if(!training||!training.hypothesis||training.used.includes(id))return;training.used.push(id);render();break;}case'finish-case':{
 const c=cases.find(c=>c.id===training?.id);
 if(!c||!training.used.length||!training.hypothesis||!training.diagnosis||training.reasoning.trim().length<60)return;
 caseResult=assessCase(c,training);
 data.cases.push({id:c.id,score:caseResult.score,at:new Date().toISOString(),conclusion:training.diagnosis,
 hypothesis:training.hypothesis,used:[...training.used],reasoning:training.reasoning,passed:caseResult.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
 }
 case'export-report':{
 if(!training||!caseResult)return;
 const c=cases.find(c=>c.id===training.id);
 const body=caseReport(c,training,caseResult);
 const blob=new Blob([body],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='autolab-'+c.id+'-'+new Date().toISOString().slice(0,10)+'.md';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
 }
 case'quit-case':training=null;caseResult=null;render();break;case'save-notes':data.notes.general=document.getElementById('notebook').value;await persist();toast('Notas guardadas');break;case'export':{const body=serializeBackup(data);const blob=new Blob([body],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='autolab-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;}case'reset':if(confirm('¿Eliminar TODO el progreso de este navegador? Esta acción no se puede deshacer.')){if(confirm('Confirmación final: ¿ya tenés una copia de seguridad?')){data=emptyProgress();await persist();nav('home');toast('Progreso reiniciado');}}break;}});
document.addEventListener('input',event=>{if(event.target.id==='reasoning'&&training){training.reasoning=event.target.value;const count=document.getElementById('case-reason-count');if(count)count.textContent=training.reasoning.trim().length+'/60 caracteres mínimos';const submit=document.getElementById('case-finish');if(submit)submit.disabled=training.reasoning.trim().length<60||!training.diagnosis||!training.used.length;}});
async function init(){try{data=await loadProgress();}catch(e){root.innerHTML='<main class="main"><h1>No se pudo abrir el almacenamiento</h1><p>'+esc(e.message)+'</p><p>Probá abrir la página fuera del modo privado y volvé a cargar.</p></main>';return;}render();if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('SW no disponible',error));}
init();
