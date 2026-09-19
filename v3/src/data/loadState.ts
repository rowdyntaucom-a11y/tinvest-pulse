import type{DataTrustSnapshot,DataTrustStatus}from"../../../v2/src/lib/dataTrust";
export type V3LoadState="loading"|"live"|"partial"|"stale"|"fallback"|"error"|"unavailable";
const STATUS_TO_STATE:Record<DataTrustStatus,V3LoadState>={LOADING:"loading",LIVE:"live",PARTIAL:"partial",STALE:"stale",FALLBACK:"fallback",ERROR:"error",UNAVAILABLE:"unavailable"};
/** Preserve the canonical trust state instead of collapsing stale/partial/fallback into LIVE. */
export function toV3LoadState(trust:Pick<DataTrustSnapshot,"status">):V3LoadState{return STATUS_TO_STATE[trust.status]}
/** Only verified LIVE data may feed deterministic v3 financial calculations. */
export function isV3VerifiedLive(trust:Pick<DataTrustSnapshot,"verifiedLive"|"safeToCalculate">){return trust.verifiedLive&&trust.safeToCalculate}
