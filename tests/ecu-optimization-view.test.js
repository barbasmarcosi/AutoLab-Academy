import test from'node:test';import assert from'node:assert/strict';
import{ecuOptimizationShell}from'../src/ecu-optimization-view.js';
test('RW8 research UI has a labelled offline mount point',()=>{
 assert.match(ecuOptimizationShell(),/ECU Optimization Research Lab/);
 assert.match(ecuOptimizationShell(),/ecu-optimization-explorer/);
});
