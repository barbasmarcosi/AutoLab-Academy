import test from'node:test';import assert from'node:assert/strict';
import{ECU_PROFILES}from'../src/ecu-optimization.js';
import{RW8_ROBUST_SCENARIOS,RW8_INDEX_HALF_WIDTH,robustCheck,dominates,paretoFront,
 robustAnalysis,thermalSensitivity,gradeRobustExercise,robustResearchReport}from'../src/ecu-robust-analysis.js';
const reasoning='Una alternativa puede respetar todos los umbrales nominales pero perder factibilidad ante intervalos de incertidumbre hipotéticos. La frontera de Pareto se calcula solo sobre los candidatos robustamente factibles.';
const limits='Los índices son inventados sin unidades ni calibración; los intervalos no representan confianza estadística ni permiten inferir emisiones, riesgos físicos o parámetros OEM.';
test('RW8+ three scenarios separate nominal, robust and multiobjective Pareto',()=>{
 const expected={safe:[1,1,1],edge:[1,0,0],open:[4,4,4]};
 for(const id of Object.keys(expected)){
  const a=robustAnalysis(id);
  assert.deepEqual([a.nominalCount,a.robustCount,a.frontierCount],expected[id]);
  assert.deepEqual(a,robustAnalysis(id));
  const input={scenarioId:id,predictedNominal:a.nominalCount,predictedRobust:a.robustCount,
   predictedFrontier:a.frontierCount,realWorldPrediction:'no',criticalEvidence:{safe:'margin',edge:'thermal',open:'tradeoffs'}[id],paretoEvidence:'feasible-set',reasoning,limits};
  const grade=gradeRobustExercise(input);assert.equal(grade.score,100);assert.equal(grade.passed,true);
  assert.match(robustResearchReport(input,grade),/synthetic_bounded_indices_not_probabilities/);
 }
});
test('RW8+ nominal edge case fails robustly on thermal bound and cannot silently relax',()=>{
 const a=robustAnalysis('edge');
 assert.deepEqual(a.nominalIds,['DAILY']);assert.deepEqual(a.robustIds,[]);
 const row=a.rows.find(r=>r.id==='DAILY');
 assert.equal(row.nominal.feasible,true);assert.equal(row.robust.feasible,false);
 assert.ok(row.robust.violations.includes('thermal_worst_above_max'));
 assert.equal(a.failClosed,true);
 const sensitivity=thermalSensitivity('edge');
 assert.deepEqual(sensitivity.map(x=>x.robustCount),[0,0,1]);
});
test('RW8+ robust feasibility subset of nominal for entire 5 dimensional grid',()=>{
 for(const scenario of RW8_ROBUST_SCENARIOS){
  for(const t of [-.04,-.02,0,.02,.04]){
   for(const width of [0,.01,.03,.06,.1]){
    const half=Object.fromEntries(Object.keys(RW8_INDEX_HALF_WIDTH).map(k=>[k,width]));
    const a=robustAnalysis(scenario.id,half,t);
    assert.ok(a.robustIds.every(id=>a.nominalIds.includes(id)));
    assert.ok(a.frontierIds.every(id=>a.robustIds.includes(id)));
    assert.equal(a.failClosed,a.robustCount===0);
   }
  }
 }
});
test('RW8+ catalog Pareto cannot rank a non-feasible option; no profile self-dominates',()=>{
 assert.deepEqual(paretoFront(ECU_PROFILES.map(p=>p.id)),['ECO','DAILY','SPORT','DIAGNOSTIC']);
 for(const x of ECU_PROFILES)for(const y of ECU_PROFILES){
  assert.equal(dominates(x,x),false);
  if(dominates(x,y))assert.equal(dominates(y,x),false);
 }
 assert.throws(()=>paretoFront(['ECO','ECO']),RangeError);
 assert.throws(()=>paretoFront(['INVENTED']),RangeError);
 assert.throws(()=>dominates({id:'ECO'},ECU_PROFILES[0]),RangeError);
});
test('RW8+ fails closed for altered profiles, invalid uncertainty and answers',()=>{
 const profile=ECU_PROFILES[0],limits=RW8_ROBUST_SCENARIOS[0].limits;
 assert.throws(()=>robustCheck({...profile,response:1},limits),RangeError);
 assert.throws(()=>robustAnalysis('safe',{...RW8_INDEX_HALF_WIDTH,knockProxy:-1}),RangeError);
 assert.throws(()=>robustAnalysis('safe',RW8_INDEX_HALF_WIDTH,.2),RangeError);
 assert.throws(()=>robustAnalysis('invalid'),RangeError);
 const input={scenarioId:'edge',predictedNominal:1,predictedRobust:0,predictedFrontier:0,
  realWorldPrediction:'no',criticalEvidence:'thermal',paretoEvidence:'feasible-set',reasoning,limits};
 assert.equal(gradeRobustExercise({...input,predictedRobust:1}).passed,false);
 assert.equal(gradeRobustExercise({...input,realWorldPrediction:'si'}).passed,false);
 assert.equal(gradeRobustExercise({...input,reasoning:'no'}).passed,false);
 assert.equal(gradeRobustExercise({...input,criticalEvidence:'margin'}).passed,false);
 assert.equal(gradeRobustExercise({...input,paretoEvidence:'full-catalog'}).passed,false);
 assert.throws(()=>gradeRobustExercise({...input,criticalEvidence:''}),RangeError);
 assert.throws(()=>gradeRobustExercise({...input,predictedNominal:1.5}),RangeError);
});
