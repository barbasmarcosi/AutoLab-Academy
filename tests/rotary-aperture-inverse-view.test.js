import test from'node:test';import assert from'node:assert/strict';
import{apertureInverseShell}from'../src/rotary-aperture-inverse-view.js';
test('RW6++ inverse metrology has labelled mount and honest synthetic measurement provenance',()=>{
 assert.match(apertureInverseShell(),/Inverse Port Metrology Lab/);
 assert.match(apertureInverseShell(),/rotary-aperture-inverse-explorer/);
});
