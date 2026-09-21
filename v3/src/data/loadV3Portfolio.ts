import{loadPortfolio,type PortfolioSnapshot}from"../../../v2/src/lib/portfolioApi";import{evaluateDataTrust,type DataTrustSnapshot}from"../../../v2/src/lib/dataTrust";
export type V3PortfolioLoad={snapshot:PortfolioSnapshot;trust:DataTrustSnapshot};
/**
 * A successful broker HTTP read is fresh at the time we receive it even when
 * the legacy /api/portfolio contract has no source-side updatedAt field.
 * Keep fetchedAt separate from sourceTimestamp: this restores live portfolio
 * delivery without inventing a broker timestamp.
 */
export async function loadV3Portfolio():Promise<V3PortfolioLoad>{
  const snapshot=await loadPortfolio();
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
