import test from'node:test';import assert from'node:assert/strict';
import{heatTransferShell}from'../src/rotary-heat-view.js';
test('RW5 thermal view exports an accessible labelled container',()=>{
 assert.match(heatTransferShell(),/Rotary Heat Transfer Lab/);
 assert.match(heatTransferShell(),/rotary-heat-explorer/);
});
