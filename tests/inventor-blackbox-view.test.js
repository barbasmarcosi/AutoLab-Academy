import test from'node:test';import assert from'node:assert/strict';
import{inventorShell}from'../src/inventor-blackbox-view.js';
test('MC14 instrument bench shell is accessible and declares its isolated container',()=>{
 assert.match(inventorShell(),/Inventor’s Bench/);
 assert.match(inventorShell(),/inventor-explorer/);
});
