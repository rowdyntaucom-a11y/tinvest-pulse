export type CoreHomeWorkspaceMode="summary"|"pulse"|"assets"|"all";

export const CORE_HOME_WORKSPACE_MODES:[CoreHomeWorkspaceMode,string,string][]=[
 ["summary","Обзор","Капитал, структура и текущий контекст"],
 ["pulse","Пульс","Что сильнее влияет на текущую картину"],
 ["assets","Активы","Крупнейшие позиции без лишней глубины"],
 ["all","Всё","Полная домашняя лента"],
];

export function isCoreHomeWorkspaceMode(value:unknown):value is CoreHomeWorkspaceMode{
 return typeof value==="string"&&CORE_HOME_WORKSPACE_MODES.some(([mode])=>mode===value);
}

export function normalizeCoreHomeWorkspaceMode(value:unknown):CoreHomeWorkspaceMode{
 return isCoreHomeWorkspaceMode(value)?value:"summary";
}
