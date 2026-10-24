import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCandump,analyzeCanFrames,sampleCandump,decodeSyntheticSample,MAX_CAN_INPUT,MAX_CAN_LINES} from '../src/can-lab.js';
test('candump: logs de 11 y 29 bits, DLC, timestamps y bytes',()=>{
 const p=parseCandump('(1720000000.001) can0 123#DEADBEEF\ncan1 18DAF110#010203\n');
 assert.equal(p.frames.length,2);assert.equal(p.skipped,0);
 assert.deepEqual(p.frames[0].bytes,[0xde,0xad,0xbe,0xef]);assert.equal(p.frames[1].extended,true);
 assert.equal(p.frames[1].time,null);
});
test('candump: no inventa soporte de CAN FD, remoto RTR ni líneas inválidas',()=>{
 const p=parseCandump('(1720000000.001) can0 123##1DEADBEEF\n(1.0) can0 124#R\ncan0 FFF#00\n(2.0) can0 123#A\n(2.0) can0 123#01');
 assert.equal(p.frames.length,1);assert.equal(p.skipped,4);
});
test('candump: límites de memoria y de líneas',()=>{
 assert.throws(()=>parseCandump('X'.repeat(MAX_CAN_INPUT+1)));
 assert.throws(()=>parseCandump('\n'.repeat(MAX_CAN_LINES+1)));
});
test('candump: muestra sintética reproducible, detector estadístico y decodificador aislado',()=>{
 const p=parseCandump(sampleCandump()),stats=analyzeCanFrames(p.frames);
 assert.equal(p.skipped,0);assert.equal(stats.uniqueIds,2);assert.equal(stats.frameCount,54);
 assert(stats.ids.find(x=>x.id==='120').gapCandidate);
 const rpm=decodeSyntheticSample(p.frames);
 assert.equal(rpm.length,36);assert(rpm.every(x=>x.rpm>=780&&x.rpm<=885));
});
test('candump: sin marcas temporales no se inventan frecuencia ni gaps',()=>{
 const stats=analyzeCanFrames(parseCandump('can0 123#01\ncan0 123#02').frames);
 assert.equal(stats.ids[0].medianGapMs,null);
 assert.equal(stats.ids[0].gapCandidate,false);
});
