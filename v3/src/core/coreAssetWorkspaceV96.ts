export type CoreAssetWorkspaceMode="summary"|"context"|"history"|"details";

export const CORE_ASSET_WORKSPACE_MODES:[CoreAssetWorkspaceMode,string,string][]=[
 ["summary","Сводка","Позиция, вес и текущий P/L"],
 ["context","Контекст","Место бумаги внутри портфеля"],
 ["history","История","Цена и наблюдаемый риск"],
 ["details","Детали","Формулы и параметры инструмента"],
];

export function isCoreAssetWorkspaceMode(value:unknown):value is CoreAssetWorkspaceMode{
 return typeof value==="string"&&CORE_ASSET_WORKSPACE_MODES.some(([mode])=>mode===value);
}

export function normalizeCoreAssetWorkspaceMode(value:unknown):CoreAssetWorkspaceMode{
 return isCoreAssetWorkspaceMode(value)?value:"summary";
}
