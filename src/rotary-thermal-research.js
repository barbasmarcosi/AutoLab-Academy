/**
 * RW2: air-standard ideal Otto-cycle thought experiment; applies to a cycle,
 * NOT to the Wankel mechanism specifically, combustion timing, port geometry,
 * or measured rotary efficiency. Assumes ideal gas, fixed gamma, reversible
 * adiabatic compression/expansion, constant-volume heat addition.
 *
 * RW3: separate SYNTHETIC steady-state energy-flow ledger. All streams are
 * fictional, not calculated from RW1 geometry or the ideal-cycle result.
 *
 * Conceptual reference: NASA Glenn engine thermodynamic analysis.
 */
export const THERMAL_MODEL='rw2-rw3-ideal-cycle-synthetic-balance-v1';
export const THERMAL_SOURCE='https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/engine-thermodynamic-analysis/';
const ok=(n,min,max,label)=>{if(!Number.isFinite(n)||n<min||n>max)throw RangeError(label+' fuera de rango');return n;};
export function idealOtto({compressionRatio,gamma,inletKelvin=300,inletKpa=101.325,heatInputKw=100}){
 const r=ok(compressionRatio,5,16,'r'),g=ok(gamma,1.2,1.45,'gamma');
 const T1=ok(inletKelvin,250,400,'temperatura de entrada');
 const p1=ok(inletKpa,60,140,'presión de entrada');
 const heat=ok(heatInputKw,10,500,'energía entrante');
 const volumeRatio=Math.pow(r,g-1),pressureRatio=Math.pow(r,g);
 const eta=1-1/volumeRatio;
 return {compressionRatio:r,gamma:g,inletKelvin:T1,inletKpa:p1,heatInputKw:heat,
  temperatureRatio:volumeRatio,pressureRatio,
  compressedKelvin:T1*volumeRatio,compressedKpa:p1*pressureRatio,
  idealEfficiency:eta,idealWorkKw:heat*eta,idealRejectedKw:heat*(1-eta),
  model:THERMAL_MODEL,provenance:'derived_from_ideal_air_standard',
  assumptions:'Aire estándar con gamma constante, compresión y expansión isentrópicas, calor a volumen constante; sin fricción, fuga, puertos ni cinética de combustión.',
  limits:'No calcula eficiencia, potencia, emisiones, presión de combustión ni relación de compresión de un Wankel físico; no utiliza la geometría RW1.'};
}
export function compareIdealOtto({ratioA=8,ratioB=10,gamma=1.35,heatInputKw=100}={}){
 const a=idealOtto({compressionRatio:ratioA,gamma,heatInputKw});
 const b=idealOtto({compressionRatio:ratioB,gamma,heatInputKw});
 if(!(ratioB>ratioA))throw RangeError('La alternativa debe tener una relación de compresión mayor');
 return {baseline:a,candidate:b,
  gainPercentagePoints:100*(b.idealEfficiency-a.idealEfficiency),
  idealWorkDifferenceKw:b.idealWorkKw-a.idealWorkKw,
  direction:b.idealEfficiency>a.idealEfficiency?'aumenta':'disminuye',
  provenance:'derived_from_ideal_air_standard'};
}
export function syntheticHeatLedger({inputKw=100,brakeKw=27,exhaustKw=37,coolantKw=24}={}){
 const heat=ok(inputKw,20,500,'flujo energético inicial');
 const brake=ok(brakeKw,0,500,'salida al eje');
 const exhaust=ok(exhaustKw,0,500,'salida de escape');
 const coolant=ok(coolantKw,0,500,'salida al refrigerante');
 const unassignedKw=heat-brake-exhaust-coolant;
 if(unassignedKw < -1e-9)throw RangeError('Balance imposible: las salidas exceden la entrada');
 const remaining=Math.max(0,unassignedKw);
 const shares={brake:brake/heat,exhaust:exhaust/heat,coolant:coolant/heat,unassigned:remaining/heat};
 return {inputKw:heat,brakeKw:brake,exhaustKw:exhaust,coolantKw:coolant,
  unassignedKw:remaining,shares,brakeEfficiency:shares.brake,
  accountedKw:brake+exhaust+coolant+remaining,
  closureErrorKw:heat-(brake+exhaust+coolant+remaining),
  provenance:'synthetic_energy_allocation',model:THERMAL_MODEL,
  limits:'Entradas arbitrarias. El residuo no equivale a fricción: incluye cualquier flujo no clasificado y posible error de medición. No se deriva rendimiento de geometría.'};
}
export function thermalExercise({ratioA=8,ratioB=10,gamma=1.35,heatInputKw=100}={}){
 const otto=compareIdealOtto({ratioA,ratioB,gamma,heatInputKw});
 const ledger=syntheticHeatLedger({inputKw:heatInputKw,brakeKw:heatInputKw*.27,
  exhaustKw:heatInputKw*.37,coolantKw:heatInputKw*.24});
 return {model:THERMAL_MODEL,otto,ledger,
  correct:{ideal:'aumenta',residual:'resto',realEngine:'no'},
  warning:'La tendencia del ciclo ideal NO demuestra una mejora del motor real; los flujos del balance son arbitrarios y no son resultados de RW1.'};
}
export function gradeThermalExercise({ratioA,ratioB,gamma,heatInputKw,idealPrediction,residualPrediction,realEnginePrediction,reasoning,limits}){
 const exp=thermalExercise({ratioA,ratioB,gamma,heatInputKw});
 const choices={ideal:['aumenta','disminuye','igual'],
  residual:['resto','friccion','cero'],realEngine:['no','si']};
 if(!choices.ideal.includes(idealPrediction)||!choices.residual.includes(residualPrediction)||
   !choices.realEngine.includes(realEnginePrediction))throw RangeError('Pronósticos incompletos');
 const predictions={
  ideal:idealPrediction===exp.correct.ideal,residual:residualPrediction===exp.correct.residual,
  realEngine:realEnginePrediction===exp.correct.realEngine};
 const freeText=typeof reasoning==='string'&&reasoning.trim().length>=80;
 const uncertainty=typeof limits==='string'&&limits.trim().length>=60;
 const count=Object.values(predictions).filter(Boolean).length;
 return {score:count*20+(freeText?20:0)+(uncertainty?20:0),
  passed:count===3&&freeText&&uncertainty,
  predictions,model:THERMAL_MODEL,provenance:exp.otto.provenance,
  warning:'La puntuación comprueba opciones y extensión, NO evalúa semánticamente el texto libre ni acredita validación científica de motor real.'};
}
export function thermalReport(session,assessment){
 const e=thermalExercise(session),a=e.otto.baseline,b=e.otto.candidate,l=e.ledger;
 return ['# AutoLab RW2/RW3 — Ciclo ideal y balance energético','',
 'Modelo: '+THERMAL_MODEL,'Procedencia: derived_from_ideal_air_standard y synthetic_energy_allocation',
 'Ciclo Otto ideal (NO arquitectura Wankel): gamma='+a.gamma+'; rA='+a.compressionRatio+', rB='+b.compressionRatio,
 'Entrada ideal ficticia '+a.heatInputKw+' kW; eta A='+(100*a.idealEfficiency).toFixed(5)+'%; eta B='+(100*b.idealEfficiency).toFixed(5)+'%',
 'Ganancia ideal: '+e.otto.gainPercentagePoints.toFixed(5)+' puntos porcentuales; NO ganancia real',
 'Balance ficticio input='+l.inputKw+' kW, eje='+l.brakeKw+' kW, escape='+l.exhaustKw+' kW, refrigerante='+l.coolantKw+' kW, sin asignar='+l.unassignedKw.toFixed(5)+' kW',
 'Eficiencia al eje de este reparto arbitrario='+(l.brakeEfficiency*100).toFixed(2)+'%; no deriva del modelo de Otto',
 'Hipótesis del alumno: eta='+session.idealPrediction+'; residuo='+session.residualPrediction+'; atribución a motor real='+session.realEnginePrediction,
 'Razonamiento sin evaluación semántica: '+session.reasoning,
 'Incertidumbres y límites declarados: '+session.limits,
 'Evaluación estructural: '+assessment.score+'/100; aprobado='+assessment.passed,
 'Fuente ideal ciclo: '+THERMAL_SOURCE,
 'No hay modelo de combustión, portado, fuga, transferencia térmica física, ni validación OEM.'].join('\n');
}
