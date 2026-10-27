import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

function harness(fetchImpl=async()=>({ok:true,clone(){return this}}),failPut=false){
 const events={},store=new Map([['autolab-academy-v63',new Map([['old','old']])],['unrelated-app',new Map()]]);
 const writes=[];
 const cacheFor=name=>({
  async addAll(paths){writes.push({name,paths});},
  async put(path,response){if(failPut)throw new DOMException('Cuota agotada','QuotaExceededError');store.get(name).set(path,response);writes.push({name,path});}
 });
 const caches={
  async open(name){if(!store.has(name))store.set(name,new Map());return cacheFor(name);},
  async keys(){return [...store.keys()];},
  async delete(name){return store.delete(name);},
  async match(path){for(const data of store.values())if(data.has(path))return data.get(path);return undefined;}
 };
 const self={
  location:{origin:'http://127.0.0.1:4173'},registration:{scope:'http://127.0.0.1:4173/AutoLab-Academy/'},
  clients:{claim:async()=>{}},
  skipWaiting:async()=>{},
  addEventListener(name,handler){events[name]=handler;}
 };
 runInNewContext(readFileSync('sw.js','utf8'),{self,caches,fetch:fetchImpl,URL,Response,DOMException,console});
 return {events,store,writes};
}
async function dispatch(handler,request=null){
 let promise;
 handler({request,waitUntil(p){promise=p},respondWith(p){promise=p}});
 return await promise;
}
test('v1.9.13: activation removes previous AutoLab cache, not unrelated browser data',async()=>{
 const sw=harness();
 await dispatch(sw.events.install);
 assert.equal(sw.store.has('autolab-academy-v87'),true);
 assert.equal(sw.writes[0].paths.includes('./src/diagnostic-draft.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-geometry.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/lesson-practice.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/lesson-inquiry.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/lesson-reasoning.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/lesson-reasoning-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/lesson-transfer.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/lesson-confidence.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/lesson-choice-order.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/learning-evidence.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-geometry-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-geometry-analytic.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-research.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-thermal-research.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-thermal-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-thermal-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-heat-transfer.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-heat-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-heat-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-port-burn.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-port-burn-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-port-burn-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-aperture.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-aperture-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-aperture-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-aperture-radius.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-aperture-inverse.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-aperture-inverse-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-aperture-inverse-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/ecu-optimization.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/ecu-optimization-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/ecu-optimization-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/ecu-robust-analysis.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/ecu-robust-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/ecu-robust-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-seal-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-seal-diagnostic.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/mechanics-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/mechanics-systems-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/metrology-research.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/metrology-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/inventor-blackbox.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/inventor-blackbox-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/inventor-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-instrument-check.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/rotary-instrument-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/brake-dynamics.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/brake-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/powertrain-research.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/powertrain-view.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/powertrain-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/chassis-systems-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/engineering-bridge-curriculum.js'),true);
 assert.equal(sw.writes[0].paths.includes('./src/mechanics-exams.js'),true);
 await dispatch(sw.events.activate);
 assert.equal(sw.store.has('autolab-academy-v63'),false);
 assert.equal(sw.store.has('autolab-academy-v87'),true);
 assert.equal(sw.store.has('unrelated-app'),true);
});
test('v1.9.3: server failure status never overwrites the offline app shell',async()=>{
 const sw=harness(async()=>({ok:false,status:404,clone(){throw Error('404 must not be cached')}}));
 await dispatch(sw.events.install);
 const response=await dispatch(sw.events.fetch,{method:'GET',url:'http://127.0.0.1:4173/AutoLab-Academy/',mode:'navigate'});
 assert.equal(response.status,404);
 assert.equal(sw.writes.some(w=>w.path==='./index.html'),false);
});

test('v1.9.10: valid HTML network response survives QuotaExceededError in cache.put',async()=>{
 const page={ok:true,status:200,headers:{get:()=> 'text/html; charset=utf-8'},clone(){return this}};
 const sw=harness(async()=>page,true);
 await dispatch(sw.events.install);
 const result=await dispatch(sw.events.fetch,{method:'GET',url:'http://127.0.0.1:4173/AutoLab-Academy/',mode:'navigate'});
 assert.equal(result,page);
 assert.equal(sw.writes.some(w=>w.path==='./index.html'),false);
});
test('v1.9.10: JSON is never stored as offline HTML',async()=>{
 const response={ok:true,status:200,headers:{get:()=> 'application/json'},clone(){throw Error('non-HTML must not be cached')}};
 const sw=harness(async()=>response);
 await dispatch(sw.events.install);
 const result=await dispatch(sw.events.fetch,{method:'GET',url:'http://127.0.0.1:4173/AutoLab-Academy/index.html',mode:'navigate'});
 assert.equal(result,response);
 assert.equal(sw.writes.some(w=>w.path==='./index.html'),false);
});
test('v1.9.10: unrelated same-origin navigation does not replace shell',async()=>{
 let calls=0;
 const sw=harness(async()=>{calls++;return {ok:true}});
 await dispatch(sw.events.install);
 const result=await dispatch(sw.events.fetch,{method:'GET',url:'http://127.0.0.1:4173/other-app/',mode:'navigate'});
 assert.equal(result,undefined);
 assert.equal(calls,0);
 assert.equal(sw.writes.some(w=>w.path==='./index.html'),false);
});
test('v1.9.10: true network outage restores cached index',async()=>{
 const sw=harness(async()=>{throw Error('sin internet')});
 await dispatch(sw.events.install);
 const shell={status:200};
 sw.store.get('autolab-academy-v87').set('./index.html',shell);
 const result=await dispatch(sw.events.fetch,{method:'GET',url:'http://127.0.0.1:4173/AutoLab-Academy/',mode:'navigate'});
 assert.equal(result,shell);
});
