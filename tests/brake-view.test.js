import test from'node:test';import assert from'node:assert/strict';
import{brakesShell}from'../src/brake-view.js';
test('MC08 view displays scientific limitations and mount point',()=>{
 assert.match(brakesShell(),/Brake Energy Research Lab/);
 assert.match(brakesShell(),/brake-explorer/);
});
