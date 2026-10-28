import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {captureBridgeStdin} from '../tools/ma00-capture-stdin.mjs';
const args=(out)=>({sessionId:'bench-aa-001',vehicleAlias:'demo-unit-001',engineFamily:'demo-petrol',
 adapterModel:'Research bridge prototype',softwareVersion:'Prototype 0.1',out});
async function* feed(lines){for(const x of lines)yield JSON.stringify(x);}
const request={kind:'request',requestId:'request-001',pid:'010C'};
const response={kind:'response',requestId:'request-001',pid:'010C',status:'ok',value:814,unit:'rpm'};
test('MA00 bridge writes a private, non-overwriting capture and claims no ECU timestamp',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'ma00-bridge-')),out=join(dir,'raw.json');
 try{
  const result=await captureBridgeStdin(feed([request,response]),args(out));
  assert.equal(result.eventCount,1);
  assert.equal(result.physicalWearEstimated,false);
  assert.equal(result.sensorAcquisitionTimeKnown,false);
  const capture=JSON.parse(readFileSync(out,'utf8'));
  assert.equal(capture.source,'provided_obd_unverified');
  assert.equal(capture.clock,'host_monotonic_receive');
  assert.equal(capture.conditions,null);
  assert.equal(capture.events[0].value,814);
  assert.ok(capture.events[0].receivedAtMs>=capture.events[0].requestAtMs);
  assert.match(capture.warning,/no tiempos de ECU/);
  await assert.rejects(()=>captureBridgeStdin(feed([request,response]),args(out)),/EEXIST/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('MA00 bridge fails closed without producing a partial file',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'ma00-bridge-fail-')),out=join(dir,'raw.json');
 try{
  for(const packets of [
   [response],
   [request],
   [request,{...response,unit:'%'}],
   [request,{...response,requestId:'request-002'}],
   [request,{...response,value:'850'}],
   [request,{...response,status:'timeout',value:850}]
  ]){
   await assert.rejects(()=>captureBridgeStdin(feed(packets),args(out)));
   assert.equal(existsSync(out),false);
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('MA00 bridge preserves a timeout without filling in a sensor observation',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'ma00-bridge-timeout-')),out=join(dir,'raw.json');
 try{
  await captureBridgeStdin(feed([request,{...response,status:'timeout',value:undefined}]),args(out));
  const c=JSON.parse(readFileSync(out,'utf8'));
  assert.equal(c.events[0].status,'timeout');
  assert.equal('value' in c.events[0],false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
