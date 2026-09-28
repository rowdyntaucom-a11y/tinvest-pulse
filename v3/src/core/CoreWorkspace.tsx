import{lazy,Suspense,useMemo,useState}from"react";import type{HistoryPoint,PositionSnapshot}from"../../../v2/src/lib/portfolioApi";import type{V3HomeViewModel}from"../home/homeViewModel";import type{V3IncomeModel}from"../income/V3Income";import{V3HistorySparkline}from"../home/V3HistorySparkline";import"./coreWorkspace.css";
const V3AssetsDepth=lazy(()=>import("../assets/V3AssetsDepth").then(m=>({default:m.V3AssetsDepth})));
const V3OperationsDepth=lazy(()=>import("../operations/V3OperationsDepth").then(m=>({default:m.V3OperationsDepth})));
const V3IncomeDepth=lazy(()=>import("../income/V3IncomeDepth").then(m=>({default:m.V3IncomeDepth})));
const V3Analysis=lazy(()=>import("../analysis/V3Analysis").then(m=>({default:m.V3Analysis})));
const V3MarketIntelligenceWorkspace=lazy(()=>import("../analysis/V3MarketIntelligenceWorkspace").then(m=>({default:m.V3MarketIntelligenceWorkspace})));
const V3AnalysisToolbox=lazy(()=>import("../analysis/V3AnalysisToolbox").then(m=>({default:m.V3AnalysisToolbox})));
type Area="overview"|"portfolio"|"performance"|"income"|"analytics"|"market"|"tools";type Density="full"|"compact";
const NAV:[Area,string,string[]][]=[
 ["overview","Обзор",["Сводка","События","Контроль"]],
 ["portfolio","Портфель",["Активы","Операции","Выплаты","Цели","Валюта","Категории","Корп. события"]],
 ["performance","Доходность",["Результат","TWR","XIRR","CAGR","Benchmark","Периоды"]],
 ["income","Доход",["Обзор","Календарь","Дивиденды","Купоны","История","Источники"]],
 ["analytics","Аналитика",["Результат","Риск","Структура","Корреляция","Сценарии","Активы"]],
 ["market","Рынок",["Пульс","Скринер","Просадки","Дивиденды","Облигации","Фьючерсы"]],
 ["tools","Инструменты",["Ребалансировка","Portfolio Lab","Сценарии","Отчёты","Экспорт"]]
];
const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}),pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1,signDisplay:"exceptZero"});
const m=(v:number|null)=>v==null?"—":money.format(v)+" ₽",p=(v:number|null)=>v==null?"—":pct.format(v)+"%";
export function CoreWorkspace({home,positions,history,income}:{home:V3HomeViewModel;positions:PositionSnapshot[];history:HistoryPoint[];income:V3IncomeModel}){const[area,setArea]=useState<Area>("overview"),[sub,setSub]=useState("Сводка"),[density,setDensity]=useState<Density>("full");const trusted=home.isTrusted,active=NAV.find(x=>x[0]===area)!,top=useMemo(()=>[...positions].sort((a,b)=>b.currentValue-a.currentValue).slice(0,6),[positions]),total=positions.reduce((s,x)=>s+x.currentValue,0),profit=home.profit,profitPct=home.profitPct;const go=(a:Area)=>{setArea(a);setSub(NAV.find(x=>x[0]===a)![2][0])};return <div className="qcore" data-density={density}>
 <aside className="qcore-side"><div className="qcore-logo"><b>Q</b><span>QVANIX</span><small>FINANCIAL CORE</small></div><nav>{NAV.map(([id,label])=><button key={id} className={area===id?"active":""} onClick={()=>go(id)}><i>{id==="overview"?"⌂":id==="portfolio"?"▦":id==="performance"?"↗":id==="income"?"₽":id==="analytics"?"⌁":id==="market"?"◉":"◇"}</i><span>{label}</span></button>)}</nav><footer><span>READ ONLY</span><small>Аналитика без торговли</small></footer></aside>
 <main className="qcore-main"><header className="qcore-top"><div><small>ПОРТФЕЛЬ</small><strong>{home.accountName||"QVANIX"}</strong></div><div className="qcore-mode"><button className={density==="compact"?"active":""} onClick={()=>setDensity("compact")}>COMPACT</button><button className={density==="full"?"active":""} onClick={()=>setDensity("full")}>FULL</button></div><div className={"qcore-live "+(trusted?"ok":"")}><i/> {trusted?"LIVE":"ДАННЫЕ НЕ ПОДТВЕРЖДЕНЫ"}</div></header>
 <section className="qcore-head"><div><small>QVANIX / {active[1].toUpperCase()}</small><h1>{active[1]}</h1></div><div className="qcore-balance"><span>Капитал</span><strong>{trusted?m(home.value):"—"}</strong><b className={(profit??0)>=0?"pos":"neg"}>{trusted?m(profit)+" · "+p(profitPct):"—"}</b></div></section>
 <nav className="qcore-sub" aria-label={"Раздел "+active[1]}>{active[2].map(x=><button key={x} className={sub===x?"active":""} onClick={()=>setSub(x)}>{x}</button>)}</nav>
 <section className="qcore-stage">
  {area==="overview"&&<><div className="qcore-kpis"><article><span>TWR</span><strong>{trusted&&home.twr!=null?p(home.twr*100):"—"}</strong><small>доходность стратегии</small></article><article><span>XIRR</span><strong>{trusted&&home.xirr!=null?p(home.xirr*100):"—"}</strong><small>с учётом потоков</small></article><article><span>Доход</span><strong>{trusted?m(income.total):"—"}</strong><small>{trusted?m(income.monthly)+" / мес":"купоны + дивиденды"}</small></article><article><span>Активы</span><strong>{trusted?positions.length:"—"}</strong><small>текущих позиций</small></article></div><div className="qcore-grid"><article className="qcore-chart"><header><div><span>Динамика портфеля</span><strong>История капитала</strong></div><button onClick={()=>go("performance")}>Вся доходность →</button></header><V3HistorySparkline points={trusted?history:[]}/><footer><span>Период <b>{history.length>1?"с начала истории":"—"}</b></span><span>История <b>{history.length} точек</b></span></footer></article><article className="qcore-focus"><header><span>Быстрый контроль</span><strong>Сейчас</strong></header><button onClick={()=>go("income")}><span>Пассивный поток</span><b>{trusted?m(income.monthly):"—"}</b><i>→</i></button><button onClick={()=>go("analytics")}><span>Риск и структура</span><b>Открыть</b><i>→</i></button><button onClick={()=>go("market")}><span>Рынок и скринеры</span><b>Открыть</b><i>→</i></button><button onClick={()=>go("tools")}><span>Инструменты</span><b>Lab · rebalance</b><i>→</i></button></article></div><section className="qcore-holdings"><header><div><span>Портфель</span><strong>Крупнейшие позиции</strong></div><button onClick={()=>go("portfolio")}>Все активы →</button></header><div>{top.length?top.map(x=><button key={x.figi||x.ticker}><b>{x.ticker}</b><span>{x.name}</span><strong>{m(x.currentValue)}</strong><i>{total>0?(x.currentValue/total*100).toFixed(1):"0"}%</i></button>):<p>Нет подтверждённых позиций.</p>}</div></section></>}
  {area!=="overview"&&<Module area={area as Exclude<Area,"overview">} sub={sub} trusted={trusted} positions={positions} history={history} income={income} home={home}/>}
 </section>
 </main>
 <nav className="qcore-mobile">{NAV.slice(0,5).map(([id,label])=><button key={id} className={area===id?"active":""} onClick={()=>go(id)}><i>{id==="overview"?"⌂":id==="portfolio"?"▦":id==="performance"?"↗":id==="income"?"₽":"⌁"}</i><span>{label}</span></button>)}<button className={area==="market"||area==="tools"?"active":""} onClick={()=>go(area==="market"?"tools":"market")}><i>•••</i><span>{area==="market"?"Инстр.":"Рынок"}</span></button></nav>
 </div>}
function Module({area,sub,trusted,positions,history,income,home}:{area:Exclude<Area,"overview">;sub:string;trusted:boolean;positions:PositionSnapshot[];history:HistoryPoint[];income:V3IncomeModel;home:V3HomeViewModel}){
 const gate=!trusted?<section className="qcore-data-gate"><strong>Данные не подтверждены</strong><p>Финансовый модуль закрыт fail-closed до получения полного LIVE-снимка. QVANIX не заменяет отсутствующие данные нулями.</p></section>:null;
 if(area==="portfolio"){
  if(sub==="Операции")return <CoreModule title="Операции" note="Исполненные события счёта · сделки · доход · внешние потоки"><Suspense fallback={<Loading/>}><V3OperationsDepth/></Suspense></CoreModule>;
  if(sub==="Цели")return <CoreModule title="Цели" note="Целевой капитал и прогресс"><GoalPanel value={trusted?home.value:null}/></CoreModule>;
  if(gate)return gate;
  return <CoreModule title={sub} note="Структура портфеля · единая подтверждённая модель"><Suspense fallback={<Loading/>}><V3AssetsDepth positions={positions}/></Suspense></CoreModule>;
 }
 if(area==="income"){
  if(gate)return gate;
  return <CoreModule title={sub} note="Факт и будущие выплаты разделены"><Suspense fallback={<Loading/>}><V3IncomeDepth positions={positions}/></Suspense></CoreModule>;
 }
 if(area==="performance"||area==="analytics"){
  if(gate)return gate;
  return <CoreModule title={sub} note="TWR-first аналитика · риск · benchmark · структура"><Suspense fallback={<Loading/>}><V3Analysis items={positions} history={history} market={{riskFreeRate:null,riskFreeRateDate:null,nextRateMeeting:null}} trusted={trusted} shell="core" mode="detailed" portfolioValue={home.value??0}/></Suspense></CoreModule>;
 }
 if(area==="market"){
  return <CoreModule title={sub} note="Market Intelligence · публичный рынок × текущий портфель"><Suspense fallback={<Loading/>}><V3MarketIntelligenceWorkspace positions={positions}/></Suspense></CoreModule>;
 }
 return <CoreModule title={sub} note="Read-only профессиональные инструменты"><Suspense fallback={<Loading/>}><V3AnalysisToolbox positions={positions}/></Suspense></CoreModule>;
}
function CoreModule({title,note,children}:{title:string;note:string;children:React.ReactNode}){return <article className="qcore-workbench qcore-live-module"><header><div><span>FINANCIAL CORE</span><h2>{title}</h2><small>{note}</small></div><em>CONNECTED</em></header><div className="qcore-embedded">{children}</div></article>}
function Loading(){return <div className="qcore-loading">Открываем финансовый модуль…</div>}
function GoalPanel({value}:{value:number|null}){const[target,setTarget]=useState(1_000_000);const progress=value==null?null:Math.min(100,value/target*100);return <section className="qcore-goal"><div><span>Текущий капитал</span><strong>{m(value)}</strong></div><label>Цель <input type="number" min="1" step="10000" value={target} onChange={e=>setTarget(Math.max(1,Number(e.target.value)||1))}/></label><div className="qcore-goalbar"><i style={{width:(progress??0)+"%"}}/></div><p>{progress==null?"Прогресс недоступен":progress.toFixed(1)+"% цели"} · сценарий не является прогнозом доходности.</p></section>}
