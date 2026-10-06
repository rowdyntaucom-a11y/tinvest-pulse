import{useEffect,useMemo,useState}from"react";
import{createPortal}from"react-dom";
import{loadPayoutCalendar,type PayoutCalendar}from"../../../v2/src/lib/payoutsApi";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";

type Props={positions:PositionSnapshot[]};
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const monthFmt=new Intl.DateTimeFormat("ru-RU",{month:"short",timeZone:"UTC"});
const money=(v:number)=>rub.format(v)+" ₽";

export function CoreIncomeVisualIntelligenceV109({positions}:Props){
 const[host,setHost]=useState<HTMLElement|null>(null),[calendar,setCalendar]=useState<PayoutCalendar|null>(null),[loaded,setLoaded]=useState(false);
 useEffect(()=>{
  let current:HTMLElement|null=null,portalHost:HTMLElement|null=null;
  const detach=()=>{if(portalHost?.isConnected)portalHost.remove();portalHost=null;current=null;setHost(null)};
  const attach=()=>{const target=document.querySelector<HTMLElement>(".v3-income-overview");if(target===current)return;detach();if(!target)return;portalHost=document.createElement("div");portalHost.className="core-income-visual-host-v109";target.insertAdjacentElement("afterend",portalHost);current=target;setHost(portalHost)};
  attach();const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});return()=>{observer.disconnect();detach()};
 },[]);
 useEffect(()=>{if(!host||loaded)return;let active=true;void loadPayoutCalendar().then(data=>{if(active){setCalendar(data);setLoaded(true)}}).catch(()=>{if(active){setCalendar(null);setLoaded(true)}});return()=>{active=false}},[host,loaded]);
 const model=useMemo(()=>{
  if(!calendar)return null;
  const complete=new Set(calendar.actual.observation?.completeMonths??[]),history=calendar.months.filter(m=>complete.has(m.key)).slice(-12),future=calendar.months.filter(m=>m.count>0&&m.gross>0).slice(0,12),historyMax=Math.max(0,...history.map(m=>m.net)),futureMax=Math.max(0,...future.map(m=>m.gross));
  const sources=new Map<string,number>();for(const event of calendar.events){if((event.confidence||"").toUpperCase()!=="HIGH")continue;const gross=typeof event.gross==="number"&&Number.isFinite(event.gross)&&event.gross>0?event.gross:0;if(!gross)continue;const key=event.ticker||event.name||"—";sources.set(key,(sources.get(key)||0)+gross)}
  const sourceRows=[...sources.entries()].map(([ticker,value])=>({ticker,value})).sort((a,b)=>b.value-a.value).slice(0,5),sourceTotal=[...sources.values()].reduce((s,v)=>s+v,0),portfolioValue=positions.reduce((s,p)=>s+(Number.isFinite(p.currentValue)?Math.max(0,p.currentValue):0),0),actual=calendar.actual.totalNet,annualShare=portfolioValue>0&&actual>0?actual/portfolioValue*100:null;
  return{history,future,historyMax,futureMax,sourceRows,sourceTotal,annualShare,coverage:calendar.coverage.coverageRatio*100,actual,forecast:calendar.forecast.gross,forecastCount:calendar.forecast.count,safe:calendar.integrity.complete&&!calendar.stale};
 },[calendar,positions]);
 if(!host)return null;
 if(!loaded)return createPortal(<section className="core-income-visual-v109 is-loading" aria-label="Визуальный денежный поток"><span>Собираем визуальный денежный поток…</span></section>,host);
 if(!model)return null;
 return createPortal(<section className="core-income-visual-v109" aria-label="Визуальный денежный поток"><header><span><b>Карта денежного потока</b><small>факт отдельно от подтверждённого расписания</small></span><strong>{model.safe?"verified":"limited"}</strong></header><div className="core-income-visual-v109__summary"><article><span>Получено фактически</span><b>{money(model.actual)}</b><small>{model.annualShare==null?"доля капитала —":pct.format(model.annualShare)+"% от текущего капитала"}</small></article><article><span>12М · расписание</span><b>{model.safe?money(model.forecast):"—"}</b><small>{model.safe?model.forecastCount+" подтверждённых событий":"закрыто до полного покрытия"}</small></article><article><span>Покрытие</span><b>{pct.format(model.coverage)}%</b><small>официального расписания</small></article></div><div className="core-income-visual-v109__grid"><article className="core-income-visual-v109__history"><div><span>Фактический поток</span><b>{model.history.length} мес.</b></div><div className="bars" role="img" aria-label="Фактически полученный net доход по полностью наблюдавшимся месяцам">{model.history.length?model.history.map(m=><i key={m.key} title={`${m.key}: ${money(m.net)}`}><b style={{height:`${model.historyMax?Math.max(3,m.net/model.historyMax*100):3}%`}}/><small>{monthFmt.format(new Date(m.key+"-01T00:00:00Z"))}</small></i>):<span>Нет полностью наблюдавшихся месяцев</span>}</div></article><article className="core-income-visual-v109__future"><div><span>Календарь 12М</span><b>{model.safe?money(model.forecast):"—"}</b></div><div className="months" role="img" aria-label="Подтверждённые gross выплаты по месяцам">{model.safe&&model.future.length?model.future.map(m=><i key={m.key} title={`${m.key}: ${money(m.gross)}`}><b style={{height:`${model.futureMax?Math.max(3,m.gross/model.futureMax*100):3}%`}}/><small>{monthFmt.format(new Date(m.key+"-01T00:00:00Z"))}</small></i>):<span>Расписание недоступно</span>}</div></article><article className="core-income-visual-v109__sources"><div><span>Крупнейшие источники</span><b>HIGH</b></div><ul>{model.safe&&model.sourceRows.length?model.sourceRows.map(row=><li key={row.ticker}><span>{row.ticker}</span><i><b style={{width:`${model.sourceTotal?row.value/model.sourceTotal*100:0}%`}}/></i><strong>{money(row.value)}</strong></li>):<li className="empty">Нет подтверждённой структуры источников</li>}</ul></article></div><p>Фактический net и будущее gross не складываются. Будущие суммы показываются только при полном и неустаревшем расписании. Это не прогноз и не рекомендация.</p></section>,host);
}
