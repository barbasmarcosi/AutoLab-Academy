import test from 'node:test';
import assert from 'node:assert/strict';
import{learningStages,evaluateLearningPath}from'../src/learning-path.js';
import{lessons}from'../src/content.js';
import{additionalLessons}from'../src/curriculum-advanced.js';
import{ecuLessons}from'../src/ecu-curriculum.js';
import{componentLessons}from'../src/components-curriculum.js';
import{differentialLessons}from'../src/differential-curriculum.js';
import{temporalLessons}from'../src/temporal-curriculum.js';
import{fuelLessons}from'../src/fuel-curriculum.js';
import{misfireLessons}from'../src/misfire-curriculum.js';
import{integrativeLessons}from'../src/integrative-curriculum.js';
import{emptyProgress}from'../src/core.js';
import{mechanicsLessons}from'../src/mechanics-curriculum.js';
import{mechanicsSystemsLessons}from'../src/mechanics-systems-curriculum.js';
import{chassisSystemsLessons}from'../src/chassis-systems-curriculum.js';
import{powertrainLessons}from'../src/powertrain-curriculum.js';
import{engineeringBridgeLessons}from'../src/engineering-bridge-curriculum.js';
import{inventorLessons}from'../src/inventor-curriculum.js';
import{rotaryThermalLessons}from'../src/rotary-thermal-curriculum.js';
import{rotaryGeometryLessons}from'../src/rotary-geometry-curriculum.js';
import{rotaryHeatLessons}from'../src/rotary-heat-curriculum.js';
import{rotaryPortBurnLessons}from'../src/rotary-port-burn-curriculum.js';
import{ecuOptimizationLessons}from'../src/ecu-optimization-curriculum.js';
import{ecuRobustLessons}from'../src/ecu-robust-curriculum.js';
import{rotaryApertureLessons}from'../src/rotary-aperture-curriculum.js';
import{rotaryInverseLessons}from'../src/rotary-aperture-inverse-curriculum.js';
const all=[...lessons,...additionalLessons,...ecuLessons,...componentLessons,...differentialLessons,...temporalLessons,...fuelLessons,...misfireLessons,...integrativeLessons,...mechanicsLessons,...mechanicsSystemsLessons,...chassisSystemsLessons,...powertrainLessons,...engineeringBridgeLessons,...inventorLessons,...rotaryGeometryLessons,...rotaryThermalLessons,...rotaryHeatLessons,...rotaryPortBurnLessons,...ecuOptimizationLessons,...ecuRobustLessons,...rotaryApertureLessons,...rotaryInverseLessons];
test('94 lecturas agrupadas en dieciséis niveles con IDs completos y sin duplicaciones',()=>{
 assert.equal(all.length,94);
 const assigned=learningStages.flatMap(s=>s.lessons);
 assert.equal(assigned.length,all.length);
 assert.equal(new Set(assigned).size,all.length);
 assert.deepEqual([...new Set(assigned)].sort(),all.map(x=>x.id).sort());
});
test('sin progreso, primer tema es el primer fundamento, sin atribuir dominio',()=>{
 const s=evaluateLearningPath(emptyProgress(),all);
 assert.equal(s.nextStage,'base');assert.equal(s.read,0);assert.equal(s.approvedTopics,0);
 assert.equal(s.allRead,false);
});
test('registra solo lecturas genuinas y recomienda la primera pendiente',()=>{
 const p=emptyProgress();
 for(const id of learningStages[0].lessons)p.notes['lesson-'+id]='2026-10-24T00:00:00.000Z';
 const s=evaluateLearningPath(p,all);
 assert.equal(s.stages[0].finishedReading,true);
 assert.equal(s.nextStage,'applied');assert.equal(s.nextLesson,learningStages[1].lessons[0]);
 assert.equal(s.approvedTopics,0);
});
test('la nota aprobada se mide separada de lecturas y sin certificación',()=>{
 const p=emptyProgress();
 p.attempts.push({topic:'redes',percentage:90});
 p.attempts.push({topic:'redes',percentage:90});
 p.attempts.push({topic:'motor',percentage:84});
 const s=evaluateLearningPath(p,all);
 assert.equal(s.approvedTopics,1);assert.equal(s.read,0);
});

test('MC00–MC14 avanza en cinco niveles ordenados con toda la cobertura, sin preacreditar práctica física',()=>{
 const ids=learningStages.slice(9,14).map(x=>x.id);
 assert.deepEqual(ids,['mechanics','engine-core','chassis-core','control-core','research-core']);
 assert.deepEqual(learningStages.map(x=>x.order),Array.from({length:16},(_,i)=>i+1));
 assert.equal(learningStages.slice(9,14).reduce((n,x)=>n+x.lessons.length,0),19);
 const p=emptyProgress();for(const stage of learningStages.slice(0,10))for(const id of stage.lessons)p.notes['lesson-'+id]='2026-10-26T00:00:00Z';
 const s=evaluateLearningPath(p,all);
 assert.equal(s.nextStage,'engine-core');assert.equal(s.nextLesson,'mc02-energy-path');
});

test('RW2/RW3 bridge is its own stage and no foundation lesson is orphaned',()=>{
 const stage=learningStages.at(-2);
 assert.equal(stage.id,'rotary-science');assert.equal(stage.order,15);
 assert.deepEqual(stage.lessons,[...rotaryGeometryLessons,...rotaryThermalLessons,...rotaryHeatLessons,rotaryPortBurnLessons[0],...rotaryApertureLessons,...rotaryInverseLessons,rotaryPortBurnLessons[1]].map(l=>l.id));
 const p=emptyProgress();for(const s of learningStages.slice(0,-2))for(const id of s.lessons)p.notes['lesson-'+id]='2026-10-26T00:00:00Z';
 const result=evaluateLearningPath(p,all);
 assert.equal(result.nextStage,'rotary-science');
 assert.equal(result.nextLesson,'rw1-analytic-geometry-validation');
});

test('RW8 optimizer is level 16 and preserves the prior rotary-science sequence',()=>{
 const stage=learningStages.at(-1);assert.equal(stage.id,'rotary-control');assert.equal(stage.order,16);
 assert.deepEqual(stage.lessons,[...ecuOptimizationLessons,...ecuRobustLessons].map(x=>x.id));
 const p=emptyProgress();for(const s of learningStages.slice(0,-1))for(const id of s.lessons)p.notes['lesson-'+id]='2026-10-26T00:00:00Z';
 const status=evaluateLearningPath(p,all);
 assert.equal(status.nextStage,'rotary-control');
 assert.equal(status.nextLesson,'rw8-controller-boundaries');
});
