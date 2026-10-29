/**
 * Lesson 06 - HV safety awareness, NOT an isolation, repair or rescue tutorial.
 * Source grounding: HSE electric/hybrid vehicle safety and NHTSA EV safety/ERGs.
 * Decision simulation only. No instruction to touch, test, de-energize or repair HV.
 */
export const HV_GUIDED_ID='lab-hv-safety-guided-v1';
export const HV_HOLDOUT_ID='lab-hv-safety-holdout-v1';
export const HV_MODEL='autolab-hv-awareness-v1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const HV_BASELINE=Object.freeze([
 {id:'quiet',question:'Un vehículo eléctrico no hace ruido. ¿Se puede asegurar que no se moverá?',options:['Sí: silencio equivale a apagado','No: el movimiento puede ser inesperado y hay que mantener controles de seguridad del taller','Sí: la llave ausente elimina todos los riesgos'],answer:1,why:'HSE advierte que un EV/HEV puede desplazarse silenciosamente. La ausencia de ruido no prueba inmovilidad ni ausencia de energía.'},
 {id:'color',question:'¿El color naranja de un cable es prueba suficiente de que ya no existe tensión peligrosa?',options:['Sí, si el contacto está apagado','No: el color es una advertencia, no una medición ni una autorización','Sí, si se desconectó un borne de 12 V'],answer:1,why:'No debe inferirse ausencia de peligro por el color o por un control aparente; la evaluación debe seguir procedimientos específicos y personal competente.'},
 {id:'damage',question:'Un EV sufrió un impacto sobre el paquete y desprende vapores. ¿Qué corresponde a personal sin habilitación HV?',options:['Abrir el paquete para encontrar la fuga','Conservar distancia, avisar servicios de emergencia y no intervenir','Seguir trabajando mientras el tablero no indique una falla'],answer:1,why:'NHTSA recomienda tratar un paquete dañado como peligro potencial, evitar exposición y recurrir a emergencias ante señales de peligro.'},
 {id:'exam',question:'¿Qué demuestra aprobar un examen en esta PWA sobre alta tensión?',options:['Habilitación para intervenir paquetes reales','Autorización para comprobar ausencia de tensión con instrumental propio','Únicamente comprensión conceptual dentro del entorno digital'],answer:2,why:'La formación teórica digital no sustituye acreditación, supervisión, formación específica por fabricante ni procedimientos laborales.'}
].map(x=>Object.freeze({...x,options:Object.freeze(x.options)})));
export function evaluateHvBaseline(answers={}){
 if(!answers||typeof answers!=='object'||Array.isArray(answers))throw RangeError('Respuestas de ingreso inválidas');
 return HV_BASELINE.map(q=>{const chosen=answers[q.id];
  if(!Number.isInteger(chosen)||chosen<0||chosen>=q.options.length)throw RangeError('Completá las cuatro ideas previas');
  return Object.freeze({id:q.id,correct:chosen===q.answer,why:q.why});
 });
}
export function mountHvBaseline(root){
 if(!root)return;
 root.innerHTML="<section class='panel stack' aria-label='Ideas previas sobre seguridad HV'><h2>Antes de aprender: ¿qué decisiones son seguras?</h2><p>Chequeo sin nota, sin guardar respuestas y sin acreditación.</p>"+
 HV_BASELINE.map(q=>"<fieldset class='panel'><legend>"+esc(q.question)+"</legend>"+q.options.map((v,i)=>"<label class='option'><input type='radio' name='hv-pre-"+q.id+"' value='"+i+"'>"+esc(v)+"</label>").join('')+"</fieldset>").join('')+
 "<button type='button' class='button alt' id='hv-baseline-check'>Comparar decisiones</button><div id='hv-baseline-feedback' role='status' aria-live='polite'>Sin revisar.</div></section>";
 root.querySelector('#hv-baseline-check').addEventListener('click',()=>{
  const feedback=root.querySelector('#hv-baseline-feedback');
  try{const answers=Object.fromEntries(HV_BASELINE.map(q=>{const n=root.querySelector("input[name='hv-pre-"+q.id+"']:checked");
   if(!n)throw RangeError('Respondé primero las cuatro preguntas');return[q.id,Number(n.value)];}));
   feedback.innerHTML="<h3>Devolución conceptual · sin nota</h3><ol>"+evaluateHvBaseline(answers).map(x=>
   "<li><strong>"+(x.correct?'Criterio seguro':'Idea para revisar')+"</strong>: "+esc(x.why)+"</li>").join('')+"</ol><p>Nada de esto autoriza un trabajo físico.</p>";
  }catch(e){feedback.textContent=e.message;}
 });
}
export function hvTheoryIllustration(){
 return "<section class='panel stack' aria-label='Seguridad HV: límites y casos resueltos'>"+
 "<h2>Seguridad eléctrica: reconocer, detener y derivar</h2>"+
 "<p><strong>Regla principal:</strong> una observación a distancia no prueba ausencia de energía. Incluso con sistemas desactivados, el paquete puede contener energía peligrosa. Un DTC, un ícono de tablero, silencio o ausencia de humo no habilitan contacto físico.</p>"+
 "<ol><li><strong>EV silencioso en un taller:</strong> no supongas inmovilidad por falta de sonido. El control del movimiento accidental forma parte del procedimiento laboral competente.</li>"+
 "<li><strong>Trabajo solicitado sobre sistema HV:</strong> no se inicia con esta PWA. Requiere persona competente, autorización del lugar, información del modelo/fabricante, procedimiento específico y medios verificados. No se enseña aquí cómo aislar o reenergizar.</li>"+
 "<li><strong>Choque, cables expuestos o daño dudoso:</strong> detené toda actividad no autorizada, mantené a terceros alejados y derivá a personal responsable. No toques, midas ni muevas componentes potencialmente energizados.</li>"+
 "<li><strong>Vapores, humo, fuego o inestabilidad:</strong> retirarse del peligro, advertir a otros y solicitar servicios locales de emergencia. No intentar abrir, mover, enfriar ni reparar el paquete por cuenta propia.</li>"+
 "<li><strong>Consulta documental sin intervención física:</strong> identificar fabricante, modelo y fuentes oficiales es adecuado; no se transforma por eso en permiso de intervención. Las guías de respuesta a emergencias también son específicas de vehículo y rol.</li></ol>"+
 "<p><strong>Contraste:</strong> que no exista un indicador luminoso de alta tensión no refuta la presencia de energía peligrosa. Una respuesta segura debe reconocer la falta de prueba independiente y los límites de autoridad.</p>"+
 "<p class='muted small'>Fuentes: <a href='https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm' target='_blank' rel='noopener noreferrer'>HSE</a> y <a href='https://www.nhtsa.gov/emergency-response-guides' target='_blank' rel='noopener noreferrer'>NHTSA ERG</a>. Son principios de reconocimiento, no un protocolo para intervención real ni asesoría de emergencias in situ.</p></section>";
}
export const HV_DECISIONS=Object.freeze([
 ['emergency','Alejarse del peligro, alertar a terceros y contactar servicios locales de emergencia'],
 ['refer','Suspender cualquier intervención HV y derivar a personal competente con documentación del vehículo'],
 ['inform','Limitarse a buscar y explicar documentación, sin intervenir físicamente'],
 ['unsafe','Inspeccionar, abrir o medir personalmente el paquete HV para comprobarlo']
]);
export const HV_RISKS=Object.freeze([
 ['thermal','Señales de daño térmico o vapores'],
 ['electrical','Daño o exposición de componentes HV, estado energético desconocido'],
 ['authority','Falta de competencia, autorización o documentación específica'],
 ['none','Solo consulta documental; no se describen signos de emergencia']
]);
const GUIDED=[
 {id:'G01',story:'Vehículo con emisión visible de vapores tras un choque; el alumno no tiene formación habilitante.',decision:'emergency',risk:'thermal'},
 {id:'G02',story:'Se solicita desmontar un componente HV; no hay autorización ni procedimiento específico del fabricante.',decision:'refer',risk:'authority'},
 {id:'G03',story:'Una clase pregunta dónde encontrar la guía oficial para un modelo, sin disponer del vehículo ni realizar trabajo.',decision:'inform',risk:'none'}
];
export const HV_GUIDED_CASES=Object.freeze(GUIDED.map(x=>Object.freeze(x)));
const HOLDOUT=[
 ['H01','Hay una señal ambiental preocupante alrededor de un vehículo que acaba de ingresar al predio.','emergency','thermal','El informe de observación confirma emisión de vapores y calor desde la zona del acumulador.'],
 ['H02','Después de un evento en carretera se informa un olor anómalo en el entorno de un EV.','emergency','thermal','El personal responsable describe humo y cambio rápido de temperatura del paquete.'],
 ['H03','La vigilancia informa un comportamiento anómalo e inmediato en una unidad estacionada.','emergency','thermal','Los avisos indican llamas o emanaciones visibles cerca del acumulador; no existe un entorno seguro para acercarse.'],
 ['H04','Una unidad con historial de incidente solicita evaluación previa.','refer','electrical','El informe muestra daños visibles en el recubrimiento de un conductor naranja tras impacto.'],
 ['H05','Se ofrece realizar un trabajo especial sobre el sistema eléctrico de potencia.','refer','authority','No existe personal acreditado ni procedimiento autorizado de ese fabricante en el taller.'],
 ['H06','Un vehículo presenta un registro de comunicación no concluyente.','refer','electrical','Se desconoce el estado energético del circuito HV; el registro no demuestra ausencia de tensión.'],
 ['H07','Un usuario pide información sobre un vehículo electrificado sin traerlo al local.','inform','none','El pedido se limita a localizar una guía del fabricante sin contacto, manipulación o diagnóstico físico.'],
 ['H08','Un aprendiz está preparando un informe de prevención de riesgos.','inform','none','El escenario consiste solo en revisar fuentes públicas y explicar las limitaciones de una PWA.'],
 ['H09','El equipo discute el significado de una luz de estado que aparece en un manual.','inform','none','No se dispone del vehículo ni hay trabajo físico: solo se interpretará documentación de forma conceptual.']
];
export const HV_HOLDOUT_CASES=Object.freeze(HOLDOUT.map(([id,story,decision,risk,evidence])=>
 Object.freeze({id,story,decision,risk,evidence})));
const probes=Object.freeze([
 ['incident','Informe remoto de signos observables'],
 ['authority','Rol, autorización y formación disponibles'],
 ['documentation','Alcance de la documentación específica'],
 ['limits','Qué NO permite demostrar el estado aparente']
]);
export const HV_PROBES=probes;
const get=id=>{const c=HV_HOLDOUT_CASES.find(c=>c.id===id);if(!c)throw RangeError('Caso HV reservado no reconocido');return c;};
export function hvObservation(caseId,probe){
 const c=get(caseId);
 if(probe==='incident')return c.evidence;
 if(probe==='authority')return 'El aprendiz no tiene autorización ni competencia acreditada para trabajar con alta tensión. No puede suplantarla con un cuestionario.';
 if(probe==='documentation')return c.decision==='inform'?'Consulta de manuales y guías oficiales sin vehículo presente.':
  'La información técnica específica no ha sido verificada por la persona competente responsable.';
 if(probe==='limits')return 'El silencio, una luz del tablero o un DTC no demuestran un circuito desenergizado ni constituyen permiso para aproximarse o tocarlo.';
 throw RangeError('Observación de seguridad no disponible');
}
export function freezeHvPlan({caseId,hypothesis,firstProbe}={}){
 get(caseId);
 if(!HV_DECISIONS.some(x=>x[0]===hypothesis)||!probes.some(x=>x[0]===firstProbe))throw RangeError('Comprometé decisión inicial y primera fuente de evidencia');
 return Object.freeze({caseId,hypothesis,firstProbe});
}
export function gradeHvCase({caseId,prior,observations,decision,risk,authority,reasoning,alternative}={}){
 const c=get(caseId),f=freezeHvPlan(prior);
 if(f.caseId!==caseId)throw RangeError('El plan congelado pertenece a otro caso');
 if(!Array.isArray(observations)||observations.length!==4||observations[0]!==f.firstProbe||new Set(observations).size!==4||
  observations.some(x=>!probes.some(p=>p[0]===x)))throw RangeError('Registrá cuatro observaciones empezando por la fuente comprometida');
 if(!HV_DECISIONS.some(x=>x[0]===decision)||!HV_RISKS.some(x=>x[0]===risk)||!['no_authority','qualified_required','quiz_certifies'].includes(authority))
  throw RangeError('Elegí una acción, el peligro predominante y el límite de autoridad');
 if(typeof reasoning!=='string'||reasoning.trim().length<30||typeof alternative!=='string'||alternative.trim().length<20)
  throw RangeError('Documentá por qué decidís así y un argumento alternativo (30 y 20 caracteres)');
 const response=decision===c.decision,recognition=risk===c.risk,limits=authority==='no_authority',
 unsafe=decision==='unsafe'||authority!=='no_authority'||(c.decision==='emergency'&&decision!=='emergency');
 // Non-negotiable critical failure: an unsafe intervention or invented certification => 0.
 const score=unsafe?0:50*Number(response)+30*Number(recognition)+20*Number(limits);
 return Object.freeze({score,passed:score===100&&!unsafe,response,recognition,limits,criticalFailure:unsafe,
  initial:f.hypothesis,changed:f.hypothesis!==decision,
  expected:Object.freeze({decision:c.decision,risk:c.risk}),qualitativeReview:'pending',model:HV_MODEL,
  disclaimer:'Acierto conceptual digital, NO autorización ni certificado para intervención HV.'});
}
export function nextHvHoldoutIndex(history=[]){
 if(!Array.isArray(history))return 0;
 for(let i=history.length-1;i>=0;i--){const x=history[i];if(x?.id!==HV_HOLDOUT_ID||typeof x.report!=='string')continue;
  try{const r=JSON.parse(x.report),index=HV_HOLDOUT_CASES.findIndex(c=>c.id===r.caseId);
   if(r.rubric===HV_HOLDOUT_ID&&index>=0)return(index+1)%HV_HOLDOUT_CASES.length;
  }catch{ /* skip corrupted history */ }
 }return 0;
}
function select(id,title,options,disabled=false){
 return "<label for='"+id+"'>"+esc(title)+"</label><select id='"+id+"' class='field' "+(disabled?'disabled':'')+"><option value=''>Elegí</option>"+options.map(([k,v])=>"<option value='"+esc(k)+"'>"+esc(v)+"</option>").join('')+"</select>";
}
export function mountHvGuided(root,{record,onSaved=()=>{}}={}){
 if(!root||typeof record!=='function')throw Error('Falta almacenamiento de práctica');
 let index=0,saved=false,busy=false;
 const $=id=>root.querySelector('#'+id);
 const render=()=>{
  const c=HV_GUIDED_CASES[index];
  root.innerHTML="<section class='panel stack' aria-label='Práctica guiada HV'><h3>Práctica guiada: tres decisiones de seguridad</h3>"+
   "<p>Situación "+(index+1)+"/3: "+esc(c.story)+"</p>"+
   select('hv-g-decision','¿Qué respuesta corresponde?',HV_DECISIONS)+
   select('hv-g-risk','¿Cuál es el peligro principal?',HV_RISKS)+
   "<p>La actividad es de reconocimiento conceptual, sin intervención física.</p>"+
   "<button type='button' class='button' data-hv-g='check'>Revisar decisión guiada</button>"+
   "<p id='hv-g-feedback' role='status' aria-live='polite'>Aún sin comparar.</p>"+
   (saved?"<p>Evidencia guiada registrada. No acredita seguridad profesional.</p>":'')+"</section>";
 };
 root.addEventListener('click',async e=>{
  const button=e.target.closest('[data-hv-g]');if(!button||busy)return;
  const c=HV_GUIDED_CASES[index],d=$('hv-g-decision').value,r=$('hv-g-risk').value;
  if(!d||!r){$('hv-g-feedback').textContent='Elegí respuesta y peligro antes de comparar.';return;}
  if(d!==c.decision||r!==c.risk){
   $('hv-g-feedback').textContent="No es una decisión segura para este caso. Revisá los signos, el límite de autorización y la necesidad de derivación. No se permite avanzar por ensayo inseguro.";
   return;
  }
  if(index<HV_GUIDED_CASES.length-1){index++;render();return;}
  busy=true;
  try{
   await record({id:HV_GUIDED_ID,at:new Date().toISOString(),passed:true,score:100,
    hypothesis:'Reconocimiento de riesgos y límites HV',conclusion:'Tres decisiones guiadas correctas en simulación',
    reasoning:'La respuesta adecuada depende de peligros y autorización, nunca de aprobar teoría.',
    report:JSON.stringify({model:HV_MODEL,cases:HV_GUIDED_CASES.map(x=>x.id),qualitativeReview:'not-applicable',noPhysicalCompetence:true})});
   saved=true;root.innerHTML="<section class='panel stack' id='hv-g-result' role='status'><h3>3/3 decisiones conceptuales revisadas</h3>"+
    "<p>Registro guiado guardado. <strong>NO habilita intervención de alta tensión.</strong> Resolvé ahora un caso reservado desconocido para contrastar tu criterio.</p></section>";
   onSaved();
  }catch(error){$('hv-g-feedback').textContent='No se pudo confirmar el guardado: '+String(error.message||error);}
  finally{busy=false;}
 });
 render();
}
export function mountHvHoldout(root,{record,history=[],onSaved=()=>{}}={}){
 if(!root||typeof record!=='function')throw Error('Falta almacenamiento de transferencia');
 let index=nextHvHoldoutIndex(history),prior=null,observations=[],result=null,busy=false,reasoning='',alternative='';
 const $=id=>root.querySelector('#'+id);
 const top=()=>"<section class='panel stack' aria-label='Caso HV de transferencia independiente'><h3>Transferencia reservada: ¿cuándo NO intervenir?</h3>"+
  "<p>Expediente "+HV_HOLDOUT_CASES[index].id+": "+esc(HV_HOLDOUT_CASES[index].story)+"</p>"+
  "<p class='muted small'>Se trata solo de informes ficticios, sin vehículo ni mediciones. La hipótesis inicial puede cambiar sin penalización.</p>";
 const render=()=>{
  if(!prior){
   root.innerHTML=top()+select('hv-h-initial','Primera decisión razonada, sin nota',HV_DECISIONS)+
    select('hv-h-first','Primera fuente de evidencia a contrastar',probes)+
    "<button class='button' type='button' data-hv-h='freeze'>Congelar decisión y fuente antes de revelar datos</button><p id='hv-h-status' role='status' aria-live='polite'></p></section>";return;
  }
  root.innerHTML=top()+"<p id='hv-h-locked'>Decisión inicial congelada: "+esc(HV_DECISIONS.find(x=>x[0]===prior.hypothesis)[1])+"; primer contraste: "+esc(prior.firstProbe)+".</p>"+
   select('hv-h-probe','Siguiente fuente virtual',probes.filter(x=>!observations.includes(x[0])),Boolean(result)||observations.length===4)+
   "<button class='button alt' type='button' data-hv-h='observe' "+(result||observations.length===4?'disabled':'')+">Revelar informe</button>"+
   "<div id='hv-h-observations' role='status' aria-live='polite' class='panel stack'><strong>Informes "+observations.length+"/4</strong>"+
   (observations.length?"<ol>"+observations.map(id=>"<li>"+esc(hvObservation(HV_HOLDOUT_CASES[index].id,id))+"</li>").join('')+"</ol>":"<p>Sin informes abiertos.</p>")+"</div>"+
   (result?"<div id='hv-h-result' class='result' role='status' tabindex='-1'><strong>"+result.score+"/100 · "+
    (result.passed?'objetivos digitales cumplidos':result.criticalFailure?'acción insegura: NO APROBADO':'revisar decisión')+"</strong>"+
    "<p>Decisión: "+(result.response?'compatible':'incorrecta')+". Riesgo: "+(result.recognition?'reconocido':'incorrecto')+
    ". Límite de autoridad: "+(result.limits?'correcto':'incorrecto')+".</p>"+
    "<p>Respuesta segura del modelo: "+esc(HV_DECISIONS.find(x=>x[0]===result.expected.decision)[1])+".</p>"+
    "<p>Explicación: "+esc(reasoning)+"</p><p>Alternativa: "+esc(alternative)+"</p>"+
    "<p>Calidad semántica pendiente de revisión humana. "+esc(result.disclaimer)+"</p></div>"+
    "<button type='button' class='button alt' data-hv-h='again'>Nuevo expediente reservado</button>":
    select('hv-h-decision','Decisión final tras los cuatro informes',HV_DECISIONS)+
    select('hv-h-risk','Peligro o límite principal',HV_RISKS)+
    select('hv-h-authority','Qué permite tu formación digital',[
     ['no_authority','No da ninguna autorización de intervención física'],
     ['qualified_required','Podría continuar físicamente si me siento seguro, sin acreditación'],
     ['quiz_certifies','Una nota alta acredita que puedo intervenir sistemas HV']
    ])+
    "<label for='hv-h-reason'>Justificá el peligro, la decisión y los límites (mín. 30 caracteres)</label>"+
    "<textarea class='field' id='hv-h-reason' rows='3' maxlength='1200'></textarea>"+
    "<label for='hv-h-alt'>Indicá una hipótesis alternativa que no debas asumir (mín. 20 caracteres)</label>"+
    "<textarea class='field' id='hv-h-alt' rows='3' maxlength='1200'></textarea>"+
    "<button type='button' class='button' data-hv-h='grade' "+(observations.length!==4?'disabled':'')+">Entregar criterio de seguridad</button>")+
   "<p id='hv-h-status' role='status' aria-live='polite'></p></section>";
 };
 root.addEventListener('click',async e=>{
  const btn=e.target.closest('[data-hv-h]');if(!btn||busy)return;
  const action=btn.dataset.hvH,c=HV_HOLDOUT_CASES[index];
  if(action==='freeze'&&!prior){
   try{prior=freezeHvPlan({caseId:c.id,hypothesis:$('hv-h-initial').value,firstProbe:$('hv-h-first').value});render();}
   catch(err){$('hv-h-status').textContent=err.message;}return;
  }
  if(action==='observe'&&prior&&!result){
   const probe=$('hv-h-probe').value;
   if(observations.length===0&&probe!==prior.firstProbe){$('hv-h-status').textContent='Respetá la fuente comprometida antes de abrir otras.';return;}
   if(observations.includes(probe)||!probes.some(x=>x[0]===probe)){$('hv-h-status').textContent='Elegí un informe nuevo.';return;}
   observations.push(probe);render();return;
  }
  if(action==='grade'&&prior&&!result){
   reasoning=$('hv-h-reason').value.trim();alternative=$('hv-h-alt').value.trim();
   let g;
   try{g=gradeHvCase({caseId:c.id,prior,observations,decision:$('hv-h-decision').value,risk:$('hv-h-risk').value,
    authority:$('hv-h-authority').value,reasoning,alternative});}
   catch(err){$('hv-h-status').textContent=err.message;return;}
   busy=true;try{
    await record({id:HV_HOLDOUT_ID,at:new Date().toISOString(),score:g.score,passed:g.passed,
     hypothesis:'Reconocimiento HV '+c.id,conclusion:'Decisión de seguridad digital '+g.score+'/100',
     reasoning,report:JSON.stringify({rubric:HV_HOLDOUT_ID,model:HV_MODEL,caseId:c.id,prior,
      observationsInOrder:observations,observations:observations.map(probe=>({probe,value:hvObservation(c.id,probe)})),
      final:{decision:$('hv-h-decision').value,risk:$('hv-h-risk').value,authority:$('hv-h-authority').value},
      grade:g,reasoning,alternative,qualitativeReview:'pending',noPhysicalCompetence:true})});
    result=g;render();$('hv-h-result')?.focus({preventScroll:true});onSaved(g);
   }catch(err){$('hv-h-status').textContent='Guardado no confirmado: '+String(err.message||err);}
   finally{busy=false;}return;
  }
  if(action==='again'&&result){index=(index+1)%HV_HOLDOUT_CASES.length;prior=null;observations=[];result=null;reasoning='';alternative='';render();}
 });
 render();
}
