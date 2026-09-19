import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{AssetHistoryPayload,AssetHistorySeries}from"../../../v2/src/lib/assetHistoryApi";
import type{CurrentRiskSeriesInput}from"../../../v2/src/features/analytics/currentRiskContribution";
import type{RiskSeries}from"../../../v2/src/features/analytics/riskMatrix";
import{positionIdentityKey}from"../assets/positionIdentity";

export type V3RiskHistoryMatch={
  inputs:CurrentRiskSeriesInput[];
  series:RiskSeries[];
  matchedTickers:string[];
  unmatchedTickers:string[];
  ambiguousTickers:string[];
  coveredValue:number;
};

const clean=(value:string|null|undefined)=>String(value??"").trim();

function positionKey(position:PositionSnapshot){
  return positionIdentityKey(position)??position.ticker;
}

export function buildV3RiskHistoryMatch(payload:AssetHistoryPayload|null,positions:PositionSnapshot[]):V3RiskHistoryMatch{
  const active=positions.filter(position=>Number.isFinite(position.currentValue)&&position.currentValue>0);
  const byId=new Map<string,PositionSnapshot|null>();
  for(const position of active){
    for(const rawId of[position.instrumentUid,position.figi]){
      const id=clean(rawId);
      if(!id)continue;
      if(!byId.has(id))byId.set(id,position);
      else if(byId.get(id)!==position)byId.set(id,null);
    }
  }

  const matchedByPosition=new Map<string,Array<{position:PositionSnapshot;series:AssetHistorySeries}>>();
  for(const item of payload?.series??[]){
    if(item.integrity!=="VALID"||item.points.length<2)continue;
    const instrumentId=clean(item.instrumentId);
    if(!instrumentId)continue;
    const position=byId.get(instrumentId);
    if(!position)continue;
    const key=positionKey(position);
    const rows=matchedByPosition.get(key)??[];
    rows.push({position,series:item});
    matchedByPosition.set(key,rows);
  }

  const inputs:CurrentRiskSeriesInput[]=[];
  const series:RiskSeries[]=[];
  const matchedTickers:string[]=[];
  const ambiguousTickers:string[]=[];
  const matchedKeys=new Set<string>();

  for(const [key,rows] of matchedByPosition.entries()){
    if(rows.length!==1){
      ambiguousTickers.push(rows[0]?.position.ticker??key);
      continue;
    }
    const {position,series:item}=rows[0];
    inputs.push({
      key,
      label:position.ticker||item.label,
      points:item.points,
      currentValue:position.currentValue,
    });
    series.push({key,label:position.ticker||item.label,points:item.points});
    matchedTickers.push(position.ticker);
    matchedKeys.add(key);
  }

  const unmatchedTickers=active
    .filter(position=>!matchedKeys.has(positionKey(position))&&!ambiguousTickers.includes(position.ticker))
    .map(position=>position.ticker);

  return{
    inputs,
    series,
    matchedTickers,
    unmatchedTickers,
    ambiguousTickers,
    coveredValue:inputs.reduce((sum,item)=>sum+item.currentValue,0),
  };
}

export function summarizeCorrelationPairs(series:RiskSeries[],cells:Array<{a:string;b:string;correlation:number|null;pairedReturns:number;available:boolean;mature:boolean}>){
  const labels=new Map(series.map(item=>[item.key,item.label]));
  const ready=cells.filter(cell=>cell.a!==cell.b&&cell.available&&cell.correlation!=null);
  const byAbs=[...ready].sort((a,b)=>Math.abs(b.correlation!)-Math.abs(a.correlation!));
  const highest=ready.length?ready.reduce((best,cell)=>cell.correlation!>best.correlation!?cell:best):null;
  const lowest=ready.length?ready.reduce((best,cell)=>cell.correlation!<best.correlation!?cell:best):null;
  const describe=(cell:typeof highest)=>cell?{
    aKey:cell.a,
    bKey:cell.b,
    a:labels.get(cell.a)??cell.a,
    b:labels.get(cell.b)??cell.b,
    correlation:cell.correlation!,
    pairedReturns:cell.pairedReturns,
    mature:cell.mature,
  }:null;
  return{
    readyPairs:ready.length,
    strongestAbsolute:byAbs.slice(0,4).map(cell=>describe(cell)!),
    highest:describe(highest),
    lowest:describe(lowest),
  };
}
