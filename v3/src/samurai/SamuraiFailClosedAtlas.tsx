export type SamuraiFailClosedKind="home"|"assets"|"analysis"|"income";

const COPY:Record<SamuraiFailClosedKind,{code:string;title:string;subtitle:string;glyph:string}>={
 home:{code:"PORTFOLIO // PREVIEW",title:"История и результат",subtitle:"Архитектура доступна, финансовые значения ждут подтверждения",glyph:"始"},
 assets:{code:"FORMATION // PREVIEW",title:"Активы и структура",subtitle:"Состав, операции, события, отрасли, облигации и drill-down",glyph:"陣"},
 analysis:{code:"TACTICAL // PREVIEW",title:"Аналитика портфеля",subtitle:"Доходность, риск, структура и рынок",glyph:"眼"},
 income:{code:"TREASURY // PREVIEW",title:"Доход и выплаты",subtitle:"Календарь, факт и концентрация источников",glyph:"禄"}
};

function EmptyMetric({label,note}:{label:string;note:string}){
 return <div className="sam-offline-metric"><span>{label}</span><strong>—</strong><small>{note}</small></div>;
}

function HomePreview(){
 return <div className="sam-offline-atlas__body sam-offline-atlas__body--home">
  <section className="sam-offline-history">
   <div className="sam-offline-history__metrics">
    <EmptyMetric label="TWR" note="стратегия"/>
    <EmptyMetric label="XIRR" note="с потоками"/>
    <EmptyMetric label="IMOEX" note="тот же период"/>
   </div>
   <div className="sam-offline-history__chart" aria-hidden="true">
    <svg viewBox="0 0 320 112" preserveAspectRatio="none">
     <polyline points="0,80 38,72 76,75 114,58 152,62 190,43 228,48 270,30 320,36"/>
     <polyline points="0,86 38,78 76,82 114,71 152,66 190,62 228,55 270,51 320,44"/>
    </svg>
    <i/><b>資</b>
   </div>
   <footer><span>Портфель</span><i/><span>IMOEX</span><i/><small>график откроется после подтверждения истории</small></footer>
  </section>
  <div className="sam-offline-atlas__chapters">
   <article><i>壱</i><span><b>История</b><small>периоды · benchmark · excess</small></span></article>
   <article><i>弐</i><span><b>Метрики</b><small>TWR · XIRR · CAGR</small></span></article>
   <article><i>参</i><span><b>Доход</b><small>купоны · дивиденды</small></span></article>
   <article><i>肆</i><span><b>Состав</b><small>позиции · концентрация</small></span></article>
  </div>
 </div>;
}

function AssetsPreview(){
 return <div className="sam-offline-atlas__body sam-offline-atlas__body--assets">
  <section className="sam-offline-formation">
   <div className="sam-offline-formation__shield" aria-hidden="true"><i/><i/><i/><b>陣</b><span>TOP-3 —</span></div>
   <div className="sam-offline-formation__rows">
    <article><i>壱</i><span><b>Состав</b><small>позиции · веса · стоимость</small></span><em/></article>
    <article><i>弐</i><span><b>Классы</b><small>акции · облигации · фонды</small></span><em/></article>
    <article><i>参</i><span><b>Отрасли</b><small>покрытие метаданных</small></span><em/></article>
    <article><i>肆</i><span><b>Облигации</b><small>сроки · эмитенты · купоны</small></span><em/></article>
    <article><i>伍</i><span><b>Карточка актива</b><small>P/L · риск · история</small></span><em/></article>
   </div>
  </section>
 </div>;
}

function AnalysisPreview(){
 return <div className="sam-offline-atlas__body sam-offline-atlas__body--analysis">
  <section className="sam-offline-scope">
   <div className="sam-offline-scope__radar" aria-hidden="true"><i/><i/><i/><i/><span/><b>眼</b></div>
   <div className="sam-offline-scope__metrics">
    <EmptyMetric label="TWR" note="доходность"/>
    <EmptyMetric label="MAX DD" note="просадка"/>
    <EmptyMetric label="VaR / CVaR" note="хвостовой риск"/>
    <EmptyMetric label="BETA" note="рынок"/>
   </div>
  </section>
  <div className="sam-offline-atlas__chapters is-analysis">
   <article><i>壱</i><span><b>Доходность</b><small>TWR · Sharpe · Sortino · rolling</small></span></article>
   <article><i>弐</i><span><b>Риск</b><small>DD · vol · VaR/CVaR · стресс</small></span></article>
   <article><i>参</i><span><b>Структура</b><small>HHI · effective positions · bonds</small></span></article>
   <article><i>肆</i><span><b>Рынок</b><small>IMOEX · beta · corr · TE · IR</small></span></article>
  </div>
 </div>;
}

function IncomePreview(){
 return <div className="sam-offline-atlas__body sam-offline-atlas__body--income">
  <section className="sam-offline-treasury">
   <div className="sam-offline-treasury__summary">
    <EmptyMetric label="Получено" note="фактические выплаты"/>
    <EmptyMetric label="12M вперёд" note="только расписание"/>
   </div>
   <div className="sam-offline-treasury__calendar" aria-hidden="true">
    {["О","Н","Д","Я","Ф","М","А","М","И","И","А","С"].map((m,i)=><span key={m+i}><b>{m}</b><i style={{height:(10+(i%4)*8)+"px"}}/></span>)}
   </div>
   <div className="sam-offline-treasury__flow" aria-hidden="true"><i/><i/><i/><i/><b>禄</b></div>
  </section>
  <div className="sam-offline-atlas__chapters">
   <article><i>壱</i><span><b>Календарь</b><small>даты · статус · источник</small></span></article>
   <article><i>弐</i><span><b>Факт</b><small>купоны · дивиденды · месяцы</small></span></article>
   <article><i>参</i><span><b>Источники</b><small>концентрация пассивного дохода</small></span></article>
  </div>
 </div>;
}

export function SamuraiFailClosedAtlas({kind}:{kind:SamuraiFailClosedKind}){
 const x=COPY[kind];
 return <section className={"sam-offline-atlas sam-offline-atlas--"+kind} aria-label={x.title}>
  <header className="sam-offline-atlas__head">
   <div><span>{x.code}</span><strong>{x.title}</strong><small>{x.subtitle}</small></div>
   <i aria-hidden="true">{x.glyph}</i>
  </header>
  {kind==="home"?<HomePreview/>:kind==="assets"?<AssetsPreview/>:kind==="analysis"?<AnalysisPreview/>:<IncomePreview/>}
  <footer className="sam-offline-atlas__status"><span>DATA LOCK</span><i/><small>«—» означает: функция есть, но значение не подтверждено источником</small></footer>
 </section>;
}
