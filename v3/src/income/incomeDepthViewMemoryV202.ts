export type IncomeDepthViewV202="overview"|"calendar"|"history"|"sources"|"trust"|"market";
export const INCOME_DEPTH_VIEW_STORAGE_KEY="qvanix-income-depth-view-v202" as const;
const BASIC=new Set<IncomeDepthViewV202>(["overview","calendar","history","sources"]);
const ALL=new Set<IncomeDepthViewV202>(["overview","calendar","history","sources","trust","market"]);
export function normalizeIncomeDepthViewV202(value:unknown,proMode:boolean):IncomeDepthViewV202{
 const v=typeof value==="string"?value as IncomeDepthViewV202:"overview";
 return (proMode?ALL:BASIC).has(v)?v:"overview";
}
export function readIncomeDepthViewV202(proMode:boolean):IncomeDepthViewV202{
 try{return normalizeIncomeDepthViewV202(sessionStorage.getItem(INCOME_DEPTH_VIEW_STORAGE_KEY),proMode)}catch{return"overview"}
}
export function writeIncomeDepthViewV202(view:IncomeDepthViewV202){
 try{sessionStorage.setItem(INCOME_DEPTH_VIEW_STORAGE_KEY,view)}catch{}
}
