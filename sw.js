const CACHE="autolab-academy-v78";const shell=["./","./index.html","./src/ecu-robust-analysis.js","./src/ecu-robust-view.js","./src/ecu-robust-curriculum.js","./src/ecu-optimization.js","./src/ecu-optimization-view.js","./src/ecu-optimization-curriculum.js","./src/rotary-aperture-radius.js","./src/rotary-aperture-inverse.js","./src/rotary-aperture-inverse-view.js","./src/rotary-aperture-inverse-curriculum.js","./src/rotary-aperture.js","./src/rotary-aperture-view.js","./src/rotary-aperture-curriculum.js","./src/rotary-port-burn.js","./src/rotary-port-burn-view.js","./src/rotary-port-burn-curriculum.js","./src/rotary-heat-transfer.js","./src/rotary-heat-view.js","./src/rotary-heat-curriculum.js","./src/rotary-thermal-research.js","./src/rotary-thermal-view.js","./src/rotary-thermal-curriculum.js","./src/mechanics-exams.js","./src/engineering-bridge-curriculum.js","./src/chassis-systems-curriculum.js","./src/brake-dynamics.js","./src/brake-view.js","./src/powertrain-research.js","./src/powertrain-view.js","./src/powertrain-curriculum.js","./src/rotary-instrument-check.js","./src/rotary-instrument-view.js","./src/mechanics-systems-curriculum.js","./src/metrology-research.js","./src/metrology-view.js","./src/inventor-blackbox.js","./src/inventor-blackbox-view.js","./src/inventor-curriculum.js","./src/rotary-seal-diagnostic.js","./src/rotary-seal-view.js","./src/mechanics-curriculum.js","./src/rotary-research.js","./src/rotary-geometry-analytic.js","./src/rotary-geometry.js","./src/rotary-geometry-curriculum.js","./src/rotary-view.js","./src/styles.css","./src/app.js","./src/core.js","./src/content.js","./src/curriculum-advanced.js","./src/waveform-lab.js","./src/differential-lab.js","./src/portfolio.js","./src/ecu-lab.js","./src/ecu-curriculum.js","./src/learning-path.js","./src/lesson-practice.js","./src/lesson-reasoning.js","./src/lesson-reasoning-view.js","./src/lesson-transfer.js","./src/component-lab.js","./src/components-curriculum.js","./src/fault-discrimination.js","./src/differential-curriculum.js","./src/temporal-trace-lab.js","./src/temporal-curriculum.js","./src/fuel-system-lab.js","./src/fuel-curriculum.js","./src/misfire-lab.js","./src/misfire-curriculum.js","./src/integrative-lab.js","./src/integrative-curriculum.js","./src/study-coach.js","./src/answer-analytics.js","./src/transfer-exercises.js","./src/diagnostic-transfer.js","./src/diagnostic-draft.js","./src/diagnostic-review.js","./src/chart-accessibility.js","./src/exam-learning-plan.js","./src/cases-advanced.js","./src/workshop-engine.js","./src/can-lab.js","./src/bms-lab.js","./src/repetition.js","./src/measurement-challenges.js","./samples/autolab-synthetic.dbc","./manifest.webmanifest","./icons/icon.svg"];self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(shell)).then(()=>self.skipWaiting()))});self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("autolab-academy-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  // There are no app deep routes: unrelated navigations cannot poison the shell.
  const scope=new URL(self.registration.scope);
  if(url.pathname!==scope.pathname&&url.pathname!==scope.pathname+"index.html")return;
  event.respondWith((async()=>{
   let response;
   try{response=await fetch(request)}
   catch{return (await caches.match("./index.html"))||Response.error()}
   // A successful network read must not fail because cache storage is full.
   if(response.ok&&response.headers?.get?.("content-type")?.includes("text/html")){
    try{const cache=await caches.open(CACHE);await cache.put("./index.html",response.clone())}
    catch(error){console.warn("AutoLab: no se pudo actualizar la caché HTML",error)}
   }
   return response;
  })());
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
