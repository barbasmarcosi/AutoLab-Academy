import test from'node:test';import assert from'node:assert/strict';
import{adversarialShell}from'../src/rotary-instrument-view.js';
test('RW4+ anuncia hipótesis instrumental y contenedor offline',()=>{
 assert.match(adversarialShell(),/Instrument Verification Lab/);
 assert.match(adversarialShell(),/rotary-instrument-explorer/);
});
