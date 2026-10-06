import{loadPortfolio,type PortfolioSnapshot}from"../../../v2/src/lib/portfolioApi";import{evaluateDataTrust,type DataTrustSnapshot}from"../../../v2/src/lib/dataTrust";import{loadFastPortfolioRecovery}from"./fastPortfolioRecovery";
export type V3PortfolioLoad={snapshot:PortfolioSnapshot;trust:DataTrustSnapshot};
const RECOVERY_HEDGE_MS=1800;
const sleep=(ms:number)=>new Promise<void>(resolve=>window.setTimeout(resolve,ms));
function firstSuccessful<T>(tasks:Promise<T>[]):Promise<T>{return new Promise((resolve,reject)=>{let pending=tasks.length;const errors:unknown[]=[];tasks.forEach((task,index)=>task.then(resolve,error=>{errors[index]=error;pending--;if(!pending)reject(errors[0]??new Error("broker sources unavailable"))}))})}
async function loadResilientSnapshot(){
 const primary=loadPortfolio();
 const recovery=(async()=>{await sleep(RECOVERY_HEDGE_MS);return loadFastPortfolioRecovery()})();
 return firstSuccessful([primary,recovery]);
}
/**
 * A successful broker HTTP read is fresh at the time we receive it even when
 * the legacy /api/portfolio contract has no source-side updatedAt field.
 * Keep fetchedAt separate from sourceTimestamp: this restores live portfolio
 * delivery without inventing a broker timestamp.
 *
 * v103 hedges a slow /api/dashboard composition after a short grace period
 * with an independent read-only /api/portfolio path. Whichever verified broker
 * snapshot arrives first is used; Core keeps retrying the richer dashboard in
 * the background when the recovery source wins.
 */
export async function loadV3Portfolio():Promise<V3PortfolioLoad>{
  const snapshot=await loadResilientSnapshot();
  const fetchedAt=new Date().toISOString();
  const hasData=snapshot.source!=="fallback";
  const sourceState=snapshot.source==="fallback"?"FALLBACK":"LIVE";
  const trust=evaluateDataTrust({
    sourceId:snapshot.source==="dashboard"?"DASHBOARD":snapshot.source==="portfolio"?"PORTFOLIO":null,
    sourceType:snapshot.source==="fallback"?"CACHE":"BROKER",
    sourceState,
    fetchedAt:hasData?fetchedAt:null,
    sourceTimestamp:snapshot.updatedAt,
    coverage:hasData?"COMPLETE":"UNKNOWN",
    hasData,
    nowMs:Date.now(),
    staleAfterMs:15*60_000
  });
  return{snapshot,trust}
}
