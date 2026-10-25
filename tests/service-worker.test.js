import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

function harness(fetchImpl=async()=>({ok:true,clone(){return this}})){
 const events={},store=new Map([['autolab-academy-v29',new Map([['old','old']])],['unrelated-app',new Map()]]);
 const writes=[];
 const cacheFor=name=>({
  async addAll(paths){writes.push({name,paths});},
  async put(path,response){store.get(name).set(path,response);writes.push({name,path});}
 });
 const caches={
  async open(name){if(!store.has(name))store.set(name,new Map());return cacheFor(name);},
  async keys(){return [...store.keys()];},
  async delete(name){return store.delete(name);},
  async match(path){for(const data of store.values())if(data.has(path))return data.get(path);return undefined;}
 };
 const self={
  location:{origin:'http://127.0.0.1:4173'},
  clients:{claim:async()=>{}},
  skipWaiting:async()=>{},
  addEventListener(name,handler){events[name]=handler;}
 };
 runInNewContext(readFileSync('sw.js','utf8'),{self,caches,fetch:fetchImpl,URL,Response});
 return {events,store,writes};
}
async function dispatch(handler,request=null){
 let promise;
 handler({request,waitUntil(p){promise=p},respondWith(p){promise=p}});
 return await promise;
}
test('v1.9.8: activation removes previous AutoLab cache, not unrelated browser data',async()=>{
 const sw=harness();
 await dispatch(sw.events.install);
 assert.equal(sw.store.has('autolab-academy-v30'),true);
 assert.equal(sw.writes[0].paths.includes('./src/diagnostic-draft.js'),true);
 await dispatch(sw.events.activate);
 assert.equal(sw.store.has('autolab-academy-v29'),false);
 assert.equal(sw.store.has('autolab-academy-v30'),true);
 assert.equal(sw.store.has('unrelated-app'),true);
});
test('v1.9.3: server failure status never overwrites the offline app shell',async()=>{
 const sw=harness(async()=>({ok:false,status:404,clone(){throw Error('404 must not be cached')}}));
 await dispatch(sw.events.install);
 const response=await dispatch(sw.events.fetch,{method:'GET',url:'http://127.0.0.1:4173/AutoLab-Academy/',mode:'navigate'});
 assert.equal(response.status,404);
 assert.equal(sw.writes.some(w=>w.path==='./index.html'),false);
});
