import test from 'node:test';
import assert from 'node:assert/strict';
import{ROTARY_MODEL,chamberAreas,normalizedAngle}from'../src/rotary-geometry.js';
import{ANALYTIC_GEOMETRY_MODEL,analyticChamberAreaMm2,analyticHousingMinusRotorAreaMm2,independentGeometryAudit}from'../src/rotary-geometry-analytic.js';

test('RW1+ integral exacta contra discretización independiente y refinamiento 24/48/96 segmentos',()=>{
 for(const e of [4,10,14,18,24])for(let angle=0;angle<1080;angle+=37){
  const p={...ROTARY_MODEL,emm:e,segments:48},a=independentGeometryAudit(angle,p);
  assert.equal(a.model,ANALYTIC_GEOMETRY_MODEL);
  assert.ok(a.rows.every(x=>x.exactMm2>0));
  assert.ok(a.maxRefinedRelativeErrorPct<a.maxRelativeErrorPct);
  assert.ok(a.areaClosureErrorMm2<1e-8);
  for(const row of a.rows){
   assert.ok(row.refinedAbsoluteErrorMm2<row.absoluteErrorMm2);
   assert.ok(row.relativeErrorPct<.5);
  }
 }
});
test('RW1+ cierre exacto de áreas, cambios de fase, escala cuadrática y periodicidad 1080 grados',()=>{
 const parameters={...ROTARY_MODEL,emm:14,segments:96};
 const global=analyticHousingMinusRotorAreaMm2(parameters);
 for(let angle=0;angle<1080;angle+=13){
  const analytic=[0,1,2].map(i=>analyticChamberAreaMm2(angle,i,parameters));
  assert.ok(Math.abs(analytic.reduce((s,v)=>s+v,0)-global)<1e-8);
  for(let k=0;k<3;k++){
   assert.ok(Math.abs(analytic[k]-analyticChamberAreaMm2(angle+1080,k,parameters))<1e-8);
   assert.ok(Math.abs(analytic[k]-analyticChamberAreaMm2(angle+720,(k+1)%3,parameters))<1e-8);
  }
  const doubled={...parameters,Rmm:180,emm:28};
  assert.ok(Math.abs(analyticChamberAreaMm2(angle,0,doubled)/analytic[0]-4)<1e-10);
 }
});
test('RW1+ fórmula no depende de resolución poligonal y rechaza datos o recursos inválidos',()=>{
 const area=analyticChamberAreaMm2(250,1,ROTARY_MODEL);
 assert.equal(area,analyticChamberAreaMm2(250,1,{...ROTARY_MODEL,segments:24}));
 assert.throws(()=>analyticChamberAreaMm2(NaN,0),RangeError);
 assert.throws(()=>analyticChamberAreaMm2(0,3),RangeError);
 assert.throws(()=>analyticChamberAreaMm2(0,0,{...ROTARY_MODEL,emm:40}),RangeError);
 assert.throws(()=>independentGeometryAudit(0,{...ROTARY_MODEL,segments:720}),RangeError);
 const a=independentGeometryAudit(0);
 assert.equal(a.rows.length,3);
 assert.ok(a.maxRefinedRelativeErrorPct<a.maxRelativeErrorPct);
 assert.ok(a.rows.every(x=>x.exactMm2>chamberAreas(0)[x.chamber].areaMm2));
 assert.match(a.limitations,/NO es incertidumbre/);
});
