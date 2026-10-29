import test from'node:test';import assert from'node:assert/strict';
import{ROTARY_SHAFT_CYCLE_DEG,PORT_PRESETS,portOpenAt,openingSegments,exactPortOverlap,
 sampledPortOverlap,portStudy,BURN_PRESETS,normalizedHeatRelease,heatReleaseStudy,evaluatePortBurn,portBurnReport}from'../src/rotary-port-burn.js';
const reasoning='El calendario de puertos únicamente estima grados de apertura simultánea. La curva Wiebe describe una fracción normalizada supuesta y no informa torque ni emisiones; hay que contrastar hipótesis con ensayos independientes.';
const limits='Sin geometría de puertos reales, presión, temperaturas ni mediciones de combustión; estos resultados son modelos sintéticos sin especificación OEM.';
test('RW6 periodic cyclic windows respect exact overlap, period and split intervals',()=>{
 assert.equal(ROTARY_SHAFT_CYCLE_DEG,1080);
 assert.deepEqual(openingSegments(PORT_PRESETS.baseline.intake),[[1040,1080],[0,300]]);
 assert.equal(portOpenAt(PORT_PRESETS.baseline.intake,1070),true);
 assert.equal(portOpenAt(PORT_PRESETS.baseline.intake,10),true);
 assert.equal(portOpenAt(PORT_PRESETS.baseline.intake,500),false);
 assert.equal(portOpenAt(PORT_PRESETS.baseline.intake,1070+1080),true);
 assert.equal(exactPortOverlap(PORT_PRESETS.baseline.intake,PORT_PRESETS.baseline.exhaust),40);
 for(const [id,expected] of [['advance',80],['delay',0]]){
  const x=portStudy(id);
  assert.equal(x.base.overlapDeg,40);assert.equal(x.candidate.overlapDeg,expected);
  assert.equal(x.candidate.intakeOpportunityDeg,x.base.intakeOpportunityDeg);
  assert.equal(x.candidate.exhaustOpportunityDeg,x.base.exhaustOpportunityDeg);
  assert.equal(x.candidate.overlapDeg,sampledPortOverlap(PORT_PRESETS[id].intake,PORT_PRESETS[id].exhaust,1));
  assert.ok(x.base.overlapFraction>=0&&x.candidate.overlapFraction>=0);
 }
});
test('RW6 analytic overlap agrees with fine midpoint integration for 100 randomized synthetic windows',()=>{
 for(let seed=1;seed<=100;seed++){
  const intake={startDeg:seed*7-300,durationDeg:seed%6*90+90};
  const exhaust={startDeg:seed*13-400,durationDeg:seed%5*90+90};
  const exact=exactPortOverlap(intake,exhaust);
  const sampled=sampledPortOverlap(intake,exhaust,1);
  assert.ok(Math.abs(exact-sampled)<=2,'Seed '+seed+' exact='+exact+' sampled='+sampled);
  assert.ok(exact>=0&&exact<=Math.min(intake.durationDeg,exhaust.durationDeg));
 }
 assert.throws(()=>portStudy('unlisted'),RangeError);
 assert.throws(()=>portOpenAt({startDeg:0,durationDeg:0},0),RangeError);
 assert.throws(()=>sampledPortOverlap(PORT_PRESETS.baseline.intake,PORT_PRESETS.baseline.exhaust,7),RangeError);
});
test('RW7 normalized Wiebe surrogate bound and monotonic, with independent intake calendar',()=>{
 for(const preset of Object.values(BURN_PRESETS)){
  assert.equal(normalizedHeatRelease(preset,preset.startDeg-10),0);
  assert.equal(normalizedHeatRelease(preset,preset.startDeg+preset.durationDeg),1);
  let last=0;
  for(let theta=0;theta<500;theta+=4){
   const fraction=normalizedHeatRelease(preset,theta);
   assert.ok(fraction>=last-1e-12&&fraction<=1);
   last=fraction;
  }
 }
 assert.equal(heatReleaseStudy('later').prediction,'disminuye');
 assert.equal(heatReleaseStudy('shorter').prediction,'aumenta');
 assert.throws(()=>normalizedHeatRelease({...BURN_PRESETS.baseline,durationDeg:0},200),RangeError);
 assert.throws(()=>heatReleaseStudy('invalid'),RangeError);
});
test('RW6/RW7 no answer key, evidence and limitations are required for passing',()=>{
 const params={portPreset:'advance',burnPreset:'later',portPrediction:'aumenta',burnPrediction:'disminuye',
  realEnginePrediction:'no',reasoning,limits};
 const result=evaluatePortBurn(params);
 assert.equal(result.score,100);assert.equal(result.passed,true);
 assert.match(portBurnReport(params,result),/synthetic_ports_and_assumed_heat_release/);
 for(const p of [{...params,portPrediction:'disminuye'},{...params,burnPrediction:'aumenta'},
  {...params,realEnginePrediction:'si'},{...params,reasoning:'corto'},{...params,limits:'corto'}])
  assert.equal(evaluatePortBurn(p).passed,false);
 assert.throws(()=>evaluatePortBurn({...params,portPreset:'bad'}),RangeError);
 assert.throws(()=>evaluatePortBurn({...params,portPrediction:''}),RangeError);
});
