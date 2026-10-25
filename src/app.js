import{tracks,lessons as baseLessons,questions as baseQuestions,cases as baseCases,resources}from'./content.js';
import{additionalLessons,additionalQuestions}from'./curriculum-advanced.js';
import{ecuLessons,ecuQuestions}from'./ecu-curriculum.js';
import{componentLessons,componentQuestions}from'./components-curriculum.js';
import{componentScenarios,componentModel,gradeComponent,componentReport,parseComponentNumber,rcSamples}from'./component-lab.js';
import{differentialLessons,differentialQuestions}from'./differential-curriculum.js';
import{temporalLessons,temporalQuestions}from'./temporal-curriculum.js';
import{fuelLessons,fuelQuestions}from'./fuel-curriculum.js';
import{misfireLessons,misfireQuestions}from'./misfire-curriculum.js';
import{integrativeLessons,integrativeQuestions}from'./integrative-curriculum.js';
import{INTEGRATIVE_CASES,EVIDENCE_KINDS,startIntegrativeCase,integrativeReading,validateObservation,evaluateIntegrativeCase,buildIntegrativeReport}from'./integrative-lab.js';
import{MISFIRE_CASES,misfireCase,misfireFrame,misfireProbe,newMisfireSession,evaluateMisfire,misfireReport}from'./misfire-lab.js';
import{FUEL_CASES,createFuelSession,fuelFrame,fuelProbe,gradeFuelSession,fuelReport}from'./fuel-system-lab.js';
import{TRACE_CASES,TRACE_CHANNELS,TRACE_WINDOWS,TRACE_DURATION_MS,createTraceSession,generateTrace,traceSummary,gradeTraceSession,traceReport}from'./temporal-trace-lab.js';
import{differentialCases,createDifferentialSession,getDifferentialProbe,gradeDifferential,differentialTrace,differentialReport}from'./fault-discrimination.js';
import{learningStages,evaluateLearningPath}from'./learning-path.js';
import{ecuCases,evaluateEcu,ecuReport}from'./ecu-lab.js';
import{WAVEFORM_SCENARIOS,generateWaveform,gradeWaveform,parseWaveAnswer}from'./waveform-lab.js';
const lessons=[...baseLessons,...additionalLessons,...ecuLessons,...componentLessons,...differentialLessons,...temporalLessons,...fuelLessons,...misfireLessons,...integrativeLessons],questions=[...baseQuestions,...additionalQuestions,...ecuQuestions,...componentQuestions,...differentialQuestions,...temporalQuestions,...fuelQuestions,...misfireQuestions,...integrativeQuestions];
import{additionalCases}from'./cases-advanced.js';
import{assessCase,caseReport}from'./workshop-engine.js';
import{multiFaultCases,evaluateMultiFault,multiFaultReport}from'./differential-lab.js';
import{portfolioSnapshot,portfolioMarkdown}from'./portfolio.js';
import{parseCandump,analyzeCanFrames,sampleCandump,decodeSyntheticSample,MAX_CAN_INPUT}from'./can-lab.js';
import{loadDbc,decodeFramesWithDbc,MAX_DBC_BYTES}from'./dbc-lab.js';
import{BMS_SCENARIOS,generateSyntheticBms,parseBmsCsv,formatBmsCsv,analyzeBms,bmsQuestion,capacitySohPct,MAX_BMS_FILE_BYTES}from'./bms-lab.js';
const cases=[...baseCases,...additionalCases];
let bmsState={scenarioId:'nominal',dataset:generateSyntheticBms('nominal'),capacityAh:60,initialSocPct:100,biasCorrectionA:0,answer:'',feedback:'',name:'Ejemplo nominal',fullCapacityAh:48,baselineCapacityAh:60};
let waveState={id:'pwm',answer:'',result:null};
let differentialTraining=null,differentialResult=null;
let traceTraining=null,traceResult=null,traceChannels=['ckp','cmp'];
let fuelTraining=null,fuelResult=null;
let misfireTraining=null,misfireResult=null;
let integralTraining=null,integralResult=null,integralReport=null;
let componentState={id:'divider',condition:'nominal',value:'',evidence:'',reasoning:'',result:null};
let labState={mode:'can',sample:true,capture:parseCandump(sampleCandump()),selectedId:'all',offset:0,circuitLoaded:false,answer:'',feedback:'',dbc:null,dbcLabel:'',dbcError:'',dbcAnswer:'',dbcFeedback:''};
import{emptyProgress,scoreExam,dueReviews,completedTopics,calculateCase,loadProgress,saveProgress,serializeBackup,parseBackup}from'./core.js';
import{recordReview,selectCumulativeQuestions,reviewOverview}from'./repetition.js';
import{buildQuantitativeSession,parseNumericAnswer,gradeQuantitative,formatQuantitativeReport}from'./measurement-challenges.js';
const root=document.getElementById('app');
let quantitative=null;let quantitativeResults=null;
let ecuTraining=null,ecuResult=null;
let multiTraining=null,multiResult=null,portfolioFilter='all';
let data=emptyProgress();let page='home';let selectedLesson=null;let exam=null;let training=null;let examResult=null;let caseResult=null;
function esc(value){return String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));}
function attr(value){return esc(value);}
function button(text,action,extra='',kind=''){return '<button class="button '+kind+'" data-action="'+attr(action)+'" '+extra+'>'+text+'</button>';}
function link(url,label){return '<a target="_blank" rel="noopener noreferrer" href="'+attr(url)+'">'+esc(label)+'</a>';}
function toast(message,error=false){document.querySelectorAll('.toast').forEach(n=>n.remove());const node=document.createElement('div');node.className='toast'+(error?' error':'');node.textContent=message;node.role='status';document.body.append(node);setTimeout(()=>node.remove(),4200);}
async function persist(){try{await saveProgress(data);}catch(e){toast('No se pudieron guardar los cambios: '+e.message,true);}}
function nav(next){page=next;exam=null;training=null;multiTraining=null;multiResult=null;ecuTraining=null;ecuResult=null;differentialTraining=null;differentialResult=null;traceTraining=null;traceResult=null;fuelTraining=null;fuelResult=null;misfireTraining=null;misfireResult=null;integralTraining=null;integralResult=null;integralReport=null;examResult=null;caseResult=null;render();window.scrollTo({top:0,behavior:'instant'});}
function heading(label,title,description=''){return '<div class="eyebrow">'+esc(label)+'</div><h1>'+esc(title)+'</h1>'+(description?'<p class="muted lead">'+esc(description)+'</p>':'');}
function layout(body){const menus=[['home','Panel'],['learn','Academia'],['path','Itinerario'],['exams','Exámenes'],['challenges','Retos medidos'],['cases','Taller virtual'],['ecu','Banco ECU'],['differential','Diagnóstico diferencial'],['temporal','Capturas temporales'],['fuel','Inyección OBD'],['misfire','Balance de cilindros'],['integrative','Taller Integrador'],['portfolio','Portafolio'],['labs','Laboratorios'],['resources','Recursos'],['data','Mis datos']];root.innerHTML='<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">A</span><div>AutoLab<span class="brand-accent"> Academy</span><small>ENGINEERING LEARNING LAB</small></div></div><nav class="nav" aria-label="Navegación principal">'+menus.map(([id,label])=>'<button class="'+(page===id?'active':'')+'" data-action="nav" data-id="'+id+'" '+(page===id?'aria-current="page"':'')+'>'+label+'</button>').join('')+'</nav><div class="sidebar-footer"><span class="tag">Versión 1.5</span><p>Progreso local, sin cuenta ni servidor. Guardá un respaldo periódicamente.</p></div></aside><main class="main"><div class="topbar"><div class="eyebrow">DIAGNÓSTICO ELECTRÓNICO · HEV/EV</div><span class="tag dim">Modo offline</span></div>'+body+'<footer>AutoLab Academy · Formación y simulación educativa. No acredita intervenciones de alta tensión ni reemplaza supervisión profesional.</footer></main></div>';}
function home(){const attempted=data.attempts.length;const average=attempted?Math.round(data.attempts.reduce((a,x)=>a+x.percentage,0)/attempted):0;const due=reviewOverview(data,questions).due;const topics=completedTopics(data,questions);return '<section class="hero"><div><div class="eyebrow">TU CENTRO DE ENTRENAMIENTO</div><h1>Aprendé a encontrar la causa, no solo el código.</h1><p>Estudiá electrónica automotriz, entrená con fallas reproducibles y evaluá tu razonamiento antes de trabajar con vehículos reales.</p><div class="row">'+button('Iniciar examen diagnóstico','start-exam','data-topic="all"')+button('Retos de medición','nav','data-id="challenges"','alt')+button('Explorar lecciones','nav','data-id="learn"','alt')+'</div></div><div class="hero-icon" aria-hidden="true">⌁</div></section><section class="grid"><div class="panel"><div class="stat-number">'+attempted+'</div><div class="stat-label">Exámenes rendidos</div></div><div class="panel"><div class="stat-number">'+average+'%</div><div class="stat-label">Promedio de evaluaciones</div></div><div class="panel"><div class="stat-number">'+due+'</div><div class="stat-label">Preguntas para repasar</div></div></section><div class="section"><h2>Mapa de competencias</h2></div><section class="grid two">'+tracks.map(t=>{const s=topics.find(x=>x.topic===t.id);const last=data.attempts.filter(a=>a.topic===t.id).at(-1);return '<article class="panel"><div class="row spaced"><span class="tag dim">'+t.id.toUpperCase()+'</span><span class="muted">'+(last?last.percentage+'%':'Sin evaluar')+'</span></div><h3>'+esc(t.title)+'</h3><p class="muted">'+esc(t.subtitle)+'</p><div class="progress"><span style="width:'+(last?last.percentage:0)+'%"></span></div><p class="muted small">'+(s?.passed||0)+' exámenes aprobados con ≥85%</p>'+button('Entrenar este tema','start-exam','data-topic="'+t.id+'"','alt small')+'</article>';}).join('')+'</section><div class="section"><h2>Próximo desafío</h2></div><div class="panel row spaced"><div><h3>Diagnóstico: arranque lento</h3><p class="muted">Caso práctico con hipótesis, mediciones y diagnóstico de causa raíz.</p></div>'+button('Abrir caso','start-case','data-id="case-ground"')+'</div>';}


function differentialGraph(c,index){
 const series=differentialTrace(c.id,index,240);
 const W=720,H=260,left=64,top=20,w=606,h=189;
 const ceiling=c.trace.type==='rc'?12:c.trace.type==='pwm'?6:5.5;
 const x=t=>left+t/c.trace.duration*w;
 const y=v=>top+h-v/ceiling*h;
 const guides=[0,.25,.5,.75,1].map(v=>'<line x1="'+left+'" x2="'+(left+w)+'" y1="'+y(v*ceiling).toFixed(1)+'" y2="'+y(v*ceiling).toFixed(1)+'" stroke="#2d4456"/>'+
 '<text x="'+(left-11)+'" y="'+(y(v*ceiling)+4).toFixed(1)+'" fill="#b4cadd" text-anchor="end" font-size="11">'+(v*ceiling).toFixed(1)+' V</text>').join('');
 const line=series.map((p,i)=>(i?'L':'M')+x(p.t).toFixed(2)+' '+y(p.value).toFixed(2)).join(' ');
 return '<div class="wave-chart"><svg role="img" aria-label="'+esc(c.trace.title)+
 '" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet">'+guides+
 '<path d="'+line+'" stroke="#60d9c7" stroke-width="2.8" fill="none" stroke-linejoin="round"/>'+
 '<text x="'+left+'" y="246" fill="#b4cadd" font-size="12">0 '+esc(c.trace.unit)+'</text>'+
 '<text x="'+(left+w)+'" y="246" fill="#b4cadd" text-anchor="end" font-size="12">'+c.trace.duration+' '+esc(c.trace.unit)+'</text></svg></div>'+
 '<p class="muted small">'+esc(c.trace.title)+'. La captura es una curva matemática sintética, no una forma de onda OEM.</p>';
}

function traceChannelGraph(c,index,channelId){
 const ch=TRACE_CHANNELS.find(x=>x.id===channelId);
 if(!ch)return '';
 const samples=generateTrace(c.id,traceTraining.eventWindow,index);
 const W=700,H=210,left=54,top=16,pw=606,ph=152;
 const x=t=>left+(t/TRACE_DURATION_MS)*pw;
 const y=v=>top+ph-(v/ch.max)*ph;
 const marks=[0,.25,.5,.75,1].map(f=>
 '<line x1="'+left+'" x2="'+(left+pw)+'" y1="'+y(f*ch.max).toFixed(1)+'" y2="'+y(f*ch.max).toFixed(1)+'" stroke="#2d4456"/>'+
 '<text x="'+(left-7)+'" y="'+(y(f*ch.max)+4).toFixed(1)+'" text-anchor="end" font-size="11" fill="#b4cadd">'+(f*ch.max).toFixed(1)+' '+esc(ch.unit)+'</text>').join('');
 const points=samples.map((p,i)=>(i?'L':'M')+x(p.t).toFixed(2)+' '+y(p[channelId]).toFixed(2)).join(' ');
 const summary=traceSummary(c.id,traceTraining.eventWindow,index)[channelId];
 return '<article class="panel"><h3>'+esc(ch.label)+'</h3><div class="wave-chart">'+
 '<svg role="img" aria-label="'+esc(ch.label+' en ventana '+(index+1))+'" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet">'+
 marks+'<path d="'+points+'" fill="none" stroke="#60d9c7" stroke-width="2.6"/>'+
 '<text x="'+left+'" y="198" font-size="12" fill="#b4cadd">0 ms</text>'+
 '<text x="'+(left+pw)+'" y="198" text-anchor="end" font-size="12" fill="#b4cadd">'+TRACE_DURATION_MS+' ms</text></svg></div>'+
 '<p class="muted small">Mín: '+summary.min.toFixed(2)+' '+esc(ch.unit)+
 ' · Máx: '+summary.max.toFixed(2)+' '+esc(ch.unit)+' · Transiciones ascendentes: '+summary.rising+'</p></article>';
}



const evidenceLabels={context:'Condiciones',obd:'Datos OBD',wave:'Señales',circuit:'Circuito'};
function integrativeMenu(){
 return heading('TALLER INTEGRADOR','Un expediente, cuatro fuentes de evidencia',
 'Diagnóstico de sistemas completos con hipótesis, mediciones contextualizadas, pruebas de descarte e incertidumbres explícitas.')+
 '<div class="notice">Todos los expedientes son ficticios. Los datos no están tomados de vehículos ni tienen calibración de fabricante. La puntuación evalúa estructura, no la calidad semántica del razonamiento.</div>'+
 '<div class="grid">'+INTEGRATIVE_CASES.map(c=>
 '<article class="panel"><span class="tag dim">'+esc(c.dtc)+'</span><h3>'+esc(c.title)+'</h3>'+
 '<p class="muted">'+esc(c.symptom)+'</p>'+
 button('Abrir expediente','integral-start','data-id="'+attr(c.id)+'"')+'</article>').join('')+'</div>';
}
function integrativeView(){
 const a=integralTraining,c=INTEGRATIVE_CASES.find(c=>c.id===a?.caseId);
 if(!c)return integrativeMenu();
 if(integralResult)return integrativeSummary(c);
 const picker=(id,value,label)=>'<label for="'+id+'"><strong>'+label+'</strong></label><select class="field" id="'+id+'"><option value="">Elegí una hipótesis...</option>'+
 c.alternatives.map(([code,name])=>'<option value="'+attr(code)+'" '+(value===code?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select>';
 let html='<div class="row spaced"><span class="eyebrow">EXPEDIENTE · BANCO VIRTUAL</span>'+
 button('Salir','integral-quit','','alt small')+'</div><h1>'+esc(c.title)+'</h1>'+
 '<div class="panel"><h3>Solicitud de diagnóstico</h3><p>'+esc(c.symptom)+'</p>'+
 '<p class="muted">Monitor: '+esc(c.dtc)+' · Condiciones, ondas, circuitos y valores definidos por este simulador.</p></div>';
 if(!a.locked)return html+'<div class="section"><h2>1. Registrá tu hipótesis inicial</h2></div>'+
 '<div class="panel">'+picker('integral-initial',a.initial,'¿Cuál investigarías primero, antes de ver evidencia?')+
 '<p class="muted small">Quedará en la cadena de custodia del expediente. Podrás corregir tu diagnóstico al reunir pruebas.</p>'+
 button('Abrir investigación','integral-lock',a.initial?'':'disabled')+'</div>';
 const seen=new Set(a.observations.map(o=>o.id)),readings=c.readings.filter(r=>seen.has(r.id));
 html+='<div class="section"><h2>2. Consultá fuentes y anotá pronósticos</h2></div>'+
 '<p class="muted">Necesitás evidencia de las cuatro fuentes, una prueba que confirme y otra que contraste una alternativa. Las etiquetas de esos papeles se muestran después de corregir.</p>'+
 '<div class="integral-sources">'+EVIDENCE_KINDS.map(kind=>{
 const category=c.readings.filter(r=>r.kind===kind);
 return '<article class="panel"><div class="row spaced"><h3>'+esc(evidenceLabels[kind])+'</h3>'+
 '<span class="tag dim">'+category.filter(r=>seen.has(r.id)).length+'/'+category.length+' consultas</span></div>'+
 '<div class="integral-source-items">'+category.map(r=>
 '<button class="probe integral-item" data-action="integral-probe" data-id="'+attr(r.id)+'" '+(seen.has(r.id)?'disabled':'')+'>'+
 esc(r.label)+(seen.has(r.id)?' ✓':'')+'</button>').join('')+'</div></article>';
 }).join('')+'</div>';
 if(a.pending){
  const p=integrativeReading(c.id,a.pending);
  html+='<div class="panel"><h3>Antes de revelar: '+esc(p.label)+'</h3>'+
 '<p class="muted small">Origen previsto: '+esc(p.provenance)+'. No es una medición física.</p>'+
 '<label for="integral-prediction">¿Cómo creés que se clasificará esta lectura?</label>'+
 '<select class="field" id="integral-prediction"><option value="">Elegí un pronóstico...</option>'+
 [['normal','Normal para el modelo'],['anómala','Anómala para el modelo'],['observación','Solo contexto, sin conclusión'],['peligrosa','Maniobra insegura o prohibida']].map(([value,name])=>
 '<option value="'+attr(value)+'" '+(a.prediction===value?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select>'+
 button('Revelar dato sintético','integral-reveal',a.prediction?'':'disabled')+'</div>';
 }
 html+='<div class="section"><h2>3. Cadena de evidencia consultada</h2></div>'+
 '<div class="panel">'+(readings.length?readings.map(r=>{
  const o=a.observations.find(o=>o.id===r.id);
  return '<div class="answer-card"><strong>'+esc(r.label)+'</strong>'+
  '<p class="muted small">Origen: '+esc(evidenceLabels[r.kind])+' · '+esc(r.provenance)+'</p>'+
  '<p>'+esc(r.value)+'</p>'+
  '<p class="muted small">Predicción: '+esc(o.prediction)+' · Clasificación observada: '+esc(r.classification)+'</p></div>';
 }).join(''):'<p class="muted">Todavía no consultaste ninguna fuente.</p>')+'</div>';
 html+='<div class="section"><h2>4. Conclusión e incertidumbres</h2></div><div class="panel">'+
 picker('integral-final',a.final,'Diagnóstico principal sustentado por el expediente')+
 '<label for="integral-reason"><strong>Argumentá: ¿qué prueba confirma y cuál descarta una alternativa?</strong></label>'+
 '<textarea class="field" id="integral-reason" rows="6" maxlength="3000" placeholder="Mínimo 120 caracteres. Indicá datos, condiciones, contradicciones y relación entre las fuentes.">'+esc(a.reasoning)+'</textarea>'+
 '<label for="integral-uncertainty"><strong>¿Qué datos faltan? ¿Qué no podés afirmar todavía?</strong></label>'+
 '<textarea class="field" id="integral-uncertainty" rows="4" maxlength="1200" placeholder="Mínimo 60 caracteres. Ej.: faltan tolerancias OEM o pruebas experimentales...">'+esc(a.uncertainty)+'</textarea>'+
 '<p class="muted small">La app solo valida criterios estructurados. No comprende ni corrige técnicamente tu explicación.</p>'+
 button('Corregir expediente','integral-grade',!a.final||!readings.length||a.reasoning.trim().length<120||a.uncertainty.trim().length<60?'disabled id="integral-submit"':'id="integral-submit"')+'</div>';
 return html;
}
function integrativeSummary(c){
 const a=integralTraining,r=integralResult;
 return heading('EXPEDIENTE FINAL','Resultado estructurado '+r.score+'/100',
 'Conclusión del generador ficticio, no acreditación de diagnóstico o seguridad en taller.')+
 '<div class="panel"><span class="tag '+(r.passed?'':'amber')+'">'+(r.passed?'Criterios de evidencia cumplidos':'Falta alguna verificación de la rúbrica')+'</span>'+
 '<h3>Auditoría de la cadena</h3>'+
 '<p>Hipótesis: '+(r.cause?'correcta':'incorrecta')+' · Prueba confirmatoria: '+(r.confirm?'sí':'no')+
 ' · Prueba de descarte: '+(r.exclude?'sí':'no')+
 ' · Cuatro fuentes: '+(r.coverage?'sí':'no')+
 ' · Pronóstico: '+(r.predicted?'sí':'no')+' · Incertidumbre declarada: '+(r.qualified?'sí':'no')+
 ' · Acción insegura: '+(r.unsafe?'sí':'no')+'</p>'+
 '<p class="muted small">Fuentes abiertas: '+esc(r.kinds.map(k=>evidenceLabels[k]).join(', ')||'ninguna')+'</p>'+
 '<h3>Conclusión del banco</h3><p>'+esc(c.explanation)+'</p>'+
 '<h3>Papeles de las mediciones</h3>'+
 a.observations.map(o=>{
 const p=integrativeReading(c.id,o.id);
 return '<div class="answer-card"><strong>'+esc(p.label)+'</strong> — '+
 (p.unsafe?'Acción insegura':p.confirm?'Confirmatoria':p.exclude?'Descarta una alternativa':'Contextual')+
 '<p class="muted small">'+esc(p.provenance)+' · '+esc(p.value)+'</p></div>';
 }).join('')+
 '<h3>Tu razonamiento (sin revisión semántica)</h3><p>'+esc(a.reasoning)+'</p>'+
 '<h3>Incertidumbres declaradas</h3><p>'+esc(a.uncertainty)+'</p>'+
 '<div class="row">'+button('Exportar expediente completo (.md)','integral-export')+
 button('Nuevo intento','integral-start','data-id="'+attr(c.id)+'"','alt')+
 button('Volver a expedientes','integral-quit','','alt')+'</div></div>';
}
function downloadIntegrative(text,id){
 const blob=new Blob([text],{type:'text/markdown;charset=utf-8'});
 const uri=URL.createObjectURL(blob),node=document.createElement('a');
 node.href=uri;node.download='autolab-expediente-'+id+'.md';document.body.append(node);
 node.click();node.remove();setTimeout(()=>URL.revokeObjectURL(uri),2000);
}

function misfireMenu(){
 return heading('MONITOR DE COMBUSTIÓN','Balance y diagnóstico por cilindro',
  'Cuatro casos sintéticos: circuito de bobina, inyector sin corriente, compresión reducida y mezcla con aporte irregular de varios cilindros.')+
 '<div class="notice">Los códigos P030x, los contadores por cilindro y los índices de aporte de estos ejercicios son inventados. Los monitores reales dependen del fabricante y no identifican por sí solos una pieza.</div>'+
 '<div class="grid">'+MISFIRE_CASES.map(c=>
 '<article class="panel"><span class="tag dim">MONITOR DIDÁCTICO '+esc(c.dtc)+'</span><h3>'+esc(c.title)+'</h3>'+
 '<p class="muted">'+esc(c.symptom)+'</p>'+
 button('Investigar cilindros','misfire-start','data-id="'+attr(c.id)+'"')+'</article>').join('')+'</div>';
}
function cylinderTable(c,session){
 const frames=c.frames.filter(f=>session.viewed.includes(f.id));
 if(!frames.length)return '';
 const table=frames.map(f=>
 '<article class="panel"><h3>'+esc(f.label)+' · '+f.rpm+' RPM</h3>'+
 '<p class="muted small">STFT '+(f.stftPct>0?'+':'')+f.stftPct+'% / LTFT '+(f.ltftPct>0?'+':'')+f.ltftPct+'%. El monitor y los índices no expresan mediciones de presión absoluta ni contribución real de torque.</p>'+
 '<div class="table-scroll"><table class="cylinder-table"><thead><tr><th>Cilindro</th><th>Eventos ficticios</th><th>Índice de aporte</th></tr></thead><tbody>'+
 f.contribution.map((v,i)=>'<tr><th scope="row">C'+(i+1)+'</th><td>'+f.misfires[i]+'</td><td>'+
 '<div class="cylinder-bar"><span style="width:'+Math.max(0,Math.min(100,v))+'%"></span></div>'+
 '<span class="muted small">'+v+'/100 arbitrario</span></td></tr>').join('')+
 '</tbody></table></div></article>').join('');
 return '<div class="grid two">'+table+'</div>';
}
function misfireView(){
 const s=misfireTraining,c=MISFIRE_CASES.find(x=>x.id===s?.caseId);
 if(!c)return misfireMenu();
 if(misfireResult)return misfireSummary(c);
 const picker=(id,value,label)=>'<label for="'+id+'"><strong>'+label+'</strong></label>'+
 '<select class="field" id="'+id+'"><option value="">Elegí una hipótesis</option>'+
 c.hypotheses.map(([code,desc])=>'<option value="'+attr(code)+'" '+(code===value?'selected':'')+'>'+esc(desc)+'</option>').join('')+'</select>';
 let html='<div class="row spaced"><span class="eyebrow">MONITOR Y CILINDROS · MOTOR MPI FICTICIO</span>'+
 button('Salir','misfire-quit','','alt small')+'</div><h1>'+esc(c.title)+'</h1>'+
 '<div class="panel"><h3>Situación del banco</h3><p>'+esc(c.symptom)+'</p>'+
 '<p class="muted">Código del monitor inventado: '+esc(c.dtc)+
 '. Los valores representan una misma instalación sintética de cuatro cilindros, no un motor OEM.</p></div>';
 if(!s.locked)return html+'<div class="section"><h2>1. Elegí hipótesis antes de mirar las mediciones</h2></div>'+
 '<div class="panel">'+picker('misfire-initial',s.initial,'¿Qué causa investigarías primero?')+
 '<p class="muted small">Tu selección previa queda registrada aunque decidas corregirla tras investigar.</p>'+
 button('Registrar hipótesis previa','misfire-lock',s.initial?'':'disabled')+'</div>';
 html+='<div class="section"><h2>2. Comprobá el monitor en dos regímenes</h2></div>'+
 '<p class="muted">Compará ralentí y una demanda moderada. Los recuentos son arbitrarios, no el algoritmo real de un monitor OBD.</p>'+
 '<div class="row trace-windows">'+c.frames.map(f=>button(f.label+(s.viewed.includes(f.id)?' ✓':''),
  'misfire-frame','data-id="'+attr(f.id)+'"',s.viewed.includes(f.id)?'':'alt')).join('')+'</div>'+
 cylinderTable(c,s);
 html+='<div class="section"><h2>3. Buscá confirmación y descartá una alternativa</h2></div>'+
 '<p class="muted">Necesitás una medición confirmatoria y otra independiente para contrastar hipótesis; no basta con acertar el P030x.</p>'+
 '<div class="grid two">'+c.probes.map(p=>'<button class="probe panel" data-action="misfire-probe" data-id="'+attr(p.id)+'" '+
 (s.observations.some(o=>o.id===p.id)?'disabled':'')+'>'+esc(p.label)+(s.observations.some(o=>o.id===p.id)?' ✓':'')+'</button>').join('')+'</div>';
 if(s.pending){
  const p=misfireProbe(c.id,s.pending);
  html+='<div class="panel"><h3>Anticipá el resultado</h3><p>'+esc(p.label)+'</p>'+
 '<label for="misfire-prediction">¿Qué lectura esperás?</label>'+
 '<select class="field" id="misfire-prediction"><option value="">Elegí antes de revelar</option>'+
 [['normal','Normal respecto de este modelo'],['anómala','Anómala respecto de este modelo'],['peligrosa','Prueba insegura / prohibida']].map(([id,label])=>
 '<option value="'+attr(id)+'" '+(s.prediction===id?'selected':'')+'>'+label+'</option>').join('')+'</select>'+
 button('Revelar resultado virtual','misfire-reveal',s.prediction?'':'disabled')+'</div>';
 }
 if(s.observations.length)html+='<div class="panel"><h3>Registro instrumental sintético</h3>'+
 s.observations.map(o=>{const p=misfireProbe(c.id,o.id);return '<div class="answer-card"><strong>'+esc(p.label)+'</strong>'+
 '<p>Predijiste: '+esc(o.prediction)+' · Resultado: '+esc(p.classify)+'</p><p class="muted">'+esc(p.reading)+'</p></div>';}).join('')+'</div>';
 html+='<div class="section"><h2>4. Conclusión razonada</h2></div><div class="panel">'+
 picker('misfire-final',s.final,'¿Qué causa está respaldada por las pruebas del modelo?')+
 '<label for="misfire-reason"><strong>Explicá los patrones por cilindro, la evidencia confirmatoria y la alternativa descartada</strong></label>'+
 '<textarea class="field" rows="6" maxlength="3000" id="misfire-reason" placeholder="Al menos 100 caracteres de razonamiento.">'+esc(s.reasoning)+'</textarea>'+
 '<p class="muted small">El texto se registra, pero no se evalúa semánticamente.</p>'+
 button('Corregir diagnóstico de cilindros','misfire-grade',!s.final||!s.observations.length||s.reasoning.trim().length<100?'disabled id="misfire-submit"':'id="misfire-submit"')+'</div>';
 return html;
}
function misfireSummary(c){
 const s=misfireTraining,r=misfireResult;
 return heading('RESULTADO DE BALANCE','Diagnóstico estructurado: '+r.score+'/100',
  'La puntuación refleja una rúbrica de datos ficticios, no una verificación de diagnóstico físico.')+
 '<div class="panel"><span class="tag '+(r.passed?'':'amber')+'">'+(r.passed?'Evidencias estructuradas completas':'Se requieren más pruebas o una conclusión distinta')+'</span>'+
 '<p><strong>Causa elegida:</strong> '+(r.correct?'correcta':'incorrecta')+
 ' · Confirmación: '+(r.confirming?'sí':'no')+' · Contraste: '+(r.contrary?'sí':'no')+
 ' · Comparación de regímenes: '+(r.compared?'sí':'no')+' · Pronóstico: '+(r.predicted?'sí':'no')+
 ' · Acción insegura: '+(r.unsafe?'sí':'no')+'</p>'+
 '<h3>Interpretación de referencia</h3><p>'+esc(c.explanation)+'</p>'+
 '<h3>Tu justificación, sin revisión profesional</h3><p>'+esc(s.reasoning)+'</p>'+
 '<p class="muted small">Una compresión relativa baja, un P030x o una diferencia de corriente no identifican necesariamente una pieza OEM. Este informe no constituye reparación ni certificación.</p>'+
 '<div class="row">'+button('Exportar informe (.md)','misfire-export')+
 button('Repetir investigación','misfire-start','data-id="'+attr(c.id)+'"','alt')+
 button('Volver a casos','misfire-quit','','alt')+'</div></div>';
}

function fuelMenu(){
 return heading('INYECCIÓN Y OBD-II','Investigar la mezcla, no cambiar piezas por un DTC',
 'Cuatro investigaciones sintéticas de motores MPI en lazo cerrado: correcciones de combustible, aire medido y verificaciones independientes.')+
 '<div class="notice">STFT/LTFT describen correcciones del control, no prueban una falla concreta. MAP, MAF, lambda y presión de combustible tienen supuestos de banco; la presión no se declara como PID genérico garantizado.</div>'+
 '<div class="grid">'+FUEL_CASES.map(c=>
 '<article class="panel"><span class="tag dim">INYECCIÓN · MODELO DIDÁCTICO</span><h3>'+esc(c.title)+'</h3><p class="muted">'+esc(c.symptom)+'</p>'+
 button('Investigar sistema','fuel-start','data-id="'+attr(c.id)+'"')+'</article>').join('')+'</div>';
}
function fuelChart(c,s){
 const rows=c.frames.filter(f=>s.opened.includes(f.id)),width=670,height=228,left=60,right=615,top=22,bottom=182;
 const y=v=>top+(40-v)/80*(bottom-top);
 const x=id=>left+(['idle','cruise','load'].indexOf(id)+.5)*(right-left)/3;
 const guides=[-40,-20,0,20,40].map(v=>'<line x1="'+left+'" x2="'+right+'" y1="'+y(v).toFixed(1)+'" y2="'+y(v).toFixed(1)+'" stroke="#304957"/>'+
 '<text x="'+(left-9)+'" y="'+(y(v)+4).toFixed(1)+'" font-size="12" text-anchor="end" fill="#b4cadd">'+(v>0?'+':'')+v+'%</text>').join('');
 const renderSeries=(key,color)=>rows.map((f,i)=>'<circle cx="'+x(f.id).toFixed(1)+'" cy="'+y(f[key]).toFixed(1)+'" r="5" fill="'+color+'"/>'+
 '<text x="'+x(f.id).toFixed(1)+'" y="'+(y(f[key])-10).toFixed(1)+'" fill="'+color+'" text-anchor="middle" font-size="12">'+(f[key]>0?'+':'')+f[key]+'%</text>').join('');
 return '<div class="wave-chart"><svg role="img" aria-label="Comparación STFT y LTFT de condiciones visitadas; no es una serie temporal ni una medición OEM" viewBox="0 0 '+width+' '+height+'">'+
 guides+renderSeries('stftPct','#60d9c7')+renderSeries('ltftPct','#ffba73')+
 c.frames.map(f=>'<text x="'+x(f.id)+'" y="210" text-anchor="middle" font-size="12" fill="#b4cadd">'+esc(f.label)+'</text>').join('')+'</svg></div>'+
 '<p class="muted small"><span style="color:#60d9c7">●</span> STFT y <span style="color:#ffba73">●</span> LTFT. Se muestran únicamente condiciones inspeccionadas: son puntos de funcionamiento, NO una captura temporal.</p>';
}
function fuelView(){
 const s=fuelTraining,c=FUEL_CASES.find(x=>x.id===s?.caseId);
 if(!c)return fuelMenu();
 if(fuelResult)return fuelSummary(c);
 const options=(id,value,label)=>'<label for="'+id+'"><strong>'+label+'</strong></label><select class="field" id="'+id+'"><option value="">Elegí una hipótesis</option>'+
 c.options.map(([valueId,name])=>'<option value="'+attr(valueId)+'" '+(valueId===value?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select>';
 let html='<div class="row spaced"><span class="eyebrow">MPI EN LAZO CERRADO · SOLO DATOS FICTICIOS</span>'+button('Salir','fuel-quit','','alt small')+'</div>'+
 '<h1>'+esc(c.title)+'</h1><div class="panel"><h3>Síntoma</h3><p>'+esc(c.symptom)+'</p><p class="muted">Las tres condiciones pertenecen al mismo motor didáctico, no a un automóvil real.</p></div>';
 if(!s.locked)return html+'<div class="section"><h2>1. Hipótesis antes de abrir las condiciones</h2></div><div class="panel">'+
 options('fuel-initial',s.initial,'¿Qué causa investigarías primero?')+
 '<p class="muted small">Se registra la hipótesis inicial, incluso si la cambiás al obtener evidencia.</p>'+
 button('Registrar hipótesis inicial','fuel-lock',s.initial?'':'disabled')+'</div>';
 html+='<div class="section"><h2>2. Compará ralentí, crucero y carga</h2></div>'+
 '<p class="muted">Tenés que abrir al menos ralentí y crucero para comparar sus correcciones.</p>'+
 '<div class="row trace-windows">'+c.frames.map(f=>button(f.label+(s.opened.includes(f.id)?' ✓':''),'fuel-open',
 'data-id="'+attr(f.id)+'"',s.opened.includes(f.id)?'':'alt')).join('')+'</div>';
 if(s.opened.length){
  html+='<div class="panel"><h3>Parámetros OBD simulados</h3>'+
 '<div class="table-scroll"><table><thead><tr><th>Condición</th><th>RPM</th><th>Carga</th><th>STFT</th><th>LTFT</th><th>MAP</th><th>MAF</th><th>λ</th></tr></thead><tbody>'+
 c.frames.filter(f=>s.opened.includes(f.id)).map(f=>'<tr><td>'+esc(f.label)+'</td><td>'+f.rpm+'</td><td>'+f.loadPct+'%</td><td>'+f.stftPct+'%</td><td>'+f.ltftPct+'%</td><td>'+f.mapKpa+' kPa</td><td>'+f.mafGps+' g/s</td><td>'+f.lambda+'</td></tr>').join('')+
 '</tbody></table></div>'+fuelChart(c,s)+
 '<p class="muted small">λ aquí representa un resultado ilustrativo de control en lazo cerrado; puede permanecer cercana a 1 porque la ECU está compensando. Las cifras y referencias no son especificaciones OEM.</p></div>';
 }
 html+='<div class="section"><h2>3. Elegí una prueba que diferencie causas</h2></div>'+
 '<div class="grid two">'+c.probes.map(p=>
 '<button class="probe panel" data-action="fuel-probe" data-id="'+attr(p.id)+'" '+(s.probes.some(o=>o.id===p.id)?'disabled':'')+'>'+esc(p.label)+(s.probes.some(o=>o.id===p.id)?' ✓':'')+'</button>').join('')+'</div>';
 if(s.pending){
  const p=fuelProbe(c.id,s.pending);
  html+='<div class="panel"><h3>Pronóstico previo</h3><p>'+esc(p.label)+'</p>'+
 '<label for="fuel-prediction">¿Qué resultado esperás de esta prueba?</label>'+
 '<select class="field" id="fuel-prediction"><option value="">Elegí antes de revelar</option>'+
 [['normal','Normal según referencia del banco'],['anormal','Anómalo respecto del banco'],['peligrosa','Acción insegura, no permitida']].map(([v,label])=>
 '<option value="'+v+'" '+(s.prediction===v?'selected':'')+'>'+label+'</option>').join('')+'</select>'+
 button('Revelar lectura virtual','fuel-reveal',s.prediction?'':'disabled')+'</div>';
 }
 if(s.probes.length)html+='<div class="panel"><h3>Registro de pruebas</h3>'+
 s.probes.map(o=>{const p=fuelProbe(c.id,o.id);return '<div class="answer-card"><strong>'+esc(p.label)+'</strong>'+
 '<p>Previsto: '+esc(o.prediction)+' · Observado: '+esc(p.classification)+'</p><p class="muted">'+esc(p.reading)+'</p></div>';}).join('')+'</div>';
 html+='<div class="section"><h2>4. Conclusión contrastada</h2></div><div class="panel">'+
 options('fuel-final',s.final,'Causa que mejor explica las pruebas')+
 '<label for="fuel-reason"><strong>Describí cómo variaron STFT/LTFT entre regímenes y qué medición confirmó tu hipótesis</strong></label>'+
 '<textarea class="field" rows="6" maxlength="3000" id="fuel-reason" placeholder="Explicá qué patrón observaste, cuál descartaste y por qué. Al menos 90 caracteres.">'+esc(s.reasoning)+'</textarea>'+
 '<p class="muted small">La calidad técnica del texto no es corregida por IA ni por un experto en esta versión.</p>'+
 button('Evaluar diagnóstico','fuel-grade',!s.final||!s.probes.length||s.reasoning.trim().length<90?'disabled id="fuel-submit"':'id="fuel-submit"')+'</div>';
 return html;
}
function fuelSummary(c){
 const s=fuelTraining,r=fuelResult;
 return heading('CORRECCIÓN DE INYECCIÓN','Resultado estructurado: '+r.score+'/100',
  'No se ha evaluado semánticamente tu explicación. Las mediciones son solo las de este banco simulado.')+
 '<div class="panel"><span class="tag '+(r.passed?'':'amber')+'">'+(r.passed?'Se cumplieron los criterios objetivos':'Faltan criterios o hay una elección incorrecta')+'</span>'+
 '<p><strong>Causa:</strong> '+(r.correct?'correcta':'incorrecta')+' · Prueba discriminante: '+(r.confirmed?'sí':'no')+
 ' · Comparaste ralentí y crucero: '+(r.compared?'sí':'no')+' · Pronóstico acertado: '+(r.predicted?'sí':'no')+
 ' · Acción insegura: '+(r.unsafe?'sí':'no')+'</p>'+
 '<h3>Interpretación del banco</h3><p>'+esc(c.explanation)+'</p>'+
 '<h3>Tu justificación sin revisión</h3><p>'+esc(s.reasoning)+'</p>'+
 '<p class="muted small">No constituye reparación, diagnóstico OEM ni certificación profesional.</p>'+
 '<div class="row">'+button('Descargar informe Markdown','fuel-export')+
 button('Nuevo intento','fuel-start','data-id="'+attr(c.id)+'"','alt')+
 button('Volver a inyección','fuel-quit','','alt')+'</div></div>';
}

function temporalMenu(){
 return heading('CORRELACIÓN TEMPORAL','El problema aparece y desaparece',
 'Revisá un buffer de seis capturas de 120 ms. La anomalía aparece en una sola ventana y exige comparar al menos dos canales con una captura normal.')+
 '<div class="notice">Todas las señales son sintéticas y didácticas. CKP/CMP no se traducen a grados reales OEM y las rampas de inyección no representan todos los inyectores.</div>'+
 '<div class="grid">'+TRACE_CASES.map(c=>
 '<article class="panel"><span class="tag dim">'+esc(tracks.find(t=>t.id===c.topic)?.title||c.topic)+'</span>'+
 '<h3>'+esc(c.title)+'</h3><p class="muted">'+esc(c.symptom)+'</p>'+
 button('Analizar buffer','trace-start','data-id="'+attr(c.id)+'"')+'</article>').join('')+'</div>';
}
function temporalView(){
 const s=traceTraining,c=TRACE_CASES.find(x=>x.id===s?.caseId);
 if(!c)return temporalMenu();
 if(traceResult)return temporalSummary(c);
 const choices=(elementId,value,label)=>'<label for="'+elementId+'"><strong>'+label+'</strong></label>'+
 '<select class="field" id="'+elementId+'"><option value="">Elegí causa…</option>'+
 c.causes.map(([id,title])=>'<option value="'+attr(id)+'" '+(id===value?'selected':'')+'>'+esc(title)+'</option>').join('')+'</select>';
 let html='<div class="row spaced"><div class="eyebrow">BUFFER TEMPORAL · SEÑALES SINTÉTICAS</div>'+
 button('Salir','trace-quit','','alt small')+'</div><h1>'+esc(c.title)+'</h1>'+
 '<div class="panel"><h3>Síntoma del banco</h3><p>'+esc(c.symptom)+'</p>'+
 '<p class="muted">'+esc(c.cue)+'</p><p class="muted small">Disponibles: CKP, CMP, comando de inyector, corriente de inyector y alimentación ECU. Intervalos y magnitudes ficticios.</p></div>';
 if(!s.locked)return html+'<div class="section"><h2>1. Hipótesis previa</h2></div><div class="panel">'+
 choices('trace-initial',s.initial,'Antes de abrir el buffer: ¿qué circuito sospechás?')+
 '<p class="muted small">La primera elección se conservará en el informe, incluso si luego descubrís otra causa.</p>'+
 button('Registrar hipótesis inicial','trace-lock',s.initial?'':'disabled')+'</div>';
 html+='<div class="section"><h2>2. Explorá las seis ventanas del buffer</h2></div>'+
 '<p class="muted">La ventana defectuosa no está marcada. Abrí distintas capturas y compará los canales con el mismo eje temporal.</p>'+
 '<div class="row trace-windows">'+Array.from({length:TRACE_WINDOWS},(_,i)=>button('Ventana '+(i+1)+(s.inspected.includes(i)?' ✓':''),'trace-capture',
 'data-id="'+i+'"',s.active===i?'':'alt')).join('')+'</div>'+
 '<div class="panel"><div class="grid two">'+[0,1].map(i=>
 '<div><label for="trace-channel-'+i+'">Canal '+(i+1)+'</label><select class="field" id="trace-channel-'+i+'">'+
 TRACE_CHANNELS.map(ch=>'<option value="'+attr(ch.id)+'" '+(traceChannels[i]===ch.id?'selected':'')+'>'+esc(ch.label)+'</option>').join('')+
 '</select></div>').join('')+'</div>'+
 '<p class="muted small">Para puntuar la comparación, ambos canales elegidos deben haberse visualizado en una ventana sana y la ventana de evento. Podés cambiar los canales y volver a capturar.</p></div>';
 if(s.active!==null)html+='<div class="section"><h2>Ventana '+(s.active+1)+' — oscilogramas</h2></div>'+
 '<div class="grid two">'+traceChannels.map(ch=>traceChannelGraph(c,s.active,ch)).join('')+'</div>';
 html+='<div class="section"><h2>3. Identificá el instante y la causa</h2></div><div class="panel">'+
 '<label for="trace-window"><strong>¿En cuál ventana ocurrió el evento?</strong></label>'+
 '<select class="field" id="trace-window"><option value="">Elegí ventana</option>'+
 Array.from({length:TRACE_WINDOWS},(_,i)=>'<option value="'+i+'" '+(s.selectedWindow===i?'selected':'')+'>Ventana '+(i+1)+'</option>').join('')+'</select>'+
 choices('trace-final',s.selectedCause,'Causa final: contrastá las alternativas')+
 '<fieldset class="component-options"><legend><strong>¿Qué dos señales permitieron comprobar tu conclusión?</strong></legend>'+
 TRACE_CHANNELS.map(ch=>'<label class="option"><input type="checkbox" name="trace-evidence" value="'+attr(ch.id)+'" '+
 (s.evidence.includes(ch.id)?'checked':'')+'><span>'+esc(ch.label)+'</span></label>').join('')+'</fieldset>'+
 '<label for="trace-reason"><strong>Explicá en qué ventanas y tiempos cambia cada canal, y qué causa descartás</strong></label>'+
 '<textarea class="field" rows="6" id="trace-reason" maxlength="3000" placeholder="Compará dos canales en una ventana normal y la de evento; fundamentá al menos 100 caracteres.">'+esc(s.reasoning)+'</textarea>'+
 '<p class="muted small">Se califica identificación de causa, ventana, pareja de canales efectivamente inspeccionados y existencia de justificación. No se corrige el texto por su significado.</p>'+
 button('Evaluar correlación','trace-grade',s.selectedWindow===null||!s.selectedCause||s.evidence.length!==2||s.reasoning.trim().length<100?'disabled id="trace-submit"':'id="trace-submit"')+'</div>';
 return html;
}
function temporalSummary(c){
 const s=traceTraining,r=traceResult;
 return heading('RESULTADO TEMPORAL','Correlación: '+r.score+'/100','La revisión se limita a evidencia estructurada y valores sintéticos. La explicación todavía requiere evaluación de un especialista.')+
 '<div class="panel"><span class="tag '+(r.passed?'':'amber')+'">'+(r.passed?'Criterios estructurados completos':'Faltan evidencias o hay una conclusión incorrecta')+'</span>'+
 '<p><strong>Ventana del evento:</strong> '+(r.expectedWindow+1)+' · La identificaste: '+(r.correctWindow?'sí':'no')+'</p>'+
 '<p><strong>Causa final:</strong> '+(r.correctCause?'correcta':'incorrecta')+' · Comparaste ambos canales de referencia en una ventana sana y otra con evento: '+(r.compared?'sí':'no')+'</p>'+
 '<p><strong>Pareja de referencia:</strong> '+esc(r.expectedEvidence.map(id=>TRACE_CHANNELS.find(x=>x.id===id)?.label||id).join(' / '))+'</p>'+
 '<div class="notice"><strong>Interpretación sintética:</strong> '+esc(c.explanation)+'</div>'+
 '<p><strong>Tu justificación (sin corrección semántica):</strong> '+esc(s.reasoning)+'</p>'+
 '<div class="row">'+button('Exportar informe Markdown','trace-export')+
 button('Nuevo buffer','trace-start','data-id="'+attr(c.id)+'"','alt')+
 button('Volver a casos','trace-quit','','alt')+'</div></div>';
}

function differentialMenu(){
 return heading('DIAGNÓSTICO DIFERENCIAL','Mismo síntoma, distinta causa',
  'Aprendé a identificar qué medición distingue dos hipótesis compatibles con la misma observación inicial.')+
 '<div class="notice">Cada investigación oculta una de dos causas sintéticas. Antes de observar cada instrumento tendrás que predecir el resultado. Los datos nunca provienen de un vehículo real.</div>'+
 '<div class="grid">'+differentialCases.map(c=>
 '<article class="panel"><span class="tag dim">'+esc(tracks.find(t=>t.id===c.topic)?.title||c.topic)+'</span>'+
 '<h3>'+esc(c.title)+'</h3><p class="muted">'+esc(c.symptom)+'</p>'+
 button('Investigar circuito','diff-start','data-id="'+attr(c.id)+'"')+'</article>').join('')+'</div>';
}
function differentialView(){
 const state=differentialTraining,c=differentialCases.find(x=>x.id===state?.caseId);
 if(!c)return differentialMenu();
 if(differentialResult)return differentialSummary(c);
 const options=(id,value,placeholder)=>'<label for="'+id+'"><strong>'+placeholder+'</strong></label>'+
 '<select class="field" id="'+id+'"><option value="">Elegí una causa</option>'+
 c.variants.map(v=>'<option value="'+attr(v.id)+'" '+(v.id===value?'selected':'')+'>'+esc(v.label)+'</option>').join('')+'</select>';
 let html='<div class="row spaced"><span class="eyebrow">CIRCUITOS · DIAGNÓSTICO DIFERENCIAL</span>'+
 button('Salir','diff-quit','','alt small')+'</div><h1>'+esc(c.title)+'</h1>'+
 '<div class="panel"><h3>Observación compartida</h3><p>'+esc(c.symptom)+'</p>'+
 '<p class="muted small">Cadena funcional: '+esc(c.circuit.join(' → '))+'</p>'+
 differentialGraph(c,state.variantIndex)+
 '<p><strong>Dos hipótesis plausibles:</strong> '+esc(c.variants.map(x=>x.label).join(' / '))+'</p>'+
 '<p class="muted small">Las dos pueden justificar la observación inicial. Necesitás una medida independiente que entregue resultados diferentes.</p></div>';
 if(!state.locked)return html+'<div class="section"><h2>1. Registrar hipótesis sin medir</h2></div>'+
 '<div class="panel">'+options('diff-initial',state.initial,'¿Qué sospechás primero?')+
 button('Registrar hipótesis inicial','diff-lock',state.initial?'':'disabled')+'</div>';
 html+='<div class="section"><h2>2. Medir tras formular predicciones</h2></div>'+
 '<div class="grid two">'+c.probes.map(p=>
 '<button class="probe panel" data-action="diff-probe" data-id="'+attr(p.id)+'" '+
 (state.observations.some(x=>x.id===p.id)?'disabled':'')+'>'+esc(p.label)+
 (state.observations.some(x=>x.id===p.id)?' ✓':'')+'</button>').join('')+'</div>';
 if(state.pending){
  const probe=c.probes.find(p=>p.id===state.pending);
  html+='<div class="panel"><h3>Predicción de la medición</h3><p>'+esc(probe.label)+'</p>'+
  '<label for="diff-prediction">¿Esperás una observación normal o anómala?</label>'+
  '<select class="field" id="diff-prediction"><option value="">Elegí antes de revelar</option>'+
  '<option value="normal" '+(state.pendingPrediction==='normal'?'selected':'')+'>Normal</option>'+
  '<option value="abnormal" '+(state.pendingPrediction==='abnormal'?'selected':'')+'>Anómala</option>'+
  '<option value="unsafe" '+(state.pendingPrediction==='unsafe'?'selected':'')+'>Acción insegura / no permitida</option></select>'+
  button('Revelar lectura del banco','diff-reveal',state.pendingPrediction?'':'disabled')+'</div>';
 }
 html+='<div class="section"><h2>Resultados observados</h2></div><div class="panel">'+
 (state.observations.length?state.observations.map(o=>{
 const p=getDifferentialProbe(c.id,state.variantIndex,o.id);
 return '<div class="answer-card"><strong>'+esc(p.label)+'</strong><p>Pronóstico: '+esc(o.prediction)+
 ' · Observado: '+esc(p.classification)+'</p><p class="muted">'+esc(p.reading)+'</p></div>';
 }).join(''):'<p class="muted">Sin mediciones. La curva inicial puede ser compatible con ambas causas.</p>')+'</div>'+
 '<div class="section"><h2>3. Decidir con evidencia</h2></div><div class="panel">'+
 options('diff-final',state.final,'Causa que explica todos los resultados')+
 '<label for="diff-reason"><strong>Explicá cuál lectura distingue ambas hipótesis y por qué</strong></label>'+
 '<textarea class="field" id="diff-reason" maxlength="3000" rows="6" placeholder="Incluí qué instrumento usaste, qué alternativa descartaste y qué esperabas obtener.">'+esc(state.reasoning)+'</textarea>'+
 '<p class="muted small">Al menos 100 caracteres. La longitud no demuestra validez técnica; tu texto queda sin revisión semántica.</p>'+
 button('Corregir investigación','diff-grade',(!state.final||!state.observations.length||state.reasoning.trim().length<100)?'disabled id="diff-submit"':'id="diff-submit"')+'</div>';
 return html;
}
function differentialSummary(c){
 const s=differentialTraining,r=differentialResult,solution=c.variants[s.variantIndex];
 return heading('RESULTADO DIFERENCIAL','Corrección '+r.score+'/100','Se evalúan hipótesis elegida, medición discriminante y pronóstico; la explicación no se revisó técnicamente.')+
 '<div class="panel"><span class="tag '+(r.passed?'':'amber')+'">'+(r.passed?'Rúbrica estructurada cumplida':'Criterios incompletos')+'</span>'+
 '<h3>La causa del modelo era: '+esc(solution.label)+'</h3><p>'+esc(solution.reason)+'</p>'+
 '<p><strong>Seleccionaste correctamente:</strong> '+(r.correct?'sí':'no')+' · Medición discriminante: '+(r.discriminated?'sí':'no')+
 ' · Predicción acertada: '+(r.predicted?'sí':'no')+' · Acción insegura: '+(r.unsafe?'sí':'no')+'</p>'+
 '<p class="muted">Límites: '+esc(c.limitation)+'</p>'+
 '<h3>Tu explicación sin revisión</h3><p>'+esc(s.reasoning)+'</p>'+
 '<p class="muted small">La puntuación no certifica competencias de diagnóstico físico.</p>'+
 '<div class="row">'+button('Descargar informe de investigación','diff-export')+
 button('Reintentar con otro escenario','diff-start','data-id="'+attr(c.id)+'"','alt')+
 button('Volver a casos','diff-quit','','alt')+'</div></div>';
}

function pathView(){
 const status=evaluateLearningPath(data,lessons);
 return heading('ITINERARIO TÉCNICO','Aprendizaje por niveles','Ruta orientativa y accesible sin bloqueo. Las lecturas y los exámenes se cuentan por separado; ninguna etapa acredita experiencia real.')+
 '<div class="grid two"><div class="panel"><div class="stat-number">'+status.read+'/'+status.total+'</div><p class="stat-label">Lecturas registradas</p></div>'+
 '<div class="panel"><div class="stat-number">'+status.approvedTopics+'/5</div><p class="stat-label">Áreas con al menos un examen ≥85%</p></div></div>'+
 '<div class="section"><h2>Tu siguiente contenido sugerido</h2></div><div class="panel">'+(status.nextLesson?
 '<h3>'+esc(lessons.find(l=>l.id===status.nextLesson)?.title||status.nextLesson)+'</h3>'+
 '<p class="muted">Podés avanzar a cualquier nivel; la sugerencia se basa exclusivamente en lecturas registradas.</p>'+
 button('Estudiar siguiente lección','path-lesson','data-id="'+attr(status.nextLesson)+'"'):
 '<h3>Recorrido de lecturas registrado</h3><p>Podés seguir repasando, rindiendo y realizando prácticas.</p>')+'</div>'+
 '<div class="section"><h2>Tres etapas del recorrido</h2></div>'+
 '<div class="stack">'+status.stages.map(stage=>
 '<article class="panel"><div class="row spaced"><div><span class="tag dim">ETAPA '+stage.order+'</span><h2 style="margin:12px 0 4px">'+esc(stage.name)+'</h2><p class="muted">'+esc(stage.subtitle)+'</p></div>'+
 '<strong>'+stage.read+'/'+stage.total+' lecturas</strong></div>'+
 '<div class="progress"><span style="width:'+Math.round(stage.read/stage.total*100)+'%"></span></div>'+
 '<p class="muted">'+esc(stage.goal)+'</p>'+
 '<div class="path-lessons">'+stage.lessons.map(id=>{
  const l=lessons.find(x=>x.id===id),done=Boolean(data.notes['lesson-'+id]);
  return '<button class="path-lesson" data-action="path-lesson" data-id="'+attr(id)+'"><span aria-hidden="true">'+(done?'✓':'○')+'</span><span>'+esc(l?.title||id)+'</span><small>'+esc(l?.topic||'')+'</small></button>';
 }).join('')+'</div>'+
 (stage.id==='ecu'?'<div class="row" style="margin-top:16px">'+button('Practicar en Banco ECU','nav','data-id="ecu"')+'</div>':'')+
 (stage.id==='components'?'<div class="row" style="margin-top:16px">'+button('Abrir laboratorio de componentes','open-components')+'</div>':'')+
 (stage.id==='differential'?'<div class="row" style="margin-top:16px">'+button('Practicar diagnóstico diferencial','nav','data-id="differential"')+'</div>':'')+
 (stage.id==='temporal'?'<div class="row" style="margin-top:16px">'+button('Examinar capturas temporales','nav','data-id="temporal"')+'</div>':'')+
 (stage.id==='fuel'?'<div class="row" style="margin-top:16px">'+button('Investigar sistemas de inyección','nav','data-id="fuel"')+'</div>':'')+
 (stage.id==='misfire'?'<div class="row" style="margin-top:16px">'+button('Practicar balance de cilindros','nav','data-id="misfire"')+'</div>':'')+
 (stage.id==='integrative'?'<div class="row" style="margin-top:16px">'+button('Abrir Taller Integrador','nav','data-id="integrative"')+'</div>':'')+
 '</article>').join('')+'</div>'+
 '<div class="notice">El avance por lectura no se interpreta como dominio de un tema. El puntaje de selección múltiple tampoco demuestra aptitud para diagnóstico real ni intervención HV.</div>';
}
function ecuMenu(){
 return heading('BANCO ECU','Investigar controladores sin cambiarlos a ciegas','Cinco modelos de banco sintético. Anticipá la observación antes de solicitarla y fundamentá por qué confirma o refuta tu diagnóstico.')+
 '<div class="notice">Los modelos no son especificaciones OEM, no se conectan a vehículos ni energizan componentes. La explicación libre requiere revisión humana.</div>'+
 '<div class="section"><h2>Elegí un caso</h2></div><div class="grid">'+ecuCases.map(c=>{
  const attempts=data.cases.filter(x=>x.id===c.id),last=attempts.at(-1);
  return '<article class="panel"><span class="tag dim">'+esc(tracks.find(t=>t.id===c.topic)?.title||c.topic)+'</span>'+
  '<h3>'+esc(c.title)+'</h3><p class="muted">'+esc(c.symptom)+'</p>'+
  (last?'<p class="muted small">Último resultado estructurado: '+last.score+'/100</p>':'')+
  button('Investigar ECU','ecu-start','data-id="'+attr(c.id)+'"')+'</article>';
 }).join('')+'</div>';
}
function ecuView(){
 const c=ecuCases.find(x=>x.id===ecuTraining?.id);
 if(!c)return ecuMenu();
 if(ecuResult)return ecuSummary(c);
 const choices=(field,label)=>'<label for="'+field+'"><strong>'+label+'</strong></label><select id="'+field+'" class="field"><option value="">Elegí una causa…</option>'+
  c.options.map(([id,name])=>'<option value="'+attr(id)+'" '+(ecuTraining[field]===id?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select>';
 let body='<div class="row spaced"><div class="eyebrow">BANCO ECU VIRTUAL</div>'+button('Salir','ecu-quit','','alt small')+'</div>'+
 '<h1>'+esc(c.title)+'</h1><div class="panel"><h3>Síntoma</h3><p>'+esc(c.symptom)+'</p><p class="muted">'+esc(c.context)+'</p></div>';
 if(!ecuTraining.locked)return body+
 '<div class="section"><h2>1. Hipótesis inicial, antes de medir</h2></div><div class="panel">'+
 choices('initial','¿Cuál investigarías primero?')+
 '<p class="muted small">Se conservará tu primera elección aunque luego cambies el diagnóstico final.</p>'+
 '<div class="row" style="margin-top:14px">'+button('Registrar hipótesis inicial','ecu-lock',ecuTraining.initial?'':'disabled')+'</div></div>';
 const seen=new Set(ecuTraining.observations.map(o=>o.id));
 body+='<div class="section"><h2>2. Predecí antes de observar</h2></div>'+
 '<p class="muted">Elegí una medición, indicá si esperás un resultado normal o anómalo, y recién después revelá el valor simulado.</p>'+
 '<div class="grid two">'+c.probes.map(p=>
 '<button class="probe panel" data-action="ecu-probe" data-id="'+attr(p.id)+'" '+(seen.has(p.id)?'disabled':'')+'>'+esc(p.label)+(seen.has(p.id)?' ✓':'')+'</button>'
 ).join('')+'</div>';
 if(ecuTraining.pendingProbe){
  const p=c.probes.find(x=>x.id===ecuTraining.pendingProbe);
  body+='<div class="panel" style="margin-top:15px"><h3>Pronóstico de la medición</h3><p>'+esc(p.label)+'</p>'+
  '<label for="ecu-prediction">¿Esperás un valor normal o anómalo?</label><select class="field" id="ecu-prediction">'+
  '<option value="">Elegí un resultado previsto…</option><option value="normal" '+(ecuTraining.pendingPrediction==='normal'?'selected':'')+'>Normal en las condiciones del banco</option>'+
  '<option value="abnormal" '+(ecuTraining.pendingPrediction==='abnormal'?'selected':'')+'>Anómalo en las condiciones del banco</option></select>'+
  '<div class="row" style="margin-top:14px">'+button('Revelar resultado sintético','ecu-reveal',ecuTraining.pendingPrediction?'':'disabled')+'</div></div>';
 }
 body+='<div class="section"><h2>Observaciones documentadas</h2></div><div class="panel">'+
 (ecuTraining.observations.length?ecuTraining.observations.map(o=>{
  const p=c.probes.find(p=>p.id===o.id);
  return '<div class="answer-card"><strong>'+esc(p.label)+'</strong><p>Predijiste: '+(o.prediction==='normal'?'normal':'anómalo')+
  ' · Observación: '+(p.observed==='normal'?'normal':'anómala')+'</p><p class="muted">'+esc(p.result)+'</p></div>';
 }).join(''):'<p class="muted">Sin observaciones: elegí una prueba discriminante.</p>')+'</div>'+
 '<div class="section"><h2>3. Diagnóstico argumentado</h2></div><div class="panel">'+choices('final','Causa que mejor explica las evidencias')+
 '<label for="ecu-reason"><strong>Explicá la medición confirmatoria y qué hipótesis descartaste</strong></label>'+
 '<textarea id="ecu-reason" class="field" rows="6" maxlength="3000" placeholder="Al menos 80 caracteres.">'+esc(ecuTraining.reasoning)+'</textarea>'+
 '<p class="muted small">Tu explicación queda registrada; no se revisa semánticamente.</p>'+
 button('Corregir banco ECU','ecu-grade',!ecuTraining.final||!ecuTraining.observations.length||ecuTraining.reasoning.trim().length<80?'disabled id="ecu-submit"':'id="ecu-submit"')+'</div>';
 return body;
}
function ecuSummary(c){
 const r=ecuResult;
 return heading('RESULTADO DE BANCO ECU','Corrección estructurada: '+r.score+'/100','Los datos son ficticios. La calidad técnica de tu razonamiento sigue sin revisión profesional.')+
 '<div class="panel"><span class="tag '+(r.passed?'':'amber')+'">'+(r.passed?'Rúbrica estructurada cumplida':'Falta evidencia o hay una acción incorrecta')+'</span>'+
 '<p>Causa correcta: '+(r.correct?'sí':'no')+' · Evidencia confirmatoria: '+(r.evidence?'sí':'no')+
 ' · Pronóstico correcto: '+(r.prediction?'sí':'no')+' · Maniobra insegura: '+(r.unsafe?'sí':'no')+'</p>'+
 '<h3>Interpretación del caso</h3><p>'+esc(c.rationale)+'</p>'+
 '<h3>Tu explicación no revisada</h3><p>'+esc(ecuTraining.reasoning)+'</p>'+
 '<p class="muted small">Se evalúan causalidad seleccionada, medición discriminante y predicción. El texto no se corrige semánticamente.</p>'+
 '<div class="row">'+button('Exportar informe (.md)','ecu-export')+button('Repetir caso','ecu-start','data-id="'+attr(c.id)+'"','alt')+
 button('Volver al banco','ecu-quit','','alt')+'</div></div>';
}

function learn(){
 const done=lessons.filter(l=>Boolean(data.notes['lesson-'+l.id])).length;
 return heading('ACADEMIA','Biblioteca de diagnóstico aplicado',lessons.length+' lecciones orientadas a interpretar mediciones, diagnosticar sin sustituir piezas al azar y trabajar con evidencia.')+
 '<div class="panel row spaced"><div><strong>'+done+' de '+lessons.length+' lecturas registradas</strong><p class="muted small">El registro es de lectura, no acredita dominio técnico.</p></div><span class="tag dim">Cinco especialidades</span></div>'+
 tracks.map(t=>{
  const group=lessons.filter(l=>l.topic===t.id),completed=group.filter(l=>data.notes['lesson-'+l.id]).length;
  return '<div class="section"><h2>'+esc(t.title)+'</h2><span class="tag dim">'+completed+'/'+group.length+' lecturas</span></div>'+
  '<div class="cards">'+group.map(l=>{
   const completed=Boolean(data.notes['lesson-'+l.id]);
   return '<article class="panel lesson-card"><div><span class="tag '+(completed?'':'dim')+'">'+(completed?'Lectura registrada':'Por estudiar')+'</span>'+
   '<h3 style="margin-top:12px">'+esc(l.title)+'</h3><p class="muted">'+l.minutes+' minutos sugeridos · '+l.sections.length+' temas</p></div>'+
   button(completed?'Revisar contenido':'Estudiar','lesson','data-id="'+attr(l.id)+'"','alt')+'</article>';
  }).join('')+'</div>';
 }).join('');
}
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

function multiView(){
 const c=multiFaultCases.find(c=>c.id===multiTraining?.id);
 if(!c)return caseMenu();
 if(multiResult)return multiSummary(c);
 const selection=(target,values)=>'<div class="stack">'+c.causes.map(([id,label])=>
 '<label class="option"><input type="checkbox" name="'+target+'" value="'+attr(id)+'" '+(values.includes(id)?'checked':'')+'><span>'+esc(label)+'</span></label>').join('')+'</div>';
 let html='<div class="row spaced"><span class="eyebrow">CASO MULTIFALLA · 2 CAUSAS SIMULTÁNEAS</span>'+button('Salir','multi-quit','','alt small')+'</div>'+
 '<h1>'+esc(c.title)+'</h1><div class="panel"><h3>Situación del taller virtual</h3><p>'+esc(c.symptom)+'</p><p class="muted">'+esc(c.context)+'</p>'+
 '<div class="notice">Todas las mediciones son sintéticas. Ninguna maniobra física ni inyección en vehículo real.</div></div>';
 if(!multiTraining.started)return html+
 '<div class="section"><h2>1. Planteá dos hipótesis iniciales</h2></div><div class="panel"><p class="muted">Antes de observar pruebas, elegí exactamente dos causas que podrían coexistir. Después podrás corregirlas al formular tu conclusión.</p>'+
 selection('multi-initial',multiTraining.hypotheses)+button('Registrar hipótesis y habilitar instrumentos','multi-lock',multiTraining.hypotheses.length!==2?'disabled':'')+'</div>';
 html+='<div class="section"><h2>2. Reuní pruebas independientes</h2></div><div class="grid two">'+c.probes.map(p=>
 '<button class="probe panel" data-action="multi-probe" data-id="'+attr(p.id)+'" '+(multiTraining.used.includes(p.id)?'disabled':'')+'>'+esc(p.label)+(multiTraining.used.includes(p.id)?' ✓':'')+'</button>').join('')+'</div>'+
 '<div class="section"><h2>Registro de mediciones</h2></div><div class="panel">'+(multiTraining.used.length?
 multiTraining.used.map(id=>{const p=c.probes.find(x=>x.id===id);return '<div class="answer-card"><strong>'+esc(p.label)+'</strong><p class="muted">'+esc(p.result)+'</p></div>';}).join(''):
 '<p class="muted">Todavía no tenés resultados; elegí las pruebas con mayor capacidad discriminante.</p>')+'</div>'+
 '<div class="section"><h2>3. Diagnóstico final: dos causas</h2></div><div class="panel"><p>Hipótesis iniciales: '+multiTraining.hypotheses.map(id=>esc(c.causes.find(pair=>pair[0]===id)?.[1])).join(' y ')+'</p>'+
 selection('multi-final',multiTraining.selected)+
 '<label for="multi-reason"><strong>Explicá qué resultado respalda cada causa y cuál es el dato distractor</strong></label>'+
 '<textarea id="multi-reason" class="field" maxlength="3000" rows="6" placeholder="Describe ambas fallas, dos evidencias independientes y por qué ninguna causa única explica todo.">'+esc(multiTraining.reasoning)+'</textarea>'+
 '<p class="muted small">Mínimo 80 caracteres. La redacción se registra pero no se corrige semánticamente.</p>'+
 button('Evaluar diagnóstico conjunto','multi-finish',(!multiTraining.used.length||multiTraining.selected.length!==2||multiTraining.reasoning.trim().length<80)?'disabled id="multi-submit"':'id="multi-submit"')+'</div>';
 return html;
}
function multiSummary(c){
 const r=multiResult;
 return heading('EVALUACIÓN MULTIFALLA','Resultado: '+r.score+'/100','Se evalúan causas seleccionadas y pruebas independientes, no la calidad semántica de tu explicación.')+
 '<div class="panel"><span class="tag '+(r.passed?'':'amber')+'">'+(r.passed?'Criterios estructurados alcanzados':'Requiere investigar nuevamente')+'</span>'+
 '<p><strong>Identificación exacta de las dos causas:</strong> '+(r.exact?'sí':'no')+'</p>'+
 '<p><strong>Causas respaldadas por evidencia independiente:</strong> '+r.proven.length+' de 2</p>'+
 '<p><strong>Maniobra insegura:</strong> '+(r.unsafe?'sí':'no')+'</p>'+
 '<div class="notice">'+esc(c.rationale)+'</div>'+
 '<h3>Tu explicación</h3><p>'+esc(multiTraining.reasoning)+'</p>'+
 '<p class="muted small">La explicación no ha sido verificada por un profesional. Esta evaluación no certifica competencia técnica.</p>'+
 '<div class="row">'+button('Descargar informe de multifalla','multi-export')+
 button('Volver al taller','multi-quit','','alt')+
 button('Repetir caso','start-multi','data-id="'+attr(c.id)+'"','alt')+'</div></div>';
}
function portfolioView(){
 const snap=portfolioSnapshot(data,lessons);
 const visible=snap.events.filter(e=>portfolioFilter==='all'||(portfolioFilter==='exam'?e.kind==='exam':portfolioFilter==='lab'?e.kind==='lab':e.kind!=='exam'&&e.kind!=='lab')).slice(0,40);
 const num=n=>String(n);
 return heading('PORTAFOLIO','Evidencias de tu formación','Historial de simulaciones, repasos y lecturas guardado exclusivamente en este navegador; sin certificaciones ni afirmaciones de experiencia real.')+
 '<div class="grid"><div class="panel"><div class="stat-number">'+num(snap.totals.exams)+'</div><div class="stat-label">Exámenes teóricos</div></div>'+
 '<div class="panel"><div class="stat-number">'+num(snap.totals.practices)+'</div><div class="stat-label">Prácticas registradas</div></div>'+
 '<div class="panel"><div class="stat-number">'+num(snap.totals.completedLessons)+'/'+num(snap.totals.knownLessons)+'</div><div class="stat-label">Lecciones registradas</div></div></div>'+
 '<div class="panel" style="margin-top:14px"><h3>Registro profesional en formación</h3>'+
 '<p class="muted">Las puntuaciones de exámenes, casos y laboratorios no son comparables y las justificaciones todavía requieren un revisor humano. El informe exporta solo lo registrado localmente.</p>'+
 '<div class="row">'+button('Descargar portafolio Markdown','portfolio-export')+button('Respaldar JSON completo','nav','data-id="data"','alt')+'</div>'+
 '<p class="muted small">Estudio estimado registrado: '+snap.totals.studyMinutes+' min · Preguntas programadas: '+snap.totals.reviewItems+' · Tarjetas FSRS: '+snap.totals.fsrsItems+'</p></div>'+
 '<div class="section"><h2>Actividad reciente</h2></div>'+
 '<div class="panel"><label for="portfolio-filter">Filtrar registros</label><select id="portfolio-filter" class="field">'+
 [['all','Todos'],['exam','Exámenes'],['diagnostic','Diagnóstico y retos'],['lab','Laboratorios']].map(([id,label])=>'<option value="'+id+'" '+(portfolioFilter===id?'selected':'')+'>'+label+'</option>').join('')+'</select>'+
 (visible.length?'<div class="portfolio-list">'+visible.map(e=>
 '<div class="portfolio-entry"><div class="row spaced"><strong>'+esc(e.title)+'</strong><span class="tag dim">'+e.score+'/100</span></div>'+
 '<p class="muted small">'+esc(e.at?.slice(0,10)||'sin fecha')+' · '+esc(e.kind)+'</p>'+
 (e.evidence.length?'<p class="muted small">Pruebas: '+esc(e.evidence.join(', '))+'</p>':'')+
 (e.reasoning?'<details><summary>Ver razonamiento registrado</summary><p>'+esc(e.reasoning)+'</p></details>':'')+
 (e.kind==='integrative'&&e.report?'<div class="row" style="margin-top:8px">'+button('Descargar expediente y fuentes','integral-download','data-id="'+attr(e.id)+'" data-at="'+attr(e.at)+'"','alt small')+'</div>':'')+
 '</div>').join('')+'</div>':'<p class="muted">Todavía no hay actividades para este filtro.</p>')+'</div>'+
 '<p class="muted small">Para exportar todos los registros disponibles, utilizá Descargar portafolio. El respaldo JSON original conserva el resto de tus datos.</p>';
}

function caseMenu(){
 const attempts=data.cases.length;
 const best=new Map();
 for(const row of data.cases) best.set(row.id,Math.max(best.get(row.id)||0,row.score));
 return heading('TALLER VIRTUAL','Laboratorio de diagnóstico','15 escenarios sintéticos. Formulá hipótesis ANTES de medir, contrastá evidencias y emití un informe. No equivale a práctica profesional real.')+
 '<div class="panel row spaced"><div><h3>'+cases.length+' casos disponibles</h3><p class="muted">'+attempts+' intentos registrados · Los resultados requieren revisión técnica externa.</p></div><span class="tag dim">Rúbrica por evidencias</span></div>'+
 '<div class="section"><h2>Casos con dos fallas simultáneas</h2></div><div class="grid">'+multiFaultCases.map(c=>'<article class="panel"><span class="tag amber">Experto · multifalla</span><h3>'+esc(c.title)+'</h3><p class="muted">'+esc(c.symptom)+'</p>'+button('Investigar dos fallas','start-multi','data-id="'+attr(c.id)+'"')+'</article>').join('')+'</div>'+
 '<div class="section"><h2>Casos de una falla</h2></div><div class="grid">'+cases.map(c=>
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


function waveView(){
 const c=WAVEFORM_SCENARIOS.find(s=>s.id===waveState.id),w=generateWaveform(waveState.id);
 const width=760,height=276,px=58,py=24,pw=664,ph=196;
 const y=v=>py+ph-(v/c.yMax)*ph,x=t=>px+(t/c.duration)*pw;
 const traces=w.labels.map((label,index)=>'<path d="'+w.series.map((p,i)=>(i?'L':'M')+x(p.t).toFixed(2)+' '+y(p.values[index]).toFixed(2)).join(' ')+'" fill="none" stroke="'+(index===0?'#60d9c7':'#ffba73')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>').join('');
 const grid=[0,1,2,3,4].map(n=>{const val=c.yMax*n/4,yy=y(val);return '<line x1="'+px+'" x2="'+(px+pw)+'" y1="'+yy.toFixed(1)+'" y2="'+yy.toFixed(1)+'" stroke="#345065" stroke-width="1"/>'+
  '<text x="'+(px-9)+'" y="'+(yy+4).toFixed(1)+'" text-anchor="end" font-size="12" fill="#b4cadd">'+val.toFixed(1)+' V</text>';}).join('')+
 [0,1,2,3,4].map(n=>{const t=c.duration*n/4,xx=x(t);return '<line x1="'+xx.toFixed(1)+'" x2="'+xx.toFixed(1)+'" y1="'+py+'" y2="'+(py+ph)+'" stroke="#213949" stroke-width="1"/>'+
 '<text x="'+xx.toFixed(1)+'" y="'+(height-15)+'" text-anchor="middle" font-size="12" fill="#b4cadd">'+t.toFixed(1)+' '+c.unit+'</text>';}).join('');
 return '<div class="panel"><h2>Osciloscopio didáctico</h2>'+
 '<p class="muted">Gráficos de señales creadas matemáticamente para aprender. No son capturas OEM ni se conectan a un vehículo.</p>'+
 '<label for="wave-scenario">Elegí la señal</label><select class="field" id="wave-scenario">'+WAVEFORM_SCENARIOS.map(p=>'<option value="'+attr(p.id)+'" '+(p.id===waveState.id?'selected':'')+'>'+esc(p.title)+'</option>').join('')+'</select>'+
 '<h3 style="margin-top:18px">'+esc(c.title)+'</h3><p class="muted">'+esc(c.description)+'</p>'+
 '<div class="wave-chart"><svg role="img" aria-label="'+esc(c.title+'; '+c.description)+'" viewBox="0 0 '+width+' '+height+'" preserveAspectRatio="xMidYMid meet"><rect x="'+px+'" y="'+py+'" width="'+pw+'" height="'+ph+'" fill="#081c2b" rx="6"/>'+grid+traces+'</svg></div>'+
 '<p class="muted small">'+w.labels.map((l,i)=>'<span class="wave-legend" style="color:'+(i?'var(--amber)':'var(--mint)')+'">━━ '+esc(l)+'</span>').join('')+'</p>'+
 '<div class="notice">La amplitud, los tiempos y la topología son supuestos del ejercicio; no los utilices como rangos universales de diagnóstico.</div>'+
 '<hr class="divider"/><h3>Interpretá la medición</h3><p>'+esc(c.question)+'</p>'+
 '<label for="wave-answer">Respuesta en '+esc(c.answerUnit)+'</label><input id="wave-answer" type="text" inputmode="decimal" maxlength="30" autocomplete="off" class="field" placeholder="Escribí un número" value="'+attr(waveState.answer)+'"/>'+
 '<div class="row" style="margin-top:15px">'+button('Corregir interpretación','wave-grade')+'</div>'+
 (waveState.result?'<div class="result"><strong class="'+(waveState.result.success?'outcome-good':'outcome-bad')+'">'+(waveState.result.success?'Correcto':'Fuera de tolerancia')+'</strong>'+
 '<p>Esperado: '+c.target+' '+esc(c.answerUnit)+' · '+esc(c.formula)+'</p>'+
 '<p class="muted small">La puntuación verifica solo el resultado numérico de este ejemplo. La interpretación de una captura real necesita documentación, instrumental y un especialista.</p></div>':'')+
 '<div class="section">'+link(c.source,'Consultar la referencia técnica')+'</div></div>';
}


function componentDiagram(s){
 const rect=(x,text)=>'<rect x="'+x+'" y="44" width="146" height="72" rx="10" fill="#17374b" stroke="#519d9d" stroke-width="2"/>'+
 '<text x="'+(x+73)+'" y="82" fill="#e9f3fb" font-size="14" text-anchor="middle">'+esc(text)+'</text>';
 const arrow=x=>'<path d="M'+x+' 80 h 30 l -8 -6 m 8 6 l -8 6" stroke="#60d9c7" fill="none" stroke-width="2.5"/>';
 return '<div class="component-diagram"><svg role="img" aria-label="'+esc('Trayecto funcional esquemático: '+s.path.join(', '))+
 '" viewBox="0 0 780 160" preserveAspectRatio="xMidYMid meet">'+s.path.map((p,i)=>rect(14+i*196,p)+(i<3?arrow(160+i*196):'')).join('')+
 '<text x="14" y="143" fill="#a5bcce" font-size="11">Esquema conceptual de bloques · no es un plano de conexiones</text></svg></div>';
}
function componentCurve(condition){
 const points=rcSamples(condition,110),W=660,H=240,left=49,top=19,w=585,h=174;
 const x=t=>left+t/.2*w,y=v=>top+h-v/12*h;
 const poly=key=>points.map((p,i)=>(i?'L':'M')+x(p.t).toFixed(2)+' '+y(p[key]).toFixed(2)).join(' ');
 const grid=[0,3,6,9,12].map(v=>'<line x1="'+left+'" x2="'+(left+w)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#2c465a"/>'+
 '<text x="39" y="'+(y(v)+4)+'" text-anchor="end" fill="#a5bcce" font-size="11">'+v+' V</text>').join('');
 return '<div class="component-diagram"><svg role="img" aria-label="Curva de carga RC ideal; referencia nominal y condición seleccionada durante 200 ms" viewBox="0 0 '+W+' '+H+'">'+
 grid+'<path d="'+poly('nominal')+'" fill="none" stroke="#ffba73" stroke-width="2" stroke-dasharray="6 5"/>'+
 '<path d="'+poly('observed')+'" fill="none" stroke="#60d9c7" stroke-width="3"/>'+
 '<text x="'+left+'" y="229" fill="#a5bcce" font-size="11">0 ms</text><text x="'+(left+w)+'" y="229" text-anchor="end" fill="#a5bcce" font-size="11">200 ms</text></svg>'+
 '<p class="muted small"><span style="color:var(--mint)">━━</span> Modelo de la condición elegida · <span style="color:var(--amber)">┅┅</span> Condición nominal</p></div>';
}
function componentView(){
 const s=componentScenarios.find(x=>x.id===componentState.id);
 const a=componentState,result=a.result;
 let body='<div class="panel"><span class="tag dim">MODELO ALGEBRAICO · 12 V O MENOS</span><h2>Banco de componentes electrónicos</h2>'+
 '<p class="muted">Practicá cálculo de circuitos resistivos, MOSFET, shunt, RC y energía de bobina. Es un modelo matemático acotado, no un solver SPICE ni una medición física.</p>'+
 '<div class="grid two"><div><label for="component-scenario">Circuito</label><select id="component-scenario" class="field">'+
 componentScenarios.map(c=>'<option value="'+attr(c.id)+'" '+(c.id===a.id?'selected':'')+'>'+esc(c.title)+'</option>').join('')+'</select></div>'+
 '<div><label for="component-condition">Condición del banco</label><select id="component-condition" class="field">'+
 '<option value="nominal" '+(a.condition==='nominal'?'selected':'')+'>Referencia nominal</option>'+
 '<option value="fault" '+(a.condition==='fault'?'selected':'')+'>Componente alterado (sintético)</option></select></div></div>'+
 '<p class="muted small" style="margin-top:12px">La condición alterada se explica tras corregir. Todos los parámetros son ideales y pertenecen únicamente a este ejercicio.</p></div>'+
 '<div class="section"><h2>1. Analizá el circuito</h2></div><div class="panel"><h3>'+esc(s.title)+'</h3>'+
 '<p>'+esc(s.description)+'</p>'+componentDiagram(s)+
 (s.id==='rc'?componentCurve(a.condition):'')+
 '<p class="muted"><strong>Modelo:</strong> '+esc(s.formula)+'</p>'+
 '<p class="muted"><strong>Magnitud a estimar:</strong> '+esc(s.measure)+'</p></div>';
 if(!result)body+='<div class="section"><h2>2. Calculá y elegí evidencia</h2></div><div class="panel">'+
 '<label for="component-number"><strong>Valor calculado en '+esc(s.unit)+'</strong></label>'+
 '<input id="component-number" class="field" type="text" inputmode="decimal" autocomplete="off" maxlength="40" placeholder="Ingresá un número" value="'+attr(a.value)+'"/>'+
 '<p class="muted small">El sistema acepta coma o punto decimal. Necesitás interpretar los supuestos para calcular el resultado.</p>'+
 '<fieldset class="component-options"><legend><strong>¿Qué medida corroboraría el resultado?</strong></legend>'+
 s.options.map(([id,description])=>'<label class="option"><input type="radio" name="component-evidence" value="'+attr(id)+'" '+(a.evidence===id?'checked':'')+'><span>'+esc(description)+'</span></label>').join('')+
 '</fieldset><label for="component-reason"><strong>Explicá tu cálculo y el criterio de medición</strong></label>'+
 '<textarea id="component-reason" class="field" maxlength="2000" rows="5" placeholder="Explicá cómo calculaste el valor y por qué la medición elegida sería pertinente.">'+esc(a.reasoning)+'</textarea>'+
 '<p class="muted small">Justificación mínima: 70 caracteres. La calidad técnica del texto no se evalúa automáticamente.</p>'+
 button('Evaluar circuito','component-grade')+'</div>';
 else body+='<div class="section"><h2>Resultado de la práctica</h2></div><div class="panel">'+
 '<div class="stat-number">'+result.score+'/100</div>'+
 '<span class="tag '+(result.passed?'':'amber')+'">'+(result.passed?'Criterios estructurados completos':'Criterios incompletos')+'</span>'+
 '<p>Valor calculado: '+esc(a.value)+' '+esc(s.unit)+' · Referencia del modelo: '+result.expected.toFixed(4)+' '+esc(s.unit)+'</p>'+
 '<p>Tolerancia ±'+result.tolerance.toFixed(4)+' '+esc(s.unit)+' · Magnitud: '+esc(s.measure)+'</p>'+
 '<p><strong>Modelo nominal:</strong> '+result.baseline.toFixed(4)+' '+esc(s.unit)+'</p>'+
 (a.condition==='fault'?'<div class="notice"><strong>Alteración hipotética:</strong> '+esc(s.fault)+'</div>':'')+
 '<p>Elección de evidencia: '+(result.evidence?'adecuada':result.unsafe?'insegura, calificación anulada':'insuficiente')+'</p>'+
 '<p><strong>Tu razonamiento (no revisado por expertos):</strong> '+esc(a.reasoning)+'</p>'+
 '<div class="row">'+button('Descargar informe Markdown','component-export')+
 button('Nuevo intento','component-retry','','alt')+'</div></div>';
 body+='<p class="muted small" style="margin-top:20px">'+link(s.source,'Fuente técnica para ampliar conceptos')+
 ' · No se utilizan datos OEM ni ensayos físicos. CircuitJS externo continúa disponible para simulaciones de circuito más complejas.</p>';
 return body;
}

function labView(){
 const mode=labState.mode;
 let body=heading('LABORATORIOS','Instrumentación y simulación','Entornos de entrenamiento. CAN es lectura de archivos sin conexión; CircuitJS es una herramienta externa y requiere Internet.');
 body+='<div class="row" style="margin:0 0 22px">'+button('Analizador CAN','lab-mode','data-id="can"',mode==='can'?'':'alt')+button('Osciloscopio','lab-mode','data-id="wave"',mode==='wave'?'':'alt')+button('Componentes','lab-mode','data-id="components"',mode==='components'?'':'alt')+button('Baterías / BMS','lab-mode','data-id="bms"',mode==='bms'?'':'alt')+button('Circuitos con CircuitJS','lab-mode','data-id="circuit"',mode==='circuit'?'':'alt')+'</div>';
 if(mode==='components')return body+componentView();
 if(mode==='bms')return body+bmsView();
 if(mode==='wave')return body+waveView();
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
function render(){let body=page==='home'?home():page==='learn'?(selectedLesson?lessonView():learn()):page==='exams'?(exam?examView():examMenu()):page==='path'?pathView():page==='ecu'?(ecuTraining?ecuView():ecuMenu()):page==='differential'?(differentialTraining?differentialView():differentialMenu()):page==='temporal'?(traceTraining?temporalView():temporalMenu()):page==='fuel'?(fuelTraining?fuelView():fuelMenu()):page==='misfire'?(misfireTraining?misfireView():misfireMenu()):page==='integrative'?(integralTraining?integrativeView():integrativeMenu()):page==='cases'?(multiTraining?multiView():training?caseView():caseMenu()):page==='portfolio'?portfolioView():page==='challenges'?(quantitative?challengeView():challengeMenu()):page==='labs'?labView():page==='resources'?resourceView():dataView();layout(body);}
document.addEventListener('input',event=>{
if(integralTraining&&!integralResult&&['integral-reason','integral-uncertainty'].includes(event.target.id)){
 const s=integralTraining;
 if(event.target.id==='integral-reason')s.reasoning=event.target.value;
 else s.uncertainty=event.target.value;
 const button=document.getElementById('integral-submit');
 if(button)button.disabled=!s.final||!s.observations.length||s.reasoning.trim().length<120||s.uncertainty.trim().length<60;
 return;
}

if(event.target.id==='misfire-reason'&&misfireTraining&&!misfireResult){
 misfireTraining.reasoning=event.target.value;
 const button=document.getElementById('misfire-submit');
 if(button)button.disabled=!misfireTraining.final||!misfireTraining.observations.length||misfireTraining.reasoning.trim().length<100;
 return;
}

if(event.target.id==='fuel-reason'&&fuelTraining&&!fuelResult){
 fuelTraining.reasoning=event.target.value;
 const node=document.getElementById('fuel-submit');
 if(node)node.disabled=!fuelTraining.final||!fuelTraining.probes.length||fuelTraining.reasoning.trim().length<90;
 return;
}

if(event.target.id==='trace-reason'&&traceTraining&&!traceResult){
 traceTraining.reasoning=event.target.value;
 const btn=document.getElementById('trace-submit');
 if(btn)btn.disabled=traceTraining.selectedWindow===null||!traceTraining.selectedCause||traceTraining.evidence.length!==2||traceTraining.reasoning.trim().length<100;
 return;
}

if(event.target.id==='diff-reason'&&differentialTraining&&!differentialResult){
 differentialTraining.reasoning=event.target.value;
 const node=document.getElementById('diff-submit');
 if(node)node.disabled=!differentialTraining.final||!differentialTraining.observations.length||differentialTraining.reasoning.trim().length<100;
 return;
}

if(event.target.id==='component-number'){componentState.value=event.target.value;return;}
if(event.target.id==='component-reason'){componentState.reasoning=event.target.value;return;}

if(event.target.id==='ecu-reason'&&ecuTraining&&!ecuResult){
 ecuTraining.reasoning=event.target.value;
 const btn=document.getElementById('ecu-submit');
 if(btn)btn.disabled=!ecuTraining.final||!ecuTraining.observations.length||ecuTraining.reasoning.trim().length<80;
 return;
}
if(event.target.id==='multi-reason'&&multiTraining){multiTraining.reasoning=event.target.value;const btn=document.getElementById('multi-submit');if(btn)btn.disabled=multiTraining.reasoning.trim().length<80||multiTraining.selected.length!==2||!multiTraining.used.length;return;}

 if(event.target.id==='wave-answer'){waveState.answer=event.target.value;return;}
 if(!quantitative||quantitativeResults)return;
 const id=event.target.id;
 if(id!=='quant-value'&&id!=='quant-reason')return;
 const q=quantitative.items[quantitative.index];
 const a=quantitative.answers[q.id]||(quantitative.answers[q.id]={value:'',measurement:'',reasoning:''});
 if(id==='quant-value')a.value=event.target.value;
 if(id==='quant-reason')a.reasoning=event.target.value;
});
document.addEventListener('change',event=>{
if(integralTraining&&!integralResult){
 const session=integralTraining,id=event.target.id;
 if(id==='integral-initial'){session.initial=event.target.value;render();return;}
 if(id==='integral-final'){session.final=event.target.value;render();return;}
 if(id==='integral-prediction'){session.prediction=event.target.value;render();return;}
}

if(misfireTraining&&!misfireResult){
 const id=event.target.id,session=misfireTraining;
 if(id==='misfire-initial'){session.initial=event.target.value;render();return;}
 if(id==='misfire-final'){session.final=event.target.value;render();return;}
 if(id==='misfire-prediction'){session.prediction=event.target.value;render();return;}
}

if(fuelTraining&&!fuelResult){
 const id=event.target.id,s=fuelTraining;
 if(id==='fuel-initial'){s.initial=event.target.value;render();return;}
 if(id==='fuel-final'){s.final=event.target.value;render();return;}
 if(id==='fuel-prediction'){s.prediction=event.target.value;render();return;}
}

if(traceTraining&&!traceResult){
 const s=traceTraining,id=event.target.id;
 if(id==='trace-initial'){s.initial=event.target.value;render();return;}
 if(id==='trace-final'){s.selectedCause=event.target.value;render();return;}
 if(id==='trace-window'){s.selectedWindow=event.target.value===''?null:Number(event.target.value);render();return;}
 if(id==='trace-channel-0'||id==='trace-channel-1'){
  traceChannels[id==='trace-channel-0'?0:1]=event.target.value;
  if(s.active!==null){const seen=new Set(s.viewed[s.active]||[]);traceChannels.forEach(ch=>seen.add(ch));s.viewed[s.active]=[...seen];}
  render();return;
 }
 if(event.target.name==='trace-evidence'){
  const seen=new Set(s.evidence);if(event.target.checked)seen.add(event.target.value);else seen.delete(event.target.value);
  s.evidence=[...seen];render();return;
 }
}

if(differentialTraining&&!differentialResult&&['diff-initial','diff-final','diff-prediction'].includes(event.target.id)){
 const field=event.target.id==='diff-initial'?'initial':event.target.id==='diff-final'?'final':'pendingPrediction';
 differentialTraining[field]=event.target.value;
 const buttonAction=field==='initial'?'diff-lock':field==='pendingPrediction'?'diff-reveal':'diff-grade';
 const button=document.querySelector('[data-action="'+buttonAction+'"]');
 if(button)button.disabled=field==='initial'?!differentialTraining.initial:
  field==='pendingPrediction'?!differentialTraining.pendingPrediction:
  !differentialTraining.final||!differentialTraining.observations.length||differentialTraining.reasoning.trim().length<100;
 return;
}

if(event.target.id==='component-scenario'||event.target.id==='component-condition'){
 componentState={id:event.target.id==='component-scenario'?event.target.value:componentState.id,
  condition:event.target.id==='component-condition'?event.target.value:componentState.condition,
  value:'',evidence:'',reasoning:'',result:null};
 render();return;
}
if(event.target.name==='component-evidence'){
 componentState.evidence=event.target.value;return;
}

if(ecuTraining&&!ecuResult&&['initial','final','ecu-prediction'].includes(event.target.id)){
 const field=event.target.id==='ecu-prediction'?'pendingPrediction':event.target.id;
 ecuTraining[field]=event.target.value;
 const id=field==='initial'?'ecu-lock':field==='pendingPrediction'?'ecu-reveal':'ecu-submit';
 const button=document.querySelector('[data-action="'+id+'"]');
 if(button)button.disabled=field==='initial'?!ecuTraining.initial:field==='pendingPrediction'?!ecuTraining.pendingPrediction:!ecuTraining.final||!ecuTraining.observations.length||ecuTraining.reasoning.trim().length<80;
 return;
}
if(event.target.id==='portfolio-filter'){portfolioFilter=event.target.value;render();return;}
if((event.target.name==='multi-initial'||event.target.name==='multi-final')&&multiTraining&&!multiResult){
 const collection=event.target.name==='multi-initial'?'hypotheses':'selected';
 const values=new Set(multiTraining[collection]);
 if(event.target.checked)values.add(event.target.value);else values.delete(event.target.value);
 multiTraining[collection]=[...values];
 const btn=document.getElementById(collection==='hypotheses'?'multi-lock':'multi-submit');
 if(btn)btn.disabled=collection==='hypotheses'?values.size!==2:values.size!==2||multiTraining.reasoning.trim().length<80||!multiTraining.used.length;
 return;
}if(event.target.id==='wave-scenario'){waveState={id:event.target.value,answer:'',result:null};render();}if(event.target.name==='quant-evidence'&&quantitative&&!quantitativeResults){const q=quantitative.items[quantitative.index];const a=quantitative.answers[q.id]||(quantitative.answers[q.id]={value:'',measurement:'',reasoning:''});a.measurement=event.target.value;}if(event.target.name==='answer'&&exam){exam.answers[exam.questions[exam.at].id]=Number(event.target.value);render();}if(event.target.name==='confidence'&&exam){exam.confidence[exam.questions[exam.at].id]=event.target.value;render();}if(event.target.id==='hypothesis'&&training){training.hypothesis=event.target.value;render();}if(event.target.id==='diagnosis'&&training){training.diagnosis=event.target.value;render();}if(event.target.id==='lab-id-filter'){
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
case'integral-start':{
 if(!INTEGRATIVE_CASES.some(c=>c.id===id))break;
 integralTraining=startIntegrativeCase(id);integralResult=null;integralReport=null;page='integrative';render();break;
}
case'integral-lock':
 if(!integralTraining?.initial)break;
 integralTraining.locked=true;render();break;
case'integral-probe':{
 const a=integralTraining;
 if(!a?.locked||a.observations.some(o=>o.id===id))break;
 if(!INTEGRATIVE_CASES.find(c=>c.id===a.caseId)?.readings.some(r=>r.id===id))break;
 a.pending=id;a.prediction='';render();break;
}
case'integral-reveal':{
 const a=integralTraining;
 if(!a?.locked||!a.pending||!a.prediction)break;
 try{a.observations.push(validateObservation(a,a.pending,a.prediction));}
 catch(error){toast(error.message,true);break;}
 a.pending='';a.prediction='';render();break;
}
case'integral-grade':{
 const a=integralTraining;
 if(!a?.locked||!a.final||!a.observations.length||a.reasoning.trim().length<120||a.uncertainty.trim().length<60)break;
 integralResult=evaluateIntegrativeCase(a);
 integralReport=buildIntegrativeReport(a,integralResult);
 data.cases.push({id:a.caseId,score:integralResult.score,at:new Date().toISOString(),
  hypothesis:a.initial,conclusion:a.final,used:a.observations.map(o=>o.id),
  reasoning:a.reasoning,report:integralReport,passed:integralResult.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'integral-export':
 if(integralReport&&integralTraining)downloadIntegrative(integralReport,integralTraining.caseId);
 break;
case'integral-quit':
 integralTraining=null;integralResult=null;integralReport=null;render();break;
case'integral-download':{
 const record=data.cases.findLast(c=>c.id===id&&c.at===target.dataset.at&&typeof c.report==='string');
 if(record)downloadIntegrative(record.report,record.id);break;
}
case'misfire-start':{
 if(!MISFIRE_CASES.some(c=>c.id===id))break;
 misfireTraining=newMisfireSession(id);misfireResult=null;page='misfire';render();break;
}
case'misfire-lock':
 if(!misfireTraining?.initial)break;
 misfireTraining.locked=true;render();break;
case'misfire-frame':{
 const session=misfireTraining;
 if(!session?.locked||!misfireCase(session.caseId).frames.some(f=>f.id===id))break;
 if(!session.viewed.includes(id))session.viewed.push(id);
 render();break;
}
case'misfire-probe':{
 const session=misfireTraining;
 if(!session?.locked||session.observations.some(o=>o.id===id))break;
 if(!misfireCase(session.caseId).probes.some(p=>p.id===id))break;
 session.pending=id;session.prediction='';render();break;
}
case'misfire-reveal':{
 const session=misfireTraining;
 if(!session?.locked||!session.pending||!session.prediction)break;
 session.observations.push({id:session.pending,prediction:session.prediction});
 session.pending='';session.prediction='';render();break;
}
case'misfire-grade':{
 const session=misfireTraining;
 if(!session?.locked||!session.final||!session.observations.length||session.reasoning.trim().length<100)break;
 misfireResult=evaluateMisfire(session);
 data.cases.push({id:session.caseId,score:misfireResult.score,at:new Date().toISOString(),
  hypothesis:session.initial,conclusion:session.final,
  used:session.observations.map(o=>o.id),reasoning:session.reasoning,passed:misfireResult.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'misfire-export':{
 if(!misfireTraining||!misfireResult)break;
 const blob=new Blob([misfireReport(misfireTraining,misfireResult)],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(blob),element=document.createElement('a');
 element.href=url;element.download='autolab-balance-'+misfireTraining.caseId+'.md';
 document.body.append(element);element.click();element.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
}
case'misfire-quit':misfireTraining=null;misfireResult=null;render();break;
case'fuel-start':{
 if(!FUEL_CASES.some(c=>c.id===id))break;
 fuelTraining={...createFuelSession(id),locked:false};
 fuelResult=null;page='fuel';render();break;
}
case'fuel-lock':
 if(!fuelTraining?.initial)break;
 fuelTraining.locked=true;render();break;
case'fuel-open':{
 if(!fuelTraining?.locked)break;
 if(!FUEL_CASES.find(c=>c.id===fuelTraining.caseId)?.frames.some(f=>f.id===id))break;
 if(!fuelTraining.opened.includes(id))fuelTraining.opened.push(id);
 render();break;
}
case'fuel-probe':{
 if(!fuelTraining?.locked||fuelTraining.probes.some(o=>o.id===id))break;
 if(!FUEL_CASES.find(c=>c.id===fuelTraining.caseId)?.probes.some(p=>p.id===id))break;
 fuelTraining.pending=id;fuelTraining.prediction='';render();break;
}
case'fuel-reveal':{
 const s=fuelTraining;
 if(!s?.locked||!s.pending||!s.prediction)break;
 s.probes.push({id:s.pending,prediction:s.prediction});
 s.pending='';s.prediction='';render();break;
}
case'fuel-grade':{
 const s=fuelTraining;
 if(!s?.locked||!s.final||!s.probes.length||s.reasoning.trim().length<90)break;
 fuelResult=gradeFuelSession(s);
 data.cases.push({id:s.caseId,score:fuelResult.score,at:new Date().toISOString(),
  hypothesis:s.initial,conclusion:s.final,used:s.probes.map(o=>o.id),
  reasoning:s.reasoning,passed:fuelResult.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'fuel-export':{
 if(!fuelTraining||!fuelResult)break;
 const blob=new Blob([fuelReport(fuelTraining,fuelResult)],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(blob),node=document.createElement('a');
 node.href=url;node.download='autolab-inyeccion-'+fuelTraining.caseId+'.md';
 document.body.append(node);node.click();node.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
}
case'fuel-quit':
 fuelTraining=null;fuelResult=null;render();break;
case'trace-start':{
 if(!TRACE_CASES.some(c=>c.id===id))break;
 traceTraining={...createTraceSession(id),locked:false};
 traceResult=null;
 traceChannels=['ckp','cmp'];page='temporal';render();break;
}
case'trace-lock':if(!traceTraining?.initial)break;traceTraining.locked=true;render();break;
case'trace-capture':{
 if(!traceTraining?.locked)break;
 const index=Number(id);
 if(!Number.isInteger(index)||index<0||index>=TRACE_WINDOWS)break;
 traceTraining.active=index;
 if(!traceTraining.inspected.includes(index))traceTraining.inspected.push(index);
 const viewed=new Set(traceTraining.viewed[index]||[]);
 traceChannels.forEach(ch=>viewed.add(ch));
 traceTraining.viewed[index]=[...viewed];
 render();break;
}
case'trace-grade':{
 const s=traceTraining;
 if(!s?.locked||s.selectedWindow===null||!s.selectedCause||s.evidence.length!==2||s.reasoning.trim().length<100)break;
 traceResult=gradeTraceSession(s);
 data.cases.push({id:s.caseId,score:traceResult.score,at:new Date().toISOString(),
  hypothesis:s.initial,conclusion:s.selectedCause,used:s.evidence,
  reasoning:s.reasoning,passed:traceResult.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'trace-export':{
 if(!traceTraining||!traceResult)break;
 const content=traceReport(traceTraining,traceResult);
 const file=new Blob([content],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(file),link=document.createElement('a');
 link.href=url;link.download='autolab-captura-temporal-'+traceTraining.caseId+'.md';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
}
case'trace-quit':traceTraining=null;traceResult=null;render();break;

case'diff-start':{
 if(!differentialCases.some(c=>c.id===id))break;
 differentialTraining={...createDifferentialSession(id),locked:false,pending:'',pendingPrediction:''};
 differentialResult=null;page='differential';render();break;
}
case'diff-lock':
 if(!differentialTraining?.initial)break;
 differentialTraining.locked=true;render();break;
case'diff-probe':{
 const session=differentialTraining;
 if(!session?.locked||session.observations.some(o=>o.id===id))break;
 if(!differentialCases.find(c=>c.id===session.caseId)?.probes.some(p=>p.id===id))break;
 session.pending=id;session.pendingPrediction='';render();break;
}
case'diff-reveal':{
 const session=differentialTraining;
 if(!session?.locked||!session.pending||!session.pendingPrediction)break;
 session.observations.push({id:session.pending,prediction:session.pendingPrediction});
 session.pending='';session.pendingPrediction='';render();break;
}
case'diff-grade':{
 const session=differentialTraining;
 if(!session?.locked||!session.final||!session.observations.length||session.reasoning.trim().length<100)break;
 differentialResult=gradeDifferential(session);
 data.cases.push({id:session.caseId,score:differentialResult.score,at:new Date().toISOString(),
  hypothesis:session.initial,conclusion:session.final,
  used:session.observations.map(o=>o.id),reasoning:session.reasoning,passed:differentialResult.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'diff-export':{
 if(!differentialTraining||!differentialResult)break;
 const blob=new Blob([differentialReport(differentialTraining,differentialResult)],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='autolab-diagnostico-diferencial-'+differentialTraining.caseId+'.md';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
}
case'diff-quit':
 differentialTraining=null;differentialResult=null;render();break;
case'open-components':
 labState.mode='components';nav('labs');break;
case'component-grade':{
 if(labState.mode!=='components'||componentState.result)break;
 const a=componentState;
 try{parseComponentNumber(a.value);}catch(error){toast(error.message,true);break;}
 if(!componentScenarios.find(s=>s.id===a.id)?.options.some(o=>o[0]===a.evidence)){
  toast('Elegí una medida confirmatoria antes de corregir.',true);break;
 }
 if(a.reasoning.trim().length<70){toast('Desarrollá una justificación de al menos 70 caracteres.',true);break;}
 a.result=gradeComponent(a.id,a.condition,a);
 data.cases.push({id:'lab-components-'+a.id+'-'+a.condition,score:a.result.score,at:new Date().toISOString(),
  hypothesis:a.evidence,conclusion:a.value+' '+a.result.unit,used:[a.id,a.condition,a.evidence],
  reasoning:a.reasoning,passed:a.result.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'component-retry':
 componentState={...componentState,value:'',evidence:'',reasoning:'',result:null};render();break;
case'component-export':{
 const a=componentState;if(!a.result)break;
 const file=new Blob([componentReport(a.id,a.condition,a,a.result)],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(file),node=document.createElement('a');
 node.href=url;node.download='autolab-componentes-'+a.id+'.md';document.body.append(node);
 node.click();node.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
}
case'path-lesson':{
 if(!lessons.some(l=>l.id===id))break;
 selectedLesson=id;page='learn';render();break;
}
case'ecu-start':{
 if(!ecuCases.some(c=>c.id===id))break;
 ecuTraining={id,initial:'',locked:false,observations:[],pendingProbe:'',pendingPrediction:'',final:'',reasoning:''};
 ecuResult=null;page='ecu';render();break;
}
case'ecu-lock':
 if(!ecuTraining?.initial)return;
 ecuTraining.locked=true;render();break;
case'ecu-probe':{
 if(!ecuTraining?.locked||ecuTraining.observations.some(o=>o.id===id))break;
 const c=ecuCases.find(x=>x.id===ecuTraining.id);
 if(!c?.probes.some(p=>p.id===id))break;
 ecuTraining.pendingProbe=id;ecuTraining.pendingPrediction='';render();break;
}
case'ecu-reveal':{
 if(!ecuTraining?.locked||!ecuTraining.pendingProbe||!ecuTraining.pendingPrediction)break;
 ecuTraining.observations.push({id:ecuTraining.pendingProbe,prediction:ecuTraining.pendingPrediction});
 ecuTraining.pendingProbe='';ecuTraining.pendingPrediction='';render();break;
}
case'ecu-grade':{
 const c=ecuCases.find(x=>x.id===ecuTraining?.id);
 if(!c||!ecuTraining.locked||!ecuTraining.final||!ecuTraining.observations.length||ecuTraining.reasoning.trim().length<80)break;
 ecuResult=evaluateEcu(c,ecuTraining);
 data.cases.push({id:c.id,score:ecuResult.score,at:new Date().toISOString(),
  conclusion:ecuTraining.final,hypothesis:ecuTraining.initial,
  used:ecuTraining.observations.map(o=>o.id),reasoning:ecuTraining.reasoning,passed:ecuResult.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'ecu-export':{
 if(!ecuTraining||!ecuResult)break;
 const c=ecuCases.find(x=>x.id===ecuTraining.id);
 const file=new Blob([ecuReport(c,ecuTraining,ecuResult)],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(file),a=document.createElement('a');
 a.href=url;a.download='autolab-ecu-'+c.id+'.md';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);break;
}
case'ecu-quit':
 ecuTraining=null;ecuResult=null;render();break;

case'portfolio-export':{
 const file=new Blob([portfolioMarkdown(data,lessons)],{type:'text/markdown;charset=utf-8'});
 const uri=URL.createObjectURL(file),a=document.createElement('a');
 a.href=uri;a.download='autolab-portafolio-'+new Date().toISOString().slice(0,10)+'.md';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),2000);
 break;
}
case'start-multi':{
 const c=multiFaultCases.find(c=>c.id===id);if(!c)return;
 training=null;caseResult=null;multiTraining={id,started:false,hypotheses:[],selected:[],used:[],reasoning:''};multiResult=null;page='cases';render();break;
}
case'multi-lock':
 if(!multiTraining||multiTraining.hypotheses.length!==2)return;
 multiTraining.started=true;multiTraining.selected=[...multiTraining.hypotheses];render();break;
case'multi-probe':
 if(!multiTraining?.started||multiTraining.used.includes(id))return;
 if(!multiFaultCases.find(c=>c.id===multiTraining.id)?.probes.some(p=>p.id===id))return;
 multiTraining.used.push(id);render();break;
case'multi-finish':{
 const c=multiFaultCases.find(c=>c.id===multiTraining?.id);
 if(!c||!multiTraining.started||multiTraining.selected.length!==2||!multiTraining.used.length||multiTraining.reasoning.trim().length<80)return;
 multiResult=evaluateMultiFault(c,multiTraining);
 data.cases.push({id:c.id,score:multiResult.score,at:new Date().toISOString(),
  conclusion:multiTraining.selected.join(','),hypothesis:multiTraining.hypotheses.join(','),
  used:[...multiTraining.used],reasoning:multiTraining.reasoning,passed:multiResult.passed});
 data.cases=data.cases.slice(-500);await persist();render();break;
}
case'multi-export':{
 if(!multiTraining||!multiResult)return;
 const c=multiFaultCases.find(c=>c.id===multiTraining.id);
 const file=new Blob([multiFaultReport(c,multiTraining,multiResult)],{type:'text/markdown;charset=utf-8'});
 const uri=URL.createObjectURL(file),a=document.createElement('a');
 a.href=uri;a.download='autolab-multifalla-'+c.id+'.md';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),2000);break;
}
case'multi-quit':multiTraining=null;multiResult=null;render();break;

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

case'wave-grade':{
 if(labState.mode!=='wave')break;
 try{
  const result=gradeWaveform(waveState.id,waveState.answer);
  waveState.result=result;
  data.cases.push({id:'lab-wave-'+waveState.id+'-v1',score:result.score,at:new Date().toISOString(),conclusion:String(result.entered),
   hypothesis:'synthetic-waveform',used:[waveState.id],reasoning:'Resultado numérico contrastado contra el escenario sintético',passed:result.success});
  data.cases=data.cases.slice(-500);await persist();render();
 }catch(error){toast(String(error.message||error),true);}
 break;
}
case'lab-mode':labState.mode=id==='circuit'?'circuit':id==='bms'?'bms':id==='wave'?'wave':id==='components'?'components':'can';render();break;
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
case'lesson':selectedLesson=id;page='learn';render();break;case'complete-lesson':{const l=lessons.find(x=>x.id===id);if(l&&!data.notes['lesson-'+l.id]){data.notes['lesson-'+l.id]=new Date().toISOString();data.studyMinutes+=l.minutes;await persist();}selectedLesson=null;nav('learn');toast('Lectura registrada');break;}case'start-exam':startExam(target.dataset.topic);break;case'review':startExam('all',true);break;case'advance-exam':if(!exam)return;if(exam.at<exam.questions.length-1){exam.at++;render();}else finishExam();break;case'quit-exam':exam=null;examResult=null;render();break;case'start-case':startCase(id);break;case'probe':{if(!training||!training.hypothesis||training.used.includes(id))return;training.used.push(id);render();break;}case'finish-case':{
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
