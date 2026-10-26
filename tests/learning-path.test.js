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
import{engineeringBridgeLessons}from'../src/engineering-bridge-curriculum.js';
const all=[...lessons,...additionalLessons,...ecuLessons,...componentLessons,...differentialLessons,...temporalLessons,...fuelLessons,...misfireLessons,...integrativeLessons,...mechanicsLessons,...mechanicsSystemsLessons,...chassisSystemsLessons,...engineeringBridgeLessons];
test('78 lecturas agrupadas en diez niveles con IDs completos y sin duplicaciones',()=>{
 assert.equal(all.length,78);
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
