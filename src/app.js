import{tracks,lessons,questions,cases as baseCases,resources}from'./content.js';
import{additionalCases}from'./cases-advanced.js';
import{assessCase,caseReport}from'./workshop-engine.js';
import{parseCandump,analyzeCanFrames,sampleCandump,decodeSyntheticSample,MAX_CAN_INPUT}from'./can-lab.js';
import{loadDbc,decodeFramesWithDbc,MAX_DBC_BYTES}from'./dbc-lab.js';
const cases=[...baseCases,...additionalCases];
let labState={mode:'can',sample:true,capture:parseCandump(sampleCandump()),selectedId:'all',offset:0,circuitLoaded:false,answer:'',feedback:'',dbc:null,dbcLabel:'',dbcError:''};
import{emptyProgress,scoreExam,scheduleReview,dueReviews,completedTopics,calculateCase,loadProgress,saveProgress,serializeBackup,parseBackup}from'./core.js';
const root=document.getElementById('app');
let data=emptyProgress();let page='home';let selectedLesson=null;let exam=null;let training=null;let examResult=null;let caseResult=null;
function esc(value){return String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));}
function attr(value){return esc(value);}
function button(text,action,extra='',kind=''){return '<button class="button '+kind+'" data-action="'+attr(action)+'" '+extra+'>'+text+'</button>';}
function link(url,label){return '<a target="_blank" rel="noopener noreferrer" href="'+attr(url)+'">'+esc(label)+'</a>';}
function toast(message,error=false){document.querySelectorAll('.toast').forEach(n=>n.remove());const node=document.createElement('div');node.className='toast'+(error?' error':'');node.textContent=message;node.role='status';document.body.append(node);setTimeout(()=>node.remove(),4200);}
async function persist(){try{await saveProgress(data);}catch(e){toast('No se pudieron guardar los cambios: '+e.message,true);}}
function nav(next){page=next;exam=null;training=null;examResult=null;caseResult=null;render();window.scrollTo({top:0,behavior:'instant'});}
function heading(label,title,description=''){return '<div class="eyebrow">'+esc(label)+'</div><h1>'+esc(title)+'</h1>'+(description?'<p class="muted lead">'+esc(description)+'</p>':'');}
function layout(body){const menus=[['home','Panel'],['learn','Academia'],['exams','Exámenes'],['cases','Taller virtual'],['labs','Laboratorios'],['resources','Recursos'],['data','Mis datos']];root.innerHTML='<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">A</span><div>AutoLab<span class="brand-accent"> Academy</span><small>ENGINEERING LEARNING LAB</small></div></div><nav class="nav" aria-label="Navegación principal">'+menus.map(([id,label])=>'<button class="'+(page===id?'active':'')+'" data-action="nav" data-id="'+id+'" '+(page===id?'aria-current="page"':'')+'>'+label+'</button>').join('')+'</nav><div class="sidebar-footer"><span class="tag">Versión 0.1</span><p>Progreso local, sin cuenta ni servidor. Guardá un respaldo periódicamente.</p></div></aside><main class="main"><div class="topbar"><div class="eyebrow">DIAGNÓSTICO ELECTRÓNICO · HEV/EV</div><span class="tag dim">Modo offline</span></div>'+body+'<footer>AutoLab Academy · Formación y simulación educativa. No acredita intervenciones de alta tensión ni reemplaza supervisión profesional.</footer></main></div>';}
function home(){const attempted=data.attempts.length;const average=attempted?Math.round(data.attempts.reduce((a,x)=>a+x.percentage,0)/attempted):0;const due=dueReviews(data).length;const topics=completedTopics(data,questions);return '<section class="hero"><div><div class="eyebrow">TU CENTRO DE ENTRENAMIENTO</div><h1>Aprendé a encontrar la causa, no solo el código.</h1><p>Estudiá electrónica automotriz, entrená con fallas reproducibles y evaluá tu razonamiento antes de trabajar con vehículos reales.</p><div class="row">'+button('Iniciar examen diagnóstico','start-exam','data-topic="all"')+button('Explorar lecciones','nav','data-id="learn"','alt')+'</div></div><div class="hero-icon" aria-hidden="true">⌁</div></section><section class="grid"><div class="panel"><div class="stat-number">'+attempted+'</div><div class="stat-label">Exámenes rendidos</div></div><div class="panel"><div class="stat-number">'+average+'%</div><div class="stat-label">Promedio de evaluaciones</div></div><div class="panel"><div class="stat-number">'+due+'</div><div class="stat-label">Preguntas para repasar</div></div></section><div class="section"><h2>Mapa de competencias</h2></div><section class="grid two">'+tracks.map(t=>{const s=topics.find(x=>x.topic===t.id);const last=data.attempts.filter(a=>a.topic===t.id).at(-1);return '<article class="panel"><div class="row spaced"><span class="tag dim">'+t.id.toUpperCase()+'</span><span class="muted">'+(last?last.percentage+'%':'Sin evaluar')+'</span></div><h3>'+esc(t.title)+'</h3><p class="muted">'+esc(t.subtitle)+'</p><div class="progress"><span style="width:'+(last?last.percentage:0)+'%"></span></div><p class="muted small">'+(s?.passed||0)+' exámenes aprobados con ≥85%</p>'+button('Entrenar este tema','start-exam','data-topic="'+t.id+'"','alt small')+'</article>';}).join('')+'</section><div class="section"><h2>Próximo desafío</h2></div><div class="panel row spaced"><div><h3>Diagnóstico: arranque lento</h3><p class="muted">Caso práctico con hipótesis, mediciones y diagnóstico de causa raíz.</p></div>'+button('Abrir caso','start-case','data-id="case-ground"')+'</div>';}
function learn(){return heading('ACADEMIA','Tu biblioteca técnica','Seis lecciones de introducción aplicada, con fuentes públicas. El programa crecerá por etapas.')+'<section class="cards">'+lessons.map(l=>'<article class="panel lesson-card"><div><span class="tag dim">'+esc(tracks.find(t=>t.id===l.topic)?.title)+'</span><h3>'+esc(l.title)+'</h3><p class="muted">'+l.minutes+' minutos estimados</p></div>'+button('Estudiar','lesson','data-id="'+attr(l.id)+'"','alt')+'</article>').join('')+'</section>';}
function lessonView(){const l=lessons.find(x=>x.id===selectedLesson);if(!l)return learn();return button('← Volver a academia','nav','data-id="learn"','alt small')+'<div class="section"></div>'+heading('LECCIÓN · '+l.topic.toUpperCase(),l.title,'Lectura orientada a diagnóstico y evidencia.')+'<article class="panel lesson-body">'+l.sections.map(([h,t])=>'<h2>'+esc(h)+'</h2><p>'+esc(t)+'</p>').join('')+'<div class="notice">La teoría y las simulaciones de la academia no habilitan prácticas reales peligrosas. Para alta tensión seguí capacitación, equipos y procedimientos profesionales.</div><hr class="divider"/>'+link(l.url,'Abrir fuente y lecturas relacionadas')+'<div class="section">'+button('Registrar lectura y volver','complete-lesson','data-id="'+attr(l.id)+'"')+'</div></article>';}
function examMenu(){return heading('EVALUACIÓN','Exámenes que miden lo que sabés','Selección única, explicaciones verificables y calendario de repaso. La nota es interna, no una acreditación oficial.')+'<div class="panel"><h3>Examen integral</h3><p class="muted">10 preguntas de diferentes áreas · Umbral recomendado de dominio: 85%</p>'+button('Empezar examen','start-exam','data-topic="all"')+'</div><div class="section"><h2>Evaluar un área</h2></div><div class="grid two">'+tracks.map(t=>'<div class="panel"><span class="tag dim">'+esc(t.id.toUpperCase())+'</span><h3>'+esc(t.title)+'</h3><p class="muted">'+questions.filter(q=>q.topic===t.id).length+' preguntas disponibles</p>'+button('Iniciar evaluación','start-exam','data-topic="'+t.id+'"','alt')+'</div>').join('')+'</div><div class="section"><h2>Repaso</h2></div><div class="panel"><p class="muted">'+dueReviews(data).length+' preguntas pendientes según tu historial de respuestas.</p>'+button('Repasar ahora','review','', 'alt')+'</div>';}
function startExam(topic,review=false){const pool=review?questions.filter(q=>dueReviews(data).includes(q.id)):questions.filter(q=>topic==='all'||q.topic===topic);if(!pool.length){toast('Todavía no hay preguntas programadas para repasar.');return;}const randomized=[...pool].sort(()=>Math.random()-.5);exam={topic,questions:randomized.slice(0,topic==='all'?10:6),at:0,answers:{},review};examResult=null;page='exams';render();}
function examView(){if(examResult)return examSummary();const q=exam.questions[exam.at];const selected=exam.answers[q.id];return '<div class="row spaced"><div class="eyebrow">'+(exam.review?'REPASO ACTIVO':'EXAMEN EN CURSO')+'</div>'+button('Salir del examen','quit-exam','','alt small')+'</div><h1>Pregunta '+(exam.at+1)+' de '+exam.questions.length+'</h1><div class="progress"><span style="width:'+Math.round(exam.at/exam.questions.length*100)+'%"></span></div><section class="panel quiz"><span class="tag dim">'+esc(tracks.find(t=>t.id===q.topic)?.title)+'</span><h2>'+esc(q.question)+'</h2><fieldset><legend class="sr-only">Seleccioná una respuesta</legend>'+q.options.map((opt,i)=>'<label class="option"><input type="radio" name="answer" value="'+i+'" '+(selected===i?'checked':'')+'><span>'+esc(opt)+'</span></label>').join('')+'</fieldset><div class="row spaced"><p class="muted small">Respondé antes de continuar.</p>'+button(exam.at===exam.questions.length-1?'Finalizar examen':'Siguiente pregunta','advance-exam',selected===undefined?'disabled':'')+'</div></section>';}
function finishExam(){const graded=scoreExam(exam.questions,exam.questions.map(q=>exam.answers[q.id]));const date=new Date().toISOString();data.attempts.push({id:'exam-'+Date.now(),topic:exam.topic,percentage:graded.percentage,at:date});data.attempts=data.attempts.slice(-500);for(const row of graded.details)data.reviews[row.id]=scheduleReview(data.reviews[row.id],row.correct);examResult=graded;persist();render();}
function examSummary(){const graded=examResult;return heading('RESULTADOS','Examen finalizado','La evaluación solo certifica progreso interno de la academia.')+'<div class="panel"><div class="stat-number">'+graded.percentage+'%</div><p class="muted">'+graded.correct+' de '+graded.total+' respuestas correctas</p><span class="tag '+(graded.percentage>=85?'':'amber')+'">'+(graded.percentage>=85?'Objetivo teórico alcanzado':'Seguí practicando')+'</span><div class="row" style="margin-top:18px">'+button('Volver a evaluaciones','quit-exam')+button('Estudiar módulos','nav','data-id="learn"','alt')+'</div></div><div class="section"><h2>Corrección razonada</h2></div><section class="cards">'+exam.questions.map((q,i)=>{const row=graded.details[i];return '<div class="panel"><div class="row spaced"><span class="tag dim">'+esc(q.topic)+'</span><strong class="'+(row.correct?'outcome-good':'outcome-bad')+'">'+(row.correct?'Correcta':'Incorrecta')+'</strong></div><h3>'+esc(q.question)+'</h3><p>Tu respuesta: '+esc(q.options[row.selected]??'Sin responder')+'</p><p>Respuesta esperada: <strong>'+esc(q.options[q.answer])+'</strong></p><p class="muted">'+esc(q.explanation)+'</p>'+link(q.source,'Fuente de referencia')+'</div>';}).join('')+'</section>';}
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
function labView(){
 const mode=labState.mode;
 let body=heading('LABORATORIOS','Instrumentación y simulación','Entornos de entrenamiento. CAN es lectura de archivos sin conexión; CircuitJS es una herramienta externa y requiere Internet.');
 body+='<div class="row" style="margin:0 0 22px">'+button('Analizador CAN','lab-mode','data-id="can"',mode==='can'?'':'alt')+button('Circuitos con CircuitJS','lab-mode','data-id="circuit"',mode==='circuit'?'':'alt')+'</div>';
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
 (labState.sample&&report.decoded.some(r=>r.id==='120')?'<p class="muted">Ejercicio: con la DBC didáctica cargada, compará la primera lectura EngineRPM con el valor bruto little-endian de la trama 0x120. ¿Por qué 0,25 es el factor?</p>':'')+
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
function render(){let body=page==='home'?home():page==='learn'?(selectedLesson?lessonView():learn()):page==='exams'?(exam?examView():examMenu()):page==='cases'?(training?caseView():caseMenu()):page==='labs'?labView():page==='resources'?resourceView():dataView();layout(body);}
document.addEventListener('change',event=>{if(event.target.name==='answer'&&exam){exam.answers[exam.questions[exam.at].id]=Number(event.target.value);render();}if(event.target.id==='hypothesis'&&training){training.hypothesis=event.target.value;render();}if(event.target.id==='diagnosis'&&training){training.diagnosis=event.target.value;render();}if(event.target.id==='lab-id-filter'){
 labState.selectedId=event.target.value;labState.offset=0;render();
}
if(event.target.id==='lab-answer'){labState.answer=event.target.value;}
if(event.target.id==='dbc-file'){
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>MAX_DBC_BYTES){toast('La base DBC supera 600 KB',true);return;}
 file.text().then(t=>{
  const parsed=loadDbc(t);
  labState.dbc=parsed;labState.dbcLabel=file.name.slice(0,100);labState.dbcError='';render();
  toast('DBC cargado; las señales se interpretan en el navegador.');
 }).catch(error=>{labState.dbcError=String(error.message||error);render();toast('No se pudo interpretar el DBC',true);});
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
document.addEventListener('click',async event=>{const target=event.target.closest('[data-action]');if(!target||target.disabled)return;const act=target.dataset.action;const id=target.dataset.id;switch(act){case'nav':selectedLesson=null;nav(id);break;case'lab-load-dbc-sample':{
 try{
  const r=await fetch('./samples/autolab-synthetic.dbc');
  if(!r.ok)throw Error('No se encuentra el DBC de ejemplo ('+r.status+')');
  labState.dbc=loadDbc(await r.text());
  labState.dbcLabel='AutoLab synthetic v1 (educativa)';labState.dbcError='';render();toast('DBC didáctico cargado.');
 }catch(e){labState.dbcError=String(e?.message||e);render();toast('Error al cargar DBC sintético',true);}
 break;
}
case'lab-clear-dbc':labState.dbc=null;labState.dbcLabel='';labState.dbcError='';render();break;
case'lab-mode':labState.mode=id==='circuit'?'circuit':'can';render();break;
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
