import{useMemo,useState}from"react";
import type{HistoryPoint}from"../../../v2/src/lib/portfolioApi";
import type{GoalProjectionPoint}from"../../../v2/src/features/goals/goalProjection";
import{V3MetricHelp}from"../help/V3MetricHelp";
import{V3SectionSelector}from"../navigation/V3SectionSelector";
import{calculateV3GoalBootstrap,calculateV3GoalScenario}from"./goalScenario";
import"../styles/goalScenarioLab.css";

type Tab="scenario"|"history";
const TAB_OPTIONS=[
  {value:"scenario",label:"Ваш сценарий",description:"Будущие предпосылки задаёте вы; QVANIX ничего не подставляет автоматически."},
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
};

const EMPTY:Draft={
  horizonYears:"",
  monthlyContribution:"",
  contributionGrowthAnnualPct:"",
  inflationAnnualPct:"",
  priceReturnAnnualPct:"",
  incomeYieldAnnualPct:"",
  benchmarkReturnAnnualPct:"",
};

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const yearsFmt=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});

function numeric(value:string){
  const raw=value.trim().replace(/s/g,"").replace(",",".");
  return raw?Number(raw):Number.NaN;
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

function ScenarioChart({series,hasBenchmark}:{series:GoalProjectionPoint[];hasBenchmark:boolean}){
  const[selected,setSelected]=useState<number|null>(null);
  const active=series.find(point=>point.year===selected)??series.at(-1)??null;
  const max=Math.max(1,...series.flatMap(point=>[point.capital,point.targetNominal,point.benchmarkCapital??0]));
  const capital=chartPath(series,point=>point.capital,max),target=chartPath(series,point=>point.targetNominal,max),benchmark=chartPath(series,point=>point.benchmarkCapital,max);
  return <section className="v3-goal-scenario-chart" aria-label="Траектория пользовательского сценария">
    {active&&<div className="v3-goal-scenario-focus" aria-live="polite"><span>{Math.round(active.year)} год</span><strong>{money(active.capital)}</strong><small>цель {money(active.targetNominal)} · в сегодняшних рублях {money(active.realCapital)}</small></div>}
    <svg viewBox="0 0 720 220" role="img" aria-label="Капитал и инфляционно скорректированная цель по годам">
      <line className="grid" x1="24" y1="194" x2="696" y2="194"/><line className="grid" x1="24" y1="107" x2="696" y2="107"/><line className="grid" x1="24" y1="20" x2="696" y2="20"/>
      <polyline className="target" points={target}/>{hasBenchmark&&benchmark&&<polyline className="benchmark" points={benchmark}/>}<polyline className="capital" points={capital}/>
    </svg>
    <div className="v3-goal-scenario-legend"><span><i className="capital"/>капитал</span><span><i className="target"/>цель с инфляцией</span>{hasBenchmark&&<span><i className="benchmark"/>индекс-сценарий</span>}</div>
    <div className="v3-goal-scenario-years" aria-label="Год сценария">{series.map(point=><button type="button" key={point.month} className={active?.month===point.month?"is-active":""} aria-pressed={active?.month===point.month} onClick={()=>setSelected(point.year)}>{Math.round(point.year)}</button>)}</div>
  </section>;
}

export function V3GoalScenarioLab({currentCapital,targetCapitalToday,history}:{currentCapital:number;targetCapitalToday:number;history:HistoryPoint[]}){
  const[tab,setTab]=useState<Tab>("scenario"),[draft,setDraft]=useState<Draft>(EMPTY),[reinvest,setReinvest]=useState(false),[bootstrapYears,setBootstrapYears]=useState(1);
  const update=(key:keyof Draft,value:string)=>setDraft(current=>({...current,[key]:value}));
  const required=["horizonYears","monthlyContribution","contributionGrowthAnnualPct","inflationAnnualPct","priceReturnAnnualPct","incomeYieldAnnualPct"] as const;
  const ready=required.every(key=>draft[key].trim()!=="");
  const projection=useMemo(()=>ready?calculateV3GoalScenario({
    currentCapital,
    targetCapitalToday,
    horizonYears:numeric(draft.horizonYears),
    monthlyContribution:numeric(draft.monthlyContribution),
    contributionGrowthAnnualPct:numeric(draft.contributionGrowthAnnualPct),
    inflationAnnualPct:numeric(draft.inflationAnnualPct),
    priceReturnAnnualPct:numeric(draft.priceReturnAnnualPct),
    incomeYieldAnnualPct:numeric(draft.incomeYieldAnnualPct),
    reinvestIncome:reinvest,
    benchmarkReturnAnnualPct:draft.benchmarkReturnAnnualPct.trim()?numeric(draft.benchmarkReturnAnnualPct):null,
  }):null,[ready,currentCapital,targetCapitalToday,draft,reinvest]);
  const bootstrap=useMemo(()=>calculateV3GoalBootstrap(history,currentCapital,bootstrapYears),[history,currentCapital,bootstrapYears]);
  const reached=projection?.scenarioGoalReachedMonth==null?"не достигнута в горизонте":projection.scenarioGoalReachedMonth===0?"уже выше заданной цели":"≈ "+yearsFmt.format(projection.scenarioGoalReachedMonth/12)+" года";

  return <section className="v3-goal-scenario-lab">
    <div className="v3-goal-scenario-head"><div><span>СЦЕНАРНЫЙ ЛАБОРАТОРИЙ</span><h2>Цель без скрытых предположений</h2></div><b>v1</b></div>
    <V3SectionSelector label="Режим сценария" value={tab} onChange={setTab} options={TAB_OPTIONS}/>

    {tab==="scenario"&&<div className="v3-goal-scenario-view">
      <div className="v3-goal-scenario-banner"><div><span>Цель сегодня <V3MetricHelp topic="goalScenario"/></span><strong>{money(targetCapitalToday)}</strong></div><div><span>Стартовый капитал</span><strong>{money(currentCapital)}</strong></div><small>QVANIX не подставляет будущую доходность, инфляцию или взносы автоматически. Все предпосылки ниже задаёте вы.</small></div>
      <div className="v3-goal-scenario-form">
        <Field label="Горизонт" note="целое число от 1 до 50" value={draft.horizonYears} onChange={value=>update("horizonYears",value)} step="1" min="1" max="50" unit="лет"/>
        <Field label="Пополнение" note="в конце каждого месяца" value={draft.monthlyContribution} onChange={value=>update("monthlyContribution",value)} step="100" min="0" unit="₽/мес"/>
        <Field label="Индексация взноса" note="ваша предпосылка изменения взноса" value={draft.contributionGrowthAnnualPct} onChange={value=>update("contributionGrowthAnnualPct",value)} unit="%/год"/>
        <Field label="Инфляция" note="увеличивает номинальную стоимость цели" value={draft.inflationAnnualPct} onChange={value=>update("inflationAnnualPct",value)} unit="%/год"/>
        <Field label="Изменение цены" note="ваша предпосылка, отдельно от выплат" value={draft.priceReturnAnnualPct} onChange={value=>update("priceReturnAnnualPct",value)} unit="%/год"/>
        <Field label="Доходность выплат" note="дивиденды/купоны как ваша предпосылка" value={draft.incomeYieldAnnualPct} onChange={value=>update("incomeYieldAnnualPct",value)} min="0" max="100" unit="%/год"/>
        <Field label="Индекс-сценарий" note="необязательно; ожидание не подставляется QVANIX" value={draft.benchmarkReturnAnnualPct} onChange={value=>update("benchmarkReturnAnnualPct",value)} unit="%/год"/>
        <label className="v3-goal-scenario-toggle"><input type="checkbox" checked={reinvest} onChange={e=>setReinvest(e.target.checked)}/><span><strong>Реинвестировать выплаты</strong><small>если выключено, сценарные выплаты считаются отдельно и не увеличивают капитал</small></span></label>
      </div>
      {!ready?<div className="v3-goal-scenario-gate"><strong>Заполните ваши предпосылки</strong><span>Расчёт не запускается из пустых полей и не заменяет их «разумными значениями».</span></div>:projection&&!projection.available?<div className="v3-goal-scenario-gate is-danger"><strong>Сценарий не рассчитан</strong><span>{projection.reason}</span></div>:projection&&<>
        <div className="v3-goal-scenario-results"><article><span>Капитал в конце</span><strong>{money(projection.finalCapital)}</strong><small>реально {money(projection.finalRealCapital)}</small></article><article><span>Цель с инфляцией</span><strong>{money(projection.finalTargetNominal)}</strong><small>номинальная цель к концу</small></article><article><span>Прогресс сценария</span><strong>{projection.finalProgress==null?"—":pct.format(projection.finalProgress*100)+"%"}</strong><small>капитал / цель с инфляцией</small></article><article><span>Достижение в сценарии</span><strong>{reached}</strong><small>не обещанная дата</small></article><article><span>Свои пополнения</span><strong>{money(projection.cumulativeContributions)}</strong><small>без стартового капитала</small></article>{!reinvest&&<article><span>Выплаты снаружи</span><strong>{money(projection.cumulativeIncomePaidOut)}</strong><small>не реинвестированы</small></article>}{projection.finalBenchmarkCapital!=null&&<article><span>Индекс-сценарий</span><strong>{money(projection.finalBenchmarkCapital)}</strong><small>те же пополнения</small></article>}</div>
        <ScenarioChart series={projection.series} hasBenchmark={projection.finalBenchmarkCapital!=null}/>
        <small className="v3-goal-scenario-method">{projection.note} Методика {projection.version}. Параметры — пользовательские предпосылки, а не оценка QVANIX.</small>
      </>}
    </div>}

    {tab==="history"&&<div className="v3-goal-bootstrap-view">
      <div className="v3-goal-bootstrap-head"><div><span>HISTORICAL BLOCK BOOTSTRAP <V3MetricHelp topic="historicalBootstrap"/></span><strong>Диапазон из подтверждённой TWR-истории</strong></div><div className="v3-goal-bootstrap-years" role="group" aria-label="Горизонт исторического bootstrap">{[1,3,5,10].map(year=><button type="button" key={year} className={bootstrapYears===year?"is-active":""} aria-pressed={bootstrapYears===year} onClick={()=>setBootstrapYears(year)}>{year}Г</button>)}</div></div>
      {!bootstrap.available?<div className="v3-goal-scenario-gate"><strong>Истории пока недостаточно</strong><span>{bootstrap.note}</span></div>:<>
        <div className="v3-goal-bootstrap-band">
          {([["P10",bootstrap.terminalValue?.p10,bootstrap.terminalReturn?.p10],["Медиана",bootstrap.terminalValue?.median,bootstrap.terminalReturn?.median],["P90",bootstrap.terminalValue?.p90,bootstrap.terminalReturn?.p90]] as const).map(([label,value,ret])=><article key={label}><span>{label}</span><strong>{money(value)}</strong><small>{percent(ret)}</small></article>)}
        </div>
        <div className="v3-goal-bootstrap-meta"><div><span>История</span><strong>{bootstrap.historyReturns} доходностей</strong><small>{bootstrap.sampleFrom??"—"} → {bootstrap.sampleTo??"—"}</small></div><div><span>Статус</span><strong>{bootstrap.status==="mature"?"Зрелая":"Preview"}</strong><small>зрелая от {bootstrap.matureReturns}</small></div><div><span>Модель</span><strong>{bootstrap.simulations.toLocaleString("ru-RU")} траекторий</strong><small>блок {bootstrap.blockTradingDays} торговых дней</small></div></div>
        <small className="v3-goal-scenario-method">{bootstrap.note} Этот диапазон не моделирует будущие пополнения, инфляцию или изменение состава портфеля и не является прогнозом вероятности достижения цели.</small>
      </>}
    </div>}
  </section>;
}
