export type ResultPeriodViewMode="capital"|"benchmark";
export const RESULT_PERIOD_VIEW_MODES=[["capital","Капитал"],["benchmark","IMOEX"]] as const;
export function normalizeResultPeriodViewMode(value:unknown):ResultPeriodViewMode{return value==="benchmark"?"benchmark":"capital"}