import test from'node:test';import assert from'node:assert/strict';
import{INVENTOR_MODEL,buildInventorCase,publicInventorCase,revealInventorProbe,evaluateInventor,inventorReport}from'../src/inventor-blackbox.js';
const reasoning='Los baselines x=0 y x=1 coinciden entre tres funciones, por eso necesito excitar a 3 V para discriminar la forma y validar sin ajustar el modelo con 4 V.';
const limitations='El sistema genera números sintéticos sin sensor ni fuente de tensión conectada; la validación retenida contrasta dos entradas del mismo modelo, no son medidas OEM.';
test('MC14 tres funciones coinciden en baseline y dos tests discriminan 600 semillas reproducibles',()=>{
 const causes=new Set(),signatures=new Set();
 for(let seed=1;seed<=600;seed++){
  const full=buildInventorCase(seed),pub=publicInventorCase(seed);
  causes.add(full.cause);
  assert.deepEqual(full,buildInventorCase(seed));
  assert.deepEqual(pub.baseline,[{inputV:0,outputV:1},{inputV:1,outputV:1.5}]);
  assert.equal('cause' in pub,false);
  assert.equal(pub.probes.length,2);
  assert.equal(full.probes.length,2);
  assert.ok(full.probes.every(p=>p.outputV>=0&&p.outputV<=5));
  const obs=full.probes.map(p=>({id:p.id,prediction:p.classification}));
  const session={seed,initial:'linear',final:full.cause,observations:obs,reasoning,limitations};
  const grade=evaluateInventor(session);
  assert.equal(grade.score,100);assert.equal(grade.passed,true);
  assert.match(inventorReport(session,grade),/synthetic_virtual_blackbox/);
  if(seed<=3)signatures.add(full.probes.map(x=>x.classification).join('/'));
 }
 assert.deepEqual([...causes].sort(),['clip','curved','linear']);
 assert.equal(signatures.size,3);
});
test('MC14 fail closed for missing holdout, spoofed observations, malformed causes and unsafe inputs',()=>{
 const c=buildInventorCase(3),observations=c.probes.map(p=>({id:p.id,prediction:p.classification}));
 const base={seed:3,initial:'linear',final:c.cause,observations,reasoning,limitations};
 assert.equal(evaluateInventor({...base,observations:observations.slice(0,1)}).passed,false);
 assert.equal(evaluateInventor({...base,final:'insufficient'}).passed,false);
 assert.equal(evaluateInventor({...base,reasoning:'guess'}).passed,false);
 assert.equal(evaluateInventor({...base,limitations:'none'}).passed,false);
 assert.throws(()=>evaluateInventor({...base,observations:[observations[0],observations[0]]}),RangeError);
 assert.throws(()=>evaluateInventor({...base,observations:[{id:'training',prediction:'high'},{id:'foreign',prediction:'low'}]}),RangeError);
 assert.throws(()=>evaluateInventor({...base,initial:'unknown'}),RangeError);
 assert.throws(()=>buildInventorCase(0),RangeError);
 assert.throws(()=>buildInventorCase(NaN),RangeError);
 assert.throws(()=>revealInventorProbe(3,'holdout','invalid'),RangeError);
 assert.equal(evaluateInventor({...base,observations:[{...observations[0],prediction:'high'},observations[1]]}).passed,false);
});
