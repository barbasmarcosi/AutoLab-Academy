import test from 'node:test';
import assert from 'node:assert/strict';
import{sealLabShell}from'../src/rotary-seal-view.js';
test('RW4 interfaz educativa contiene landmark y montaje claro',()=>{
 assert.match(sealLabShell(),/rotary-seal-lab/);
 assert.match(sealLabShell(),/Rotary Diagnostic Research/);
});
