import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3HomeViewModel}from"../home/homeViewModel";

export type V3PulseAllocation={key:string;ticker:string;weight:number;value:number};
export type V3PulseSnapshot={
  available:boolean;
  accountName:string;
  value:number|null;
  profit:number|null;
  profitPct:number|null;
  passiveIncome:number|null;
  monthlyIncome:number|null;
  xirr:number|null;
  positions:number|null;
  updatedAt:string|null;
  history:HistoryPoint[];
  allocation:V3PulseAllocation[];
  allocationCoverage:number;
};

function finite(value:unknown):value is number{return typeof value==="number"&&Number.isFinite(value)}
function cleanHistory(points:HistoryPoint[]){
  return [...points]
    .filter(point=>point?.date)
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}
function allocationKey(position:PositionSnapshot){return position.instrumentUid?.trim()||position.figi?.trim()||position.ticker}

export function buildV3PulseSnapshot(home:V3HomeViewModel,positions:PositionSnapshot[]):V3PulseSnapshot{
  const available=home.isTrusted&&finite(home.value)&&home.value>=0;
  const allocation=available?[...positions]
    .filter(position=>finite(position.currentValue)&&position.currentValue>0&&finite(position.weight)&&position.weight>0)
    .sort((a,b)=>b.weight-a.weight)
    .slice(0,6)
    .map(position=>({key:allocationKey(position),ticker:position.ticker,weight:Math.min(1,Math.max(0,position.weight)),value:position.currentValue})):[];
  return{
    available,
    accountName:home.accountName||"Портфель",
    value:available?home.value:null,
    profit:available&&finite(home.profit)?home.profit:null,
    profitPct:available&&finite(home.profitPct)?home.profitPct:null,
    passiveIncome:available&&finite(home.passiveIncome)?home.passiveIncome:null,
    monthlyIncome:available&&finite(home.monthlyIncome)?home.monthlyIncome:null,
    xirr:available&&finite(home.xirr)?home.xirr:null,
    positions:available&&finite(home.positions)?home.positions:null,
    updatedAt:available?home.updatedAt:null,
    history:available?cleanHistory(home.history):[],
    allocation,
    allocationCoverage:allocation.reduce((sum,row)=>sum+row.weight,0),
  };
}

export function buildPulseHistoryGeometry(points:HistoryPoint[]){
  const valid=points.filter(point=>finite(point.value));
  if(valid.length<2)return{available:false,segments:[] as string[],start:null as number|null,end:null as number|null,min:null as number|null,max:null as number|null};
  const values=valid.map(point=>point.value as number);
  const min=Math.min(...values),max=Math.max(...values),span=max-min||1,total=Math.max(1,points.length-1);
  const x=(index:number)=>index/total*100;
  const y=(value:number)=>42-((value-min)/span)*34;
  const segments:string[]=[];
  let current:string[]=[];
  points.forEach((point,index)=>{
    if(!finite(point.value)){
      if(current.length>=2)segments.push(current.join(" "));
      current=[];
      return;
    }
    current.push(x(index)+","+y(point.value));
  });
  if(current.length>=2)segments.push(current.join(" "));
  return{available:segments.length>0,segments,start:values[0],end:values.at(-1)??null,min,max};
}
