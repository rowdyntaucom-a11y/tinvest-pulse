export type FinancialWorkspace="home"|"assets"|"analysis"|"income"|"goal"|"account";
export type FinancialModuleState="live"|"planned"|"source-gated"|"architecture";
export type FinancialSurface="first-answer"|"workspace"|"deep-tool"|"account-infra";
export type FinancialDevice="mobile"|"desktop";
export type FinancialDataBoundary="portfolio"|"portfolio-history"|"operations"|"payouts"|"market"|"fundamentals"|"scenario-input"|"account";
export type FinancialAvailability="AVAILABLE"|"PORTFOLIO_REQUIRED"|"VERIFIED_MARKET_DATA_REQUIRED"|"SOURCE_CONTRACT_REQUIRED"|"NOT_IMPLEMENTED"|"ARCHITECTURE_ONLY";
export type FinancialModuleId=
 |"portfolio-hero"|"holdings"|"equity-fundamentals"|"bond-intelligence"|"operations"|"portfolio-report"|"structure-dimensions"
 |"performance"|"risk"|"market-relative"|"rebalance"|"portfolio-lab"|"technical-discovery"|"market-screener"
 |"futures-scenario"|"options-analytics"|"orderbook-microstructure"
 |"income-calendar"|"income-history"|"income-sources"|"market-dividend-discovery"
 |"goal-scenarios"|"registration"|"broker-connections";

export type FinancialModuleDefinition={
 id:FinancialModuleId;
 workspace:FinancialWorkspace;
 surface:FinancialSurface;
 label:string;
 purpose:string;
 state:FinancialModuleState;
 mobilePriority:1|2|3;
 desktopPriority:1|2|3;
 requiresPortfolio:boolean;
 requiresVerifiedMarketData:boolean;
 dataBoundaries:readonly FinancialDataBoundary[];
 scenarioOnly?:boolean;
 noTrade:true;
};

export type FinancialCompositionContext={
 hasPortfolio:boolean;
 hasVerifiedMarketData:boolean;
};

export type FinancialCompositionOptions={
 includeBlocked?:boolean;
 includeArchitecture?:boolean;
};

export type FinancialCompositionItem={
 module:FinancialModuleDefinition;
 priority:1|2|3;
 availability:FinancialAvailability;
 blocked:boolean;
};

export const FINANCIAL_MODULES:readonly FinancialModuleDefinition[]=[
 {id:"portfolio-hero",workspace:"home",surface:"first-answer",label:"Портфель",purpose:"Капитал, состояние и быстрый ответ",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio"],noTrade:true},
 {id:"holdings",workspace:"assets",surface:"workspace",label:"Состав",purpose:"Позиции, веса и текущий broker P/L",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio"],noTrade:true},
 {id:"equity-fundamentals",workspace:"assets",surface:"deep-tool",label:"Акции",purpose:"Проверяемые фундаментальные показатели текущих акций",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,dataBoundaries:["portfolio","fundamentals"],noTrade:true},
 {id:"bond-intelligence",workspace:"assets",surface:"deep-tool",label:"Облигации",purpose:"YTM, duration, сроки, купоны и структура",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,dataBoundaries:["portfolio","fundamentals","payouts"],noTrade:true},
 {id:"operations",workspace:"assets",surface:"workspace",label:"Операции",purpose:"Сделки, денежные потоки и выплаты",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio","operations"],noTrade:true},
 {id:"portfolio-report",workspace:"assets",surface:"deep-tool",label:"Отчёт",purpose:"Стоимость, база и сверка broker P/L",state:"live",mobilePriority:2,desktopPriority:2,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio","operations"],noTrade:true},
 {id:"structure-dimensions",workspace:"assets",surface:"workspace",label:"Структура",purpose:"Классы, отрасли, категории и валюты",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio"],noTrade:true},
 {id:"performance",workspace:"analysis",surface:"workspace",label:"Доходность",purpose:"TWR, rolling, Sharpe, Sortino",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio","portfolio-history"],noTrade:true},
 {id:"risk",workspace:"analysis",surface:"workspace",label:"Риск",purpose:"Просадка, volatility, VaR/CVaR и связи",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio","portfolio-history"],noTrade:true},
 {id:"market-relative",workspace:"analysis",surface:"workspace",label:"Рынок",purpose:"IMOEX, beta, correlation, tracking error",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,dataBoundaries:["portfolio-history","market"],noTrade:true},
 {id:"rebalance",workspace:"analysis",surface:"deep-tool",label:"Ребаланс",purpose:"Цель, drift и пользовательские сценарии",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio","scenario-input"],scenarioOnly:true,noTrade:true},
 {id:"portfolio-lab",workspace:"analysis",surface:"deep-tool",label:"Лаборатория",purpose:"Историческое сравнение пользовательских структур",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,dataBoundaries:["portfolio","market","scenario-input"],scenarioOnly:true,noTrade:true},
 {id:"technical-discovery",workspace:"analysis",surface:"deep-tool",label:"Просадки",purpose:"High/low/SMA/recovery discovery",state:"live",mobilePriority:2,desktopPriority:2,requiresPortfolio:false,requiresVerifiedMarketData:true,dataBoundaries:["market"],noTrade:true},
 {id:"market-screener",workspace:"analysis",surface:"deep-tool",label:"Скринер",purpose:"Наблюдаемые параметры MOEX TQBR",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:true,dataBoundaries:["market"],noTrade:true},
 {id:"futures-scenario",workspace:"analysis",surface:"deep-tool",label:"Фьючерсы",purpose:"Номинал, leverage, basis и scenario P/L",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:false,dataBoundaries:["scenario-input"],scenarioOnly:true,noTrade:true},
 {id:"options-analytics",workspace:"analysis",surface:"deep-tool",label:"Опционы",purpose:"Payoff, Greeks и volatility после verified source contract",state:"source-gated",mobilePriority:3,desktopPriority:2,requiresPortfolio:false,requiresVerifiedMarketData:true,dataBoundaries:["market","scenario-input"],noTrade:true},
 {id:"orderbook-microstructure",workspace:"analysis",surface:"deep-tool",label:"Микроструктура",purpose:"Стакан, spread, liquidity и scalping-oriented наблюдения без исполнения",state:"source-gated",mobilePriority:3,desktopPriority:2,requiresPortfolio:false,requiresVerifiedMarketData:true,dataBoundaries:["market"],noTrade:true},
 {id:"income-calendar",workspace:"income",surface:"workspace",label:"Календарь",purpose:"Подтверждённые будущие выплаты",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:true,dataBoundaries:["portfolio","payouts"],noTrade:true},
 {id:"income-history",workspace:"income",surface:"workspace",label:"История выплат",purpose:"Фактически полученные купоны и дивиденды",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio","payouts"],noTrade:true},
 {id:"income-sources",workspace:"income",surface:"deep-tool",label:"Источники",purpose:"Концентрация пассивного дохода",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio","payouts"],noTrade:true},
 {id:"market-dividend-discovery",workspace:"income",surface:"deep-tool",label:"Дивиденды рынка",purpose:"Отдельный broad-market dividend discovery",state:"live",mobilePriority:2,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:true,dataBoundaries:["fundamentals"],noTrade:true},
 {id:"goal-scenarios",workspace:"goal",surface:"workspace",label:"Цель",purpose:"Пользовательские траектории и WHAT IF",state:"live",mobilePriority:1,desktopPriority:1,requiresPortfolio:true,requiresVerifiedMarketData:false,dataBoundaries:["portfolio","scenario-input"],scenarioOnly:true,noTrade:true},
 {id:"registration",workspace:"account",surface:"account-infra",label:"Профиль",purpose:"Регистрация и пользовательская идентичность",state:"architecture",mobilePriority:1,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:false,dataBoundaries:["account"],noTrade:true},
 {id:"broker-connections",workspace:"account",surface:"account-infra",label:"Подключения",purpose:"Пользовательские read-only брокерские соединения",state:"architecture",mobilePriority:1,desktopPriority:1,requiresPortfolio:false,requiresVerifiedMarketData:false,dataBoundaries:["account"],noTrade:true},
]as const;

export function moduleById(id:FinancialModuleId){
 return FINANCIAL_MODULES.find(module=>module.id===id)??null;
}

export function modulesForWorkspace(workspace:FinancialWorkspace){
 return FINANCIAL_MODULES.filter(module=>module.workspace===workspace);
}

export function liveModules(){
 return FINANCIAL_MODULES.filter(module=>module.state==="live");
}

export function availabilityFor(module:FinancialModuleDefinition,context:FinancialCompositionContext):FinancialAvailability{
 if(module.state==="planned")return"NOT_IMPLEMENTED";
 if(module.state==="architecture")return"ARCHITECTURE_ONLY";
 if(module.state==="source-gated")return"SOURCE_CONTRACT_REQUIRED";
 if(module.requiresPortfolio&&!context.hasPortfolio)return"PORTFOLIO_REQUIRED";
 if(module.requiresVerifiedMarketData&&!context.hasVerifiedMarketData)return"VERIFIED_MARKET_DATA_REQUIRED";
 return"AVAILABLE";
}

export function compositionFor(
 workspace:FinancialWorkspace,
 device:FinancialDevice,
 context:FinancialCompositionContext,
 options:FinancialCompositionOptions={},
):FinancialCompositionItem[]{
 const originalIndex=new Map(FINANCIAL_MODULES.map((module,index)=>[module.id,index] as const));
 return modulesForWorkspace(workspace)
  .map(module=>{
   const availability=availabilityFor(module,context);
   return{
    module,
    priority:device==="mobile"?module.mobilePriority:module.desktopPriority,
    availability,
    blocked:availability!=="AVAILABLE",
   } satisfies FinancialCompositionItem;
  })
  .filter(item=>{
   if(item.module.state==="architecture"&&!options.includeArchitecture)return false;
   if(item.blocked&&!options.includeBlocked)return false;
   return true;
  })
  .sort((a,b)=>(a.priority-b.priority)||((originalIndex.get(a.module.id)??0)-(originalIndex.get(b.module.id)??0)));
}

export function assertReadOnlyProductInvariant(){
 const invalid=FINANCIAL_MODULES.filter(module=>module.noTrade!==true);
 if(invalid.length)throw new Error("QVANIX financial module registry contains a trading-capable module");
 return true;
}

export function assertFinancialRegistryInvariant(){
 const ids=FINANCIAL_MODULES.map(module=>module.id);
 if(new Set(ids).size!==ids.length)throw new Error("QVANIX financial module registry contains duplicate module ids");
 const sourceGateWithoutMarketContract=FINANCIAL_MODULES.filter(module=>module.state==="source-gated"&&!module.requiresVerifiedMarketData);
 if(sourceGateWithoutMarketContract.length)throw new Error("QVANIX source-gated market tools must require verified market data");
 const liveWithoutBoundary=FINANCIAL_MODULES.filter(module=>module.state==="live"&&module.dataBoundaries.length===0);
 if(liveWithoutBoundary.length)throw new Error("QVANIX live financial modules must declare a data boundary");
 assertReadOnlyProductInvariant();
 return true;
}
