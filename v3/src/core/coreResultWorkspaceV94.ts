export type CoreResultWorkspaceMode="summary"|"period"|"method";
export const CORE_RESULT_SCROLL_PREFIX="qvanix-core-result-scroll-v94:" as const;
export function coreResultScrollStorageKey(mode:CoreResultWorkspaceMode){return CORE_RESULT_SCROLL_PREFIX+mode}
export function normalizeCoreResultScroll(value:unknown){const n=typeof value==="number"?value:Number(value);return Number.isFinite(n)&&n>0?Math.round(n):0}

export const CORE_RESULT_WORKSPACE_MODES:[CoreResultWorkspaceMode,string,string][]=[
 ["summary","Сводка","TWR, общий результат, открытый P/L и выплаты"],
 ["period","Период","Окно истории и график капитала / IMOEX"],
 ["method","Методика","XIRR, CAGR и границы интерпретации"],
];

export function isCoreResultWorkspaceMode(value:unknown):value is CoreResultWorkspaceMode{
 return typeof value==="string"&&CORE_RESULT_WORKSPACE_MODES.some(([mode])=>mode===value);
}

export function normalizeCoreResultWorkspaceMode(value:unknown):CoreResultWorkspaceMode{
 return isCoreResultWorkspaceMode(value)?value:"summary";
}
