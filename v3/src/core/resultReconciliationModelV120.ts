export type ResultEvidenceInput={
 totalResult:number|null;
 openPositionPl:number|null;
 realizedPayouts:number|null;
 trusted:boolean;
 history:Array<{date?:string|null;value?:number|null;portfolio?:number|null;imoex?:number|null}>;
};
export type ResultEvidenceModel={
 totalResult:number;openPositionPl:number;realizedPayouts:number;
 historyPoints:number;valuePoints:number;benchmarkCommonPoints:number;
 benchmarkCoveragePct:number|null;startDate:string|null;endDate:string|null;
};
const finite=(v:unknown):v is number=>typeof v==="number"&&Number.isFinite(v);
export function buildResultEvidenceV120(input:ResultEvidenceInput):ResultEvidenceModel|null{
 if(!input.trusted||!finite(input.totalResult)||!finite(input.openPositionPl)||!finite(input.realizedPayouts))return null;
 const rows=input.history.filter(row=>row&&typeof row==="object"),valueRows=rows.filter(row=>finite(row.value)),common=rows.filter(row=>finite(row.portfolio)&&finite(row.imoex));
 const dates=rows.map(row=>typeof row.date==="string"&&row.date.trim()?row.date:null).filter((x):x is string=>x!=null).sort();
 return{totalResult:input.totalResult,openPositionPl:input.openPositionPl,realizedPayouts:input.realizedPayouts,historyPoints:rows.length,valuePoints:valueRows.length,benchmarkCommonPoints:common.length,benchmarkCoveragePct:rows.length?common.length/rows.length*100:null,startDate:dates[0]??null,endDate:dates.at(-1)??null};
}
