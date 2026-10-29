import test from'node:test';
import assert from'node:assert/strict';
import{POWERTRAIN_MODEL,buildPowertrainCase,publicPowertrainCase,revealPowertrainProbe,gradePowertrainCase,powertrainReport}from'../src/powertrain-research.js';
const reasoning='Una caída de RPM indicada no identifica por sí sola el mecanismo. La lectura de tacómetro independiente contrasta el eje de salida y la prueba de offset identifica un canal RPM sesgado, incluidas dos anomalías simultáneas.';
const limitations='El modelo contiene relaciones de transmisión estacionarias idealizadas, no simula convertidor real, variaciones de carga ni sensores calibrados u operaciones sobre un vehículo.';
test('MC06 600 seeded cases: common symptom, independent probes, exact energy conservation',()=>{
 const seen=new Set();
 for(let seed=1;seed<=600;seed++){
  const c=buildPowertrainCase(seed),publicCase=publicPowertrainCase(seed);
  seen.add(c.cause);
  assert.equal(c.indicatedOutputRpm,704);
  assert.equal(publicCase.indicatedOutputRpm,704);
  assert.equal('cause' in publicCase,false);
  assert.deepEqual(c,buildPowertrainCase(seed));
  assert.equal(c.model,POWERTRAIN_MODEL);
  assert.ok(c.powerOutputKw>=0&&c.powerInputKw>c.powerOutputKw);
  assert.ok(Math.abs(c.powerInputKw-c.powerOutputKw-c.powerLossKw)<1e-12);
  assert.ok(Math.abs(c.powerOutputKw-c.outputTorqueNm*c.trueOutputRpm*2*Math.PI/60000)<1e-12);
  assert.equal(c.trueOutputRpm+c.offsetRpm,c.indicatedOutputRpm);
  const independent=c.probes.find(p=>p.id==='independent'),reference=c.probes.find(p=>p.id==='reference');
  assert.equal(independent.classification,c.cause==='slip'?'low':c.cause==='sensor'?'normal':'middle');
  assert.equal(reference.classification,c.cause==='slip'?'correct':c.cause==='sensor'?'large':'moderate');
  const session={seed,initial:'slip',observations:c.probes.map(p=>({id:p.id,prediction:p.classification})),final:c.cause,reasoning,limitations};
  const g=gradePowertrainCase(session);
  assert.equal(g.passed,true);assert.equal(g.score,100);
  assert.match(powertrainReport(session,g),/Balance energético ficticio/);
 }
 assert.deepEqual([...seen].sort(),['both','sensor','slip']);
});
test('MC06 incomplete, contradictory predictions and invalid seeds fail closed',()=>{
 const c=buildPowertrainCase(3),obs=c.probes.map(p=>({id:p.id,prediction:p.classification}));
 const base={seed:3,initial:'slip',final:'both',observations:obs,reasoning,limitations};
 assert.equal(gradePowertrainCase({...base,observations:obs.slice(0,1)}).passed,false);
 assert.equal(gradePowertrainCase({...base,final:'slip'}).passed,false);
 assert.equal(gradePowertrainCase({...base,reasoning:'sin prueba'}).passed,false);
 assert.equal(gradePowertrainCase({...base,observations:[{...obs[0],prediction:'normal'},obs[1]]}).passed,false);
 assert.equal(gradePowertrainCase({...base,final:'insufficient'}).passed,false);
 assert.throws(()=>gradePowertrainCase({...base,observations:[obs[0],obs[0]]}),RangeError);
 assert.throws(()=>gradePowertrainCase({...base,observations:[obs[0],{id:'invented',prediction:'correct'}]}),RangeError);
 assert.throws(()=>gradePowertrainCase({...base,initial:'invalid'}),RangeError);
 assert.throws(()=>revealPowertrainProbe(3,'independent','large'),RangeError);
 for(const seed of [NaN,-1,0,1.5,2147483648])assert.throws(()=>buildPowertrainCase(seed),RangeError);
});
