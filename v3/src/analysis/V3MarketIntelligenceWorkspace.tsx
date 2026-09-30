import{useEffect,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{loadMarketScreener,type MarketScreenerPayload}from"./marketScreenerApi";
import{buildMarketPulse}from"./marketIntelligenceModel";
import{V3MarketScreener}from"./V3MarketScreener";
import{V3FallenAssetsDiscovery}from"./V3FallenAssetsDiscovery";
import"../styles/marketIntelligenceWorkspace.css";

const compact=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const MARKET_RETRY_DELAYS=[2500,6000] as const;
type Mode="pulse"|"screener"|"discovery";

export function V3MarketIntelligenceWorkspace({positions}:{positions:PositionSnapshot[]}){
 const[mode,setMode]=useState<Mode>("pulse"),[data,setData]=useState<MarketScreenerPayload|null>(null),[loading,setLoading]=useState(true),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  let retryTimer:number|null=null;
  setLoading(true);
  void loadMarketScreener(controller.signal).then(next=>{
   if(controller.signal.aborted)return;
   setData(next);
   if(!next.available&&attempt<MARKET_RETRY_DELAYS.length){
    retryTimer=window.setTimeout(()=>setAttempt(value=>value+1),MARKET_RETRY_DELAYS[attempt]);
   }
  }).catch(error=>{
   if(controller.signal.aborted)return;
   setData({available:false,fetchedAt:null,source:null,board:null,rows:[],reason:"Не удалось получить данные рынка"});
   if(attempt<MARKET_RETRY_DELAYS.length){
    retryTimer=window.setTimeout(()=>setAttempt(value=>value+1),MARKET_RETRY_DELAYS[attempt]);
   }
  }).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>{controller.abort();if(retryTimer!=null)window.clearTimeout(retryTimer)};
 },[attempt]);
 const manualRetry=()=>setAttempt(value=>Math.max(value+1,MARKET_RETRY_DELAYS.length+1));
 const pulse=useMemo(()=>buildMarketPulse(data?.rows??[],positions),[data,positions]);
 const portfolioRows=useMemo(()=>(data?.rows??[]).filter(row=>pulse.portfolioTickers.has(row.secid.toUpperCase())).sort((a,b)=>b.turnoverRub-a.turnoverRub),[data,pulse.portfolioTickers]);
 return <section className="v3-market-intelligence" aria-label="Рыночная аналитика">
  <header><div><span>РЫНОЧНАЯ АНАЛИТИКА // РАБОЧАЯ ОБЛАСТЬ</span><h3>Рынок и портфель</h3><p>Публичный TQBR-срез, техническая история текущих позиций и пересечение с портфелем — в одном режиме только чтения.</p></div><strong>MOEX</strong></header>
  <nav>{([["pulse","Пульс","рынок · портфель"],["screener","Скринер","фильтры · ликвидность"],["discovery","История","просадки · SMA"]]as const).map(([id,label,note])=><button type="button" key={id} className={mode===id?"is-active":""} onClick={()=>setMode(id)}><strong>{label}</strong><small>{note}</small></button>)}</nav>
  {mode==="pulse"&&<div className="v3-market-pulse">
   {loading?<div className="v3-market-pulse__gate is-loading"><span>ПОДТВЕРЖДАЕМ РЫНОЧНЫЙ СРЕЗ</span><strong>Получаем публичные строки MOEX TQBR{attempt?" повторно":""}</strong><div><article><b>TQBR</b><small>источник рынка</small></article><article><b>{positions.length}</b><small>позиций для сопоставления</small></article></div><small>До ответа источника QVANIX не показывает рыночные движения как подтверждённые.</small></div>:!data?.available?<div className="v3-market-pulse__gate"><strong>Рыночный срез сейчас не подтверждён источником.</strong><small>{data?.reason??"Источник не подтвердил рыночные строки"}{attempt<MARKET_RETRY_DELAYS.length?" — пробуем ещё раз автоматически.":"."}</small><button type="button" onClick={manualRetry}>Повторить сейчас</button></div>:<>
    <div className="v3-market-pulse__metrics">
     <article><span>Рост / падение</span><strong>{pulse.gainers} / {pulse.losers}</strong><small>{pulse.advancersShare==null?"—":pct.format(pulse.advancersShare*100)+"%"} наблюдаемых бумаг растут</small></article>
     <article><span>Оборот среза</span><strong>{compact.format(pulse.turnover)} ₽</strong><small>{pulse.total} бумаг TQBR</small></article>
     <article><span>Макс. оборот</span><strong>{pulse.topTurnover?.secid??"—"}</strong><small>{pulse.topTurnover?compact.format(pulse.topTurnover.turnoverRub)+" ₽":"—"}</small></article>
     <article><span>Макс. |движение|</span><strong>{pulse.largestMove?.secid??"—"}</strong><small>{pulse.largestMove?.dayChangePct==null?"—":pulse.largestMove.dayChangePct.toFixed(2)+"%"}</small></article>
    </div>
    <section className="v3-market-portfolio"><header><div><span>ПОРТФЕЛЬ × РЫНОК</span><strong>Мои бумаги в текущем срезе</strong></div><small>{pulse.portfolioMatches} совпадений</small></header>
     {portfolioRows.length?<div>{portfolioRows.map(row=><article key={row.secid}><div><strong>{row.secid}</strong><small>{row.name}</small></div><b className={(row.dayChangePct??0)>0?"is-positive":(row.dayChangePct??0)<0?"is-negative":""}>{row.dayChangePct==null?"—":(row.dayChangePct>0?"+":"")+row.dayChangePct.toFixed(2)+"%"}</b><span>{compact.format(row.turnoverRub)} ₽ оборот</span></article>)}</div>:<p>Текущие тикеры портфеля не совпали с подтверждёнными строками TQBR. QVANIX не подменяет идентичность похожими названиями.</p>}
    </section>
    <footer>Пульс описывает только текущий публичный срез. Доля растущих бумаг не является прогнозом направления рынка, а совпадение с портфелем выполняется по точному тикеру.</footer>
   </>}
  </div>}
  {mode==="screener"&&<V3MarketScreener sharedData={data} sharedLoading={loading} onRetry={manualRetry}/>}
  {mode==="discovery"&&<V3FallenAssetsDiscovery/>}
 </section>;
}