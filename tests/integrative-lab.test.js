import test from 'node:test';
import assert from 'node:assert/strict';
import{INTEGRATIVE_CASES,EVIDENCE_KIN,validateIntegrativeCase,startIntegrativeCase,integrativeReading,validateObservation,evaluateIntegrativeCase,buildIntegrativeReport}from'../src/integrative-lab.js';
const explanation='Las lecturas OBD y de contexto no son concluyentes por sí solas. Contrasté los oscilogramas con la alimentación y una prueba discriminante del circuito, descartando una causa alternativa.';
const limits='La causa se refiere solo al emulador. No se conocen tolerancias OEM, defectos concurrentes o información experimental que permita reemplazar una pieza real.';
function complete(c){
 const s=startIntegrativeCase(c.id);s.initial=c.alternatives.find(x=>x[0]!==c.cause)[0];
 const selected=[...EVIDENCE_KIN.map(k=>c.readings.find(r=>r.kind===k&&!r.unsafe)),c.readings.find(r=>r.confirm),c.readings.find(r=>r.exclude)];
 s.observations=[...new Map(selected.map(r=>[r.id,{id:r.id,prediction:r.classification}])).values()];
 s.final=c.cause;s.reasoning=explanation;s.uncertainty=limits;return s;
}
test('los expedientes contienen 4 fuentes, confirmación, descarte y alternativa segura',()=>{
 assert.equal(INTEGRATIVE_CASES.length,3);
 assert.equal(new Set(INTEGRATIVE_CASES.map(c=>c.id)).size,3);
 for(const c of INTEGRATIVE_CASES){assert(validateIntegrativeCase(c));assert.match(c.source,/^https:\/\//);
  assert.equal(c.readings.filter(r=>r.confirm).length,1);
  assert.equal(c.readings.filter(r=>r.exclude).length,1);
 }
});
test('solo cuatro fuentes y cadena confirmatoria completa alcanzan rúbrica de 100',()=>{
 for(const c of INTEGRATIVE_CASES){const s=complete(c),r=evaluateIntegrativeCase(s);
  assert.equal(r.score,100);assert.equal(r.passed,true);assert.equal(r.textReviewed,false);
  assert(EVIDENCE_KIN.every(k=>r.kinds.includes(k)));
 }
});
test('acertar causa sin confirmación o prueba negativa no aprueba',()=>{
 for(const c of INTEGRATIVE_CASES){const s=complete(c);
  const withoutConfirm={...s,observations:s.observations.filter(o=>!integrativeReading(c.id,o.id).confirm)};
  assert.equal(evaluateIntegrativeCase(withoutConfirm).passed,false);
  const withoutExclude={...s,observations:s.observations.filter(o=>!integrativeReading(c.id,o.id).exclude)};
  assert.equal(evaluateIntegrativeCase(withoutExclude).passed,false);
 }
});
test('falta de una fuente, justificación o incertidumbre se detecta',()=>{
 for(const c of INTEGRATIVE_CASES){const s=complete(c);
  const noContext={...s,observations:s.observations.filter(o=>integrativeReading(c.id,o.id).kind!=='context')};
  assert.equal(evaluateIntegrativeCase(noContext).coverage,false);
  assert.equal(evaluateIntegrativeCase({...s,reasoning:'corto'}).passed,false);
  assert.equal(evaluateIntegrativeCase({...s,uncertainty:'sin límites'}).passed,false);
 }
});
test('una acción insegura bloquea puntuación y registro como aprobado',()=>{
 for(const c of INTEGRATIVE_CASES){const s=complete(c),bad=c.readings.find(r=>r.unsafe);
  s.observations.push({id:bad.id,prediction:'peligrosa'});
  const grade=evaluateIntegrativeCase(s);assert.equal(grade.score,0);assert.equal(grade.passed,false);
 }
});
test('mediciones y predicciones deben ser válidas y no duplicarse',()=>{
 const c=INTEGRATIVE_CASES[0],s=startIntegrativeCase(c.id),r=c.readings[0];
 assert.deepEqual(validateObservation(s,r.id,'observación'),{id:r.id,prediction:'observación'});
 assert.throws(()=>validateObservation(s,r.id,'inexistente'));
 s.observations.push({id:r.id,prediction:'observación'});
 assert.throws(()=>validateObservation(s,r.id,'normal'));
 assert.throws(()=>integrativeReading(c.id,'otra'));
});
test('informe documenta procedencia, hipótesis original, descarte e incertidumbre',()=>{
 const c=INTEGRATIVE_CASES[0],s=complete(c),r=evaluateIntegrativeCase(s);
 const doc=buildIntegrativeReport(s,r,new Date('2026-10-25T04:00:00Z'));
 assert.match(doc,/Cadena de evidencia con procedencia/);assert.match(doc,/Papel \*\*según la solución del modelo\*\*/);
 assert.match(doc,/Incertidumbres/);assert.match(doc,/Hipótesis inicial/);assert.match(doc,/no evaluado semánticamente/);
 assert(doc.length<12000);
});
