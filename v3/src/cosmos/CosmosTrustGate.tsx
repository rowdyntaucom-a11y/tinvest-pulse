type GateKind="assets"|"analysis"|"income";
const COPY:Record<GateKind,{code:string;title:string;lead:string;label:string}>={
 assets:{code:"FORMATION // 02",title:"Строй закрыт",lead:"Состав появится только после подтверждённого снимка портфеля.",label:"PORTFOLIO ROSTER"},
 analysis:{code:"TACTICAL // 03",title:"Матрица закрыта",lead:"Риск и доходность не строятся без подтверждённой истории.",label:"RISK MATRIX"},
 income:{code:"TREASURY // 04",title:"Поток закрыт",lead:"Купоны и дивиденды не заменяются расчётными значениями.",label:"CASH FLOW"}
};

export function CosmosTrustGate({kind,onRefresh,refreshing=false}:{kind:GateKind;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
 const x=COPY[kind];
 return <main className={"cos-gate cos-gate--"+kind} aria-label={x.title}>
  <section className="cos-gate__scene">
   <div className="cos-gate__stars" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
  </section>
  <section className="cos-gate__instrument" aria-hidden="true">
   {kind==="assets"?<div className="cos-formation"><i/><i/><i/><i/><span/><span/><b>陣</b></div>:kind==="analysis"?<div className="cos-radar"><i/><i/><i/><span/><b>眼</b></div>:<div className="cos-flow"><i/><i/><i/><span/><b>禄</b></div>}
  </section>
  <section className="cos-gate__panel">
   <div className="cos-gate__chapter"><span>{x.code}</span><b>{x.label}</b></div>
   <header><span>DATA GATE // FAIL-CLOSED</span><strong>{x.title}</strong><p>{x.lead}</p></header>
   <div className="cos-gate__route">
    <article><i>01</i><b>Источник</b><span>получить снимок</span></article>
    <article><i>02</i><b>Проверка</b><span>проверить покрытие</span></article>
    <article><i>03</i><b>Открытие</b><span>показать данные</span></article>
   </div>
   <button type="button" onClick={()=>void onRefresh?.()} disabled={refreshing||!onRefresh}>{refreshing?"СИНХРОНИЗАЦИЯ…":"ПРОВЕРИТЬ ИСТОЧНИК"}</button>
  </section>
 </main>;
}
