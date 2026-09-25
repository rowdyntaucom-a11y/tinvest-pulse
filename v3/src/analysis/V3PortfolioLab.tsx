import{useEffect,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{PERSONAL_STRATEGY_V1,type StrategyConfig}from"../../../v2/src/features/analytics/drift";
import{compareStrategyScenarios}from"../../../v2/src/features/analytics/strategyScenarioComparison";
import{filterStrategyLabWindow,runMonthlyRebalancedStrategy,type StrategyLabScenarioResult}from"./strategyHistoryLab";
import{loadStrategyLabSource,type StrategyLabSource}from"./strategyLabApi";
import"../styles/samuraiPortfolioLab.css";

const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
type LabWindow=1|3|5;
function p(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?pct.format(value*100)+"%":"—"}
function money(value:number|null|undefined){return typeof value==="number"&&Number.isFinite(value)?rub.format(value)+" ₽":"—"}
function strategy(name:string,input:string):StrategyConfig|null{
 const eq=Number(input.replace(",","."));
 if(!Number.isFinite(eq)||eq<=0||eq>=100)return null;
 return{
  version:"1.0",name,
  targets:[{key:"equity",label:"Акции",target:eq/100},{key:"bond",label:"Облигации",target:(100-eq)/100}],
  absoluteTolerance:PERSONAL_STRATEGY_V1.absoluteTolerance,
  relativeTolerance:PERSONAL_STRATEGY_V1.relativeTolerance,
 };
}
function HistoryCard({label,result}:{label:string;result:StrategyLabScenarioResult|null}){
 const weights=result?.available?pct.format(result.equityWeight*100)+" / "+pct.format(result.bondWeight*100):"—";
 const range=result?.metrics?result.metrics.startDate+" → "+result.metrics.endDate+" · "+result.metrics.points+" торговых точек":result?.reason??"Введите валидную структуру";
 return <article className="sam-lab__history-card">
  <header><strong>{label}</strong><span>{weights}</span></header>
  <div><span>Полная доходность</span><b>{p(result?.metrics?.totalReturn)}</b></div>
  <div><span>CAGR</span><b>{p(result?.metrics?.cagr)}</b></div>
  <div><span>Max DD</span><b>{p(result?.metrics?.maxDrawdown)}</b></div>
  <div><span>Волатильность</span><b>{p(result?.metrics?.annualizedVol)}</b></div>
  <small>{range}</small>
 </article>;
}

export function V3PortfolioLab({positions}:{positions:PositionSnapshot[]}){
 const[a,setA]=useState("50"),[b,setB]=useState("70"),[windowYears,setWindowYears]=useState<LabWindow>(3);
 const[source,setSource]=useState<StrategyLabSource|null>(null),[loading,setLoading]=useState(true);
 useEffect(()=>{
  const controller=new AbortController();
  setLoading(true);
  void loadStrategyLabSource(controller.signal).then(setSource).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[]);
 const sa=useMemo(()=>strategy("Сценарий A",a),[a]),sb=useMemo(()=>strategy("Сценарий B",b),[b]);
 const current=useMemo(()=>compareStrategyScenarios(positions,[
  ...(sa?[{id:"a",strategy:sa}]:[]),
  ...(sb?[{id:"b",strategy:sb}]:[]),
 ]),[positions,sa,sb]);
 const history=useMemo(()=>source?.available?filterStrategyLabWindow(source.points,windowYears):[],[source,windowYears]);
 const ha=useMemo(()=>sa?runMonthlyRebalancedStrategy(history,sa.targets[0].target):null,[history,sa]);
 const hb=useMemo(()=>sb?runMonthlyRebalancedStrategy(history,sb.targets[0].target):null,[history,sb]);

 const scenarioInput=(id:string,value:string,setValue:(value:string)=>void)=>{
  const parsed=Number(value.replace(",","."));
  const valid=Number.isFinite(parsed)&&parsed>0&&parsed<100;
  return <label><span>Сценарий {id} · акции, %</span><input inputMode="decimal" value={value} onChange={e=>setValue(e.target.value)} aria-label={"Сценарий "+id+": доля акций"}/><small>облигации: {valid?pct.format(100-parsed)+"%":"—"}</small></label>;
 };

 return <section className="sam-lab" aria-label="Portfolio Laboratory">
  <header className="sam-lab__head"><div><span>07 · PORTFOLIO LAB</span><h2>Лаборатория стратегий</h2><p>Два пользовательских набора сравниваются на одной исторической выборке MCFTR / RGBITR и на текущем снимке портфеля. Победитель не выбирается.</p></div><i aria-hidden="true">研</i></header>
  <section className="sam-lab__inputs">{scenarioInput("A",a,setA)}{scenarioInput("B",b,setB)}</section>

  <section className="sam-lab__current">
   <div className="sam-lab__title"><div><span>01 · СЕЙЧАС</span><h3>Структурная цена перехода</h3></div><small>текущий snapshot</small></div>
   {!current.available?<div className="sam-lab__gate">Введите два валидных пользовательских сценария. QVANIX не нормализует и не дополняет веса.</div>:<div className="sam-lab__current-grid">{current.rows.map(row=><article key={row.id}><header><strong>{row.name}</strong><span>{row.targetEquity==null?"—":pct.format(row.targetEquity*100)+" / "+pct.format((row.targetBond??0)*100)}</span></header><div><span>Макс. drift</span><b>{p(row.maxAbsoluteDrift)}</b></div><div><span>Перераспределить</span><b>{money(row.rebalanceTurnoverValue)}</b></div><div><span>Доля перехода</span><b>{p(row.rebalanceTurnoverRatio)}</b></div><small>вне модели {p(row.unassignedWeight)} · {row.withinTolerance?"в допуске":"вне допуска"}</small></article>)}</div>}
  </section>

  <section className="sam-lab__history">
   <div className="sam-lab__title"><div><span>02 · ИСТОРИЯ</span><h3>Одинаковая рыночная выборка</h3></div><small>{source?.equityCode??"MCFTR"} + {source?.bondCode??"RGBITR"}</small></div>
   <div className="sam-lab__windows" role="group" aria-label="Историческое окно">{([1,3,5] as LabWindow[]).map(value=><button type="button" key={value} className={windowYears===value?"is-active":""} onClick={()=>setWindowYears(value)}>{value}Г</button>)}</div>
   {loading?<div className="sam-lab__gate">Получаем историю индексов Московской биржи…</div>:!source?.available?<div className="sam-lab__gate is-warning"><strong>Исторический слой недоступен</strong><small>{source?.reason??"Источник не подтвердил данные."}</small></div>:<div className="sam-lab__history-grid"><HistoryCard label="Сценарий A" result={ha}/><HistoryCard label="Сценарий B" result={hb}/></div>}
   <p className="sam-lab__method">Методика v1: рублёвые total-return индексы MCFTR (акции, gross dividends) и RGBITR (ОФЗ total return), пересечение торговых дат, ежемесячное восстановление целевых весов, без комиссий, налогов и проскальзывания. Это историческая модель классов, а не реконструкция фактического портфеля пользователя.</p>
  </section>
 </section>;
}
