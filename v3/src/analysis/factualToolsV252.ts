/** v252: Show evidence-based portfolio work, not speculative WHAT-IF simulators. */
export type FactualToolId="bonds"|"report";
export const FACTUAL_TOOLS=[
 {id:"bonds",label:"Облигации",note:"сроки · выпуски · купоны",hero:"Фактический состав облигаций, эмитенты, сроки и доступные данные по купонам."},
 {id:"report",label:"Отчёт портфеля",note:"состав · валюты · результат",hero:"Текущие позиции, структура и результаты по подтверждённому снимку."}
] as const;
export const FACTUAL_TOOL_STORAGE_KEY="qvanix-pro-tools-v100";
/** Old saved choices of removed scenarios return to the first useful report. */
export function resolveFactualToolId(value:unknown):FactualToolId{
 return value==="bonds"||value==="report"?value:"bonds";
}
