import test from 'node:test';
import assert from 'node:assert/strict';
import{buildSealInvestigation,publicSealScenario,revealSealProbe,evaluateSealInvestigation,sealInvestigationReport}from'../src/rotary-seal-diagnostic.js';
const why='Contrasté una variable de sellado con otra variable instrumental de encendido, bajo el mismo contexto y sin atribuir los índices a mediciones físicas del motor real.';
const uncertainty='No existen presiones OEM, calibración, mediciones de compresión ni ensayos reales; estos índices son sintéticos.';
test('RW4 dos hipótesis con síntoma inicial idéntico y 200 semillas reproducibles',()=>{
 const report=publicSealScenario(31);
 assert.equal(report.hypotheses.length,2);assert.equal(report.probes.length,2);
 assert.equal('cause' in report,false);
 for(let seed=1;seed<=200;seed++){
  const p=buildSealInvestigation(seed);
  assert.deepEqual(p,buildSealInvestigation(seed));
  assert.equal(p.complaint,buildSealInvestigation(1).complaint);
  assert.ok(p.probes.every(x=>Number.isFinite(x.value)&&x.value>0&&x.value<1));
  const a=p.probes.map(x=>({probeId:x.id,prediction:x.predicted}));
  const e=evaluateSealInvestigation({seed,initial:'ignition',final:p.cause,observations:a,reasoning:why,uncertainty});
  assert.equal(e.passed,true);
  assert.equal(e.score,100);
  assert.match(sealInvestigationReport({seed,initial:'ignition',final:p.cause,observations:a,reasoning:why,uncertainty},e),/synthetic_model/);
 }
});
test('RW4 rechaza conclusiones prematuras, falta de descarte y errores de predicción',()=>{
 const p=buildSealInvestigation(18);
 const obs=p.probes.map(x=>({probeId:x.id,prediction:x.predicted}));
 const base={seed:18,initial:'ignition',final:p.cause,observations:obs,reasoning:why,uncertainty};
 assert.equal(evaluateSealInvestigation({...base,observations:obs.slice(0,1)}).passed,false);
 assert.equal(evaluateSealInvestigation({...base,observations:[...obs.slice(0,1),{...obs[1],prediction:obs[1].prediction==='bajo'?'normal':'bajo'}]}).passed,false);
 assert.equal(evaluateSealInvestigation({...base,final:'ignition'}).passed,false);
 assert.equal(evaluateSealInvestigation({...base,reasoning:'insuficiente'}).passed,false);
 assert.throws(()=>evaluateSealInvestigation({...base,observations:[obs[0],obs[0]]}),RangeError);
 assert.throws(()=>buildSealInvestigation(0),RangeError);
 assert.throws(()=>buildSealInvestigation(NaN),RangeError);
 assert.throws(()=>revealSealProbe(18,'invalid','normal'),RangeError);
 assert.throws(()=>revealSealProbe(18,'primary',''),RangeError);
});
