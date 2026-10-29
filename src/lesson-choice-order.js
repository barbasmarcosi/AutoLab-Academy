/**
 * Reorder only the PRESENTATION of MC reasoning choices.
 * Canonical option values and answer keys stay immutable and versioned.
 * The seed and order are recorded with evidence to reproduce a session.
 */
export const CHOICE_ORDER_MODEL='autolab-reasoning-option-order-v1';
const orders=Object.freeze([
 Object.freeze([0,1,2]),Object.freeze([0,2,1]),Object.freeze([1,0,2]),
 Object.freeze([1,2,0]),Object.freeze([2,0,1]),Object.freeze([2,1,0])
]);
const keys=['hypothesis','measurement','falsifier','transfer'];
export function choiceOrder(seed,stepId){
 if(!Number.isSafeInteger(seed)||seed<1||seed>2147483647||!keys.includes(stepId))
  throw RangeError('Semilla o fase de evaluación inválida');
 return [...orders[(seed-1+keys.indexOf(stepId))%orders.length]];
}
export function choiceOrderReport(seed,lessonId,scenario,transfer){
 if(typeof lessonId!=='string'||!lessonId||!scenario||scenario.steps?.length!==3||!transfer||transfer.options?.length!==3)
  throw RangeError('Expediente de opciones incompleto');
 return ['## Orden reproducible de opciones (no cambia las respuestas correctas)',
  'Modelo: '+CHOICE_ORDER_MODEL,'Lección: '+lessonId,'Semilla de presentación: '+seed,
  ...scenario.steps.map(s=>'Paso '+s.id+' — índices originales mostrados: '+choiceOrder(seed,s.id).join(', ')),
  'Transferencia — índices originales mostrados: '+choiceOrder(seed,'transfer').join(', '),
  'Las respuestas se guardan por índice canónico del catálogo, no por posición visual; el orden se documenta únicamente para auditoría.'].join('\n');
}
