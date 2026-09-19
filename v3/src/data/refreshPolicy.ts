export const V3_REFRESH_INTERVAL_MS=60_000;
export const V3_FOCUS_REFRESH_MIN_AGE_MS=15_000;

export function shouldApplyRefresh(requestId:number,latestRequestId:number,active:boolean){
  return active&&requestId===latestRequestId;
}

export function shouldRefreshOnFocus(lastAttemptAt:number|null,now:number){
  return lastAttemptAt==null||!Number.isFinite(lastAttemptAt)||now-lastAttemptAt>=V3_FOCUS_REFRESH_MIN_AGE_MS;
}

export function nextRefreshDelay(lastAttemptAt:number|null,now:number){
  if(lastAttemptAt==null||!Number.isFinite(lastAttemptAt))return 0;
  return Math.max(0,V3_REFRESH_INTERVAL_MS-(now-lastAttemptAt));
}
