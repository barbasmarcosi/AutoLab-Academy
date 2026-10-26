import test from'node:test';import assert from'node:assert/strict';
import{buildAdversarialCase,publicAdversarialCase,revealCrosscheck,evaluateAdversarial,adversarialReport}from'../src/rotary-instrument-check.js';
const reasoning='La lectura inicial de retención es anormal en las dos causas, así que no atribuyo sellado. Contrasto una medición independiente y la referencia de cero para diferenciar fuga de error del instrumento.';
const limits='Son instrumentos virtuales con índices inventados, sin presión de compresión ni tolerancia OEM de un motor físico.';
test('RW4 adversarial: 400 semillas, problema no identificable antes de verificación',()=>{
 for(let seed=1;seed<=400;seed++){
  const c=buildAdversarialCase(seed),publicCase=publicAdversarialCase(seed);
  assert.equal(publicCase.checks.length,2);assert.equal('cause' in publicCase,false);
  assert.deepEqual(c,buildAdversarialCase(seed));
  assert.equal(c.symptom,buildAdversarialCase(1).symptom);
  assert.ok(c.observed>.3&&c.observed<.35);
  const observations=c.checks.map(x=>({id:x.id,prediction:x.classification}));
  const s={seed,initial:'sealing',observations,final:c.cause,reasoning,limits},r=evaluateAdversarial(s);
  assert.equal(r.score,100);assert.equal(r.passed,true);
  assert.match(adversarialReport(s,r),/synthetic_model/);
 }
});
test('RW4 adversarial: falla cerrada sin crosschecks o evidencia',()=>{
 const c=buildAdversarialCase(30),observations=c.checks.map(x=>({id:x.id,prediction:x.classification}));
 const base={seed:30,initial:'sealing',final:c.cause,observations,reasoning,limits};
 assert.equal(evaluateAdversarial({...base,observations:observations.slice(0,1)}).passed,false);
 assert.equal(evaluateAdversarial({...base,final:'instrument'}).passed,false);
 assert.equal(evaluateAdversarial({...base,reasoning:'nada'}).passed,false);
 assert.throws(()=>evaluateAdversarial({...base,observations:[observations[0],observations[0]]}),RangeError);
 assert.throws(()=>revealCrosscheck(30,'wrong','normal'),RangeError);
 assert.throws(()=>revealCrosscheck(30,'zero','normal'),RangeError);
 assert.throws(()=>buildAdversarialCase(-1),RangeError);
});
