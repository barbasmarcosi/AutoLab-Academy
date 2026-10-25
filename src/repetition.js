/**
 * FSRS via ts-fsrs. Never synthesizes historic reviews from legacy fixed intervals.
 * Legacy cards keep their previously saved due date until next actual retrieval.
 * Objective correctness determines failure; confidence distinguishes successful recalls.
 */
import {createEmptyCard,fsrs,Rating} from 'ts-fsrs';
const scheduler=fsrs({enable_fuzz:false,request_retention:0.9});
export const FSRS_ENGINE='ts-fsrs-5';
export const CONFIDENCE_LEVELS=['low','normal','high'];
export function gradeRating(correct,confidence='normal'){
 if(!correct)return Rating.Again;
 return confidence==='low'?Rating.Hard:confidence==='high'?Rating.Easy:Rating.Good;
}
export function isFsrsReview(review){return review?.algorithm===FSRS_ENGINE&&review.card&&typeof review.card==='object';}
export function recordReview(previous,correct,confidence='normal',now=new Date()){
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))throw Error('Fecha de revisión inválida');
 const prior=isFsrsReview(previous)?previous.card:null;
 const card=prior?{...prior,due:new Date(prior.due),last_review:prior.last_review?new Date(prior.last_review):undefined}:createEmptyCard(now);
 const rating=gradeRating(correct,confidence);
 const result=scheduler.next(card,now,rating);
 const saved={...result.card,due:result.card.due.toISOString(),last_review:result.card.last_review?.toISOString()||null};
 const history=Array.isArray(previous?.history)?previous.history.slice(-29):[];
 history.push({at:now.toISOString(),rating,correct:!!correct,confidence:correct&&CONFIDENCE_LEVELS.includes(confidence)?confidence:'normal',due:saved.due});
 return {algorithm:FSRS_ENGINE,due:saved.due,last:now.toISOString(),correct:!!correct,card:saved,history};
}
export function selectCumulativeQuestions(questions,count=15,random=Math.random){
 const byTopic=new Map();
 for(const q of questions){if(!byTopic.has(q.topic))byTopic.set(q.topic,[]);byTopic.get(q.topic).push(q);}
 const topics=[...byTopic.keys()];
 if(!topics.length)return [];
 const shuffle=list=>[...list].map(x=>({x,sort:random()})).sort((a,b)=>a.sort-b.sort).map(o=>o.x);
 const queues=new Map(topics.map(topic=>[topic,shuffle(byTopic.get(topic))]));
 const chosen=[];
 // Round-robin guarantees topic coverage before choosing another question in the same topic.
 while(chosen.length<Math.min(count,questions.length)){
  let any=false;
  for(const topic of shuffle(topics)){
   const q=queues.get(topic).shift();
   if(q){chosen.push(q);any=true;if(chosen.length>=count)break;}
  }
  if(!any)break;
 }
 return chosen;
}
export function reviewOverview(progress,questionBank,now=new Date()){
 const available=new Set(questionBank.map(q=>q.id));
 const entries=Object.entries(progress.reviews||{}).filter(([id,item])=>available.has(id)&&Number.isFinite(Date.parse(item?.due)));
 const current=now.getTime(),week=current+7*86400000;
 const due=entries.filter(([,x])=>Date.parse(x.due)<=current).length;
 const upcoming=entries.filter(([,x])=>Date.parse(x.due)>current&&Date.parse(x.due)<=week).length;
 const legacy=entries.filter(([,x])=>!isFsrsReview(x)).length;
 return {due,upcoming,legacy,scheduled:entries.length,untested:Math.max(0,available.size-entries.length)};
}
