import{useEffect,useMemo,useState}from"react";
import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import type{GoalProjectionInput,GoalProjectionPoint}from"../../../v2/src/features/goals/goalProjection";
import{V3MetricHelp}from"../help/V3MetricHelp";
import{V3SectionSelector}from"../navigation/V3SectionSelector";
import type{V3Shell}from"../app/model";
import{SamuraiChapterNav,SamuraiNextCue}from"../samurai/SamuraiChapterNav";
import{calculateV3GoalBootstrap,calculateV3GoalScenario,solveV3RequiredMonthlyContribution}from"./goalScenario";
import"../styles/goalScenarioLab.css";

type Tab="scenario"|"history";
type GoalMode="capital"|"income";
const TAB_OPTIONS=[
  {value:"scenario",label:"План цели",description:"Будущие предпосылки задаёте вы; QVANIX ничего не подставляет автоматически."},
  {value:"history",label:"Исторический диапазон",description:"Block bootstrap из подтверждённых дневных TWR-доходностей, не прогноз."},
] as const;

type Draft={
  horizonYears:string;
  monthlyContribution:string;
  contributionGrowthAnnualPct:string;
  inflationAnnualPct:string;
  priceReturnAnnualPct:string;
  incomeYieldAnnualPct:string;
  benchmarkReturnAnnualPct:string;
  passiveIncomeMonthly:string;
};

type PersistedSettings={
  draft:Draft;
  reinvest:boolean;
  inflationAdjust:boolean;
  growContribution:boolean;
  alternative:boolean;
  goalMode:GoalMode;
};

const SETTINGS_KEY="qvanix.v3.goal.lab.v2";
const EMPTY_DRAFT:Draft={
  horizonYears:"",
  monthlyContribution:"",
  contributionGrowthAnnualPct:"",
  inflationAnnualPct:"",
  priceReturnAnnualPct:"",
  incomeYieldAnnualPct:"",
  benchmarkReturnAnnualPct:"",
  passiveIncomeMonthly:"",
};
const DEFAULT_SETTINGS:PersistedSettings={
  draft:EMPTY_DRAFT,
  reinvest:false,
  inflationAdjust:false,
  growContribution:false,
  alternative:true,
  goalMode:"capital",
};

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const yearsFmt=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});

function readSettings():PersistedSettings{
  if(typeof window==="undefined")return DEFAULT_SETTINGS;
  try{
    const raw=localStorage.getItem(SETTINGS_KEY);
    if(!raw)return DEFAULT_SETTINGS;
    const parsed=JSON.parse(raw) as Partial<PersistedSettings>;
    return{
      draft:{...EMPTY_DRAFT,...parsed.draft},
      reinvest:Boolean(parsed.reinvest),
      inflationAdjust:Boolean(parsed.inflationAdjust),
      growContribution:Boolean(parsed.growContribution),
      alternative:parsed.alternative!==false,
      goalMode:parsed.goalMode==="income"?"income":"capital",
    };
  }catch{return DEFAULT_SETTINGS}
}

function numeric(value:string){
  const raw=value.trim().replace(/\s/g,"").replace(",",".");
  return raw?Number(raw):Number.NaN;
}
function positive(value:string){
  const x=numeric(value);
  return Number.isFinite(x)&&x>0?x:null;
}
function money(value:number|null|undefined){
  return typeof value==="number"&&Number.isFinite(value)?rub.format(value)+" ₽":"—";
}
function percent(value:number|null|undefined){
  return typeof value==="number"&&Number.isFinite(value)?pct.format(value*100)+"%":"—";
}

function Field({label,note,value,onChange,unit,min,max,step="0.1"}:{label:string;note:string;value:string;onChange:(value:string)=>void;unit:string;min?:string;max?:string;step?:string}){
  return <label className="v3-goal-scenario-field">
    <span>{label}</span>
    <div><input type="number" inputMode="decimal" value={value} min={min} max={max} step={step} placeholder="—" onChange={e=>onChange(e.target.value)}/><b>{unit}</b></div>
    <small>{note}</small>
  </label>;
}

function chartPath(series:GoalProjectionPoint[],getter:(point:GoalProjectionPoint)=>number|null,max:number){
  if(!series.length||max<=0)return"";
  const left=24,right=696,top=20,bottom=194,width=right-left,height=bottom-top;
  return series.map((point,index)=>{
    const value=getter(point);
    if(value==null||!Number.isFinite(value))return null;
    const x=series.length===1?left:left+index/(series.length-1)*width;
    const y=bottom-Math.min(1,Math.max(0,value/max))*height;
    return x.toFixed(1)+","+y.toFixed(1);
  }).filter((point):point is string=>Boolean(point)).join(" ");
}

function ScenarioChart({series,hasBenchmark,inflationAdjust}:{series:GoalProjectionPoint[];hasBenchmark:boolean;inflationAdjust:boolean}){
  const[selected,setSelected]=useState<number|null>(null);
  const active=series.find(point=>point.year===selected)??series.at(-1)??null;
  const max=Math.max(1,...series.flatMap(point=>[point.capital,point.targetNominal,point.benchmarkCapital??0]));
  const capital=chartPath(series,point=>point.capital,max),target=chartPath(series,point=>point.targetNominal,max),benchmark=chartPath(series,point=>point.benchmarkCapital,max);
  return <section className="v3-goal-scenario-chart" aria-label="Траектория пользовательского сценария">
    {active&&<div className="v3-goal-scenario-focus"><span>{Math.round(active.year)} год</span><strong>{money(active.capital)}</strong><small>цель {money(active.targetNominal)} · в сегодняшних рублях {money(active.realCapital)}</small></div>}
    <svg viewBox="0 0 720 220" role="img" aria-label="Капитал и цель по годам">
      <line className="grid" x1="24" y1="194" x2="696" y2="194"/><line className="grid" x1="24" y1="107" x2="696" y2="107"/><line className="grid" x1="24" y1="20" x2="696" y2="20"/>
      <polyline className="target" points={target}/>{hasBenchmark&&benchmark&&<polyline className="benchmark" points={benchmark}/>}<polyline className="capital" points={capital}/>
    </svg>
    <div className="v3-goal-scenario-legend"><span><i className="capital"/>капитал</span><span><i className="target"/>цель{inflationAdjust?" с инфляцией":""}</span>{hasBenchmark&&<span><i className="benchmark"/>индекс-сценарий</span>}</div>
    <div className="v3-goal-scenario-years" aria-label="Год сценария">{series.map(point=><button type="button" key={point.month} className={active?.month===point.month?"is-active":""} aria-pressed={active?.month===point.month} onClick={()=>setSelected(point.year)}>{Math.round(point.year)}</button>)}</div>
  </section>;
}

function ScenarioTable({series}:{series:GoalProjectionPoint[]}){
  return <details className="v3-goal-scenario-table">
    <summary><span><strong>Таблица по годам</strong><small>Капитал, цель, пополнения и выплаты</small></span><b>{series.length} строк</b></summary>
    <div className="v3-goal-scenario-table-scroll">
      <table>
        <thead><tr><th>Год</th><th>Капитал</th><th>Цель</th><th>Пополнения</th><th>Выплаты</th></tr></thead>
        <tbody>{series.map(point=><tr key={point.month}><td>{Math.round(point.year)}</td><td>{money(point.capital)}</td><td>{money(point.targetNominal)}</td><td>{money(point.cumulativeContributions)}</td><td>{money(point.cumulativeIncomePaidOut)}</td></tr>)}</tbody>
      </table>
    </div>
  </details>;
}

export function V3GoalScenarioLab({
  currentCapital,
  targetCapitalToday,
  history,
  onTargetChange,
  shell,
}:{
  currentCapital:number|null;
  targetCapitalToday:number|null;
  history:HistoryPoint[];
  onTargetChange?:(value:number)=>void;
  shell?:V3Shell;
}){
  const initial=useMemo(readSettings,[]),samuraiReference=shell==="samurai";
  const[tab,setTab]=useState<Tab>("scenario");
  const[draft,setDraft]=useState<Draft>(initial.draft);
  const[reinvest,setReinvest]=useState(initial.reinvest);
  const[inflationAdjust,setInflationAdjust]=useState(initial.inflationAdjust);
  const[growContribution,setGrowContribution]=useState(initial.growContribution);
  const[alternative,setAlternative]=useState(initial.alternative);
  const[goalMode,setGoalMode]=useState<GoalMode>(initial.goalMode);
  const[bootstrapYears,setBootstrapYears]=useState(1);
  const[targetDraft,setTargetDraft]=useState(targetCapitalToday?String(targetCapitalToday):"");

  useEffect(()=>{setTargetDraft(targetCapitalToday?String(targetCapitalToday):"")},[targetCapitalToday]);
  useEffect(()=>{
    if(typeof window==="undefined")return;
    localStorage.setItem(SETTINGS_KEY,JSON.stringify({draft,reinvest,inflationAdjust,growContribution,alternative,goalMode} satisfies PersistedSettings));
  },[draft,reinvest,inflationAdjust,growContribution,alternative,goalMode]);

  const update=(key:keyof Draft,value:string)=>setDraft(current=>({...current,[key]:value}));
  const payoutYield=positive(draft.incomeYieldAnnualPct);
  const desiredPassiveIncome=positive(draft.passiveIncomeMonthly);
  const derivedIncomeTarget=goalMode==="income"&&desiredPassiveIncome&&payoutYield?desiredPassiveIncome*12/(payoutYield/100):null;
  const scenarioTarget=goalMode==="income"?derivedIncomeTarget:targetCapitalToday;

  const requiredKeys=["horizonYears","monthlyContribution","priceReturnAnnualPct","incomeYieldAnnualPct"] as const;
  const requiredReady=requiredKeys.every(key=>draft[key].trim()!=="");
  const optionalReady=(!inflationAdjust||draft.inflationAnnualPct.trim()!=="")&&(!growContribution||draft.contributionGrowthAnnualPct.trim()!=="");
  const targetReady=typeof scenarioTarget==="number"&&Number.isFinite(scenarioTarget)&&scenarioTarget>0;
  const sourceReady=typeof currentCapital==="number"&&Number.isFinite(currentCapital)&&currentCapital>=0;
  const ready=requiredReady&&optionalReady&&targetReady&&sourceReady;

  const input=useMemo<GoalProjectionInput|null>(()=>ready&&scenarioTarget!=null&&currentCapital!=null?({
    currentCapital,
    targetCapitalToday:scenarioTarget,
    horizonYears:numeric(draft.horizonYears),
    monthlyContribution:numeric(draft.monthlyContribution),
    contributionGrowthAnnualPct:growContribution?numeric(draft.contributionGrowthAnnualPct):0,
    inflationAnnualPct:inflationAdjust?numeric(draft.inflationAnnualPct):0,
    priceReturnAnnualPct:numeric(draft.priceReturnAnnualPct),
    incomeYieldAnnualPct:numeric(draft.incomeYieldAnnualPct),
    reinvestIncome:reinvest,
    benchmarkReturnAnnualPct:draft.benchmarkReturnAnnualPct.trim()?numeric(draft.benchmarkReturnAnnualPct):null,
  }):null,[ready,scenarioTarget,currentCapital,draft,growContribution,inflationAdjust,reinvest]);

  const projection=useMemo(()=>input?calculateV3GoalScenario(input):null,[input]);
  const alternativeResult=useMemo(()=>alternative&&input?solveV3RequiredMonthlyContribution(input):null,[alternative,input]);
  const bootstrap=useMemo(()=>currentCapital==null?null:calculateV3GoalBootstrap(history,currentCapital,bootstrapYears),[history,currentCapital,bootstrapYears]);
  const reached=projection?.scenarioGoalReachedMonth==null?"не достигнута в горизонте":projection.scenarioGoalReachedMonth===0?"уже выше заданной цели":"≈ "+yearsFmt.format(projection.scenarioGoalReachedMonth/12)+" года";

  const saveTarget=()=>{
    const value=positive(targetDraft);
    if(value&&onTargetChange)onTargetChange(value);
  };
  const applyAlternative=()=>{
    const required=alternativeResult?.requiredMonthlyContribution;
    if(required==null||!Number.isFinite(required))return;
    update("monthlyContribution",String(Math.round(required)));
  };

  return <section id="cos-goal-lab" className="v3-goal-scenario-lab v3-goal-lab-v2">
    <div className="v3-goal-scenario-head"><div><span>GOAL LAB // 02</span><h2>Сценарный конструктор цели</h2></div><b>v2</b></div>
    {samuraiReference&&<SamuraiChapterNav label="Цель Samurai" chapters={[
      {id:"sam-goal-scenario",code:"壱",label:"Сценарий",note:"ваши предпосылки"},
      {id:"sam-goal-history",code:"弐",label:"История",note:"block bootstrap"}
    ]}/>}
    {!samuraiReference&&<V3SectionSelector label="Режим сценария" value={tab} onChange={setTab} options={TAB_OPTIONS}/>} 

    {(samuraiReference||tab==="scenario")&&<div id="sam-goal-scenario" className="v3-goal-scenario-view">
      <section className="v3-goal-lab-target">
        <header><span>01 · ЦЕЛЬ <V3MetricHelp topic="goalScenario"/></span><small>Настройка без скрытых предположений</small></header>
        <div className="v3-goal-lab-segmented" role="group" aria-label="Тип сценария цели">
          <button type="button" className={goalMode==="capital"?"is-active":""} onClick={()=>setGoalMode("capital")}>Капитал</button>
          <button type="button" className={goalMode==="income"?"is-active":""} onClick={()=>setGoalMode("income")}>Пассивный доход</button>
        </div>
        {goalMode==="capital"?<div className="v3-goal-lab-target-row">
          <label><span>Целевой капитал</span><div><input inputMode="decimal" value={targetDraft} placeholder="—" onChange={e=>setTargetDraft(e.target.value)}/><b>₽</b></div></label>
          <button type="button" onClick={saveTarget} disabled={!positive(targetDraft)||!onTargetChange}>Сохранить</button>
        </div>:<div className="v3-goal-lab-income-target">
          <Field label="Пассивный доход" note="желаемый денежный поток" value={draft.passiveIncomeMonthly} onChange={value=>update("passiveIncomeMonthly",value)} min="0" step="100" unit="₽/мес"/>
          <div><span>Эквивалентный капитал</span><strong>{money(derivedIncomeTarget)}</strong><small>рассчитан только из указанной вами доходности выплат; это не прогноз.</small></div>
        </div>}
      </section>

      <section className="v3-goal-lab-assumptions">
        <header><span>02 · ПАРАМЕТРЫ</span><small>Срок, взносы и ваши предпосылки</small></header>
        <div className="v3-goal-scenario-form">
          <Field label="Горизонт" note="1–50 лет" value={draft.horizonYears} onChange={value=>update("horizonYears",value)} step="1" min="1" max="50" unit="лет"/>
          <Field label="Пополнение" note="в конце каждого месяца" value={draft.monthlyContribution} onChange={value=>update("monthlyContribution",value)} step="100" min="0" unit="₽/мес"/>
          <Field label="Изменение цены" note="ваша предпосылка" value={draft.priceReturnAnnualPct} onChange={value=>update("priceReturnAnnualPct",value)} unit="%/год"/>
          <Field label="Доходность выплат" note="дивиденды/купоны" value={draft.incomeYieldAnnualPct} onChange={value=>update("incomeYieldAnnualPct",value)} min="0" max="100" unit="%/год"/>
        </div>
        <div className="v3-goal-lab-toggles">
          <label><input type="checkbox" checked={reinvest} onChange={e=>setReinvest(e.target.checked)}/><span><strong>Реинвестировать выплаты</strong><small>добавлять купоны/дивиденды к капиталу</small></span></label>
          <label><input type="checkbox" checked={inflationAdjust} onChange={e=>setInflationAdjust(e.target.checked)}/><span><strong>Корректировать цель на инфляцию</strong><small>увеличивать номинальную цель по вашей инфляции</small></span></label>
          {inflationAdjust&&<Field label="Инфляция" note="ваша предпосылка" value={draft.inflationAnnualPct} onChange={value=>update("inflationAnnualPct",value)} unit="%/год"/>}
          <label><input type="checkbox" checked={growContribution} onChange={e=>setGrowContribution(e.target.checked)}/><span><strong>Увеличивать пополнения</strong><small>индексировать ежемесячный взнос ежегодно</small></span></label>
          {growContribution&&<Field label="Рост пополнений" note="ваша предпосылка" value={draft.contributionGrowthAnnualPct} onChange={value=>update("contributionGrowthAnnualPct",value)} unit="%/год"/>}
        </div>
        <details className="v3-goal-scenario-advanced"><summary><span><strong>Дополнительно</strong><small>Сравнение с индекс-сценарием и альтернативный расчёт</small></span><b>Раскрыть</b></summary><div>
          <Field label="Индекс-сценарий" note="необязательная пользовательская предпосылка" value={draft.benchmarkReturnAnnualPct} onChange={value=>update("benchmarkReturnAnnualPct",value)} unit="%/год"/>
          <label className="v3-goal-scenario-toggle"><input type="checkbox" checked={alternative} onChange={e=>setAlternative(e.target.checked)}/><span><strong>Искать альтернативный сценарий</strong><small>подобрать минимальный ежемесячный взнос при остальных ваших предпосылках</small></span></label>
        </div></details>
      </section>

      {!sourceReady?<div className="v3-goal-scenario-gate"><strong>Нужен подтверждённый стартовый капитал</strong><span>Параметры можно настроить и сохранить уже сейчас, но расчёт результата не запускается без подтверждённой стоимости портфеля.</span></div>:!targetReady?<div className="v3-goal-scenario-gate"><strong>{goalMode==="capital"?"Задайте целевой капитал":"Укажите пассивный доход и доходность выплат"}</strong><span>QVANIX не подставляет цель или доходность автоматически.</span></div>:!requiredReady||!optionalReady?<div className="v3-goal-scenario-gate"><strong>Заполните ваши предпосылки</strong><span>Пустые поля не заменяются «средними» значениями. Ноль тоже нужно указать явно там, где параметр включён.</span></div>:projection&&!projection.available?<div className="v3-goal-scenario-gate is-danger"><strong>Сценарий не рассчитан</strong><span>{projection.reason}</span></div>:projection&&<>
        <section className="v3-goal-lab-result">
          <header><span>03 · РЕЗУЛЬТАТ</span><small>Сценарий, а не обещание будущего</small></header>
          <div className="v3-goal-scenario-outcome">
            <div><span>Капитал в конце</span><strong>{money(projection.finalCapital)}</strong><small>в сегодняшних рублях {money(projection.finalRealCapital)}</small></div>
            <div><span>Достижение</span><strong>{reached}</strong><small>{projection.finalProgress==null?"—":pct.format(projection.finalProgress*100)+"% цели"}</small></div>
          </div>
          {alternative&&alternativeResult&&<div className="v3-goal-alternative">
            <div><span>Альтернативный сценарий</span><strong>{alternativeResult.available?money(alternativeResult.requiredMonthlyContribution)+" / мес":"—"}</strong><small>{alternativeResult.available&&alternativeResult.deltaMonthlyContribution!=null?(alternativeResult.deltaMonthlyContribution>1?"к текущему взносу нужно ещё "+money(alternativeResult.deltaMonthlyContribution):alternativeResult.deltaMonthlyContribution<-1?"ваш взнос выше расчётного минимума на "+money(Math.abs(alternativeResult.deltaMonthlyContribution)):"текущий взнос уже около расчётного минимума"):(alternativeResult.reason??"недоступно")}</small></div>
            {alternativeResult.available&&alternativeResult.requiredMonthlyContribution!=null&&<button type="button" onClick={applyAlternative}>Применить взнос</button>}
          </div>}
          <details className="v3-goal-scenario-results"><summary><span><strong>Разбор результата</strong><small>Цель, пополнения{!reinvest?", выплаты":""}{projection.finalBenchmarkCapital!=null?", индекс":""}</small></span><b>Подробнее</b></summary><div className="v3-goal-scenario-result-grid">
            <article><span>Цель в конце</span><strong>{money(projection.finalTargetNominal)}</strong><small>{inflationAdjust?"с вашей инфляцией":"без индексации"}</small></article>
            <article><span>Свои пополнения</span><strong>{money(projection.cumulativeContributions)}</strong><small>без стартового капитала</small></article>
            {!reinvest&&<article><span>Выплаты снаружи</span><strong>{money(projection.cumulativeIncomePaidOut)}</strong><small>не реинвестированы</small></article>}
            {projection.finalBenchmarkCapital!=null&&<article><span>Индекс-сценарий</span><strong>{money(projection.finalBenchmarkCapital)}</strong><small>те же пополнения</small></article>}
          </div></details>
          <ScenarioChart series={projection.series} hasBenchmark={projection.finalBenchmarkCapital!=null} inflationAdjust={inflationAdjust}/>
          <ScenarioTable series={projection.series}/>
          <small className="v3-goal-scenario-method">{projection.note} Методика {projection.version}. Все будущие параметры — пользовательские предпосылки.</small>
        </section>
      </>}
    {samuraiReference&&<SamuraiNextCue targetId="sam-goal-history" label="ДАЛЬШЕ · ИСТОРИЧЕСКИЙ ДИАПАЗОН"/>}</div>}

    {(samuraiReference||tab==="history")&&<div id="sam-goal-history" className="v3-goal-bootstrap-view">
      <div className="v3-goal-bootstrap-head"><div><span>HISTORICAL BLOCK BOOTSTRAP <V3MetricHelp topic="historicalBootstrap"/></span><strong>Диапазон из подтверждённой TWR-истории</strong></div><div className="v3-goal-bootstrap-years" role="group" aria-label="Горизонт исторического bootstrap">{[1,3,5,10].map(year=><button type="button" key={year} className={bootstrapYears===year?"is-active":""} aria-pressed={bootstrapYears===year} onClick={()=>setBootstrapYears(year)}>{year}Г</button>)}</div></div>
      {bootstrap==null?<div className="v3-goal-scenario-gate"><strong>Нужен подтверждённый стартовый капитал</strong><span>Исторический диапазон строится только от подтверждённой текущей стоимости.</span></div>:!bootstrap.available?<div className="v3-goal-scenario-gate"><strong>Истории пока недостаточно</strong><span>{bootstrap.note}</span></div>:<>
        <div className="v3-goal-bootstrap-band">
          {([["P10",bootstrap.terminalValue?.p10,bootstrap.terminalReturn?.p10],["Медиана",bootstrap.terminalValue?.median,bootstrap.terminalReturn?.median],["P90",bootstrap.terminalValue?.p90,bootstrap.terminalReturn?.p90]] as const).map(([label,value,ret])=><article key={label}><span>{label}</span><strong>{money(value)}</strong><small>{percent(ret)}</small></article>)}
        </div>
        <div className="v3-goal-bootstrap-meta"><div><span>История</span><strong>{bootstrap.historyReturns} доходностей</strong><small>{bootstrap.sampleFrom??"—"} → {bootstrap.sampleTo??"—"}</small></div><div><span>Статус</span><strong>{bootstrap.status==="mature"?"Зрелая":"Preview"}</strong><small>зрелая от {bootstrap.matureReturns}</small></div><div><span>Модель</span><strong>{bootstrap.simulations.toLocaleString("ru-RU")} траекторий</strong><small>блок {bootstrap.blockTradingDays} торговых дней</small></div></div>
        <small className="v3-goal-scenario-method">{bootstrap.note} Этот диапазон не моделирует будущие пополнения, инфляцию или изменение состава портфеля и не является прогнозом вероятности достижения цели.</small>
      </>}
    </div>}
  </section>;
}
