import test from 'node:test';
import assert from 'node:assert/strict';
import{ROTARY_MODEL,normalizedAngle,housingPoint,rotorAt,chamberAreas,conceptualPhase,trendNext,mechanicalPowerKw}from'../src/rotary-geometry.js';
test('RW1 3:1: ápices sobre epitrocoide y radio constante',()=>{
 for(let deg=0;deg<=1080;deg+=37){
  const r=rotorAt(deg),theta=normalizedAngle(deg)*Math.PI/180;
  assert.ok(Math.abs(Math.hypot(r.center.x,r.center.y)-ROTARY_MODEL.emm)<1e-8);
  for(let k=0;k<3;k++){
   const apex=r.apexes[k],p=housingPoint(theta/3+2*Math.PI*k/3);
   assert.ok(Math.hypot(apex.x-p.x,apex.y-p.y)<1e-8);
   assert.ok(Math.abs(Math.hypot(apex.x-r.center.x,apex.y-r.center.y)-ROTARY_MODEL.Rmm)<1e-8);
  }
 }
 assert.ok(Math.abs(rotorAt(720).phaseRad-4*Math.PI/3)<1e-8);
 assert.deepEqual(chamberAreas(0).map(x=>Math.round(x.areaMm2)),chamberAreas(1080).map(x=>Math.round(x.areaMm2)));
});
test('RW1 3 recintos positivos, conservación global y periodicidad',()=>{
 const a0=chamberAreas(0).reduce((s,x)=>s+x.areaMm2,0);
 for(let deg=0;deg<1080;deg+=7){
  const values=chamberAreas(deg),sum=values.reduce((a,b)=>a+b.areaMm2,0);
  assert.ok(values.every(x=>x.areaMm2>0&&x.volumeProxyCm3>0));
  assert.ok(Math.abs(values.reduce((a,b)=>a+b.share,0)-1)<1e-10);
  assert.ok(Math.abs(sum-a0)/a0<0.001);
 }
});
test('RW1 fases solo conceptuales, tendencias y entrada adversarial',()=>{
 assert.equal(conceptualPhase(100,0),'admisión (conceptual)');
 assert.equal(conceptualPhase(400,0),'compresión (conceptual)');
 assert.equal(conceptualPhase(670,0),'expansión (conceptual)');
 assert.equal(conceptualPhase(950,0),'escape (conceptual)');
 assert.equal(trendNext(120,0),'aumenta');
 assert.equal(trendNext(420,0),'disminuye');
 assert.equal(trendNext(120,0),trendNext(120+1080,0));
 assert.throws(()=>normalizedAngle(NaN),RangeError);
 assert.throws(()=>housingPoint(Infinity),RangeError);
 assert.throws(()=>chamberAreas(0,{...ROTARY_MODEL,Rmm:30}),RangeError);
 assert.throws(()=>chamberAreas(0,{...ROTARY_MODEL,segments:2}),RangeError);
 assert.throws(()=>conceptualPhase(0,3),RangeError);
 assert.throws(()=>trendNext(0,-1),RangeError);
});
test('RW0 P=torque × omega, unidades kW',()=>{
 assert.ok(Math.abs(mechanicalPowerKw(160,3000)-50.2654824574)<1e-6);
 assert.equal(mechanicalPowerKw(0,2000),0);
 assert.throws(()=>mechanicalPowerKw(-2,1000),RangeError);
 assert.throws(()=>mechanicalPowerKw(NaN,2000),RangeError);
});
