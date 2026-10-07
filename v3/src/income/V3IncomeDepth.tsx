import{useEffect,useMemo,useState}from"react";
import"../styles/incomeDepth.css";
import"../styles/visualComplexityV88.css";
import{loadPayoutCalendar,type PayoutCalendar,type PayoutEvent}from"../../../v2/src/lib/payoutsApi";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{filterIncomeCalendarEvents}from"../../../v2/src/features/income/incomeCalendarVisual";
import{findPayoutEventPosition,payoutEventIsConfirmed}from"../../../v2/src/features/income/incomeCalendarEventView";
import{buildV3IncomeDepth}from"./incomeDepth";
import{buildIncomeWorkspaceSummary}from"./incomeWorkspaceSummary";
import{V3MetricHelp}from"../help/V3MetricHelp";
import{V3SectionSelector}from"../navigation/V3SectionSelector";
import type{V3DetailMode,V3Shell}from"../app/model";
import{SamuraiChapterNav,SamuraiNextCue}from"../samurai/SamuraiChapterNav";
import{V3IncomeForwardPanel}from"./V3IncomeCalendarV2";
import{V3DividendDiscovery}from"./V3DividendDiscovery";
import{V3IncomeDataTrust}from"./V3IncomeDataTrust";
import{V3IncomeSeasonalityV122}from"./V3IncomeSeasonalityV122";
import{V3IncomeResilienceV128}from"./V3IncomeResilienceV128";
import{V3IncomeGrowthV143}from"./V3IncomeGrowthV143";
import{V3IncomeContinuityMatrixV133}from"./V3IncomeContinuityMatrixV133";
import{V3IncomeFreshnessV135}from"./V3IncomeFreshnessV135";

type View="overview"|"calendar"|"history"|"sources"|"trust"|"market";
const BASIC_VIEW_OPTIONS=[
  {value:"overview",label:"Сводка",description:"Короткий ответ: факт, ближайшая выплата и подтверждённые горизонты."},
  {value:"calendar",label:"Календарь",description:"Подтверждённое 12-месячное расписание будущих выплат."},
  {value:"history",label:"Факт",description:"Реально полученный пассивный доход по полностью наблюдавшимся месяцам."},
  {value:"sources",label:"Источники",description:"Факт и расписание по активам с точной FIGI-связью."},
] as const;
const PRO_VIEW_OPTIONS=[
  ...BASIC_VIEW_OPTIONS,
  {value:"trust",label:"Данные",description:"Профи: покрытие, FIGI-связность и сверка агрегатов FACT/FUTURE."},
  {value:"market",label:"Рынок",description:"Профи: отдельный TTM dividend discovery рынка, не доход текущего портфеля."},
] as const;
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

export function V3IncomeDepth({positions,onOpenAsset,shell,mode="detailed"}:{positions:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void;shell?:V3Shell;mode?:V3DetailMode}){
  const[calendar,setCalendar]=useState<PayoutCalendar|null>(null),[loading,setLoading]=useState(true),[loadedAt,setLoadedAt]=useState(()=>Date.now()),[view,setView]=useState<View>("overview"),[selectedMonth,setSelectedMonth]=useState<string|null>(null),samuraiReference=shell==="samurai",proMode=mode==="detailed";
  const viewOptions=proMode?PRO_VIEW_OPTIONS:BASIC_VIEW_OPTIONS;
  useEffect(()=>{let active=true;setLoading(true);void loadPayoutCalendar().then(data=>{if(active){setCalendar(data);setLoadedAt(Date.now());setLoading(false)}}).catch(()=>{if(active){setCalendar(null);setLoadedAt(Date.now());setLoading(false)}});return()=>{active=false}},[]);
  useEffect(()=>{if(!proMode&&(view==="trust"||view==="market"))setView("overview")},[proMode,view]);
  const depth=useMemo(()=>calendar?buildV3IncomeDepth(calendar,positions,loadedAt):null,[calendar,positions,loadedAt]);
  const futureEvents=depth?.trustedIncome.futureEvents??[];
  const workspaceSummary=useMemo(()=>buildIncomeWorkspaceSummary(futureEvents,calendar?.generatedAt??calendar?.period.from),[futureEvents,calendar?.generatedAt,calendar?.period.from]);
  const monthEvents=useMemo(()=>filterIncomeCalendarEvents(futureEvents,selectedMonth),[futureEvents,selectedMonth]);
  useEffect(()=>{if(selectedMonth&&depth&&!depth.calendarMonths.some(month=>month.key===selectedMonth))setSelectedMonth(null)},[selectedMonth,depth]);
  const next=depth?.trustedIncome.taxCalendar.next??null;
  const historyMonths=depth?.realizedHistory.months.slice(-12)??[];
  const historyMax=Math.max(0,...historyMonths.map(month=>month.totalNet));
  const selectedCalendar=selectedMonth?depth?.calendarMonths.find(month=>month.key===selectedMonth)??null:null;

  if(loading)return <section className="v3-income-depth"><div className="v3-income-depth-state">Синхронизируем факт и официальное расписание выплат…</div>{proMode&&(samuraiReference||view==="market")&&<V3DividendDiscovery/>}</section>;
  if(!calendar||!depth)return <section className="v3-income-depth"><div className="v3-income-depth-state is-warning">Подробный слой выплат сейчас недоступен. Уже подтверждённый пассивный доход выше не заменяется нулём.</div>{proMode&&samuraiReference&&<V3DividendDiscovery/>}</section>;

  const coverage=depth.integrity.coveragePct;
  const scheduleReady=depth.payoutTrust.safeToCalculate;
  const statusClass=depth.integrity.state==="verified"?"is-positive":depth.integrity.state==="stale"||depth.integrity.state==="partial"?"is-warning":"is-neutral";
  const actualNet=calendar.actual.totalNet;
  const overviewNext=workspaceSummary.next;

  return <section className="v3-income-depth" data-detail-mode={mode}>
    <div className="v3-income-depth-head"><div><span>{proMode?"ПРОФЕССИОНАЛЬНЫЙ ДОХОД":"ДОХОД · ПРОСТО"}</span><h2>{!samuraiReference&&view==="overview"?"Сводка денежного потока":"Факт, календарь и источники"}</h2></div><div className={"v3-income-depth-status "+statusClass}><strong>{depth.integrity.label}</strong><small>{coverage==null?"покрытие —":pct.format(coverage)+"% покрытия"}</small></div></div>
    {samuraiReference&&<SamuraiChapterNav label="Доход Samurai" chapters={[
      {id:"sam-income-upcoming",code:"壱",label:"Ближайшие",note:"3М · 6М · 12М"},
      {id:"sam-income-calendar",code:"弐",label:"Календарь",note:"будущие подтверждённые выплаты"},
      {id:"sam-income-history",code:"参",label:"Факт",note:"реально полученный доход"},
      {id:"sam-income-sources",code:"肆",label:"Источники",note:"активы · концентрация · YoC"},
      ...(proMode?[{id:"sam-income-trust",code:"伍",label:"Данные",note:"покрытие · FIGI · сверка"},{id:"sam-income-market",code:"陸",label:"Рынок",note:"отдельный dividend discovery"}]:[])
    ]}/>}
    {!samuraiReference&&<V3SectionSelector label="Раздел дохода" value={view} onChange={setView} options={viewOptions}/>} 

    {!samuraiReference&&view==="overview"&&<section className="v3-income-overview" aria-label="Сводка дохода">
      <div className="v3-income-overview-lead">
        <article><span>Получено фактически</span><strong>{money(actualNet)}</strong><small>уже полученный net · отдельно от будущего</small></article>
        <article><span>Ближайшая подтверждённая</span><strong>{scheduleReady&&overviewNext?(overviewNext.ticker||overviewNext.name):"—"}</strong><small>{scheduleReady&&overviewNext?dateFmt.format(new Date(overviewNext.date))+(workspaceSummary.nextDays==null?"":" · через "+workspaceSummary.nextDays+" дн."):"нет подтверждённого HIGH-события"}</small></article>
      </div>
      <div className="v3-income-overview-horizons">{workspaceSummary.buckets.map(row=><article key={row.days}><span>{row.days} дней</span><strong>{scheduleReady?money(row.gross):"—"}</strong><small>{scheduleReady?row.count+" подтверждённых событий":"расписание закрыто"}</small></article>)}</div>
      <div className="v3-income-overview-actions">
        <button type="button" onClick={()=>setView("calendar")}><span>Календарь</span><strong>Даты и события</strong><small>Месяцы, суммы и переход к активу</small></button>
        <button type="button" onClick={()=>setView("history")}><span>Факт</span><strong>{money(actualNet)}</strong><small>История уже полученных выплат</small></button>
        <button type="button" onClick={()=>setView("sources")}><span>Источники</span><strong>{depth.concentration.sourceCount||"—"}</strong><small>Позиции и структура денежного потока</small></button>
        {proMode&&<button type="button" onClick={()=>setView("trust")}><span>Данные · Профи</span><strong>{coverage==null?"—":pct.format(coverage)+"%"}</strong><small>Покрытие, FIGI и сверка</small></button>}
      </div>
      <small className="v3-income-method">Сводка показывает только уже полученный факт и подтверждённые HIGH-события текущего расписания. Будущие суммы остаются gross и не складываются с FACT net.</small>
    </section>}

    {samuraiReference&&scheduleReady&&<V3IncomeForwardPanel events={futureEvents} loadedAt={loadedAt}/>}
    {(samuraiReference||view==="calendar")&&<div id="sam-income-calendar" className="v3-income-calendar-depth">
      <div className="v3-income-calendar-summary">
        <article><span>12М · расписание <V3MetricHelp topic="payoutCoverage"/></span><strong>{scheduleReady?money(calendar.forecast.gross):"—"}</strong><small>{scheduleReady?calendar.forecast.count+" событий":"закрыто до полного покрытия"}</small></article>
        <article><span>Следующая выплата</span><strong>{scheduleReady&&next?(next.ticker||next.name):"—"}</strong><small>{scheduleReady&&next?dateFmt.format(new Date(next.date))+" · "+(futureAmount(next)==null?"сумма уточняется":rub2.format(futureAmount(next)!)+" ₽ до налога"):"нет подтверждённого события"}</small></article>
      </div>
      {!scheduleReady&&<div className="v3-income-depth-gate">{depth.payoutTrust.shortReason}. Будущий календарь fail-closed: неполное или устаревшее расписание не выдаётся за подтверждённый прогноз.</div>}
      {scheduleReady&&depth.calendarMonths.length>0&&<div className="v3-income-month-heatmap" aria-label="Тепловая карта подтверждённых выплат на 12 месяцев">{depth.calendarMonths.map(month=>{const level=Math.max(0,Math.min(4,Math.round(month.intensity*4)));return <button type="button" key={month.key} className={(selectedMonth===month.key?"is-active ":"")+(month.count===0?"is-empty ":"")+"heat-"+level} aria-pressed={selectedMonth===month.key} onClick={()=>setSelectedMonth(selectedMonth===month.key?null:month.key)}><span>{month.label}</span><strong>{month.grossAvailable?rub.format(month.gross)+" ₽":"—"}</strong><small>{month.count?month.count+" событий":"нет HIGH"}</small></button>})}</div>}
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
      <small className="v3-income-method">Тепловая карта кодирует только подтверждённую сумму текущего 12М расписания: чем интенсивнее блок, тем больше gross внутри этого окна. Это не прогноз за пределами известных HIGH-событий.</small>{samuraiReference&&<SamuraiNextCue targetId="sam-income-history" label="ДАЛЬШЕ · ФАКТ"/>}
    </div>}

    {(samuraiReference||view==="history")&&<div id="sam-income-history" className="v3-income-history-depth">
      <div className="v3-income-calendar-summary">
        <article><span>Наблюдение</span><strong>{depth.realizedHistory.observation.available?depth.realizedHistory.observation.completeMonths+" полн.":"—"}</strong><small>{depth.realizedHistory.observation.partialMonths} частичных месяцев</small></article>
        <article><span>Стабильность <V3MetricHelp topic="incomeStability"/></span><strong>{depth.stability.available?(depth.stability.status==="mature"?"Зрелая":"Предв."):"Gate"}</strong><small>{depth.stability.available?money(depth.stability.averageMonthlyNet)+" / мес.":"нужно ≥3 полных месяца"}</small></article>
      </div>
      <div className="v3-income-history-bars" aria-label="Фактический пассивный доход по наблюдаемым месяцам">{historyMonths.length?historyMonths.map(month=>{
        const height=historyMax>0?Math.max(month.totalNet>0?8:2,Math.round(month.totalNet/historyMax*100)):2;
        return <article key={month.key} className={month.partial?"is-partial":month.complete?"is-complete":"is-unobserved"}><div><i style={{height:height+"%"}}/></div><strong>{monthLabel(month.key)}</strong><span>{rub.format(month.totalNet)} ₽</span><small>{month.complete?"полный":month.partial?"частичный":"не подтверждён"}</small></article>
      }):<div className="v3-income-depth-state">Нет подтверждённой помесячной истории выплат.</div>}</div>
      <div className="v3-income-quality" aria-label="Качество фактического пассивного дохода">
        <div className="v3-income-quality-head"><div><span>КАЧЕСТВО ФАКТА</span><strong>{depth.quality.available?(depth.quality.status==="mature"?"Зрелая выборка":"Предварительная выборка"):"Недостаточно истории"}</strong></div><small>{depth.quality.available?"только полученный net · без прогноза":"нужно ≥3 полных месяца и положительный факт"}</small></div>
        <div className="v3-income-quality-grid">
          <article><span>Регулярность</span><strong>{depth.quality.regularityRatio==null?"—":pct.format(depth.quality.regularityRatio*100)+"%"}</strong><small>{depth.quality.payoutMonths}/{depth.quality.observedMonths} полных месяцев с выплатами</small></article>
          <article><span>Купоны</span><strong>{depth.quality.couponShare==null?"—":pct.format(depth.quality.couponShare*100)+"%"}</strong><small>{money(depth.quality.couponsNet)} получено net</small></article>
          <article><span>Дивиденды</span><strong>{depth.quality.dividendShare==null?"—":pct.format(depth.quality.dividendShare*100)+"%"}</strong><small>{money(depth.quality.dividendsNet)} получено net</small></article>
          <article><span>Прочее</span><strong>{depth.quality.otherShare==null?"—":pct.format(depth.quality.otherShare*100)+"%"}</strong><small>{money(depth.quality.otherNet)} получено net</small></article>
        </div>
        <small className="v3-income-method">Состав показывает только уже полученный пассивный доход после налога. Регулярность — доля полностью наблюдавшихся месяцев, в которых была хотя бы одна фактическая выплата; частичные месяцы не ухудшают показатель.</small>
      </div>
      <V3IncomeSeasonalityV122 months={depth.realizedHistory.months}/><V3IncomeGrowthV143 months={depth.realizedHistory.months}/><V3IncomeResilienceV128 months={depth.realizedHistory.months} events={depth.trustedIncome.actualEvents}/>
      <div className="v3-income-history-stats">
        <article><span>Месяцев с выплатами</span><strong>{depth.stability.payoutMonths}</strong><small>из {depth.stability.observedMonths} полных</small></article>
        <article><span>Нулевых месяцев</span><strong>{depth.stability.zeroIncomeMonths}</strong><small>только полностью наблюдавшиеся</small></article>
        <article><span>Крупнейший месяц</span><strong>{money(depth.stability.largestMonthNet)}</strong><small>{depth.stability.largestMonthShare==null?"—":pct.format(depth.stability.largestMonthShare*100)+"% факта"}</small></article>
        <article><span>Вариативность</span><strong>{depth.stability.coefficientOfVariation==null?"—":pct.format(depth.stability.coefficientOfVariation*100)+"%"}</strong><small>CV полного месячного факта</small></article>
      </div>
      {depth.comparable.available&&<div className="v3-income-comparable"><span>Сопоставимые месяцы</span><strong className={(depth.comparable.changeNet??0)>0?"is-positive":(depth.comparable.changeNet??0)<0?"is-negative":"is-neutral"}>{depth.comparable.changeRatio==null?money(depth.comparable.changeNet):((depth.comparable.changeRatio??0)>=0?"+":"")+pct.format((depth.comparable.changeRatio??0)*100)+"%"}</strong><small>{depth.comparable.monthCount} одинаковых полных месяцев · {depth.comparable.currentYear}/{depth.comparable.previousYear} · без годового пересчёта</small></div>}
      <small className="v3-income-method">Нулём считается только полностью наблюдавшийся календарный месяц. Частичный или отсутствующий месяц не превращается в ноль. Стабильность открывается после 3 полных месяцев; зрелая выборка — после 12.</small>{samuraiReference&&<SamuraiNextCue targetId="sam-income-sources" label="ДАЛЬШЕ · ИСТОЧНИКИ"/>}
    </div>}

    {(samuraiReference||view==="sources")&&<div id="sam-income-sources" className="v3-income-sources-depth">
      <div className="v3-income-calendar-summary">
        <article><span>Источников факта <V3MetricHelp topic="incomeConcentration"/></span><strong>{depth.concentration.sourceCount||"—"}</strong><small>{depth.concentration.effectiveSources==null?"эффективное число —":"эфф. "+depth.concentration.effectiveSources.toLocaleString("ru-RU",{maximumFractionDigits:2})}</small></article>
        <article><span>Главный источник</span><strong>{depth.concentration.topSourceShare==null?"—":pct.format(depth.concentration.topSourceShare*100)+"%"}</strong><small>доля реально полученного net</small></article>
      </div>
      <V3IncomeContinuityMatrixV133 actual={depth.trustedIncome.actualEvents} future={depth.trustedIncome.futureEvents} positions={positions} from={calendar.period.from} to={calendar.period.to}/><div className="v3-income-source-list">{depth.sourceRows.length?depth.sourceRows.slice(0,12).map(row=>{
        const matches=row.figi?positions.filter(position=>position.figi?.trim().toUpperCase()===row.figi):[],position=row.matchBasis==="FIGI"&&matches.length===1?matches[0]:null;
        return <button type="button" key={row.key} className="v3-income-source-row" disabled={!position} onClick={()=>{if(position)onOpenAsset?.(position)}}>
          <div><strong>{row.ticker}</strong><small>{row.name!==row.ticker?row.name:sourceIdentity(row.identityState)}</small></div>
          <div><span>Факт</span><strong>{row.fact>0?rub2.format(row.fact)+" ₽":"—"}</strong><small>{row.factCount} выплат</small></div>
          <div><span>12М</span><strong>{row.forecast>0?rub2.format(row.forecast)+" ₽":"—"}</strong><small>{row.yoc12m==null?"YoC — · "+sourceIdentity(row.identityState):"YoC "+pct.format(row.yoc12m*100)+"%"}</small></div>
        </button>
      }):<div className="v3-income-depth-state">Нет подтверждённых источников для разбивки.</div>}</div>
      {depth.bondLinkage.eligibleBondCount>0&&<div className="v3-income-bond-link"><div><span>Облигации → расписание</span><strong>{depth.bondLinkage.linkedBondCount}/{depth.bondLinkage.eligibleBondCount}</strong></div><i><b style={{width:Math.round(depth.bondLinkage.valueCoverage*100)+"%"}}/></i><small>{pct.format(depth.bondLinkage.valueCoverage*100)}% стоимости облигаций связано по FIGI · {depth.bondLinkage.couponEvents} купонных событий · {money(depth.bondLinkage.scheduledGross)} до налога</small></div>}
      {depth.bondCashflow.available&&<section className="v3-income-bond-cashflow" aria-label="Купонный поток облигаций">
        <div className="v3-income-quality-head"><div><span>КУПОННЫЙ ПОТОК · 12М</span><strong>Календарный профиль купонов</strong></div><small>расписание до налога · точный FIGI</small></div>
        <div className="v3-income-quality-grid">
          <article><span>Поток 12М</span><strong>{money(depth.bondCashflow.scheduledGross)}</strong><small>{depth.bondCashflow.couponEvents} событий</small></article>
          <article><span>Активные месяцы</span><strong>{depth.bondCashflow.activeMonths}/12</strong><small>месяцев с купоном</small></article>
          <article><span>Пик месяца</span><strong>{depth.bondCashflow.largestMonthShare==null?"—":pct.format(depth.bondCashflow.largestMonthShare*100)+"%"}</strong><small>{money(depth.bondCashflow.largestMonthGross)}</small></article>
          <article><span>Крупнейший выпуск</span><strong>{depth.bondCashflow.topIssueShare==null?"—":pct.format(depth.bondCashflow.topIssueShare*100)+"%"}</strong><small>{money(depth.bondCashflow.topIssueGross)}</small></article>
        </div>
        <div className="v3-income-bond-months">{depth.bondCashflow.months.map(row=><article key={row.key}><span>{row.key}</span><i><b style={{width:Math.max(3,(row.gross/(depth.bondCashflow.largestMonthGross||1))*100)+"%"}}/></i><strong>{rub2.format(row.gross)} ₽</strong><small>{row.issues} вып. · {row.events} событий</small></article>)}</div>
        <small className="v3-income-method">Это будущий купонный график до налога, а не уже полученный доход. В профиль входят только доверенные scheduled-события текущих облигаций, связанных по точному FIGI; Факт здесь никогда не суммируется повторно.</small>
      </section>}
      <div className="v3-income-coverage"><span>Покрытие расписания</span><strong>{coverage==null?"—":pct.format(coverage)+"%"}</strong><small>{depth.integrity.resolvedAssets}/{depth.integrity.eligibleAssets||"—"} активов · ошибок {depth.integrity.errors}</small></div>
      <small className="v3-income-method">Факт строится только из реально полученных положительных выплат после налога. 12М — отдельное расписание до налога. YoC доступен лишь когда все события строки несут один FIGI и он однозначно соответствует одной текущей позиции; тикер и название никогда не выбирают cost basis.</small>{samuraiReference&&proMode&&<SamuraiNextCue targetId="sam-income-trust" label="ДАЛЬШЕ · ДАННЫЕ"/>}
    </div>}
    {proMode&&(samuraiReference||view==="trust")&&<div id="sam-income-trust"><V3IncomeDataTrust calendar={calendar} positions={positions} loadedAt={loadedAt}/><V3IncomeFreshnessV135 calendar={calendar} loadedAt={loadedAt}/>{samuraiReference&&<SamuraiNextCue targetId="sam-income-market" label="ДАЛЬШЕ · РЫНОК"/>}</div>}
    {proMode&&samuraiReference&&<V3DividendDiscovery/>}
    {proMode&&!samuraiReference&&view==="market"&&<V3DividendDiscovery/>}
  </section>
}