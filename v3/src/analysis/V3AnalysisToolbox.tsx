import{lazy,Suspense,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{V3FuturesScenario}from"../terminal/V3FuturesScenario";
import"../styles/proTools.css";

const V3RebalanceWorkspace=lazy(()=>import("./V3RebalanceWorkspace").then(m=>({default:m.V3RebalanceWorkspace})));
const V3PortfolioLab=lazy(()=>import("./V3PortfolioLab").then(m=>({default:m.V3PortfolioLab})));
const V3FallenAssetsDiscovery=lazy(()=>import("./V3FallenAssetsDiscovery").then(m=>({default:m.V3FallenAssetsDiscovery})));
const V3MarketScreener=lazy(()=>import("./V3MarketScreener").then(m=>({default:m.V3MarketScreener})));

type ToolId="rebalance"|"lab"|"discovery"|"screener"|"futures";
const TOOLS:Array<{id:ToolId;label:string;note:string}>=[
 {id:"rebalance",label:"Ребаланс",note:"цель · drift · сценарий"},
 {id:"lab",label:"Лаборатория",note:"история стратегий"},
 {id:"discovery",label:"Просадки",note:"high · low · SMA"},
 {id:"screener",label:"Скринер",note:"MOEX · TQBR"},
 {id:"futures",label:"Фьючерсы",note:"WHAT IF · basis · ГО"},
];

export function V3AnalysisToolbox({positions}:{positions:PositionSnapshot[]}){
 const[tool,setTool]=useState<ToolId>("rebalance");
 return <section className="v3-pro-tools" aria-label="Профессиональные инструменты аналитики">
  <header><div><span>PRO TOOLBOX</span><h2>Инструменты</h2><p>Один вход в глубокие рабочие модули вместо длинной цепочки отдельных разделов.</p></div><small>READ-ONLY</small></header>
  <nav className="v3-pro-tools__nav" aria-label="Выбор инструмента">{TOOLS.map(item=><button key={item.id} type="button" className={tool===item.id?"is-active":""} aria-pressed={tool===item.id} onClick={()=>setTool(item.id)}><strong>{item.label}</strong><small>{item.note}</small></button>)}</nav>
  <div className="v3-pro-tools__stage">
   {tool==="rebalance"&&<Suspense fallback={<div className="v3-pro-tools__loading">Открываем ребалансировку…</div>}><V3RebalanceWorkspace positions={positions}/></Suspense>}
   {tool==="lab"&&<Suspense fallback={<div className="v3-pro-tools__loading">Открываем лабораторию…</div>}><V3PortfolioLab positions={positions}/></Suspense>}
   {tool==="discovery"&&<Suspense fallback={<div className="v3-pro-tools__loading">Открываем технический discovery…</div>}><V3FallenAssetsDiscovery/></Suspense>}
   {tool==="screener"&&<Suspense fallback={<div className="v3-pro-tools__loading">Открываем рыночный скринер…</div>}><V3MarketScreener/></Suspense>}
   {tool==="futures"&&<V3FuturesScenario/>}
  </div>
 </section>;
}
