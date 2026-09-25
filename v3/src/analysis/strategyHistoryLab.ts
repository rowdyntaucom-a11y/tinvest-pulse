export type StrategyLabPoint={date:string;equity:number;bond:number};
export type StrategyLabMetrics={points:number;startDate:string;endDate:string;totalReturn:number;cagr:number|null;maxDrawdown:number|null;annualizedVol:number|null};
export type StrategyLabScenarioResult={available:boolean;equityWeight:number;bondWeight:number;metrics:StrategyLabMetrics|null;curve:{date:string;value:number}[];reason:string|null};

function validLevel(value:unknown){return typeof value==="number"&&Number.isFinite(value)&&value>0}
function dateOnly(value:unknown){
 if(typeof value!=="string")return null;
 const day=value.slice(0,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return null;
 const ms=Date.parse(day+"T00:00:00.000Z");
 return Number.isFinite(ms)?day:null;
}
function std(values:number[]){
 if(values.length<2)return null;
 const mean=values.reduce((a,b)=>a+b,0)/values.length;
 const variance=values.reduce((sum,x)=>sum+(x-mean)**2,0)/(values.length-1);
 return Math.sqrt(variance);
}
export function alignStrategyLabSeries(equity:{date:string;value:number}[],bond:{date:string;value:number}[]){
 const eq=new Map(equity.filter(x=>dateOnly(x.date)&&validLevel(x.value)).map(x=>[x.date.slice(0,10),x.value]));
 const bd=new Map(bond.filter(x=>dateOnly(x.date)&&validLevel(x.value)).map(x=>[x.date.slice(0,10),x.value]));
 return [...eq.entries()].filter(([date])=>bd.has(date)).map(([date,value])=>({date,equity:value,bond:bd.get(date)!})).sort((a,b)=>a.date.localeCompare(b.date));
}
export function filterStrategyLabWindow(points:StrategyLabPoint[],years:1|3|5){
 if(points.length<2)return points;
 const anchor=Date.parse(points.at(-1)!.date+"T00:00:00.000Z");
 const cutoff=new Date(anchor);
 cutoff.setUTCFullYear(cutoff.getUTCFullYear()-years);
 const key=cutoff.toISOString().slice(0,10);
 const rows=points.filter(x=>x.date>=key);
 return rows.length>=2?rows:points.slice(-2);
}
export function runMonthlyRebalancedStrategy(points:StrategyLabPoint[],equityWeight:number):StrategyLabScenarioResult{
 const bondWeight=1-equityWeight;
 if(!Number.isFinite(equityWeight)||equityWeight<=0||equityWeight>=1)return{available:false,equityWeight,bondWeight,metrics:null,curve:[],reason:"Weights must keep both classes above 0% and sum to 100%."};
 const rows=points.filter(x=>dateOnly(x.date)&&validLevel(x.equity)&&validLevel(x.bond));
 if(rows.length<2)return{available:false,equityWeight,bondWeight,metrics:null,curve:[],reason:"At least two aligned equity/bond index points are required."};
 let portfolio=1,eqValue=equityWeight,bondValue=bondWeight;
 const curve=[{date:rows[0].date,value:1}],returns:number[]=[];
 let peak=1,maxDd=0;
 for(let i=1;i<rows.length;i++){
  const prev=rows[i-1],cur=rows[i];
  if(cur.date.slice(0,7)!==prev.date.slice(0,7)){eqValue=portfolio*equityWeight;bondValue=portfolio*bondWeight}
  const er=cur.equity/prev.equity,br=cur.bond/prev.bond;
  if(!Number.isFinite(er)||!Number.isFinite(br)||er<=0||br<=0)continue;
  const before=portfolio;
  eqValue*=er;bondValue*=br;portfolio=eqValue+bondValue;
  if(before>0)returns.push(portfolio/before-1);
  peak=Math.max(peak,portfolio);
  maxDd=Math.min(maxDd,portfolio/peak-1);
  curve.push({date:cur.date,value:portfolio});
 }
 if(curve.length<2)return{available:false,equityWeight,bondWeight,metrics:null,curve:[],reason:"Aligned index history did not produce a valid strategy curve."};
 const start=Date.parse(curve[0].date+"T00:00:00.000Z"),end=Date.parse(curve.at(-1)!.date+"T00:00:00.000Z");
 const years=(end-start)/(365.2425*86400000),totalReturn=portfolio-1;
 const cagr=years>0&&portfolio>0?portfolio**(1/years)-1:null;
 const sigma=std(returns);
 return{available:true,equityWeight,bondWeight,curve,reason:null,metrics:{points:curve.length,startDate:curve[0].date,endDate:curve.at(-1)!.date,totalReturn,cagr,maxDrawdown:maxDd,annualizedVol:sigma==null?null:sigma*Math.sqrt(252)}};
}
