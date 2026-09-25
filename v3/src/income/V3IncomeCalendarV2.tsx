import{useMemo,useState}from"react";
import type{PayoutEvent}from"../../../v2/src/lib/payoutsApi";
import{buildIncomeForwardWindow,daysUntilPayout,type IncomeForwardMonths}from"./incomeForwardWindow";
import"../styles/incomeCalendarV2.css";

const rub2=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",timeZone:"UTC"});

function money(value:number|null|undefined){
 return typeof value==="number"&&Number.isFinite(value)?rub2.format(value)+" ₽":"—";
}
function kind(event:PayoutEvent){
 const value=String(event.kind||"").toUpperCase();
 return value==="COUPON"?"Купон":value==="DIVIDEND"?"Дивиденд":"Выплата";
}

export function V3IncomeForwardPanel({events,loadedAt}:{events:PayoutEvent[];loadedAt:number}){
 const[months,setMonths]=useState<IncomeForwardMonths>(12);
 const forward=useMemo(()=>buildIncomeForwardWindow(events,loadedAt,months),[events,loadedAt,months]);
 return <section id="sam-income-upcoming" className="v3-income-nearest">
  <header><div><span>БЛИЖАЙШИЕ ВЫПЛАТЫ</span><strong>Портфель · подтверждённое расписание</strong></div><strong>{forward.count} событий</strong></header>
  <div className="v3-income-forward-window" role="group" aria-label="Горизонт будущих выплат">
   {([3,6,12] as IncomeForwardMonths[]).map(value=><button type="button" key={value} className={months===value?"is-active":""} aria-pressed={months===value} onClick={()=>setMonths(value)}>{value}М</button>)}
  </div>
  <div className="v3-income-calendar-summary">
   <article><span>{months}М · начислено</span><strong>{money(forward.gross)}</strong><small>{forward.count} событий · до налога</small></article>
   <article><span>Среднее / месяц</span><strong>{money(forward.monthlyAverageGross)}</strong><small>сумма выбранного окна ÷ {months}</small></article>
   <article><span>Типы выплат</span><strong>{forward.coupons} / {forward.dividends}</strong><small>купоны / дивиденды</small></article>
   <article><span>Покрытие сумм</span><strong>{forward.amountCoverageRatio==null?"—":pct.format(forward.amountCoverageRatio*100)+"%"}</strong><small>событий с подтверждённой gross-суммой</small></article>
  </div>
  <div className="v3-income-nearest-list">
   {forward.nearest.length?forward.nearest.map((event,index)=>{
    const days=daysUntilPayout(event.date,loadedAt);
    const per=typeof event.perSecurity==="number"&&Number.isFinite(event.perSecurity)?event.perSecurity:null;
    const qty=typeof event.quantity==="number"&&Number.isFinite(event.quantity)?event.quantity:null;
    const kindClass=String(event.kind||"").toUpperCase()==="DIVIDEND"?"is-dividend":"is-coupon";
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

export function V3IncomeMarketDiscovery(){
 return <section id="sam-income-market" className="sam-income-market-gate">
  <header><span>05 · MARKET DISCOVERY</span><h3>Рыночный календарь</h3><p>Дивидендные события всего рынка — отдельный инструмент поиска, не часть расчёта дохода текущего портфеля.</p></header>
  <div className="sam-income-market-gate__status"><strong>Источник рынка ещё не подключён</strong><small>QVANIX не смешивает календарь текущего портфеля с рыночным discovery и не создаёт события без отдельного проверяемого рыночного источника.</small></div>
 </section>;
}
