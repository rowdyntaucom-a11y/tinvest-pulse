import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import{resolveValidatedHistory}from"./validatedHistoryV244.ts";

export type DrawdownEpisode={
 peakDate:string;peakIndex:number;troughDate:string;troughIndex:number;
 recoveryDate:string|null;observedUntil:string;depthPct:number;peakToTroughDays:number;
 underwaterDays:number;maxGapDays:number;quoteCount:number;status:"recovered"|"open";sparse:boolean;
};
export type DrawdownAnalysis={
 trusted:boolean;isIndex:boolean;asOfDate:string|null;points:number;episodes:DrawdownEpisode[];
 worst:DrawdownEpisode|null;active:DrawdownEpisode|null;reason:string|null;
};
const DAY_MS=86400000;
const days=(a:string,b:string)=>(Date.parse(b+"T00:00:00.000Z")-Date.parse(a+"T00:00:00.000Z"))/DAY_MS;
const absent=(trusted:boolean,reason:string):DrawdownAnalysis=>({trusted,isIndex:false,asOfDate:null,points:0,episodes:[],worst:null,active:null,reason});
/**
 * TWR/wealth-index drawdowns, not PnL or external cash flows. All extrema are
 * observations, not intraday theoretical lows; a large missing span is flagged.
 */
export function analyzeDrawdownEpisodes(history:HistoryPoint[],trusted:boolean):DrawdownAnalysis{
 if(!trusted)return absent(false,"Источник истории портфеля не подтверждён.");
 const {points,isPortfolioIndex}=resolveValidatedHistory(history);
 if(!isPortfolioIndex||points.length<2)return absent(true,"Нет подтверждённого ряда индекса доходности для анализа просадок.");
 const events:DrawdownEpisode[]=[];
 let peak=points[0],peakIndex=0;
 let started:({peakDate:string;peakIndex:number;peakLevel:number;troughDate:string;troughIndex:number;troughLevel:number;maxGapDays:number;quotes:number})|null=null;
 for(let i=1;i<points.length;i++){
  const current=points[i],previous=points[i-1],gap=days(previous.date,current.date),level=current.portfolio!;
  if(started)started.maxGapDays=Math.max(started.maxGapDays,gap);
  if(level>=peak.portfolio!){
   if(started){
    const count=started.quotes+1;
    events.push({
     peakDate:started.peakDate,peakIndex:started.peakIndex,troughDate:started.troughDate,troughIndex:started.troughIndex,
     recoveryDate:current.date,observedUntil:current.date,depthPct:(started.troughLevel/started.peakLevel-1)*100,
     peakToTroughDays:days(started.peakDate,started.troughDate),underwaterDays:days(started.peakDate,current.date),
     maxGapDays:started.maxGapDays,quoteCount:count,status:"recovered",sparse:started.maxGapDays>45
    });
    started=null;
   }
   peak=current;peakIndex=i;
   continue;
  }
  if(!started){
   started={peakDate:peak.date,peakIndex,peakLevel:peak.portfolio!,troughDate:current.date,troughIndex:i,troughLevel:level,maxGapDays:gap,quotes:2};
  }else{
   started.quotes++;
   if(level<started.troughLevel){started.troughLevel=level;started.troughDate=current.date;started.troughIndex=i}
  }
 }
 if(started){
  const last=points.at(-1)!;
  events.push({
   peakDate:started.peakDate,peakIndex:started.peakIndex,troughDate:started.troughDate,troughIndex:started.troughIndex,
   recoveryDate:null,observedUntil:last.date,depthPct:(started.troughLevel/started.peakLevel-1)*100,
   peakToTroughDays:days(started.peakDate,started.troughDate),underwaterDays:days(started.peakDate,last.date),
   maxGapDays:started.maxGapDays,quoteCount:started.quotes,status:"open",sparse:started.maxGapDays>45
  });
 }
 const worst=events.reduce<DrawdownEpisode|null>((record,event)=>record===null||event.depthPct<record.depthPct?event:record,null);
 const active=events.at(-1)?.status==="open"?events.at(-1)!:null;
 return{trusted:true,isIndex:true,asOfDate:points.at(-1)!.date,points:points.length,episodes:events,worst,active,reason:events.length?null:"На подтверждённом отрезке просадок не наблюдалось."};
}
export function drawdownsCsv(result:DrawdownAnalysis):string|null{
 if(!result.trusted||!result.isIndex||!result.episodes.length)return null;
 const lines=[
  ["QVANIX · наблюдаемые просадки"],["Дата окончания ряда",result.asOfDate??""],
  ["Пик","Дно","Восстановление","Наблюдалось до","Глубина, %","Дней до дна","Дней ниже пика","Наблюдений","Максимальный пробел, дней","Данные с разрывами"]
 ];
 for(const ep of result.episodes){
  if(![ep.depthPct,ep.peakToTroughDays,ep.underwaterDays,ep.quoteCount,ep.maxGapDays].every(Number.isFinite))return null;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(ep.peakDate)||!/^\d{4}-\d{2}-\d{2}$/.test(ep.troughDate)||!/^\d{4}-\d{2}-\d{2}$/.test(ep.observedUntil))return null;
  lines.push([ep.peakDate,ep.troughDate,ep.recoveryDate??"",ep.observedUntil,String(Number(ep.depthPct.toFixed(10))),String(ep.peakToTroughDays),String(ep.underwaterDays),String(ep.quoteCount),String(ep.maxGapDays),ep.sparse?"Да":"Нет"]);
 }
 const cell=(value:string)=>{const formula=/^\s*[=+@-]/.test(value)&&!/^[+-](?:\d+(?:\.\d*)?|\.\d+)$/.test(value);return '"'+(formula?"'":"")+value.replace(/"/g,'""')+'"'};
 return"\uFEFF"+lines.map(row=>row.map(cell).join(";")).join("\r\n")+"\r\n";
}
