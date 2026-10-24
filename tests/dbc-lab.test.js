import test from 'node:test';
import assert from 'node:assert/strict';
import {loadDbc,decodeFramesWithDbc,MAX_DBC_BYTES} from '../src/dbc-lab.js';
import {parseCandump,sampleCandump} from '../src/can-lab.js';
import {readFileSync} from 'node:fs';
const sample=readFileSync('samples/autolab-synthetic.dbc','utf8');
test('DBC sample supports 0x120 engine RPM and 0x220 coolant temperature',()=>{
 const model=loadDbc(sample);
 const frames=parseCandump(sampleCandump()).frames;
 const report=decodeFramesWithDbc(model,frames);
 assert.equal(report.examined,54);
 assert.equal(report.errorCount,0,JSON.stringify(report.errors));
 assert.equal(report.missing.length,0);
 assert.equal(report.decoded.length,54);
 const first=report.decoded.find(row=>row.id==='120');
 console.log('DBC_DEBUG',JSON.stringify({first,keys:Object.keys(model.database||{}),getMessage:Object.keys(model.dbc.getMessageById?.(288)||{}),msgSignals:model.dbc.getMessageById?.(288)?.signals?.map?.(x=>x.name),msgBaseSignals:model.dbc.getMessageById?.(288)?.baseSignals?.map?.(x=>x.name),messageCount:model.database.messages?.length}));
 assert(first,'Message 0x120 not decoded');
 const rpm=first.signals.find(s=>s.name==='EngineRPM');
 assert(rpm,'Signal EngineRPM missing');
 assert.equal(Number(rpm.value),780);
 const temp=report.decoded.find(row=>row.id==='220')?.signals.find(s=>s.name==='CoolantTemp');
 assert(temp,'Signal CoolantTemp missing');
 assert.equal(Number(temp.value),90);
});
test('DBC rejects empty, invalid, oversized texts',()=>{
 assert.throws(()=>loadDbc(''));
 assert.throws(()=>loadDbc('no dbc'));
 assert.throws(()=>loadDbc('x'.repeat(MAX_DBC_BYTES+1)));
});
test('DBC decoder never requires connection to a physical CAN interface',()=>{
 const result=decodeFramesWithDbc(loadDbc(sample),parseCandump('can0 333#DEADBEEF').frames);
 assert.equal(result.decoded.length,0);
 assert.deepEqual(result.missing,['0x333']);
});
