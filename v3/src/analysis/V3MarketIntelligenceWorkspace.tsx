import{lazy,Suspense,useEffect,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{loadMarketScreener,type MarketScreenerPayload}from"./marketScreenerApi";
import{buildMarketPulse}from"./marketIntelligenceModel";
import"../styles/marketIntelligenceWorkspace.css";

const V3MarketScreener=lazy(()=>import("./V3MarketScreener").then(m=>({default:m.V3MarketScreener})));
const V3FallenAssetsDiscovery=lazy(()=>import("./V3FallenAssetsDiscovery").then(m=>({default:m.V3FallenAssetsDiscovery})));
const compact=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const MARKET_RETRY_DELAYS=[2500,6000] as const;
const MODE_KEY="qvanix-market-workspace-v98";
type Mode="pulse"|"screener"|"discovery";
const MODES:Array<[Mode,string,string]>= [["pulse","Пульс","рынок · портфель"],["screener","Скринер","фильтры · ликвидность"],["discovery","История","просадки · SMA"]];
function readMode():Mode{try{const value=sessionStorage.getItem(MODE_KEY);return value==="screener"||value==="discovery"?value:"pulse"}catch{return"pulse"}}
function writeMode(mode:Mode){try{sessionStorage.setItem(MODE_KEY,mode)}catch{}}
function MarketStageLoading({label}:{label:string}){return <div className="v3-market-stage-loading"><i aria-hidden="true"/><strong>{label}</strong><small>Тяжёлый инструмент загружается только при открытии раздела.</small></div>}

export function V3MarketIntelligenceWorkspace({positions}:{positions:PositionSnapshot[]}){
 const initialMode=readMode();
 const[mode,setMode]=useState<Mode>(initialMode),[visited,setVisited]=useState<Set<Mode>>(()=>new Set<Mode>(["pulse",initialMode])),[data,setData]=useState<MarketScreenerPayload|null>(null),[loading,setLoading]=useState(true),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  let retryTimer:number|null=null;
  setLoading(true);
  void loadMarketScreener(controller.signal).then(next=>{
   if(controller.signal.aborted)return;
   setData(next);
   if(!next.available&&attempt<MARKET_RETRY_DELAYS.length)retryTimer=window.setTimeout(()=>setAttempt(value=>value+1),MARKET_RETRY_DELAYS[attempt]);
  }).catch(()=>{
   if(controller.signal.aborted)return;
   setData({available:false,fetchedAt:null,source:null,board:null,rows:[],reason:"Не удалось получить данные рынка"});
   if(attempt<MARKET_RETRY_DELAYS.length)retryTimer=window.setTimeout(()=>setAttempt(value=>value+1),MARKET_RETRY_DELAYS[attempt]);
  }).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>{controller.abort();if(retryTimer!=null)window.clearTimeout(retryTimer)};
 },[attempt]);
 const selectMode=(next:Mode)=>{setMode(next);writeMode(next);setVisited(prev=>{if(prev.has(next))return prev;const copy=new Set(prev);copy.add(next);return copy});window.requestAnimationFrame(()=>document.querySelector<HTMLElement>(".v3-market-intelligence__stage")?.scrollIntoView({block:"nearest",behavior:"auto"}))};
 const manualRetry=()=>setAttempt(value=>Math.max(value+1,MARKET_RETRY_DELAYS.length+1));
 const pulse=useMemo(()=>buildMarketPulse(data?.rows??[],positions),[data,positions]);
 const portfolioRows=useMemo(()=>(data?.rows??[]).filter(row=>pulse.portfolioTickers.has(row.secid.toUpperCase())).sort((a,b)=>b.turnoverRub-a.turnoverRub),[data,pulse.portfolioTickers]);
 return <section className="v3-market-intelligence" aria-label="Рыночная аналитика" data-market-mode={mode}>
  <header><div><span>РЫНОЧНАЯ АНАЛИТИКА // РАБОЧАЯ ОБЛАСТЬ</span><h3>Рынок и портфель</h3><p>Публичный TQBR-срез, техническая история текущих позиций и пересечение с портфелем — в одном режиме только чтения.</p></div><strong>MOEX</strong></header>
  <nav className="v3-market-intelligence__nav" aria-label="Раздел рыночной аналитики">{MODES.map(([id,label,note])=><button type="button" key={id} className={mode===id?"is-active":""} aria-pressed={mode===id} onClick={()=>selectMode(id)}><strong>{label}</strong><small>{note}</small></button>)}</nav>
  <div className="v3-market-intelligence__stage">
   <section className="v3-market-mode" hidden={mode!=="pulse"} aria-hidden={mode!=="pulse"}>
    <div className="v3-market-pulse">
     {loading?<div className="v3-market-pulse__gate is-loading"><span>ПОДТВЕРЖДАЕМ РЫНОЧНЫЙ СРЕЗ</span><strong>Получаем публичные строки MOEX TQBR{attempt?" повторно":""}</strong><div><article><b>TQBR</b><small>источник рынка</small></article><article><b>{positions.length}</b><small>позиций для сопоставления</small></article></div><small>До ответа источника QVANIX не показывает рыночные движения как подтверждённые.</small></div>:!data?.available?<div className="v3-market-pulse__gate"><strong>Рыночный срез сейчас не подтверждён источником.</strong><small>{data?.reason??"Источник не подтвердил рыночные строки"}{attempt<MARKET_RETRY_DELAYS.length?" — пробуем ещё раз автоматически.":"."}</small><button type="button" onClick={manualRetry}>Повторить сейчас</button></div>:<>
      <div className="v3-market-pulse__metrics"><article><span>Рост / падение</span><strong>{pulse.gainers} / {pulse.losers}</strong><small>{pulse.advancersShare==null?"—":pct.format(pulse.advancersShare*100)+"%"} наблюдаемых бумаг растут</small></article><article><span>Оборот среза</span><strong>{compact.format(pulse.turnover)} ₽</strong><small>{pulse.total} бумаг TQBR</small></article><article><span>Макс. оборот</span><strong>{pulse.topTurnover?.secid??"—"}</strong><small>{pulse.topTurnover?compact.format(pulse.topTurnover.turnoverRub)+" ₽":"—"}</small></article><article><span>Макс. |движение|</span><strong>{pulse.largestMove?.secid??"—"}</strong><small>{pulse.largestMove?.dayChangePct==null?"—":pulse.largestMove.dayChangePct.toFixed(2)+"%"}</small></article><article><span>Покрытие портфеля TQBR</span><strong>{pulse.portfolioCapitalCoverage==null?"—":pct.format(pulse.portfolioCapitalCoverage*100)+"%"}</strong><small>{pulse.portfolioMatches} точных совпадений</small></article></div>
      <section className="v3-market-portfolio"><header><div><span>ПОРТФЕЛЬ × РЫНОК</span><strong>Мои бумаги в текущем срезе</strong></div><small>{pulse.portfolioMatches} совпадений · {pulse.portfolioCapitalCoverage==null?"—":pct.format(pulse.portfolioCapitalCoverage*100)+"% капитала"}</small></header>{portfolioRows.length?<><div>{portfolioRows.map(row=><article key={row.secid}><div><strong>{row.secid}</strong><small>{row.name}</small></div><b className={(row.dayChangePct??0)>0?"is-positive":(row.dayChangePct??0)<0?"is-negative":""}>{row.dayChangePct==null?"—":(row.dayChangePct>0?"+":"")+row.dayChangePct.toFixed(2)+"%"}</b><span>{compact.format(row.turnoverRub)} ₽ оборот</span></article>)}</div>{pulse.unmatchedPortfolioTickers.length>0&&<p className="v3-market-portfolio__gaps">Вне TQBR-среза: {pulse.unmatchedPortfolioTickers.slice(0,6).join(", ")}{pulse.unmatchedPortfolioTickers.length>6?" и ещё "+(pulse.unmatchedPortfolioTickers.length-6):""}. Это не пропажа позиции: текущий публичный срез охватывает только подтверждённые строки TQBR.</p>}</>:<p>Текущие тикеры портфеля не совпали с подтверждёнными строками TQBR. QVANIX не подменяет идентичность похожими названиями.</p>}</section>
      <footer>Пульс описывает только текущий публичный срез. Доля растущих бумаг не является прогнозом направления рынка, а совпадение с портфелем выполняется по точному тикеру.</footer>
     </>}
    </div>
   </section>
   {visited.has("screener")&&<section className="v3-market-mode" hidden={mode!=="screener"} aria-hidden={mode!=="screener"}><Suspense fallback={<MarketStageLoading label="Открываем рыночный скринер…"/>}><V3MarketScreener sharedData={data} sharedLoading={loading} onRetry={manualRetry} portfolioTickers={pulse.portfolioTickers}/></Suspense></section>}
   {visited.has("discovery")&&<section className="v3-market-mode" hidden={mode!=="discovery"} aria-hidden={mode!=="discovery"}><Suspense fallback={<MarketStageLoading label="Открываем исторический поиск…"/>}><V3FallenAssetsDiscovery/></Suspense></section>}
  </div>
 </section>;
}
