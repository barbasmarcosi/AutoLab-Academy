import test from'node:test';import assert from'node:assert/strict';
import{ECU_SCENARIOS,ECU_PROFILES,checkProfile,optimizeProfiles,evaluateECUScenario,gradeECUScenario,ecuScenarioReport}from'../src/ecu-optimization.js';
const reasoning='El controlador debe escoger una opción que cumpla simultáneamente demanda mínima, límites térmicos, ambientales, de detonación y observabilidad sintética antes de optimizar una métrica inventada.';
const limits='Índices normalizados arbitrarios: no son medidas OEM ni mapas calibrables; hacen falta modelos físicos, emisiones y ensayos independientes.';
const limitsObj={minResponse:.6,maxThermal:.65,maxEmissions:.55,maxKnock:.30,minObservability:0};
test('RW8 each mode has a unique feasible optimum, all physical claims bounded',()=>{
 assert.deepEqual(ECU_SCENARIOS.map(x=>x.id),['daily','eco','sport','diagnostic']);
 assert.deepEqual(ECU_SCENARIOS.map(x=>evaluateECUScenario(x.id).chosen),['DAILY','ECO','SPORT','DIAGNOSTIC']);
 for(const scenario of ECU_SCENARIOS){
  const e=evaluateECUScenario(scenario.id);
  assert.equal(e.feasibleIds.length,1);
  assert.equal(e.feasibility.filter(x=>x.feasible).length,1);
  assert.deepEqual(e,evaluateECUScenario(scenario.id));
  const session={scenarioId:scenario.id,predicted:e.chosen,realCalibrationPrediction:'no',reasoning,limits};
  const grade=gradeECUScenario(session);
  assert.equal(grade.score,100);assert.equal(grade.passed,true);
  assert.match(ecuScenarioReport(session,grade),/synthetic_discrete_constraint_catalog/);
 }
});
test('RW8 no feasible candidate fail-closed and never relax constraints silently',()=>{
 const unsatisfiable={minResponse:1,maxThermal:.1,maxEmissions:.1,maxKnock:.01,minObservability:1};
 const result=optimizeProfiles(unsatisfiable,'response');
 assert.equal(result.failClosed,true);assert.equal(result.chosen,null);
 assert.equal(result.feasibility.every(x=>x.feasible===false),true);
 assert.throws(()=>optimizeProfiles({...limitsObj,maxThermal:NaN},'response'),RangeError);
 assert.throws(()=>optimizeProfiles(limitsObj,'unknown'),RangeError);
 assert.throws(()=>checkProfile({id:'DAILY',response:1},limitsObj),RangeError);
});
test('RW8 safety includes independent risk constraints: failing a single check invalidates option',()=>{
 const sport=ECU_PROFILES.find(x=>x.id==='SPORT');
 const v=checkProfile(sport,limitsObj);
 assert.equal(v.feasible,false);
 assert.ok(v.violations.includes('thermal_over_limit'));
 assert.ok(v.violations.includes('emissions_over_limit'));
 assert.ok(v.violations.includes('knock_over_limit'));
 const session={scenarioId:'daily',predicted:'SPORT',realCalibrationPrediction:'no',reasoning,limits};
 assert.equal(gradeECUScenario(session).passed,false);
 assert.equal(gradeECUScenario({...session,predicted:'DAILY',realCalibrationPrediction:'si'}).passed,false);
 assert.equal(gradeECUScenario({...session,predicted:'DAILY',reasoning:'short'}).passed,false);
 assert.throws(()=>gradeECUScenario({...session,predicted:'UNLISTED'}),RangeError);
 assert.throws(()=>evaluateECUScenario('unknown'),RangeError);
});
test('RW8 deterministic constrained solver chooses a feasible profile under 100 limit grids',()=>{
 const options=[.25,.40,.55,.70,1];
 for(const thermal of options)for(const emissions of options)for(const knock of [.2,.5,.8,1]){
  const x={...limitsObj,minResponse:.2,maxThermal:thermal,maxEmissions:emissions,maxKnock:knock};
  const solve=optimizeProfiles(x,'response');
  if(solve.chosen)assert.equal(solve.feasibility.find(y=>y.id===solve.chosen).feasible,true);
  else assert.equal(solve.failClosed,true);
 }
});
