import{useEffect,useMemo,useRef,useState}from"react";import{loadPayoutCalendar,type PayoutCalendar,type PayoutEvent}from"../../../v2/src/lib/payoutsApi";import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";import{findPayoutEventPosition,payoutEventIsConfirmed}from"../../../v2/src/features/income/incomeCalendarEventView";import"./corePayoutCalendar.css";
const money=(v:number|null|undefined)=>typeof v==="number"&&Number.isFinite(v)?new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(v)+" ₽":"—";
const monthFmt=new Intl.DateTimeFormat("ru-RU",{month:"short",year:"numeric",timeZone:"UTC"}),dayFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",timeZone:"UTC"});
const monthLabel=(k:string)=>monthFmt.format(new Date(k+"-01T00:00:00Z"));const kind=(e:PayoutEvent)=>String(e.kind).toUpperCase()==="COUPON"?"Купон":"Дивиденд";
const RETRY_DELAYS=[2500,6000,12000] as const;
export function CorePayoutCalendar({compact=false,onOpenCalendar,positions=[],onOpenAsset}:{compact?:boolean;onOpenCalendar?:()=>void;positions?:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void}={}){
 const[data,setData]=useState<PayoutCalendar|null>(null),[loading,setLoading]=useState(true),[selected,setSelected]=useState<string|null>(null),[attempt,setAttempt]=useState(0),[timedOut,setTimedOut]=useState(false),retryRef=useRef(0),retryTimer=useRef<number|null>(null);
 useEffect(()=>{
  let on=true;
  if(retryTimer.current!=null){window.clearTimeout(retryTimer.current);retryTimer.current=null}
  setLoading(true);setTimedOut(false);
  const uiTimer=window.setTimeout(()=>{if(on){setTimedOut(true);setLoading(false)}},9000);
  void loadPayoutCalendar({force:attempt>0,timeoutMs:8000}).then(x=>{
   if(!on)return;
   window.clearTimeout(uiTimer);
   if(x.available){
    setData(x);retryRef.current=0;setSelected(current=>current??x.months.find(m=>m.count>0)?.key??null);setLoading(false);setTimedOut(false);return;
   }
   setData(x);setLoading(false);
   if(retryRef.current<RETRY_DELAYS.length){
    const delay=RETRY_DELAYS[retryRef.current++];
    retryTimer.current=window.setTimeout(()=>on&&setAttempt(v=>v+1),delay);
   }
  }).catch(()=>{
   if(!on)return;
   window.clearTimeout(uiTimer);setLoading(false);
   if(retryRef.current<RETRY_DELAYS.length){
    const delay=RETRY_DELAYS[retryRef.current++];
    retryTimer.current=window.setTimeout(()=>on&&setAttempt(v=>v+1),delay);
   }
  });
  return()=>{on=false;window.clearTimeout(uiTimer);if(retryTimer.current!=null){window.clearTimeout(retryTimer.current);retryTimer.current=null}};
 },[attempt]);
 const manualRetry=()=>{retryRef.current=0;setAttempt(x=>x+1)};
 const months=useMemo(()=>data?.months.filter(m=>m.count>0)??[],[data]),active=months.find(m=>m.key===selected)??months[0],events=(active?.items??[]).filter(e=>e.status!=="FACT").sort((a,b)=>a.date.localeCompare(b.date));
 const upcoming=useMemo(()=>months.flatMap(m=>(m.items??[]).filter(e=>e.status!=="FACT")).sort((a,b)=>a.date.localeCompare(b.date)),[months]),nextEvent=upcoming[0]??null,compactMonths=months.slice(0,3);
 const nextPosition=nextEvent?findPayoutEventPosition(nextEvent,positions):null;
 if(loading)return <section className="qpay qpay-state"><div className="qpay-state-head"><b>Календарь выплат</b><span>{attempt?"Повторная проверка":"Проверяем расписание"}</span></div><div className="qpay-skeleton"><i/><i/><i/><i/></div><p>Подтверждаем будущие купоны и дивиденды. Уже полученные выплаты остаются отдельным фактом.</p></section>;
 if(timedOut&&!data)return <section className="qpay qpay-state"><b>Источник отвечает слишком долго</b><p>Core остановил загрузку. Неподтверждённые суммы не показываются.</p><button onClick={manualRetry}>Повторить</button></section>;
 if(!data?.available)return <section className="qpay qpay-state"><div className="qpay-state-head"><b>Календарь пока недоступен</b><span>{retryRef.current<RETRY_DELAYS.length?"Повторяем автоматически":"Нужен ручной повтор"}</span></div><p>Подтверждённое расписание сейчас недоступно. Значения не подменяются оценкой.</p><button className="qpay-retry" onClick={manualRetry}>Повторить сейчас</button></section>;
 if(compact)return <section className="qpay qpay-compact" aria-label="Ближайшие подтверждённые выплаты"><header><button type="button" className="qpay-next-event" disabled={!nextPosition} onClick={()=>{if(nextPosition)onOpenAsset?.(nextPosition)}}><div><span>БЛИЖАЙШАЯ ВЫПЛАТА</span><h2>{nextEvent?(nextEvent.ticker||nextEvent.name):"Нет подтверждённого события"}</h2><small>{nextEvent?dayFmt.format(new Date(nextEvent.date))+" · "+kind(nextEvent)+(payoutEventIsConfirmed(nextEvent)?" · HIGH":""):"Расписание текущих позиций пока пусто"}</small></div><i>{nextPosition?"Открыть актив ›":"FIGI не связан"}</i></button><div><b>{nextEvent?money(nextEvent.gross):"—"}</b><small>gross · до налога</small></div></header><div className="qpay-compact-kpis"><article><span>12М расписание</span><strong>{money(data.forecast.gross)}</strong><small>{data.forecast.count} событий</small></article><article><span>Покрытие</span><strong>{Math.round(data.coverage.coverageRatio*100)}%</strong><small>официального расписания</small></article><article><span>Месяцев</span><strong>{months.length}</strong><small>с выплатами</small></article></div>{compactMonths.length>0&&<div className="qpay-compact-months">{compactMonths.map(m=><article key={m.key}><span>{monthLabel(m.key)}</span><strong>{money(m.gross)}</strong><small>{m.count} выплат</small></article>)}</div>}<footer><span>FUTURE · GROSS</span> — отдельное подтверждённое расписание, а не уже полученный доход и не гарантия выплаты.{data.stale?" Источник помечен как устаревший.":""}</footer>{onOpenCalendar&&<button type="button" className="qpay-compact-open" onClick={onOpenCalendar}>Открыть полный календарь →</button>}</section>;
 return <section className="qpay"><header><div><span>12M CASH FLOW</span><h2>Календарь выплат</h2><small>Будущие купоны и дивиденды · отдельно от фактически полученного дохода</small></div><div><b>{money(data.forecast.gross)}</b><small>{data.forecast.count} событий</small></div></header>
 <div className="qpay-ledger"><article><span>FACT · NET</span><strong>{money(data.actual.totalNet)}</strong><small>уже получено</small></article><i>≠</i><article><span>FUTURE · GROSS</span><strong>{money(data.forecast.gross)}</strong><small>{data.forecast.count} событий</small></article><article><span>Покрытие</span><strong>{Math.round(data.coverage.coverageRatio*100)}%</strong><small>известного расписания</small></article></div><div className="qpay-strip"><span>Ближайшие месяцы</span><b>{months.length} с выплатами</b></div><div className="qpay-months">{months.map(m=><button key={m.key} className={active?.key===m.key?"active":""} onClick={()=>setSelected(m.key)}><span>{monthLabel(m.key)}</span><strong>{money(m.gross)}</strong><small>{m.count} выплат</small></button>)}</div>
 {active&&<><div className="qpay-summary"><div><span>{monthLabel(active.key)}</span><strong>{money(active.gross)}</strong></div><div><span>Событий</span><strong>{active.count}</strong></div><div><span>Покрытие</span><strong>{Math.round(data.coverage.coverageRatio*100)}%</strong></div></div><div className="qpay-events">{events.slice(0,12).map((e,i)=>{const position=findPayoutEventPosition(e,positions),confirmed=payoutEventIsConfirmed(e);return <button type="button" className="qpay-event-row" key={(e.scheduleId||e.figi||e.ticker)+e.date+i} disabled={!position} onClick={()=>{if(position)onOpenAsset?.(position)}}><time>{dayFmt.format(new Date(e.date))}</time><div><b>{e.ticker}</b><span>{e.name}</span><small>{confirmed?"HIGH · подтверждено":"статус уточняется"}</small></div><em>{kind(e)}</em><strong>{money(e.gross)}</strong><i>{position?"›":"FIGI —"}</i></button>})}{events.length===0&&<p>В этом месяце нет подтверждённых будущих выплат.</p>}</div>{events.length>12&&<p className="qpay-more">Ещё {events.length-12} событий скрыты — месячная сводка остаётся компактной.</p>}</>}
 <footer><span>FACT</span> не смешивается с расписанием. Будущие суммы — gross и не являются гарантией выплаты.{data.stale?" Источник помечен как устаревший.":""}</footer></section>
}