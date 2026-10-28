import test from 'node:test';
import assert from 'node:assert/strict';
import {auditObdSignalObservability,SIGNAL_AUDIT_VERSION} from '../src/mechanical-age-signal-quality.js';
import {evaluateMechanicalSnapshot,syntheticServicePair} from '../src/mechanical-age-research.js';

test('MA00 flags a constant RPM channel without claiming mechanical health or sensor fault',()=>{
 const record=syntheticServicePair().before;
 record.source='provided_obd_unverified';
 const original=structuredClone(record.samples);
 for(const x of record.samples)x.rpm=800;
 const raw=structuredClone(record.samples);
 const a=auditObdSignalObservability(record.samples);
 assert.equal(a.version,SIGNAL_AUDIT_VERSION);
 assert.equal(a.signals.rpm.distinctValues,1);
 assert.equal(a.signals.rpm.longestIdenticalRun,40);
 assert.equal(a.signals.rpm.possibleQuantizedStaleOrStable,true);
 assert.match(a.warnings.join(' '),/cuantización/);
 assert.equal(a.synchronizationVerified,false);
 assert.equal(a.perPidTimestampPresent,false);
 assert.equal(a.wearInferenceAllowed,false);
 assert.equal(a.independentSampleCount,null);
 assert.deepEqual(record.samples,raw);
 const r=evaluateMechanicalSnapshot(record);
 assert.ok(r.signalObservability.warnings.length>0);
 assert.equal(r.deviationIndex,null);
 assert.equal(r.mechanicalAgeEquivalentKm,null);
 assert.notDeepEqual(record.samples,original);
});

test('MA00 no invented values for missing trim channels or short datasets',()=>{
 const record=syntheticServicePair().before;
 for(const x of record.samples){delete x.stftPct;delete x.ltftPct;}
 const a=auditObdSignalObservability(record.samples);
 assert.equal(a.signals.stftPct.available,false);
 assert.equal(a.signals.ltftPct.available,false);
 assert.equal(a.warnings.length,0);
 assert.equal(evaluateMechanicalSnapshot(record).status,'inconclusive');
 assert.throws(()=>auditObdSignalObservability([]),RangeError);
});

test('MA00 plateau flag is an observation not a fault verdict',()=>{
 const record=syntheticServicePair().before;
 const report=auditObdSignalObservability(record.samples);
 assert.equal(report.signals.rpm.possibleQuantizedStaleOrStable,false);
 assert.equal(report.synchronizationVerified,false);
 assert.match(report.caveat,/no diagnostica/);
});
