import{lazy,Suspense,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{V3FuturesScenario}from"../terminal/V3FuturesScenario";
import"../styles/proTools.css";

const V3RebalanceWorkspace=lazy(()=>import("./V3RebalanceWorkspace").then(m=>({default:m.V3RebalanceWorkspace})));
const V3PortfolioLab=lazy(()=>import("./V3PortfolioLab").then(m=>({default:m.V3PortfolioLab})));
const V3MarketIntelligenceWorkspace=lazy(()=>import("./V3MarketIntelligenceWorkspace").then(m=>({default:m.V3MarketIntelligenceWorkspace})));
const V3PortfolioReportDepth=lazy(()=>import("../report/V3PortfolioReportDepth").then(m=>({default:m.V3PortfolioReportDepth})));

type ToolId="rebalance"|"lab"|"market"|"futures"|"report";
type ToolDef={id:ToolId;label:string;note:string;group:"portfolio"|"scenario";hero:string};
const TOOLS:ToolDef[]=[
 {id:"rebalance",label:"Ребаланс",note:"цель · отклонение · сценарий",group:"portfolio",hero:"Проверить отклонение структуры и смоделировать выравнивание без заявок."},
 {id:"report",label:"Отчёт",note:"классы · валюты · P/L",group:"portfolio",hero:"Собрать состав, валюты и накопленный результат в одном отчёте только для чтения."},
 {id:"lab",label:"Лаборатория",note:"история стратегий",group:"scenario",hero:"Сравнить сценарии на подтверждённой истории без подмены результата прогнозом."},
 {id:"futures",label:"Фьючерсы",note:"сценарий · базис · ГО",group:"scenario",hero:"Посчитать сценарий фьючерса, базис и нагрузку ГО без отправки приказов брокеру."},
 {id:"market",label:"Рынок",note:"пульс · скринер · история",group:"scenario",hero:"Открыть публичный рыночный контекст и историю без торговых сигналов."},
];

function ToolLoading({label}:{label:string}){return <div className="v3-pro-tools__loading" aria-live="polite"><i/><div><strong>{label}</strong><small>Модуль подключается к текущим подтверждённым данным.</small><span aria-hidden="true"><b/><b/><b/></span></div></div>}

export function V3AnalysisToolbox({positions,includeMarket=true}:{positions:PositionSnapshot[];includeMarket?:boolean}){
 const[tool,setTool]=useState<ToolId>("rebalance");
 const[catalogOpen,setCatalogOpen]=useState(true);
 const tools=useMemo(()=>includeMarket?TOOLS:TOOLS.filter(item=>item.id!=="market"),[includeMarket]);
 const selected=tools.find(item=>item.id===tool)??tools[0];
 const groups=[
  {id:"portfolio",label:"Управление портфелем",items:tools.filter(item=>item.group==="portfolio")},
  {id:"scenario",label:"Сценарии и исследование",items:tools.filter(item=>item.group==="scenario")},
 ] as const;
 return <section className="v3-pro-tools" aria-label="Профессиональные инструменты аналитики">
  <header><div><span>ПРОФЕССИОНАЛЬНЫЕ ИНСТРУМЕНТЫ</span><h2>Инструменты</h2><p>Рабочие модули сгруппированы по задаче. Открыт только выбранный инструмент, остальные не перегружают экран.</p></div><small>ТОЛЬКО ЧТЕНИЕ</small></header>
  <section className={"v3-pro-tools__focus"+(catalogOpen?" is-catalog-open":" is-focused")}>
   <div><span>СЕЙЧАС</span><strong>{selected?.label??"Инструмент"}</strong><p>{selected?.hero}</p></div>
   <button type="button" onClick={()=>setCatalogOpen(open=>!open)}>{catalogOpen?"Скрыть выбор":"Сменить инструмент"}</button>
  </section>
  {catalogOpen&&<div className="v3-pro-tools__groups">
   {groups.map(group=><section key={group.id}><header>{group.label}</header><nav aria-label={group.label}>{group.items.map(item=><button key={item.id} type="button" className={tool===item.id?"is-active":""} aria-pressed={tool===item.id} onClick={()=>{setTool(item.id);setCatalogOpen(false);window.requestAnimationFrame(()=>document.querySelector(".v3-pro-tools__stage")?.scrollIntoView({block:"nearest",behavior:"auto"}))}}><strong>{item.label}</strong><small>{item.note}</small><i aria-hidden="true">{tool===item.id?"●":"›"}</i></button>)}</nav></section>)}
  </div>}
  <div className="v3-pro-tools__stage">
   {tool==="rebalance"&&<Suspense fallback={<ToolLoading label="Открываем ребалансировку…"/>}><V3RebalanceWorkspace positions={positions}/></Suspense>}
   {tool==="lab"&&<Suspense fallback={<ToolLoading label="Открываем лабораторию…"/>}><V3PortfolioLab positions={positions}/></Suspense>}
   {tool==="market"&&<Suspense fallback={<ToolLoading label="Открываем рыночную аналитику…"/>}><V3MarketIntelligenceWorkspace positions={positions}/></Suspense>}
   {tool==="futures"&&<V3FuturesScenario positions={positions}/>}
   {tool==="report"&&<Suspense fallback={<ToolLoading label="Открываем отчёт…"/>}><V3PortfolioReportDepth positions={positions}/></Suspense>}
  </div>
 </section>;
}
