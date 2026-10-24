/**
 * Diagnostic training engine. Does not certify practical competence.
 * Free-text justifications are recorded but not semantically graded.
 */
export function validateScenario(c) {
  if (!c || !/^[a-z0-9-]+$/.test(c.id) || !['electricidad','motor','senales','redes','ev'].includes(c.topic)) throw new Error('Identificador o área inválida');
  if (!c.title || !c.symptom || !c.context || !c.reason || !Array.isArray(c.choices) || c.choices.length < 3) throw new Error('Datos incompletos: '+c.id);
  if (!c.choices.some(pair=>pair[0]===c.solution) || new Set(c.choices.map(pair=>pair[0])).size!==c.choices.length) throw new Error('Opciones inconsistentes: '+c.id);
  if (!Array.isArray(c.probes) || c.probes.length<3 || !c.probes.some(p=>p.critical)) throw new Error('Pruebas insuficientes: '+c.id);
  if (new Set(c.probes.map(p=>p.id)).size!==c.probes.length) throw new Error('Pruebas duplicadas: '+c.id);
  for (const p of c.probes) if (!p.id||!p.label||!p.result||(p.unsafe&&p.critical)) throw new Error('Prueba inválida: '+c.id);
  return true;
}
export function assessCase(c,session) {
  validateScenario(c);
  const permitted=new Map(c.probes.map(p=>[p.id,p]));
  const ids=[...new Set(session.used||[])].filter(id=>permitted.has(id));
  const probes=ids.map(id=>permitted.get(id));
  const unsafe=probes.some(p=>p.unsafe);
  const hasConfirm=probes.some(p=>p.critical);
  const accurate=session.diagnosis===c.solution;
  const initialHypothesis=c.choices.some(pair=>pair[0]===session.hypothesis);
  const rationale=String(session.reasoning||'').trim();
  const documented=rationale.length>=60&&rationale.length<=3000;
  const efficiency=Math.max(0,5-Math.max(0,probes.length-3)*5);
  const breakdown={rootCause:accurate?45:0,confirmingEvidence:hasConfirm?30:0,initialHypothesis:initialHypothesis?5:0,documentation:documented?15:0,measurementDiscipline:efficiency};
  const raw=Object.values(breakdown).reduce((sum,n)=>sum+n,0);
  const score=unsafe?0:Math.min(raw,!accurate||!hasConfirm||!documented||!initialHypothesis?79:100);
  const passed=score>=85&&!unsafe&&accurate&&hasConfirm&&documented&&initialHypothesis;
  return {score,passed,unsafe,accurate,hasConfirm,documented,initialHypothesis,probes:ids,breakdown,requiresExpertReview:true};
}
export function caseReport(c,session,result,at=new Date()) {
  const diagnose=c.choices.find(pair=>pair[0]===session.diagnosis)?.[1]||'No elegido';
  const hypothesis=c.choices.find(pair=>pair[0]===session.hypothesis)?.[1]||'No elegida';
  const tests=(session.used||[]).map((id,i)=>{const p=c.probes.find(x=>x.id===id);return p?(i+1)+'. '+p.label+'\n   Resultado: '+p.result:null;}).filter(Boolean);
  return ['# AutoLab Academy — Informe de práctica simulada','','Fecha: '+at.toISOString(),'Caso: '+c.id+' — '+c.title,'Origen: escenario sintético; no es diagnóstico de un vehículo real.','','## Síntomas',c.symptom,c.context,'','## Hipótesis inicial',hypothesis,'','## Pruebas realizadas',...tests,'','## Diagnóstico final',diagnose,'','## Justificación del estudiante',String(session.reasoning||'').trim()||'(Sin explicación)','','## Corrección técnica',c.reason,'','## Rúbrica automática','Puntuación: '+result.score+'/100. Cumple criterio interno: '+(result.passed?'sí':'no'),'Evidencia confirmatoria: '+(result.hasConfirm?'sí':'no')+'. Acción insegura: '+(result.unsafe?'sí':'no')+'.','La justificación escrita solo se verifica por longitud; su validez técnica requiere revisión humana.','El resultado no constituye certificación ni competencia práctica acreditada.',''].join('\n');
}
