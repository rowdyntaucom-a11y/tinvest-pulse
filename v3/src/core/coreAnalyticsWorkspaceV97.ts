export type CoreAnalyticsWorkspaceMode="summary"|"analysis"|"method";

export const CORE_ANALYTICS_WORKSPACE_MODES:[CoreAnalyticsWorkspaceMode,string,string][]=[
 ["summary","Сводка","Главный ответ и качество выборки"],
 ["analysis","Разбор","Доходность, риск и сравнение с IMOEX"],
 ["method","Методика","Пояснения, термины и границы интерпретации"],
];

export function isCoreAnalyticsWorkspaceMode(value:unknown):value is CoreAnalyticsWorkspaceMode{
 return typeof value==="string"&&CORE_ANALYTICS_WORKSPACE_MODES.some(([mode])=>mode===value);
}

export function normalizeCoreAnalyticsWorkspaceMode(value:unknown):CoreAnalyticsWorkspaceMode{
 return isCoreAnalyticsWorkspaceMode(value)?value:"summary";
}
