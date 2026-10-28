import test from'node:test';import assert from'node:assert/strict';
import{portBurnShell}from'../src/rotary-port-burn-view.js';
test('RW6/7 interactive shell exposes aria-ready mount, honest conceptual label',()=>{
 assert.match(portBurnShell(),/Rotary Ports & Combustion Lab/);
 assert.match(portBurnShell(),/rotary-port-burn-explorer/);
});
