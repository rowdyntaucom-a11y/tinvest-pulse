export type DividendDiscoveryRow={
 assetUid:string;
 instrumentUid:string;
 ticker:string;
 name:string;
 dividendYieldDailyTtm:number;
 marketCapitalization:number|null;
};

export type DividendDiscoveryCoverage={
 shares:number;
 fundamentals:number;
 matchedFundamentals:number;
 dividendRows:number;
 missingDividendYieldTtm:number;
 nonPositiveDividendYieldTtm:number;
};

export type DividendDiscoveryPayload={
 available:boolean;
 rows:DividendDiscoveryRow[];
 coverage:DividendDiscoveryCoverage;
 yieldField:"dividend_yield_daily_ttm";
 yieldSemantics:"trailing_twelve_months";
 semantics:"descriptive_market_discovery";
 updatedAt:string;
};

function record(value:unknown):value is Record<string,unknown>{return value!=null&&typeof value==="object"}
function finite(value:unknown):value is number{return typeof value==="number"&&Number.isFinite(value)}
function nonNegativeInteger(value:unknown):value is number{return Number.isInteger(value)&&Number(value)>=0}
function text(value:unknown):value is string{return typeof value==="string"&&value.trim().length>0}

function validRow(value:unknown):value is DividendDiscoveryRow{
 if(!record(value))return false;
 return text(value.assetUid)&&text(value.instrumentUid)&&text(value.ticker)&&text(value.name)
  &&finite(value.dividendYieldDailyTtm)&&value.dividendYieldDailyTtm>0
  &&(value.marketCapitalization===null||(finite(value.marketCapitalization)&&value.marketCapitalization>0));
}

function validCoverage(value:unknown):value is DividendDiscoveryCoverage{
 if(!record(value))return false;
 return ["shares","fundamentals","matchedFundamentals","dividendRows","missingDividendYieldTtm","nonPositiveDividendYieldTtm"]
  .every(key=>nonNegativeInteger(value[key]));
}

export function normalizeDividendDiscoveryPayload(value:unknown):DividendDiscoveryPayload|null{
 if(!record(value)||typeof value.available!=="boolean"||!Array.isArray(value.rows)||!validCoverage(value.coverage))return null;
 if(value.yieldField!=="dividend_yield_daily_ttm"||value.yieldSemantics!=="trailing_twelve_months"||value.semantics!=="descriptive_market_discovery")return null;
 if(!text(value.updatedAt)||!value.rows.every(validRow))return null;
 if(value.available!==value.rows.length>0||value.coverage.dividendRows!==value.rows.length)return null;
 return value as DividendDiscoveryPayload;
}

export async function loadDividendDiscovery(signal?:AbortSignal):Promise<DividendDiscoveryPayload>{
 const response=await fetch("/api/dividend-discovery",{headers:{Accept:"application/json"},cache:"no-store",signal});
 if(!response.ok)throw new Error("dividend discovery unavailable");
 const payload=normalizeDividendDiscoveryPayload(await response.json());
 if(!payload)throw new Error("invalid dividend discovery payload");
 return payload;
}
