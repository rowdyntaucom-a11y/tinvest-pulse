export type FinancialWorkspace="home"|"assets"|"analysis"|"income"|"goal"|"account";
export type FinancialModuleState="live"|"planned"|"source-gated"|"architecture";
export type FinancialModuleId=
 |"portfolio-hero"|"holdings"|"equity-fundamentals"|"bond-intelligence"|"operations"|"portfolio-report"|"structure-dimensions"
 |"performance"|"risk"|"market-relative"|"rebalance"|"portfolio-lab"|"technical-discovery"|"market-screener"
 |"futures-scenario"|"options-analytics"|"orderbook-microstructure"
 |"income-calendar"|"income-history"|"income-sources"|"market-dividend-discovery"
 |"goal-scenarios"|"registration"|"broker-connections";

export type FinancialModuleDefinition={
 id:FinancialModuleId;
 workspace:FinancialWorkspace;
 label:string;
 purpose:string;
 state:FinancialModuleState;
 mobilePriority:1|2|3;
 desktopPriority:1|2|3;
 requiresPortfolio:boolean;
 requiresVerifiedMarketData:boolean;
 scenarioOnly?:boolean;
 noTrade:true;
};

export const FINANCIAL_MODULES:readonly FinancialModuleDefinition[]=[
 {id:"portfolio-hero",workspace:"home",label:"Портфель",purpose:"Капитал, состояние и быстрый ответ",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"holdings",workspace:"assets",label:"Состав",purpose:"Позиции, веса и текущий broker P/L",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"equity-fundamentals",workspace:"assets",label:"Акции",purpose:"Проверяемые фундаментальные показатели текущих акций",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,noTrade:true},
 {id:"bond-intelligence",workspace:"assets",label:"Облигации",purpose:"YTM, duration, сроки, купоны и структура",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,noTrade:true},
 {id:"operations",workspace:"assets",label:"Операции",purpose:"Сделки, денежные потоки и выплаты",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"portfolio-report",workspace:"assets",label:"Отчёт",purpose:"Стоимость, база и сверка broker P/L",state:"live",mobilePriority:2,desktopPriority:2,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"structure-dimensions",workspace:"assets",label:"Структура",purpose:"Классы, отрасли, категории и валюты",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"performance",workspace:"analysis",label:"Доходность",purpose:"TWR, rolling, Sharpe, Sortino",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"risk",workspace:"analysis",label:"Риск",purpose:"Просадка, volatility, VaR/CVaR и связи",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"market-relative",workspace:"analysis",label:"Рынок",purpose:"IMOEX, beta, correlation, tracking error",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,noTrade:true},
 {id:"rebalance",workspace:"analysis",label:"Ребаланс",purpose:"Цель, drift и пользовательские сценарии",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,scenarioOnly:true,noTrade:true},
 {id:"portfolio-lab",workspace:"analysis",label:"Лаборатория",purpose:"Историческое сравнение пользовательских структур",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,scenarioOnly:true,noTrade:true},
 {id:"technical-discovery",workspace:"analysis",label:"Просадки",purpose:"High/low/SMA/recovery discovery",state:"live",mobilePriority:2,desktopPriority:2,requiresPortfolio:false,requiresVerifiedMarketData:true,noTrade:true},
 {id:"market-screener",workspace:"analysis",label:"Скринер",purpose:"Наблюдаемые параметры MOEX TQBR",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:true,noTrade:true},
 {id:"futures-scenario",workspace:"analysis",label:"Фьючерсы",purpose:"Номинал, leverage, basis и scenario P/L",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:false,scenarioOnly:true,noTrade:true},
 {id:"options-analytics",workspace:"analysis",label:"Опционы",purpose:"Payoff, Greeks и volatility после verified source contract",state:"source-gated",mobilePriority:3,desktopPriority:2,requiresPortfolio:false,requiresVerifiedMarketData:true,noTrade:true},
 {id:"orderbook-microstructure",workspace:"analysis",label:"Микроструктура",purpose:"Стакан, spread, liquidity и scalping-oriented наблюдения без исполнения",state:"source-gated",mobilePriority:3,desktopPriority:2,requiresPortfolio:false,requiresVerifiedMarketData:true,noTrade:true},
 {id:"income-calendar",workspace:"income",label:"Календарь",purpose:"Подтверждённые будущие выплаты",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,noTrade:true},
 {id:"income-history",workspace:"income",label:"История выплат",purpose:"Фактически полученные купоны и дивиденды",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"income-sources",workspace:"income",label:"Источники",purpose:"Концентрация пассивного дохода",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,noTrade:true},
 {id:"market-dividend-discovery",workspace:"income",label:"Дивиденды рынка",purpose:"Отдельный broad-market dividend discovery",state:"planned",mobilePriority:2,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:true,noTrade:true},
 {id:"goal-scenarios",workspace:"goal",label:"Цель",purpose:"Пользовательские траектории и WHAT IF",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,scenarioOnly:true,noTrade:true},
 {id:"registration",workspace:"account",label:"Профиль",purpose:"Регистрация и пользовательская идентичность",state:"architecture",mobilePriority:1,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:false,noTrade:true},
 {id:"broker-connections",workspace:"account",label:"Подключения",purpose:"Пользовательские read-only брокерские соединения",state:"architecture",mobilePriority:1,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:false,noTrade:true},
]as const;

export function modulesForWorkspace(workspace:FinancialWorkspace){
 return FINANCIAL_MODULES.filter(module=>module.workspace===workspace);
}

export function liveModules(){
 return FINANCIAL_MODULES.filter(module=>module.state==="live");
}

export function assertReadOnlyProductInvariant(){
 const invalid=FINANCIAL_MODULES.filter(module=>module.noTrade!==true);
 if(invalid.length)throw new Error("QVANIX financial module registry contains a trading-capable module");
 return true;
}
