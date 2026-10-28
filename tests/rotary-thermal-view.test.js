import test from'node:test';import assert from'node:assert/strict';
import{thermalShell}from'../src/rotary-thermal-view.js';
test('RW2/RW3 shell accessible research container',()=>{
 assert.match(thermalShell(),/Thermodynamics Research Bench/);
 assert.match(thermalShell(),/rotary-thermal-explorer/);
});
