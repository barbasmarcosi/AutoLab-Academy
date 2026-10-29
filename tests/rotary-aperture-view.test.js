import test from'node:test';import assert from'node:assert/strict';
import{apertureShell}from'../src/rotary-aperture-view.js';
test('RW6+ planar aperture research view uses labelled mount and non-CFD warning',()=>{
 assert.match(apertureShell(),/Port Aperture Geometry Lab/);
 assert.match(apertureShell(),/rotary-aperture-explorer/);
});
