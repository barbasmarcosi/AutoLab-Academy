import test from 'node:test';
import assert from 'node:assert/strict';
import {examLearningPlan} from '../src/exam-learning-plan.js';

test('errores con alta confianza se priorizan por área, sin inventar interpretación',()=>{
 const q=[{id:'q1',topic:'redes'},{id:'q2',topic:'motor'},{id:'q3',topic:'motor'},{id:'q4',topic:'redes'}];
 const d=[{id:'q1',correct:false},{id:'q2',correct:false},{id:'q3',correct:true},{id:'q4',correct:false}];
 const r=examLearningPlan(q,d,{q1:'high',q2:'normal',q3:'high',q4:'high'});
 assert.equal(r.incorrect,3);
 assert.equal(r.highConfidenceWrong,2);
 assert.deepEqual(r.topics.map(g=>[g.topic,g.missed,g.highConfidenceWrong]),[['redes',2,2],['motor',1,0]]);
 assert.deepEqual(r.topics[0].questionIds,['q1','q4']);
});
test('aprobación total no fabrica errores, y confianza high correcta no se castiga',()=>{
 const r=examLearningPlan([{id:'ok',topic:'electricidad'}],[{id:'ok',correct:true}],{ok:'high'});
 assert.equal(r.incorrect,0);assert.equal(r.needsReview,false);assert.deepEqual(r.topics,[]);
});
test('ignora id inventados, registros históricos no incluidos y opciones de confianza desconocidas',()=>{
 const r=examLearningPlan([{id:'a',topic:'motor'}],[{id:'inventada',correct:false},{id:'a',correct:false}],{a:'fake'});
 assert.equal(r.incorrect,1);assert.equal(r.highConfidenceWrong,0);
 assert.deepEqual(r.topics[0].questionIds,['a']);
});
