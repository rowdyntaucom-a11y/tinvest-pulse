export type FuturesScenarioInput={
 futuresPrice:number|null;
 spotPrice:number|null;
 scenarioPrice:number|null;
 contracts:number|null;
 priceValuePerPoint:number|null;
 marginPerContract:number|null;
 daysToExpiry:number|null;
};

export type FuturesScenarioResult={
 notional:number|null;
 totalMargin:number|null;
 leverage:number|null;
 scenarioPnl:number|null;
 scenarioMarginReturnPct:number|null;
 basisAbsolute:number|null;
 basisPct:number|null;
 annualizedBasisPct:number|null;
};

function positive(value:number|null){return value!=null&&Number.isFinite(value)&&value>0?value:null}
function finite(value:number|null){return value!=null&&Number.isFinite(value)?value:null}

export function calculateFuturesScenario(input:FuturesScenarioInput):FuturesScenarioResult{
 const futuresPrice=positive(input.futuresPrice);
 const spotPrice=positive(input.spotPrice);
 const scenarioPrice=positive(input.scenarioPrice);
 const contracts=positive(input.contracts);
 const pointValue=positive(input.priceValuePerPoint);
 const marginPerContract=positive(input.marginPerContract);
 const days=positive(input.daysToExpiry);

 const notional=futuresPrice&&contracts&&pointValue?futuresPrice*contracts*pointValue:null;
 const totalMargin=contracts&&marginPerContract?contracts*marginPerContract:null;
 const leverage=notional&&totalMargin?notional/totalMargin:null;
 const scenarioPnl=futuresPrice&&scenarioPrice&&contracts&&pointValue?(scenarioPrice-futuresPrice)*contracts*pointValue:null;
 const scenarioMarginReturnPct=scenarioPnl!=null&&totalMargin?scenarioPnl/totalMargin*100:null;
 const basisAbsolute=futuresPrice&&spotPrice?futuresPrice-spotPrice:null;
 const basisPct=futuresPrice&&spotPrice?(futuresPrice/spotPrice-1)*100:null;
 const annualizedBasisPct=basisPct!=null&&days?basisPct*365/days:null;

 return{notional,totalMargin,leverage,scenarioPnl,scenarioMarginReturnPct,basisAbsolute,basisPct,annualizedBasisPct};
}

export function parseScenarioNumber(raw:string):number|null{
 const normalized=raw.replace(",",".").trim();
 if(!normalized)return null;
 const value=Number(normalized);
 return Number.isFinite(value)?value:null;
}

export function futuresScenarioWarnings(input:FuturesScenarioInput,result:FuturesScenarioResult){
 const warnings:string[]=[];
 if(finite(input.contracts)!=null&&input.contracts!<=0)warnings.push("Количество контрактов должно быть больше нуля.");
 if(finite(input.priceValuePerPoint)!=null&&input.priceValuePerPoint!<=0)warnings.push("Стоимость пункта должна быть больше нуля.");
 if(finite(input.marginPerContract)!=null&&input.marginPerContract!<=0)warnings.push("ГО на контракт должно быть больше нуля.");
 if(result.leverage!=null&&result.leverage>=10)warnings.push("Высокое расчётное плечо: небольшой ход цены может дать большой результат относительно ГО.");
 if(result.annualizedBasisPct!=null&&Math.abs(result.annualizedBasisPct)>100)warnings.push("Высокий annualized basis: проверьте цену базового актива, срок и спецификацию контракта.");
 return warnings;
}
