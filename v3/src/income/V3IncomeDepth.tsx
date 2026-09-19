import{useEffect,useMemo,useState}from"react";
import"../styles/incomeDepth.css";
import{loadPayoutCalendar,type PayoutCalendar,type PayoutEvent}from"../../../v2/src/lib/payoutsApi";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{filterIncomeCalendarEvents}from"../../../v2/src/features/income/incomeCalendarVisual";
import{findPayoutEventPosition,payoutEventIsConfirmed}from"../../../v2/src/features/income/incomeCalendarEventView";
import{buildV3IncomeDepth}from"./incomeDepth";
import{V3MetricHelp}from"../help/V3MetricHelp";

type View="calendar"|"history"|"sources";
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const rub2=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});
const monthFmt=new Intl.DateTimeFormat("ru-RU",{month:"short",year:"2-digit",timeZone:"UTC"});

function money(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?rub.format(value)+" ₽":"—"}
function eventKind(event:PayoutEvent){const kind=String(event.kind||"").toUpperCase();return kind==="COUPON"?"Купон":kind==="DIVIDEND"?"Дивиденд":"Выплата"}
function futureAmount(event:PayoutEvent){return typeof event.gross==="number"&&Number.isFinite(event.gross)&&event.gross>0?event.gross:null}
function monthLabel(key:string){const date=new Date(key+"-01T00:00:00Z");return Number.isNaN(date.getTime())?key:monthFmt.format(date)}
function sourceIdentity(state:string){return state==="EXACT_FIGI"?"FIGI":state==="AMBIGUOUS_FIGI"?"FIGI неоднозначен":state==="INCOMPLETE_FIGI"?"FIGI неполный":"FIGI нет"}

export function V3IncomeDepth({positions,onOpenAsset}:{positions:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void}){
  const[calendar,setCalendar]=useState<PayoutCalendar|null>(null),[loading,setLoading]=useState(true),[loadedAt,setLoadedAt]=useState(()=>Date.now()),[view,setView]=useState<View>("calendar"),[selectedMonth,setSelectedMonth]=useState<string|null>(null);
  useEffect(()=>{let active=true;setLoading(true);void loadPayoutCalendar().then(data=>{if(active){setCalendar(data);setLoadedAt(Date.now());setLoading(false)}}).catch(()=>{if(active){setCalendar(null);setLoadedAt(Date.now());setLoading(false)}});return()=>{active=false}},[]);
  const depth=useMemo(()=>calendar?buildV3IncomeDepth(calendar,positions,loadedAt):null,[calendar,positions,loadedAt]);
  const futureEvents=depth?.trustedIncome.futureEvents??[];
  const monthEvents=useMemo(()=>filterIncomeCalendarEvents(futureEvents,selectedMonth),[futureEvents,selectedMonth]);
  useEffect(()=>{if(selectedMonth&&depth&&!depth.calendarMonths.some(month=>month.key===selectedMonth))setSelectedMonth(null)},[selectedMonth,depth]);
  const next=depth?.trustedIncome.taxCalendar.next??null;
  const historyMonths=depth?.realizedHistory.months.slice(-12)??[];
  const historyMax=Math.max(0,...historyMonths.map(month=>month.totalNet));
  const selectedCalendar=selectedMonth?depth?.calendarMonths.find(month=>month.key===selectedMonth)??null:null;

  if(loading)return <section className="v3-income-depth"><div className="v3-income-depth-state">Синхронизируем факт и официальное расписание выплат…</div></section>;
  if(!calendar||!depth)return <section className="v3-income-depth"><div className="v3-income-depth-state is-warning">Подробный слой выплат сейчас недоступен. Уже подтверждённый пассивный доход выше не заменяется нулём.</div></section>;

  const coverage=depth.integrity.coveragePct;
  const scheduleReady=depth.payoutTrust.safeToCalculate;
  const statusClass=depth.integrity.state==="verified"?"is-positive":depth.integrity.state==="stale"||depth.integrity.state==="partial"?"is-warning":"is-neutral";

  return <section className="v3-income-depth">
    <div className="v3-income-depth-head"><div><span>ПОДРОБНЫЙ ДОХОД</span><h2>Факт, календарь и источники</h2></div><div className={"v3-income-depth-status "+statusClass}><strong>{depth.integrity.label}</strong><small>{coverage==null?"покрытие —":pct.format(coverage)+"% покрытия"}</small></div></div>
    <nav className="v3-income-depth-tabs" aria-label="Подробные разделы дохода">{([["calendar","Календарь"],["history","Факт"],["sources","Источники"]] as const).map(([id,label])=><button key={id} type="button" className={view===id?"is-active":""} aria-current={view===id?"page":undefined} onClick={()=>setView(id)}>{label}</button>)}</nav>

    {view==="calendar"&&<div className="v3-income-calendar-depth">
      <div className="v3-income-calendar-summary">
        <article><span>12М · расписание <V3MetricHelp topic="payoutCoverage"/></span><strong>{scheduleReady?money(calendar.forecast.gross):"—"}</strong><small>{scheduleReady?calendar.forecast.count+" событий":"закрыто до полного покрытия"}</small></article>
        <article><span>Следующая выплата</span><strong>{scheduleReady&&next?(next.ticker||next.name):"—"}</strong><small>{scheduleReady&&next?dateFmt.format(new Date(next.date))+" · "+(futureAmount(next)==null?"сумма уточняется":rub2.format(futureAmount(next)!)+" ₽ до налога"):"нет подтверждённого события"}</small></article>
      </div>
      {!scheduleReady&&<div className="v3-income-depth-gate">{depth.payoutTrust.shortReason}. Будущий календарь fail-closed: неполное или устаревшее расписание не выдаётся за подтверждённый прогноз.</div>}
      {scheduleReady&&depth.calendarMonths.length>0&&<div className="v3-income-month-ribbon" aria-label="12-месячный календарь выплат">
        <button type="button" className={selectedMonth==null?"is-active":""} aria-pressed={selectedMonth==null} onClick={()=>setSelectedMonth(null)}><span>Все</span><strong>{futureEvents.length}</strong><small>событий</small></button>
        {depth.calendarMonths.map(month=><button type="button" key={month.key} className={(selectedMonth===month.key?"is-active ":"")+(month.count===0?"is-empty":"")} aria-pressed={selectedMonth===month.key} onClick={()=>setSelectedMonth(month.key)}>
          <span>{month.label}</span><strong>{month.count}</strong><small>{month.grossAvailable?rub.format(month.gross)+" ₽":month.count?"сумма —":"тихо"}</small><i aria-hidden="true"><b style={{width:Math.round(month.intensity*100)+"%"}}/></i>
        </button>)}
      </div>}
      {scheduleReady&&<div className="v3-income-calendar-selection"><span>{selectedCalendar?selectedCalendar.label:"Все месяцы"}</span><strong>{monthEvents.length} событий</strong><small>Только официальное расписание текущих позиций · суммы до налога</small></div>}
      {scheduleReady&&<div className="v3-income-event-list">{monthEvents.length?monthEvents.slice(0,24).map((event,index)=>{
        const position=findPayoutEventPosition(event,positions),confirmed=payoutEventIsConfirmed(event),amount=futureAmount(event);
        return <button type="button" className="v3-income-event-row" key={(event.scheduleId||event.figi||event.ticker)+"-"+event.date+"-"+index} disabled={!position} onClick={()=>{if(position)onOpenAsset?.(position)}}>
          <time>{dateFmt.format(new Date(event.date))}</time><div><strong>{event.ticker||event.name}</strong><small>{eventKind(event)}{confirmed?" · HIGH":" · "+(event.confidence||"статус уточняется")}</small></div><div><strong>{amount==null?"—":rub2.format(amount)+" ₽"}</strong><small>{position?"FIGI → актив":"без точного FIGI"}</small></div>
        </button>
      }):<div className="v3-income-depth-state">{selectedMonth?"В выбранном месяце подтверждённых событий нет.":"Подтверждённые будущие события не найдены."}</div>}</div>}
      <small className="v3-income-method">Будущие выплаты не складываются с уже полученным фактом. Календарь открывается только при полном проверенном покрытии расписания; HIGH означает подтверждение события источником, а переход в актив разрешён только после точного FIGI-сопоставления.</small>
    </div>}

    {view==="history"&&<div className="v3-income-history-depth">
      <div className="v3-income-calendar-summary">
        <article><span>Наблюдение</span><strong>{depth.realizedHistory.observation.available?depth.realizedHistory.observation.completeMonths+" полн.":"—"}</strong><small>{depth.realizedHistory.observation.partialMonths} частичных месяцев</small></article>
        <article><span>Стабильность <V3MetricHelp topic="incomeStability"/></span><strong>{depth.stability.available?(depth.stability.status==="mature"?"Зрелая":"Предв."):"Gate"}</strong><small>{depth.stability.available?money(depth.stability.averageMonthlyNet)+" / мес.":"нужно ≥3 полных месяца"}</small></article>
      </div>
      <div className="v3-income-history-bars" aria-label="Фактический пассивный доход по наблюдаемым месяцам">{historyMonths.length?historyMonths.map(month=>{
        const height=historyMax>0?Math.max(month.totalNet>0?8:2,Math.round(month.totalNet/historyMax*100)):2;
        return <article key={month.key} className={month.partial?"is-partial":month.complete?"is-complete":"is-unobserved"}><div><i style={{height:height+"%"}}/></div><strong>{monthLabel(month.key)}</strong><span>{rub.format(month.totalNet)} ₽</span><small>{month.complete?"полный":month.partial?"частичный":"не подтверждён"}</small></article>
      }):<div className="v3-income-depth-state">Нет подтверждённой помесячной истории выплат.</div>}</div>
      <div className="v3-income-history-stats">
        <article><span>Месяцев с выплатами</span><strong>{depth.stability.payoutMonths}</strong><small>из {depth.stability.observedMonths} полных</small></article>
        <article><span>Нулевых месяцев</span><strong>{depth.stability.zeroIncomeMonths}</strong><small>только полностью наблюдавшиеся</small></article>
        <article><span>Крупнейший месяц</span><strong>{money(depth.stability.largestMonthNet)}</strong><small>{depth.stability.largestMonthShare==null?"—":pct.format(depth.stability.largestMonthShare*100)+"% факта"}</small></article>
        <article><span>Вариативность</span><strong>{depth.stability.coefficientOfVariation==null?"—":pct.format(depth.stability.coefficientOfVariation*100)+"%"}</strong><small>CV полного месячного факта</small></article>
      </div>
      {depth.comparable.available&&<div className="v3-income-comparable"><span>Сопоставимые месяцы</span><strong className={(depth.comparable.changeNet??0)>0?"is-positive":(depth.comparable.changeNet??0)<0?"is-negative":"is-neutral"}>{depth.comparable.changeRatio==null?money(depth.comparable.changeNet):((depth.comparable.changeRatio??0)>=0?"+":"")+pct.format((depth.comparable.changeRatio??0)*100)+"%"}</strong><small>{depth.comparable.monthCount} одинаковых полных месяцев · {depth.comparable.currentYear}/{depth.comparable.previousYear} · без годового пересчёта</small></div>}
      <small className="v3-income-method">Нулём считается только полностью наблюдавшийся календарный месяц. Частичный или отсутствующий месяц не превращается в ноль. Стабильность открывается после 3 полных месяцев; зрелая выборка — после 12.</small>
    </div>}

    {view==="sources"&&<div className="v3-income-sources-depth">
      <div className="v3-income-calendar-summary">
        <article><span>Источников факта <V3MetricHelp topic="incomeConcentration"/></span><strong>{depth.concentration.sourceCount||"—"}</strong><small>{depth.concentration.effectiveSources==null?"эффективное число —":"эфф. "+depth.concentration.effectiveSources.toLocaleString("ru-RU",{maximumFractionDigits:2})}</small></article>
        <article><span>Главный источник</span><strong>{depth.concentration.topSourceShare==null?"—":pct.format(depth.concentration.topSourceShare*100)+"%"}</strong><small>доля реально полученного net</small></article>
      </div>
      <div className="v3-income-source-list">{depth.sourceRows.length?depth.sourceRows.slice(0,12).map(row=>{
        const matches=row.figi?positions.filter(position=>position.figi?.trim().toUpperCase()===row.figi):[],position=row.matchBasis==="FIGI"&&matches.length===1?matches[0]:null;
        return <button type="button" key={row.key} className="v3-income-source-row" disabled={!position} onClick={()=>{if(position)onOpenAsset?.(position)}}>
          <div><strong>{row.ticker}</strong><small>{row.name!==row.ticker?row.name:sourceIdentity(row.identityState)}</small></div>
          <div><span>Факт</span><strong>{row.fact>0?rub2.format(row.fact)+" ₽":"—"}</strong><small>{row.factCount} выплат</small></div>
          <div><span>12М</span><strong>{row.forecast>0?rub2.format(row.forecast)+" ₽":"—"}</strong><small>{row.yoc12m==null?"YoC — · "+sourceIdentity(row.identityState):"YoC "+pct.format(row.yoc12m*100)+"%"}</small></div>
        </button>
      }):<div className="v3-income-depth-state">Нет подтверждённых источников для разбивки.</div>}</div>
      {depth.bondLinkage.eligibleBondCount>0&&<div className="v3-income-bond-link"><div><span>Облигации → расписание</span><strong>{depth.bondLinkage.linkedBondCount}/{depth.bondLinkage.eligibleBondCount}</strong></div><i><b style={{width:Math.round(depth.bondLinkage.valueCoverage*100)+"%"}}/></i><small>{pct.format(depth.bondLinkage.valueCoverage*100)}% стоимости облигаций связано по FIGI · {depth.bondLinkage.couponEvents} купонных событий · {money(depth.bondLinkage.scheduledGross)} до налога</small></div>}
      <div className="v3-income-coverage"><span>Покрытие расписания</span><strong>{coverage==null?"—":pct.format(coverage)+"%"}</strong><small>{depth.integrity.resolvedAssets}/{depth.integrity.eligibleAssets||"—"} активов · ошибок {depth.integrity.errors}</small></div>
      <small className="v3-income-method">Факт строится только из реально полученных положительных выплат после налога. 12М — отдельное расписание до налога. YoC доступен лишь когда все события строки несут один FIGI и он однозначно соответствует одной текущей позиции; тикер и название никогда не выбирают cost basis.</small>
    </div>}
  </section>
}
