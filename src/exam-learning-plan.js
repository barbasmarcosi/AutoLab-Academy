/**
 * Review priorities grounded in one exam's actual answered items only.
 * Neither infers a misconception nor evaluates reasoning semantics.
 */
export function examLearningPlan(questions,details,confidenceById={}){
 const source=new Map((Array.isArray(questions)?questions:[]).filter(q=>q&&typeof q.id==='string').map(q=>[q.id,q]));
 const misses=[];
 for(const d of Array.isArray(details)?details:[]){
  const question=source.get(d?.id);
  if(!question||d.correct!==false)continue;
  const confidence=['low','normal','high'].includes(confidenceById?.[d.id])?confidenceById[d.id]:'normal';
  misses.push({id:d.id,topic:question.topic,confidence});
 }
 const groups=new Map();
 for(const miss of misses){
  const k=typeof miss.topic==='string'?miss.topic:'sin-area';
  if(!groups.has(k))groups.set(k,{topic:k,missed:0,highConfidenceWrong:0,questionIds:[]});
  const g=groups.get(k);g.missed++;if(miss.confidence==='high')g.highConfidenceWrong++;
  g.questionIds.push(miss.id);
 }
 const topics=[...groups.values()].sort((a,b)=>
  b.highConfidenceWrong-a.highConfidenceWrong||b.missed-a.missed||a.topic.localeCompare(b.topic));
 return {incorrect:misses.length,highConfidenceWrong:misses.filter(x=>x.confidence==='high').length,
  topics,needsReview:misses.length>0};
}
