import test from 'node:test';
import assert from 'node:assert/strict';
import {auditEngineFaultCsv,verifyPinnedEngineFault,gitBlobSha,ENGINEFAULT_SOURCE} from '../tools/audit-enginefaultdb.mjs';
const header='Fault,MAP,TPS,Force,Power,RPM,Consumption L/H,Consumption L/100KM,Speed,CO,HC,CO2,O2,Lambda,AFR';
const row=(fault,rpm=1800,lambda=1)=>[fault,2,1,7,5,rpm,3,11,30,.5,195,14,1,lambda,14.7*lambda].join(',');
test('EngineFault audit detects class-run confounding and derived AFR without claiming vehicle age',()=>{
 const csv=[header,row(0),row(0),row(1,2400,1.1),row(1,2400,1.1)].join('\n')+'\n';
 const a=auditEngineFaultCsv(csv);
 assert.equal(a.observationCount,4);
 assert.equal(a.exactDuplicateRows,1);
 assert.deepEqual(a.faultClassCounts,{'0':2,'1':2});
 assert.equal(a.contiguousLabelRuns,2);
 assert.equal(a.afrLambdaMeanAbsResidual147,0);
 assert.equal(a.allowsMechanicalAgeValidation,false);
 assert.equal(a.wearGroundTruthPresent,false);
 assert.equal(a.allowsUnseenVehicleEvaluation,false);
 assert.equal(a.independentVehicleIdentifiers,0);
 assert.equal(a.provenance.bytes,Buffer.byteLength(csv));
});
test('EngineFault audit fails closed against schema changes and nonnumeric measurements',()=>{
 assert.throws(()=>auditEngineFaultCsv(header+'\n'),RangeError);
 assert.throws(()=>auditEngineFaultCsv('Fault,RPM\n0,800\n'),/schema/);
 assert.throws(()=>auditEngineFaultCsv(header+'\n'+row(0).replace(',1800,',',NaN,')+'\n'),/Non-finite/);
 assert.throws(()=>auditEngineFaultCsv(header+'\n'+row(5)+'\n'),/fault class/);
 assert.throws(()=>auditEngineFaultCsv(header+'\n'+row(0)+',extra\n'),/field count/);
});
test('Pinned data integrity refuses fabricated file without network access',()=>{
 const csv=header+'\n'+row(0)+'\n';
 assert.match(gitBlobSha(csv),/^[0-9a-f]{40}$/);
 assert.equal(ENGINEFAULT_SOURCE.expectedBytes,5334236);
 assert.throws(()=>verifyPinnedEngineFault(Buffer.from(csv)),/integrity/);
});
