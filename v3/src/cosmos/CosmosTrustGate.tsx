type GateKind="assets"|"analysis"|"income";

const COPY:Record<GateKind,{code:string;title:string;lead:string;label:string}>={
 assets:{code:"FORMATION // 02",title:"Строй закрыт",lead:"Состав появится только после подтверждённого снимка портфеля.",label:"PORTFOLIO ROSTER"},
 analysis:{code:"TACTICAL // 03",title:"Матрица закрыта",lead:"Риск и доходность не строятся без подтверждённой истории.",label:"RISK MATRIX"},
 income:{code:"TREASURY // 04",title:"Поток закрыт",lead:"Купоны и дивиденды не заменяются расчётными значениями.",label:"CASH FLOW"}
};

function AssetsDeck(){
 return <div className="cos-gate__modules cos-gate__modules--assets" aria-label="Модули портфеля">
  <article className="cos-module cos-module--allocation">
   <header><i>01</i><span>РАСПРЕДЕЛЕНИЕ</span></header>
   <div className="cos-allocation-orbit" aria-hidden="true"><b>—</b><i/><i/><i/></div>
   <footer><span>Акции</span><span>Облигации</span><span>Прочее</span></footer>
  </article>
  <article className="cos-module cos-module--holdings">
   <header><i>02</i><span>ПОЗИЦИИ</span><b>—</b></header>
   <div className="cos-holding-rows" aria-hidden="true"><i/><i/><i/></div>
   <small>веса · P/L · доля</small>
  </article>
  <article className="cos-module cos-module--concentration">
   <header><i>03</i><span>КОНЦЕНТРАЦИЯ</span></header>
   <div className="cos-concentration-bars" aria-hidden="true"><i/><i/><i/></div>
   <footer><span>HHI</span><b>—</b><span>TOP-3</span><b>—</b></footer>
  </article>
  <article className="cos-module cos-module--asset-intel">
   <header><i>04</i><span>КАРТОЧКА АКТИВА</span></header>
   <svg viewBox="0 0 120 34" aria-hidden="true"><path d="M2 27 C18 24 24 16 37 19 S58 29 69 18 S91 8 118 10"/></svg>
   <small>история · доход · риск</small>
  </article>
 </div>;
}

function AnalysisDeck(){
 return <div className="cos-gate__modules cos-gate__modules--analysis" aria-label="Модули аналитики">
  <article className="cos-module cos-module--performance">
   <header><i>01</i><span>ДОХОДНОСТЬ</span><b>—</b></header>
   <svg viewBox="0 0 180 48" aria-hidden="true"><path className="cos-chart-grid" d="M0 12H180M0 24H180M0 36H180"/><path className="cos-chart-line" d="M2 37 C20 34 31 18 49 23 S77 40 96 25 S128 10 145 17 S163 12 178 8"/></svg>
   <footer><span>TWR</span><span>XIRR</span><span>CAGR</span></footer>
  </article>
  <article className="cos-module cos-module--risk">
   <header><i>02</i><span>РИСК</span></header>
   <div className="cos-risk-arc" aria-hidden="true"><b>—</b><i/></div>
   <footer><span>Max DD</span><span>VaR</span><span>CVaR</span></footer>
  </article>
  <article className="cos-module cos-module--benchmark">
   <header><i>03</i><span>IMOEX</span></header>
   <div className="cos-benchmark-track" aria-hidden="true"><i/><b/><span/></div>
   <footer><span>относительная</span><b>—</b></footer>
  </article>
  <article className="cos-module cos-module--correlation">
   <header><i>04</i><span>СВЯЗИ</span></header>
   <div className="cos-correlation-matrix" aria-hidden="true">{Array.from({length:16},(_,i)=><i key={i}/>)}</div>
   <small>корреляции · HHI</small>
  </article>
 </div>;
}

function IncomeDeck(){
 return <div className="cos-gate__modules cos-gate__modules--income" aria-label="Модули дохода">
  <article className="cos-module cos-module--cashflow">
   <header><i>01</i><span>ПОТОК</span><b>—</b></header>
   <svg viewBox="0 0 180 48" aria-hidden="true"><path className="cos-flow-area" d="M0 42 L0 35 L22 30 L44 34 L66 20 L88 25 L110 15 L132 21 L154 9 L180 14 L180 42 Z"/><path className="cos-flow-line" d="M0 35 L22 30 L44 34 L66 20 L88 25 L110 15 L132 21 L154 9 L180 14"/></svg>
   <footer><span>купоны</span><span>дивиденды</span></footer>
  </article>
  <article className="cos-module cos-module--calendar">
   <header><i>02</i><span>КАЛЕНДАРЬ</span></header>
   <div className="cos-calendar-grid" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>
   <small>12 месяцев · события</small>
  </article>
  <article className="cos-module cos-module--sources">
   <header><i>03</i><span>ИСТОЧНИКИ</span></header>
   <div className="cos-source-bars" aria-hidden="true"><i/><i/><i/></div>
   <small>вклад бумаг</small>
  </article>
  <article className="cos-module cos-module--coverage">
   <header><i>04</i><span>ПОКРЫТИЕ</span></header>
   <div className="cos-coverage-ring" aria-hidden="true"><b>—</b><i/></div>
   <small>подтверждено источником</small>
  </article>
 </div>;
}

function GateDeck({kind}:{kind:GateKind}){
 if(kind==="assets")return <AssetsDeck/>;
 if(kind==="analysis")return <AnalysisDeck/>;
 return <IncomeDeck/>;
}

export function CosmosTrustGate({kind,onRefresh,refreshing=false}:{kind:GateKind;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
 const x=COPY[kind];
 return <main className={"cos-gate cos-gate--"+kind} aria-label={x.title}>
  <section className="cos-gate__scene">
   <div className="cos-gate__stars" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
   <header className="cos-gate__scene-head"><span>{x.code}</span><b>{x.label}</b></header>
   <div className="cos-gate__instrument" aria-hidden="true">
    {kind==="assets"?<div className="cos-formation"><i/><i/><i/><i/><span/><span/><b>陣</b></div>:kind==="analysis"?<div className="cos-radar"><i/><i/><i/><span/><b>眼</b></div>:<div className="cos-flow"><i/><i/><i/><span/><b>禄</b></div>}
   </div>
   <GateDeck kind={kind}/>
  </section>
  <section className="cos-gate__panel">
   <div className="cos-gate__chapter"><span>{x.code}</span><b>{x.label}</b></div>
   <header><span>DATA GATE // FAIL-CLOSED</span><strong>{x.title}</strong><p>{x.lead}</p></header>
   <div className="cos-gate__source"><i>●</i><span>Источник не подтверждён · значения не подставляются</span></div>
   <button type="button" onClick={()=>void onRefresh?.()} disabled={refreshing||!onRefresh}>{refreshing?"СИНХРОНИЗАЦИЯ…":"ПРОВЕРИТЬ ИСТОЧНИК"}</button>
  </section>
 </main>;
}
