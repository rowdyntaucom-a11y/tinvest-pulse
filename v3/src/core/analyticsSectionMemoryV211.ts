export type AnalyticsSectionV211="return"|"risk"|"benchmark";
export const ANALYTICS_SECTION_STORAGE_KEY="qvanix-core-analytics-section-v211";
export function normalizeAnalyticsSectionV211(value:unknown):AnalyticsSectionV211{
 return value==="risk"||value==="benchmark"?value:"return";
}
export function readAnalyticsSectionV211():AnalyticsSectionV211{
 try{return normalizeAnalyticsSectionV211(sessionStorage.getItem(ANALYTICS_SECTION_STORAGE_KEY))}
 catch{return"return"}
}
export function writeAnalyticsSectionV211(section:AnalyticsSectionV211):void{
 try{sessionStorage.setItem(ANALYTICS_SECTION_STORAGE_KEY,normalizeAnalyticsSectionV211(section))}
 catch{}
}
