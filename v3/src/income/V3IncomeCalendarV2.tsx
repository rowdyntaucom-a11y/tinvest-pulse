import{useEffect,useMemo,useState}from"react";
import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";
import{buildIncomeForwardWindow,daysUntilPayout,type IncomeForwardMonths}from"./incomeForwardWindow";
import{buildIncomeForwardCadence}from"./incomeForwardCadence";
import"../styles/incomeCalendarV2.css";import"../styles/incomeForwardCadence.css";

const rub2=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",timeZone:"UTC"});
const monthFmt=new Intl.DateTimeFormat("ru-RU",{month:"short",year:"2-digit",timeZone:"UTC"});

function money(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?rub2.format(value)+" ₽":"—"}
function kind(event:PayoutEvent){const value=String(event.kind||"").toUpperCase();return value==="COUPON"?"Купон":value==="DIVIDEND"?"Дивиденд":"Выплата"}
function monthLabel(key:string){const d=new Date(key+"-01T00:00:00Z");return Number.isFinite(d.getTime())?monthFmt.format(d):key}

export function V3IncomeForwardPanel({events,loadedAt}:{events:PayoutEvent[];loadedAt:number}){
 const[months,setMonths]=useState<IncomeForwardMonths>(12),[selectedMonth,setSelectedMonth]=useState<string|null>(null);
 const forward=useMemo(()=>buildIncomeForwardWindow(events,loadedAt,months),[events,loadedAt,months]);
 const cadence=useMemo(()=>buildIncomeForwardCadence(events,loadedAt,months),[events,loadedAt,months]);
 const maxGross=Math.max(1,...cadence.months.map(row=>row.gross)),selected=cadence.months.find(row=>row.key===selectedMonth)??null;
 useEffect(()=>{if(selectedMonth&&!cadence.months.some(row=>row.key===selectedMonth))setSelectedMonth(null)},[cadence.months,selectedMonth]);
 const visibleEvents=selected?selected.events:forward.nearest;
 return <section id="sam-income-upcoming" className="v3-income-nearest">
  <header><div><span>БЛИЖАЙШИЕ ВЫПЛАТЫ</span><strong>Портфель · подтверждённое расписание</strong></div><strong>{forward.count} событий</strong></header>
  <div className="v3-income-forward-window" role="group" aria-label="Горизонт будущих выплат">
   {([3,6,12] as IncomeForwardMonths[]).map(value=><button type="button" key={value} className={months===value?"is-active":""} aria-pressed={months===value} onClick={()=>{setMonths(value);setSelectedMonth(null)}}>{value}М</button>)}
  </div>
  <div className="v3-income-calendar-summary">
   <article><span>{months}М · начислено</span><strong>{money(forward.gross)}</strong><small>{forward.count} событий · до налога</small></article>
   <article><span>Среднее / месяц</span><strong>{money(forward.monthlyAverageGross)}</strong><small>сумма выбранного окна ÷ {months}</small></article>
   <article><span>Типы выплат</span><strong>{forward.coupons} / {forward.dividends}</strong><small>купоны / дивиденды</small></article>
   <article><span>Покрытие сумм</span><strong>{forward.amountCoverageRatio==null?"—":pct.format(forward.amountCoverageRatio*100)+"%"}</strong><small>событий с подтверждённой gross-суммой</small></article>
  </div>
  {cadence.available&&<div className="v3-forward-cadence">
   <div className="v3-forward-cadence-head"><div><span>РИТМ ПОДТВЕРЖДЁННОГО ПОТОКА</span><strong>{cadence.activeMonths}/{cadence.months.length} месяцев с событиями</strong></div><small>{selected?monthLabel(selected.key)+" · выбран месяц":"Нажмите месяц для детализации"}</small></div>
   <div className="v3-forward-cadence-bars" aria-label="Распределение подтверждённых выплат по месяцам">{cadence.months.map(row=><button type="button" key={row.key} className={(selectedMonth===row.key?"is-active ":"")+(row.count===0?"is-empty":"")} aria-pressed={selectedMonth===row.key} onClick={()=>setSelectedMonth(selectedMonth===row.key?null:row.key)} title={monthLabel(row.key)+" · "+money(row.gross)}><i><b style={{height:(row.gross>0?Math.max(8,row.gross/maxGross*100):0)+"%"}}/></i><span>{monthLabel(row.key).split(" ")[0]}</span><strong>{row.count||"—"}</strong></button>)}</div>
   <div className="v3-forward-cadence-kpis">
    <article><span>Пиковый месяц</span><strong>{cadence.peakMonth?monthLabel(cadence.peakMonth.key):"—"}</strong><small>{money(cadence.peakMonth?.gross)}</small></article>
    <article><span>Без событий</span><strong>{cadence.zeroMonths}</strong><small>месяцев в окне</small></article>
    <article><span>Макс. разрыв</span><strong>{cadence.longestGap}</strong><small>месяцев подряд</small></article>
    <article><span>Первые 90 дней</span><strong>{cadence.first90Share==null?"—":pct.format(cadence.first90Share*100)+"%"}</strong><small>{money(cadence.first90Gross)}</small></article>
    <article><span>Эфф. месяцев</span><strong>{cadence.effectiveMonths==null?"—":cadence.effectiveMonths.toFixed(1)}</strong><small>по долям gross</small></article>
    <article><span>HHI по месяцам</span><strong>{cadence.monthlyHhi==null?"—":Math.round(cadence.monthlyHhi)}</strong><small>описательная концентрация</small></article>
   </div>
   <div className="v3-forward-cadence-split"><div><span>Купоны</span><i><b style={{width:(cadence.couponShare??0)*100+"%"}}/></i><strong>{cadence.couponShare==null?"—":pct.format(cadence.couponShare*100)+"%"}</strong></div><div><span>Дивиденды</span><i><b style={{width:(cadence.dividendShare??0)*100+"%"}}/></i><strong>{cadence.dividendShare==null?"—":pct.format(cadence.dividendShare*100)+"%"}</strong></div></div>
   {selected&&<div className="v3-forward-month-detail"><header><div><span>{monthLabel(selected.key)}</span><strong>{money(selected.gross)}</strong></div><small>{selected.count} событий · {selected.coupons} куп. / {selected.dividends} див.</small></header><div><article><span>Купоны gross</span><strong>{money(selected.couponGross)}</strong></article><article><span>Дивиденды gross</span><strong>{money(selected.dividendGross)}</strong></article><article><span>Сумма известна</span><strong>{selected.count?pct.format(selected.amountKnown/selected.count*100)+"%":"—"}</strong></article></div></div>}
   <small className="v3-income-method">Ритм описывает только подтверждённые HIGH-события в выбранном окне. HHI и эффективное число месяцев показывают распределение gross по времени и не являются оценкой качества или прогнозом.</small>
  </div>}
  <div className="v3-income-nearest-caption"><span>{selected?"СОБЫТИЯ В МЕСЯЦЕ":"БЛИЖАЙШИЕ СОБЫТИЯ"}</span><strong>{selected?selected.count:forward.nearest.length}</strong></div>
  <div className="v3-income-nearest-list">
   {visibleEvents.length?visibleEvents.slice(0,12).map((event,index)=>{
    const days=daysUntilPayout(event.date,loadedAt),per=typeof event.perSecurity==="number"&&Number.isFinite(event.perSecurity)?event.perSecurity:null,qty=typeof event.quantity==="number"&&Number.isFinite(event.quantity)?event.quantity:null,kindClass=String(event.kind||"").toUpperCase()==="DIVIDEND"?"is-dividend":"is-coupon";
    return <article className={"v3-income-nearest-row "+kindClass} key={(event.scheduleId||event.figi||event.ticker)+"-"+event.date+"-"+index}>
     <div><time>{dateFmt.format(new Date(event.date))}</time><span>{days==null?"":days===0?"сегодня":"через "+days+" дн."}</span></div>
     <div><strong>{event.ticker||event.name}</strong><span>{kind(event)} · {event.confidence||"статус уточняется"}</span><small>{event.lastBuyDate?"последняя покупка "+dateFmt.format(new Date(event.lastBuyDate)):event.recordDate?"реестр "+dateFmt.format(new Date(event.recordDate)):"дата отсечки уточняется"}</small></div>
     <div><strong>{money(event.gross)}</strong><small>{per==null?"на бумагу —":money(per)+" / бумагу"}{qty==null?"":" · "+qty.toLocaleString("ru-RU",{maximumFractionDigits:4})+" шт."}</small></div>
    </article>
   }):<div className="v3-income-depth-state">В выбранном горизонте подтверждённых будущих выплат нет.</div>}
  </div>
  <small className="v3-income-method">Это календарь только текущих позиций портфеля. Суммы будущих событий показываются до налога и не смешиваются с уже полученным фактом.</small>
 </section>;
}
