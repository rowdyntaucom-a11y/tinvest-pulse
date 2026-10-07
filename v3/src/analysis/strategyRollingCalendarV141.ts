import type{StrategyLabScenarioResult}from"./strategyHistoryLab";
export type CalendarYearV141={year:number;returnA:number;returnB:number;gap:number;leader:"A"|"B"|"tie";points:number};
export type RollingCalendarV141={available:boolean;years:CalendarYearV141[];aWins:number;bWins:number;ties:number;medianGap:number|null;reason:string|null};
function med(xs:number[]){const a=[...xs].sort((x,y)=>x-y),n=a.length;if(!n)return null;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2}
export function buildStrategyRollingCalendarV141(a:StrategyLabScenarioResult|null,b:StrategyLabScenarioResult|null):RollingCalendarV141{
 if(!a?.available||!b?.available)return{available:false,years:[],aWins:0,bWins:0,ties:0,medianGap:null,reason:"Нужны два подтверждённых исторических сценария."};
 const bm=new Map(b.curve.map(x=>[x.date,x.value]));const rows=a.curve.filter(x=>bm.has(x.date)).map(x=>({date:x.date,a:x.value,b:bm.get(x.date)!}));if(rows.length<2)return{available:false,years:[],aWins:0,bWins:0,ties:0,medianGap:null,reason:"Недостаточно общих дат."};
 const groups=new Map<number,typeof rows>();for(const x of rows){const y=Number(x.date.slice(0,4));const g=groups.get(y)??[];g.push(x);groups.set(y,g)}
 const years:CalendarYearV141[]=[];for(const[y,g]of groups){if(g.length<2)continue;const f=g[0],l=g.at(-1)!;const ra=l.a/f.a-1,rb=l.b/f.b-1,gap=ra-rb;years.push({year:y,returnA:ra,returnB:rb,gap,leader:Math.abs(gap)<1e-10?"tie":gap>0?"A":"B",points:g.length})}
 if(!years.length)return{available:false,years:[],aWins:0,bWins:0,ties:0,medianGap:null,reason:"Нет полного календарного сравнения."};
 return{available:true,years,aWins:years.filter(x=>x.leader==="A").length,bWins:years.filter(x=>x.leader==="B").length,ties:years.filter(x=>x.leader==="tie").length,medianGap:med(years.map(x=>x.gap)),reason:null};
}