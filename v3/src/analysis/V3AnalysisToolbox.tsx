import{lazy,Suspense,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{FACTUAL_TOOLS,FACTUAL_TOOL_STORAGE_KEY,resolveFactualToolId,type FactualToolId}from"./factualToolsV252.ts";
import"../styles/proTools.css";
import"../styles/proToolsWorkspaceV100.css";

const V3BondIntelligenceWorkspace=lazy(()=>import("./V3BondIntelligenceWorkspace").then(m=>({default:m.V3BondIntelligenceWorkspace})));
const V3PortfolioReportDepth=lazy(()=>import("../report/V3PortfolioReportDepth").then(m=>({default:m.V3PortfolioReportDepth})));

function readStoredTool():FactualToolId{
 try{return resolveFactualToolId(sessionStorage.getItem(FACTUAL_TOOL_STORAGE_KEY))}catch{return"bonds"}
}
function writeStoredTool(id:FactualToolId){
 try{sessionStorage.setItem(FACTUAL_TOOL_STORAGE_KEY,id)}catch{}
}
function ToolLoading({label}:{label:string}){
 return <div className="v3-pro-tools__loading" aria-live="polite"><i/><div><strong>{label}</strong><small>Модуль подключается к текущим подтверждённым данным.</small><span aria-hidden="true"><b/><b/><b/></span></div></div>;
}

/** No WHAT IF, target-weight simulator or hypothetical futures tool in portfolio reporting. */
export function V3AnalysisToolbox({positions}:{positions:PositionSnapshot[]}){
 const[tool,setTool]=useState<FactualToolId>(readStoredTool);
 const[visited,setVisited]=useState<Set<FactualToolId>>(()=>new Set([readStoredTool()]));
 const selectTool=(id:FactualToolId)=>{setTool(id);writeStoredTool(id);setVisited(previous=>{const next=new Set(previous);next.add(id);return next})};
 return <section className="v3-pro-tools v3-factual-tools-v252" aria-label="Проверенные данные по портфелю">
  <header><div><span>СОСТАВ И ДОКУМЕНТЫ</span><h2>Облигации и отчёт</h2><p>Только данные портфеля и доступные характеристики бумаг. Без искусственных прогнозов и сценариев.</p></div><small role="status">ТОЛЬКО ПРОСМОТР</small></header>
  <nav className="v3-factual-tools__nav" aria-label="Данные и отчёты">
   {FACTUAL_TOOLS.map(item=><button type="button" key={item.id} aria-pressed={tool===item.id} className={tool===item.id?"is-active":""} onClick={()=>selectTool(item.id)}>
    <strong>{item.label}</strong><small>{item.note}</small>
   </button>)}
  </nav>
  <p className="v3-factual-tools__description">{FACTUAL_TOOLS.find(item=>item.id===tool)?.hero}</p>
  <div className="v3-pro-tools__stage" aria-label="Данные выбранного раздела">
   {FACTUAL_TOOLS.filter(item=>visited.has(item.id)).map(item=><div className="v3-pro-tools__stage-pane" data-tool={item.id} hidden={tool!==item.id} aria-hidden={tool!==item.id} aria-label={item.label} key={item.id}>
    <Suspense fallback={<ToolLoading label={item.id==="bonds"?"Открываем облигации…":"Открываем отчёт…"}/>}>
     {item.id==="bonds"?<V3BondIntelligenceWorkspace positions={positions}/>:<V3PortfolioReportDepth positions={positions}/>}
    </Suspense>
   </div>)}
  </div>
 </section>;
}
