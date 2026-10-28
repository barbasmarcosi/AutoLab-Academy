import test from'node:test';import assert from'node:assert/strict';
import{metrologyShell}from'../src/metrology-view.js';
test('MC01 banco interactivo permite navegar y registra formulario',()=>{
 assert.match(metrologyShell(),/Metrology Research Bench/);
 assert.match(metrologyShell(),/metrology-explorer/);
});
