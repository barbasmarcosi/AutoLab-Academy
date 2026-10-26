import test from'node:test';import assert from'node:assert/strict';
import{robustResearchShell}from'../src/ecu-robust-view.js';
test('RW8+ shell advertises evidence and a dedicated labelled view',()=>{
 assert.match(robustResearchShell(),/Robust Optimization Research Lab/);
 assert.match(robustResearchShell(),/ecu-robust-explorer/);
});
