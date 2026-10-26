/**
 * Cross-catalog static QA. Does not certify physical correctness or field safety.
 * Registered validators reuse existing lab engines; no second rulebook.
 */
const slug=/^[a-z][a-z0-9-]{1,99}$/;
const sourceUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch{return false}};
export function auditScenarioCatalogs(catalogs,topics){
 const errors=[],warnings=[],allIds=new Map(),stats=[];
 const allowedTopics=new Set(topics);
 for(const catalog of catalogs){
  const label=catalog.name;
  if(!label||!Array.isArray(catalog.items)||!catalog.items.length){errors.push('Catálogo vacío o inválido: '+label);continue}
  let sources=0;
  for(const [index,item] of catalog.items.entries()){
   const where=label+'['+index+']';
   if(!item||typeof item!=='object'){errors.push(where+': escenario no es objeto');continue}
   if(typeof item.id!=='string'||!slug.test(item.id)){errors.push(where+': ID inválido');continue}
   if(allIds.has(item.id))errors.push(where+': ID duplicado con '+allIds.get(item.id)+': '+item.id);
   allIds.set(item.id,where);
   if(typeof item.title!=='string'||item.title.trim().length<8)errors.push(where+': título insuficiente');
   const topic=item.topic??catalog.topic;
   if(!allowedTopics.has(topic))errors.push(where+': especialidad desconocida '+String(topic));
   if(item.source!==undefined){if(sourceUrl(item.source))sources++;else errors.push(where+': fuente no HTTPS');}
   else if(catalog.sourceRequired)errors.push(where+': fuente conceptual ausente');
   else warnings.push(where+': fuente no adjunta, revisar procedencia separada');
   try{catalog.validate?.(item)}catch(e){errors.push(where+': falla validador existente: '+String(e?.message||e))}
  }
  stats.push({catalog:label,count:catalog.items.length,sourceUrls:sources});
 }
 return {ok:errors.length===0,errors,warnings,summary:{catalogs:stats.length,scenarios:stats.reduce((n,x)=>n+x.count,0),uniqueIds:allIds.size,byCatalog:stats}};
}
