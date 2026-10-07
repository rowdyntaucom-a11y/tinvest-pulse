export type ResultReconciliationInput={
 totalResult:number|null;
 openPositionPl:number|null;
 realizedPayouts:number|null;
 trusted:boolean;
};

export type ResultReconciliationModel={
 totalResult:number;
 openPositionPl:number;
 realizedPayouts:number;
 otherRealizedEffects:number;
 componentsTotal:number;
 openShareOfMagnitude:number|null;
 payoutShareOfMagnitude:number|null;
 otherShareOfMagnitude:number|null;
};

const finite=(value:number|null):value is number=>value!=null&&Number.isFinite(value);

export function buildResultReconciliationV120(input:ResultReconciliationInput):ResultReconciliationModel|null{
 if(!input.trusted||!finite(input.totalResult)||!finite(input.openPositionPl)||!finite(input.realizedPayouts))return null;
 const otherRealizedEffects=input.totalResult-input.openPositionPl-input.realizedPayouts;
 const magnitude=Math.abs(input.openPositionPl)+Math.abs(input.realizedPayouts)+Math.abs(otherRealizedEffects);
 return{
  totalResult:input.totalResult,
  openPositionPl:input.openPositionPl,
  realizedPayouts:input.realizedPayouts,
  otherRealizedEffects,
  componentsTotal:input.openPositionPl+input.realizedPayouts+otherRealizedEffects,
  openShareOfMagnitude:magnitude>0?Math.abs(input.openPositionPl)/magnitude*100:null,
  payoutShareOfMagnitude:magnitude>0?Math.abs(input.realizedPayouts)/magnitude*100:null,
  otherShareOfMagnitude:magnitude>0?Math.abs(otherRealizedEffects)/magnitude*100:null,
 };
}
