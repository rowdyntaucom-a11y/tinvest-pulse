export type CorePortfolioWorkspaceMode="assets"|"structure"|"compare"|"map"|"depth";

export const CORE_PORTFOLIO_WORKSPACE_MODES:readonly[CorePortfolioWorkspaceMode,string,string][]=[
 ["assets","Активы","поиск · сортировка · позиции"],
 ["structure","Структура","классы · доли капитала"],
 ["compare","Сравнить","позиции рядом"],
 ["map","Карта","вклад в портфель"],
 ["depth","Проф. анализ","фундаментал · облигации · срезы"],
];

export const CORE_PORTFOLIO_MODE_STORAGE_KEY="qvanix-core-portfolio-workspace-v102";
const MODE_SET=new Set<CorePortfolioWorkspaceMode>(CORE_PORTFOLIO_WORKSPACE_MODES.map(([mode])=>mode));
const LABEL_TO_MODE=new Map(CORE_PORTFOLIO_WORKSPACE_MODES.map(([mode,label])=>[label.toLowerCase(),mode] as const));

export function normalizeCorePortfolioWorkspaceMode(value:unknown):CorePortfolioWorkspaceMode{return typeof value==="string"&&MODE_SET.has(value as CorePortfolioWorkspaceMode)?value as CorePortfolioWorkspaceMode:"assets"}
export function corePortfolioModeFromLabel(value:string|null|undefined):CorePortfolioWorkspaceMode|null{return value?LABEL_TO_MODE.get(value.trim().toLowerCase())??null:null}
export function corePortfolioScrollStorageKey(mode:CorePortfolioWorkspaceMode){return `qvanix-core-portfolio-scroll-v102:${mode}`}
export function normalizeCorePortfolioScroll(value:unknown){const number=typeof value==="number"?value:Number(value);return Number.isFinite(number)&&number>=0?number:0}
