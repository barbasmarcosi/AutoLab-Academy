import test from 'node:test';
import assert from 'node:assert/strict';
import{FSRS_ENGINE,gradeRating,recordReview,isFsrsReview,selectCumulativeQuestions,reviewOverview}from'../src/repetition.js';
import{Rating}from'ts-fsrs';
import{questions}from'../src/content.js';
test('FSRS: response correctness cannot be overridden by high confidence',()=>{
 assert.equal(gradeRating(false,'high'),Rating.Again);
 assert.equal(gradeRating(true,'low'),Rating.Hard);
 assert.equal(gradeRating(true,'normal'),Rating.Good);
 assert.equal(gradeRating(true,'high'),Rating.Easy);
});
test('FSRS: valid dates, persisted state and repeated memory updates',()=>{
 const t=new Date('2026-10-24T12:00:00.000Z');
 const first=recordReview(null,true,'normal',t);
 assert(isFsrsReview(first));
 assert.equal(first.algorithm,FSRS_ENGINE);
 assert.equal(first.history.length,1);
 assert.equal(first.card.reps,1);
 assert(Number.isFinite(Date.parse(first.card.due)));
 const second=recordReview(first,true,'low',new Date('2026-10-26T12:00:00.000Z'));
 assert.equal(second.card.reps,2);
 assert.equal(second.history.length,2);
 assert.equal(second.history[1].rating,Rating.Hard);
 assert(Number.isFinite(Date.parse(second.due)));
});
test('FSRS: legacy due remains readable and migration does not fabricate previous reviews',()=>{
 const legacy={level:4,last:'2026-10-23T12:00:00.000Z',due:'2026-10-27T12:00:00.000Z',correct:true};
 assert.equal(isFsrsReview(legacy),false);
 const before=reviewOverview({reviews:{e01:legacy}},questions,new Date('2026-10-24T12:00:00.000Z'));
 assert.equal(before.upcoming,1);
 assert.equal(before.legacy,1);
 const transitioned=recordReview(legacy,true,'normal',new Date('2026-10-27T13:00:00.000Z'));
 assert.equal(transitioned.card.reps,1);
 assert.equal(transitioned.history.length,1);
 assert.equal(transitioned.algorithm,FSRS_ENGINE);
});
test('FSRS: distributed cumulative test covers all topics with 15 questions',()=>{
 const selected=selectCumulativeQuestions(questions,15,()=>0.5);
 assert.equal(selected.length,15);
 assert.equal(new Set(selected.map(q=>q.id)).size,15);
 const counts=Object.fromEntries([...new Set(selected.map(q=>q.topic))].map(topic=>[topic,selected.filter(q=>q.topic===topic).length]));
 assert.equal(Object.keys(counts).length,5);
 assert(Object.values(counts).every(n=>n===3));
});
test('FSRS: reminder counts ignore removed content and report remaining untested',()=>{
 const now=new Date('2026-10-24T12:00:00Z');
 const p={reviews:{e01:{due:'2026-10-24T11:00:00Z',level:0},unknown:{due:'2026-10-23T11:00:00Z',level:0}}};
 const overview=reviewOverview(p,questions,now);
 assert.equal(overview.due,1);
 assert.equal(overview.untested,questions.length-1);
});
