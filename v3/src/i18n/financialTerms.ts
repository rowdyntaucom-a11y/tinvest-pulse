const FINANCIAL_LABELS:Record<string,string>={
 government:"Государственный",
 financial:"Финансовый",
 energy:"Энергетика",
 utilities:"Коммунальный сектор",
 industrials:"Промышленность",
 materials:"Материалы",
 consumer:"Потребительский сектор",
 telecom:"Телеком",
 technology:"Технологии",
 healthcare:"Здравоохранение",
};

export function localizeFinancialLabel(value:string){
 const trimmed=value.trim();
 if(!trimmed)return value;
 return FINANCIAL_LABELS[trimmed.toLowerCase()]??trimmed;
}

export const financialCopy={
 readOnly:"Только чтение",
 verified:"подтверждено",
 noData:"нет данных",
 usableMetrics:"подтверждённые метрики",
 verifiedFundamentals:"подтверждённые фундаментальные данные",
 dirtyValue:"стоимость с НКД",
 exactFigi:"точное совпадение по FIGI",
}as const;
