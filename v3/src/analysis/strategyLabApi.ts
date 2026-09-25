import{alignStrategyLabSeries,type StrategyLabPoint}from"./strategyHistoryLab";

export type StrategyLabSource={
 available:boolean;
 fetchedAt:string|null;
 from:string|null;
 to:string|null;
 equityCode:string;
 bondCode:string;
 points:StrategyLabPoint[];
 reason:string|null;
};

export async function loadStrategyLabSource(signal?:AbortSignal):Promise<StrategyLabSource>{
 try{
  const response=await fetch("/api/strategy-lab-history",{cache:"no-store",signal});
  if(!response.ok)return{available:false,fetchedAt:null,from:null,to:null,equityCode:"MCFTR",bondCode:"RGBITR",points:[],reason:"HTTP "+response.status};
  const raw=await response.json() as any;
  const equity=Array.isArray(raw?.equity?.points)?raw.equity.points:[];
  const bond=Array.isArray(raw?.bond?.points)?raw.bond.points:[];
  const points=alignStrategyLabSeries(equity,bond);
  return{
   available:raw?.ok===true&&points.length>=2,
   fetchedAt:typeof raw?.fetchedAt==="string"?raw.fetchedAt:null,
   from:typeof raw?.from==="string"?raw.from:null,
   to:typeof raw?.to==="string"?raw.to:null,
   equityCode:String(raw?.equity?.code||"MCFTR"),
   bondCode:String(raw?.bond?.code||"RGBITR"),
   points,
   reason:raw?.ok===true&&points.length>=2?null:String(raw?.reason||"Aligned market history is unavailable."),
  };
 }catch(error){
  if(error instanceof DOMException&&error.name==="AbortError")throw error;
  return{available:false,fetchedAt:null,from:null,to:null,equityCode:"MCFTR",bondCode:"RGBITR",points:[],reason:"Market-history source is unavailable."};
 }
}
