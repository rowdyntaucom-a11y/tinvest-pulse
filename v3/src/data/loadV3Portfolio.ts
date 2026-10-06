import{loadPortfolio,type PortfolioSnapshot}from"../../../v2/src/lib/portfolioApi";import{evaluateDataTrust,type DataTrustSnapshot}from"../../../v2/src/lib/dataTrust";import{loadFastPortfolioRecovery}from"./fastPortfolioRecovery";
export type V3PortfolioLoad={snapshot:PortfolioSnapshot;trust:DataTrustSnapshot};
const RECOVERY_HEDGE_MS=1800;
const sleep=(ms:number)=>new Promise<void>(resolve=>window.setTimeout(resolve,ms));
async function loadResilientSnapshot(){
 const primary=loadPortfolio();
 const recovery=(async()=>{await sleep(RECOVERY_HEDGE_MS);return loadFastPortfolioRecovery()})();
 try{return await Promise.any([primary,recovery])}catch(error){if(error instanceof AggregateError&&error.errors.length)throw error.errors[0];throw error}
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
