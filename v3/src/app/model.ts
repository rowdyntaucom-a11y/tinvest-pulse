export type V3Workspace = "home" | "assets" | "analysis" | "income" | "goal";
export type V3Shell = "core" | "horizon" | "carbon";
export type V3DetailMode = "simple" | "detailed";
export const V3_NAV = [{id:"home",label:"Главная"},{id:"assets",label:"Активы"},{id:"analysis",label:"Анализ"},{id:"income",label:"Доход"},{id:"goal",label:"Цель"}] as const;
export const V3_SHELLS = [{id:"core",label:"CORE"},{id:"horizon",label:"HORIZON"},{id:"carbon",label:"CARBON"}] as const;
