import test from'node:test';import assert from'node:assert/strict';
import{ECU_PROFILES}from'../src/ecu-optimization.js';
import{RW8_ROBUST_SCENARIOS,RW8_INDEX_HALF_WIDTH,robustCheck,dominates,paretoFront,
 robustAnalysis,thermalSensitivity,factorialStressStudy,gradeRobustExercise,robustResearchReport}from'../src/ecu-robust-analysis.js';
const reasoning='Una alternativa puede respetar todos los umbrales nominales pero perder factibilidad ante intervalos de incertidumbre hipotéticos. La frontera de Pareto se calcula solo sobre los candidatos robustamente factibles.';
const limits='Los índices son inventados sin unidades ni calibración; los intervalos no representan confianza estadística ni permiten inferir emisiones, riesgos físicos o parámetros OEM.';
test('RW8+ three scenarios separate nominal, robust and multiobjective Pareto',()=>{
 const expected={safe:[1,1,1],edge:[1,0,0],open:[4,4,4]};
 for(const id of Object.keys(expected)){
  const a=robustAnalysis(id);
  assert.deepEqual([a.nominalCount,a.robustCount,a.frontierCount],expected[id]);
  assert.deepEqual(a,robustAnalysis(id));
  const input={scenarioId:id,predictedNominal:a.nominalCount,predictedRobust:a.robustCount,
   predictedFrontier:a.frontierCount,predictedDailyCorners:{safe:4,edge:3,open:4}[id],realWorldPrediction:'no',criticalEvidence:{safe:'margin',edge:'thermal',open:'tradeoffs'}[id],paretoEvidence:'feasible-set',reasoning,limits};
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
  predictedDailyCorners:3,realWorldPrediction:'no',criticalEvidence:'thermal',paretoEvidence:'feasible-set',reasoning,limits};
 assert.equal(gradeRobustExercise({...input,predictedRobust:1}).passed,false);
 assert.equal(gradeRobustExercise({...input,predictedDailyCorners:4}).passed,false);
 assert.equal(gradeRobustExercise({...input,realWorldPrediction:'si'}).passed,false);
 assert.equal(gradeRobustExercise({...input,reasoning:'no'}).passed,false);
 assert.equal(gradeRobustExercise({...input,criticalEvidence:'margin'}).passed,false);
 assert.equal(gradeRobustExercise({...input,paretoEvidence:'full-catalog'}).passed,false);
 assert.throws(()=>gradeRobustExercise({...input,criticalEvidence:''}),RangeError);
 assert.throws(()=>gradeRobustExercise({...input,predictedNominal:1.5}),RangeError);
});

test('RW8++ four corners stay within each rectangular envelope and preserve guarantee inclusion across a grid',()=>{
 for(const scenario of RW8_ROBUST_SCENARIOS)for(const width of [0,.01,.03,.06,.1]){
  const half=Object.fromEntries(Object.keys(RW8_INDEX_HALF_WIDTH).map(k=>[k,width]));
  const factorial=factorialStressStudy(scenario.id,half),rectangle=robustAnalysis(scenario.id,half);
  assert.deepEqual(factorial.corners.map(c=>[c.loadFactor,c.controlFactor]),[[-1,-1],[-1,1],[1,-1],[1,1]]);
  assert.equal(factorial.corners.length,4);
  assert.ok(rectangle.robustIds.every(id=>factorial.survivorIds.includes(id)));
  assert.ok(factorial.survivorIds.every(id=>rectangle.nominalIds.includes(id)));
  assert.equal(factorial.failClosed,factorial.survivorIds.length===0);
  for(const c of factorial.corners)for(const row of c.rows){
   const p=ECU_PROFILES.find(x=>x.id===row.id);
   for(const [key,value] of Object.entries(row.indices)){
    assert.ok(value>=0&&value<=1);
    assert.ok(value>=Math.max(0,p[key]-half[key])-1e-12,'below rectangle: '+key);
    assert.ok(value<=Math.min(1,p[key]+half[key])+1e-12,'above rectangle: '+key);
   }
  }
  assert.deepEqual(factorialStressStudy(scenario.id,half),factorial);
 }
 assert.equal(factorialStressStudy('edge').dailyPassedCorners,3);
 assert.equal(factorialStressStudy('safe').dailyPassedCorners,4);
 assert.equal(factorialStressStudy('open').dailyPassedCorners,4);
 assert.deepEqual(factorialStressStudy('edge').survivorIds,[]);
});
test('RW8++ invalid experimental bounds fail closed and an incorrect fifth prediction cannot pass',()=>{
 assert.throws(()=>factorialStressStudy('unknown'),RangeError);
 assert.throws(()=>factorialStressStudy('edge',{...RW8_INDEX_HALF_WIDTH,response:NaN}),RangeError);
 const input={scenarioId:'edge',predictedNominal:1,predictedRobust:0,predictedFrontier:0,predictedDailyCorners:3,
  realWorldPrediction:'no',criticalEvidence:'thermal',paretoEvidence:'feasible-set',
  reasoning:'Los dos factores ficticios producen cuatro esquinas; es obligatorio comprobar los cinco índices y rechazar un candidato ante cualquier infracción de los límites.',
  limits:'Es una matriz determinista artificial sin mediciones ni calibración; la frecuencia de escenarios admisibles no es una probabilidad ni valida una ECU real.'};
 const grade=gradeRobustExercise(input);
 assert.equal(grade.score,100);assert.equal(grade.passed,true);
 assert.equal(gradeRobustExercise({...input,predictedDailyCorners:2}).passed,false);
 assert.match(robustResearchReport(input,grade),/Matriz de perturbaciones factoriales sintéticas/);
});
