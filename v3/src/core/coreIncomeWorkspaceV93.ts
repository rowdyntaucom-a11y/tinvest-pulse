export type CoreIncomeWorkspaceMode="summary"|"fact"|"events"|"sources"|"pro";

export const CORE_INCOME_WORKSPACE_MODES:[CoreIncomeWorkspaceMode,string,string][]=[
 ["summary","Коротко","Главное без диагностической глубины"],
 ["fact","Факт","Полученный net и налоговые факты"],
 ["events","События","Подтверждённый HIGH-календарь"],
 ["sources","Источники","Связь выплат с текущими позициями"],
 ["pro","Профи","Все диагностические слои"],
];

export function isCoreIncomeWorkspaceMode(value:unknown):value is CoreIncomeWorkspaceMode{
 return typeof value==="string"&&CORE_INCOME_WORKSPACE_MODES.some(([mode])=>mode===value);
}

export function normalizeCoreIncomeWorkspaceMode(value:unknown):CoreIncomeWorkspaceMode{
 return isCoreIncomeWorkspaceMode(value)?value:"summary";
}
