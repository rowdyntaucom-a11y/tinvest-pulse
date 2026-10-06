import{useCallback,useEffect,useRef,useState}from"react";
import{CoreWorkspace}from"./CoreWorkspace";
import{buildV3HomeViewModel}from"../home/homeViewModel";
import{loadV3Portfolio}from"../data/loadV3Portfolio";
import{isV3VerifiedLive,toV3LoadState,type V3LoadState}from"../data/loadState";
import{shouldApplyRefresh,V3_REFRESH_INTERVAL_MS,V3_FOCUS_REFRESH_MIN_AGE_MS}from"../data/refreshPolicy";
import{loadPortfolioHistory,type PortfolioSnapshot}from"../../../v2/src/lib/portfolioApi";
import{loadPayoutCalendar}from"../../../v2/src/lib/payoutsApi";
import{loadMarketScreener}from"../analysis/marketScreenerApi";

const CACHE_KEY="qvanix-core-trusted-snapshot-v2";
const CACHE_MAX_AGE_MS=24*60*60_000;
const RETRY_DELAYS=[2000,5000,10000,20000,30000,60000] as const;
// Previous cold-start profile: 3000 / 7000 / 15000 / 30000 / 60000 ms; v67 begins recovery sooner.

const readCache=():PortfolioSnapshot|null=>{
 try{
  const raw=localStorage.getItem(CACHE_KEY);
  if(!raw)return null;
  const x=JSON.parse(raw) as {savedAt:number;snapshot:PortfolioSnapshot};
  return Date.now()-x.savedAt<=CACHE_MAX_AGE_MS?x.snapshot:null;
 }catch{return null}
};
const writeCache=(snapshot:PortfolioSnapshot)=>{
 try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),snapshot}))}catch{}
};
const EMPTY={
 accountName:"QVANIX",value:0,profit:0,profitPct:0,passiveIncome:0,
 averageMonthlyPassiveIncome:0,averageAnnualPassiveIncome:0,positions:0,positionItems:[],
 xirr:null,cagr:null,riskFreeRate:null,riskFreeRateDate:null,nextRateMeeting:null,
 startDate:null,updatedAt:null,history:[],source:"fallback"
} satisfies PortfolioSnapshot;

function friendlyLoadError(error:unknown){
 const message=error instanceof Error?error.message:"Ошибка загрузки данных";
 if(/\b(502|503|504)\b|upstream unavailable|fetch failed|timeout|temporarily unavailable|portfolio unavailable/i.test(message)){
  return"Брокерский источник пока не ответил. QVANIX продолжает автоматическое восстановление; неподтверждённые значения не показываются.";
 }
 return"Не удалось подтвердить брокерские данные. QVANIX повторит загрузку автоматически.";
}

export function CoreRoot(){
 const cached=useRef<PortfolioSnapshot|null>(readCache());
 const[snapshot,setSnapshot]=useState<PortfolioSnapshot>(cached.current??EMPTY);
 const[trusted,setTrusted]=useState(Boolean(cached.current));
 const[state,setState]=useState<V3LoadState>(cached.current?"stale":"loading");
 const[reason,setReason]=useState<string|null>(cached.current?"Показан последний подтверждённый снимок с этого устройства. Проверяем свежие брокерские данные…":null);
 const[refreshing,setRefreshing]=useState(false);
 const running=useRef(false),req=useRef(0),active=useRef(true),lastAttempt=useRef(0),retryTimer=useRef<number|null>(null),retryStep=useRef(0);
 const refreshRef=useRef<()=>Promise<void>>(async()=>{});

 const cancelRetry=useCallback(()=>{
  if(retryTimer.current!=null){window.clearTimeout(retryTimer.current);retryTimer.current=null}
 },[]);

 const scheduleRetry=useCallback(()=>{
  if(!active.current||retryTimer.current!=null)return;
  const delay=RETRY_DELAYS[Math.min(retryStep.current,RETRY_DELAYS.length-1)];
  retryTimer.current=window.setTimeout(()=>{retryTimer.current=null;retryStep.current++;void refreshRef.current()},delay);
 },[]);

 const refresh=useCallback(async()=>{
  if(running.current)return;
  cancelRetry();
  running.current=true;
  setRefreshing(true);
  lastAttempt.current=Date.now();
  const id=++req.current;
  if(!trusted){setState("loading");setReason("Подключаем брокерские данные. Если полный dashboard отвечает медленно, QVANIX автоматически переключится на независимый read-only портфель.")}
  try{
   const result=await loadV3Portfolio();
   if(!shouldApplyRefresh(id,req.current,active.current))return;
   const next=toV3LoadState(result.trust),ok=isV3VerifiedLive(result.trust);
   setState(next);
   if(ok){
    let nextSnapshot=result.snapshot;
    if(nextSnapshot.history.length<2){const recovered=await loadPortfolioHistory();if(recovered.length>=2)nextSnapshot={...nextSnapshot,history:recovered}}
    setSnapshot(nextSnapshot);
    cached.current=nextSnapshot;
    writeCache(nextSnapshot);
    setTrusted(true);
    if(nextSnapshot.source==="portfolio"){
     const recovery=nextSnapshot.recoveryContext;
     const recoveredParts=[recovery?.account?"счёт":null,recovery?.operations&&recovery?.passiveIncomeComplete?"выплаты":null].filter(Boolean);
     const suffix=recoveredParts.length?" Дополнительно подтверждены: "+recoveredParts.join(" и ")+".":"";
     const incomeNote=recovery?.passiveIncomeComplete?"":" Выплаты пока не подтверждены и не выдаются за ноль.";
     setReason("Основной dashboard временно недоступен или отвечает медленно. Уже загружены подтверждённые стоимость и позиции из независимого read-only брокерского маршрута."+suffix+incomeNote+" История, XIRR/CAGR и рыночный контекст догружаются отдельно.");
     retryStep.current=Math.max(retryStep.current,3);
     scheduleRetry();
    }else{
     setReason(null);
     retryStep.current=0;
     cancelRetry();
    }
   }else{
    if(cached.current){
     setSnapshot(cached.current);setTrusted(true);setState("stale");setReason("Свежий источник временно недоступен. Показан последний подтверждённый снимок с этого устройства; повторяем загрузку автоматически.")
    }else{
     setTrusted(false);setReason(result.trust.shortReason??"Источник не прошёл проверку доверия.")
    }
    scheduleRetry();
   }
  }catch(error){
   if(!active.current)return;
   if(cached.current){
    setSnapshot(cached.current);setTrusted(true);setState("stale");setReason("Свежий источник временно недоступен. Показан последний подтверждённый снимок с этого устройства; повторяем загрузку автоматически.")
   }else{
    setTrusted(false);setState("error");setReason(friendlyLoadError(error))
   }
   scheduleRetry();
  }finally{
   if(id===req.current){running.current=false;if(active.current)setRefreshing(false)}
  }
 },[cancelRetry,scheduleRetry,trusted]);
 refreshRef.current=refresh;

 useEffect(()=>{
  active.current=true;
  void refresh();
  const timer=window.setInterval(()=>void refreshRef.current(),V3_REFRESH_INTERVAL_MS);
  const focus=()=>{if(document.visibilityState==="hidden")return;if(!cached.current||Date.now()-lastAttempt.current>=V3_FOCUS_REFRESH_MIN_AGE_MS)void refreshRef.current()};
  const online=()=>void refreshRef.current();
  window.addEventListener("focus",focus);window.addEventListener("online",online);document.addEventListener("visibilitychange",focus);
  return()=>{active.current=false;req.current++;cancelRetry();window.clearInterval(timer);window.removeEventListener("focus",focus);window.removeEventListener("online",online);document.removeEventListener("visibilitychange",focus)};
 },[cancelRetry]);

 useEffect(()=>{
  if(!trusted)return;
  const timer=window.setTimeout(()=>{void Promise.allSettled([loadMarketScreener(),loadPayoutCalendar({timeoutMs:8000})])},450);
  return()=>window.clearTimeout(timer);
 },[trusted,snapshot.updatedAt]);

 useEffect(()=>{
  if(!trusted)return;
  const timer=window.setTimeout(()=>{void Promise.allSettled([import("../assets/V3AssetsDepth"),import("../analysis/V3MarketIntelligenceWorkspace"),import("../analysis/V3AnalysisToolbox"),import("./CoreAnalyticsDepth"),import("../income/V3IncomeDepth")])},1400);
  return()=>window.clearTimeout(timer);
 },[trusted]);

 const home=buildV3HomeViewModel(snapshot,trusted);
 const incomeTrusted=trusted&&(snapshot.source==="dashboard"||snapshot.recoveryContext?.passiveIncomeComplete===true);
 return <CoreWorkspace
  home={home}
  positions={trusted?snapshot.positionItems:[]}
  history={trusted?snapshot.history:[]}
  marketContext={{riskFreeRate:trusted?snapshot.riskFreeRate:null,riskFreeRateDate:trusted?snapshot.riskFreeRateDate:null,nextRateMeeting:trusted?snapshot.nextRateMeeting:null}}
  income={{total:incomeTrusted?snapshot.passiveIncome:null,monthly:incomeTrusted?snapshot.averageMonthlyPassiveIncome:null,annual:incomeTrusted?snapshot.averageAnnualPassiveIncome:null,portfolioValue:trusted?snapshot.value:null,trusted:incomeTrusted}}
  connection={{state,reason,refresh,refreshing,source:trusted?snapshot.source:null}}
 />;
}
