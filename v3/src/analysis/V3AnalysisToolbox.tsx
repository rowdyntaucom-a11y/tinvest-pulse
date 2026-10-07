import{lazy,Suspense,useEffect,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import"../styles/proTools.css";
import"../styles/proToolsWorkspaceV100.css";

const V3RebalanceWorkspace=lazy(()=>import("./V3RebalanceWorkspace").then(m=>({default:m.V3RebalanceWorkspace})));
const V3PortfolioLab=lazy(()=>import("./V3PortfolioLab").then(m=>({default:m.V3PortfolioLab})));
const V3MarketIntelligenceWorkspace=lazy(()=>import("./V3MarketIntelligenceWorkspace").then(m=>({default:m.V3MarketIntelligenceWorkspace})));
const V3BondIntelligenceWorkspace=lazy(()=>import("./V3BondIntelligenceWorkspace").then(m=>({default:m.V3BondIntelligenceWorkspace})));
const V3PortfolioReportDepth=lazy(()=>import("../report/V3PortfolioReportDepth").then(m=>({default:m.V3PortfolioReportDepth})));
const V3FuturesScenario=lazy(()=>import("../terminal/V3FuturesScenario").then(m=>({default:m.V3FuturesScenario})));

type ToolId="rebalance"|"bonds"|"lab"|"market"|"futures"|"report";
type ToolDef={id:ToolId;label:string;note:string;group:"portfolio"|"scenario";hero:string};
const STORAGE_KEY="qvanix-pro-tools-v100";
const TOOLS:ToolDef[]=[
 {id:"rebalance",label:"Ребаланс",note:"цель · отклонение · сценарий",group:"portfolio",hero:"Проверить отклонение структуры и смоделировать выравнивание без заявок."},
 {id:"bonds",label:"Облигации",note:"сроки · эмитенты · купоны",group:"portfolio",hero:"Разобрать облигационную часть по срокам, эмитентам, валютам и подтверждённым характеристикам выпусков."},
 {id:"report",label:"Отчёт",note:"классы · валюты · P/L",group:"portfolio",hero:"Собрать состав, валюты и накопленный результат в одном отчёте только для чтения."},
 {id:"lab",label:"Лаборатория",note:"история стратегий",group:"scenario",hero:"Сравнить сценарии на подтверждённой истории без подмены результата прогнозом."},
 {id:"futures",label:"Фьючерсы",note:"сценарий · базис · ГО",group:"scenario",hero:"Посчитать сценарий фьючерса, базис и нагрузку ГО без отправки приказов брокеру."},
 {id:"market",label:"Рынок",note:"пульс · скринер · история",group:"scenario",hero:"Открыть публичный рыночный контекст и историю без торговых сигналов."},
];
const TERMS=[
 {term:"Drift",copy:"Отклонение текущей доли класса или позиции от выбранной целевой доли."},
 {term:"YTM",copy:"Доходность облигации к погашению. QVANIX не вычисляет её, если источник не передал достаточный подтверждённый денежный поток."},
 {term:"Basis / базис",copy:"Разница между ценой фьючерса и базовым активом в выбранный момент."},
 {term:"ГО",copy:"Гарантийное обеспечение: сумма, которую биржа требует под фьючерсную позицию; это не стоимость контракта."},
 {term:"WHAT IF",copy:"Сценарный расчёт: показывает результат заданного пользователем допущения, а не прогноз рынка."},
]as const;

function isToolId(value:unknown):value is ToolId{return typeof value==="string"&&TOOLS.some(item=>item.id===value)}
function readStoredTool(includeMarket:boolean):ToolId{try{const value=sessionStorage.getItem(STORAGE_KEY);return isToolId(value)&&(includeMarket||value!=="market")?value:"rebalance"}catch{return"rebalance"}}
function writeStoredTool(value:ToolId){try{sessionStorage.setItem(STORAGE_KEY,value)}catch{}}
function ToolLoading({label}:{label:string}){return <div className="v3-pro-tools__loading" aria-live="polite"><i/><div><strong>{label}</strong><small>Модуль подключается к текущим подтверждённым данным.</small><span aria-hidden="true"><b/><b/><b/></span></div></div>}

export function V3AnalysisToolbox({positions,includeMarket=true}:{positions:PositionSnapshot[];includeMarket?:boolean}){
 const initial=()=>readStoredTool(includeMarket);
 const[tool,setTool]=useState<ToolId>(initial),[visited,setVisited]=useState<Set<ToolId>>(()=>new Set([initial()]));
 const[catalogOpen,setCatalogOpen]=useState(false),[glossaryOpen,setGlossaryOpen]=useState(false);
 const tools=useMemo(()=>includeMarket?TOOLS:TOOLS.filter(item=>item.id!=="market"),[includeMarket]);
 useEffect(()=>{if(tools.some(item=>item.id===tool))return;const fallback=tools[0]?.id??"rebalance";setTool(fallback);setVisited(previous=>{const next=new Set(previous);next.add(fallback);return next});writeStoredTool(fallback)},[tool,tools]);
 const selected=tools.find(item=>item.id===tool)??tools[0];
 const groups=[
  {id:"portfolio",label:"Управление портфелем",items:tools.filter(item=>item.group==="portfolio")},
  {id:"scenario",label:"Сценарии и исследование",items:tools.filter(item=>item.group==="scenario")},
 ] as const;
 const selectTool=(id:ToolId)=>{setTool(id);writeStoredTool(id);setVisited(previous=>{const next=new Set(previous);next.add(id);return next});setCatalogOpen(false);window.requestAnimationFrame(()=>document.querySelector(".v3-pro-tools__stage")?.scrollIntoView({block:"nearest",behavior:"auto"}))};
 const renderTool=(id:ToolId)=>id==="rebalance"?<V3RebalanceWorkspace positions={positions}/>:id==="bonds"?<V3BondIntelligenceWorkspace positions={positions}/>:id==="lab"?<V3PortfolioLab positions={positions}/>:id==="market"?<V3MarketIntelligenceWorkspace positions={positions}/>:id==="futures"?<V3FuturesScenario positions={positions}/>:<V3PortfolioReportDepth positions={positions}/>;
 const loadingLabel=(id:ToolId)=>id==="rebalance"?"Открываем ребалансировку…":id==="bonds"?"Открываем облигационный контур…":id==="lab"?"Открываем лабораторию…":id==="market"?"Открываем рыночную аналитику…":id==="futures"?"Открываем сценарий фьючерса…":"Открываем отчёт…";
 return <section className="v3-pro-tools" aria-label="Профессиональные инструменты аналитики">
  <header><div><span>ПРОФЕССИОНАЛЬНЫЕ ИНСТРУМЕНТЫ</span><h2>Инструменты</h2><p>Рабочие модули сгруппированы по задаче. Тяжёлый инструмент подключается только при первом открытии, а его локальное состояние сохраняется при переключении.</p></div><small role="status">ТОЛЬКО ЧТЕНИЕ</small></header>
  <section className="v3-pro-tools__glossary" aria-label="Глоссарий профессиональных инструментов"><button type="button" aria-expanded={glossaryOpen} aria-controls="qvanix-tools-glossary" aria-label={glossaryOpen?"Скрыть глоссарий терминов":"Открыть глоссарий терминов"} onClick={()=>setGlossaryOpen(open=>!open)}><span>Что означают термины на этой странице</span><strong>{glossaryOpen?"Скрыть":"Открыть глоссарий"}</strong></button>{glossaryOpen&&<div id="qvanix-tools-glossary">{TERMS.map(item=><article key={item.term}><strong>{item.term}</strong><p>{item.copy}</p></article>)}</div>}</section>
  <section className={"v3-pro-tools__focus"+(catalogOpen?" is-catalog-open":" is-focused")} aria-label="Текущий выбранный инструмент">
   <div><span>СЕЙЧАС</span><strong>{selected?.label??"Инструмент"}</strong><p>{selected?.hero}</p></div>
   <button type="button" aria-expanded={catalogOpen} aria-controls="qvanix-tool-catalog" aria-label={catalogOpen?"Скрыть каталог инструментов":"Открыть каталог инструментов"} onClick={()=>setCatalogOpen(open=>!open)}>{catalogOpen?"Скрыть выбор":"Сменить инструмент"}</button>
  </section>
  {catalogOpen&&<div className="v3-pro-tools__groups" id="qvanix-tool-catalog" aria-label="Каталог аналитических инструментов">
   {groups.map(group=><section key={group.id}><header>{group.label}</header><nav aria-label={group.label}>{group.items.map(item=><button key={item.id} type="button" className={tool===item.id?"is-active":""} aria-pressed={tool===item.id} aria-label={item.label+": "+item.note} onClick={()=>selectTool(item.id)}><strong>{item.label}</strong><small>{item.note}</small><i aria-hidden="true">{tool===item.id?"●":"›"}</i></button>)}</nav></section>)}
  </div>}
  <div className="v3-pro-tools__stage" aria-live="polite" aria-label="Рабочая область выбранного инструмента">
   {tools.filter(item=>visited.has(item.id)).map(item=><div className="v3-pro-tools__stage-pane" data-tool={item.id} hidden={tool!==item.id} aria-hidden={tool!==item.id} aria-label={item.label} key={item.id}><Suspense fallback={<ToolLoading label={loadingLabel(item.id)}/>}>{renderTool(item.id)}</Suspense></div>)}
  </div>
 </section>;
}
