import{Fragment,type ReactNode,useRef,useState}from"react";

export type SamuraiFailClosedKind="home"|"assets"|"analysis"|"income";
type AtlasDestination="assets"|"analysis"|"income";
type AtlasChapter={
 id:string;
 code:string;
 label:string;
 note:string;
 detail:string;
 source:string;
 destination?:AtlasDestination;
 targetId?:string;
};

const COPY:Record<SamuraiFailClosedKind,{code:string;title:string;subtitle:string;glyph:string}>={
 home:{code:"PORTFOLIO // PREVIEW",title:"История и результат",subtitle:"Архитектура доступна, финансовые значения ждут подтверждения",glyph:"始"},
 assets:{code:"FORMATION // PREVIEW",title:"Активы и структура",subtitle:"Состав, операции, события, отрасли, облигации и drill-down",glyph:"陣"},
 analysis:{code:"TACTICAL // PREVIEW",title:"Аналитика портфеля",subtitle:"Доходность, риск, структура и рынок",glyph:"眼"},
 income:{code:"TREASURY // PREVIEW",title:"Доход и выплаты",subtitle:"Календарь, факт и концентрация источников",glyph:"禄"}
};

const CHAPTERS:Record<SamuraiFailClosedKind,AtlasChapter[]>={
 home:[
  {id:"history",code:"壱",label:"История",note:"периоды · benchmark · excess",detail:"История портфеля, общий период сравнения и относительный результат к рынку.",source:"Подтверждённые TWR-точки и рыночный benchmark.",destination:"analysis"},
  {id:"metrics",code:"弐",label:"Метрики",note:"TWR · XIRR · CAGR",detail:"Сводная доходность портфеля с разделением time-weighted и money-weighted методик.",source:"История стоимости, внешние денежные потоки и валидные даты.",destination:"analysis"},
  {id:"income",code:"参",label:"Доход",note:"купоны · дивиденды",detail:"Фактически полученные выплаты и отдельный слой подтверждённого будущего расписания.",source:"Операции брокера и подтверждённое расписание выплат.",destination:"income"},
  {id:"composition",code:"肆",label:"Состав",note:"позиции · концентрация",detail:"Текущий состав, веса, концентрация и переход к глубокой карточке инструмента.",source:"Подтверждённый снимок портфеля и метаданные инструментов.",destination:"assets"},
 ],
 assets:[
  {id:"positions",code:"壱",label:"Состав",note:"позиции · веса · стоимость",detail:"Текущие позиции, вес каждой бумаги и подтверждённая стоимость.",source:"Broker portfolio snapshot."},
  {id:"classes",code:"弐",label:"Классы",note:"акции · облигации · фонды",detail:"Разделение капитала по нормализованным типам инструментов.",source:"Тип инструмента из подтверждённых метаданных."},
  {id:"sectors",code:"参",label:"Отрасли",note:"покрытие метаданных",detail:"Отраслевой разрез с явным показателем покрытия классификации.",source:"Проверенные sector-метаданные; неизвестное не угадывается."},
  {id:"bonds",code:"肆",label:"Облигации",note:"сроки · эмитенты · купоны",detail:"Сроки, параметры выпуска и подтверждённые купонные характеристики облигаций.",source:"Метаданные облигаций и расписание выплат."},
  {id:"asset",code:"伍",label:"Карточка актива",note:"P/L · риск · история",detail:"Drill-down конкретной позиции: broker P/L, история, риск и события.",source:"Позиция, метаданные и ценовая история инструмента."},
  {id:"operations",code:"陸",label:"Операции",note:"сделки · потоки · выплаты",detail:"Исполненные брокерские события с фильтрами по типам операций.",source:"Broker operations journal."},
  {id:"integrity",code:"漆",label:"Целостность",note:"покрытие · события · corporate actions",detail:"Проверки покрытия, идентификаторов, дубликатов и расхождений агрегатов.",source:"Операционный журнал и отдельные source-gates корпоративных действий."},
  {id:"report",code:"捌",label:"Отчёт",note:"стоимость · база · broker P/L",detail:"Текущая стоимость, cost basis и broker P/L с явной сверкой.",source:"Подтверждённые позиции и broker expectedYield."},
  {id:"categories",code:"玖",label:"Категории",note:"классы · доли · результат",detail:"Разрез стоимости, базы и результата по классам активов.",source:"Нормализованные типы инструментов."},
  {id:"currencies",code:"拾",label:"Валюты",note:"покрытие · подтверждённый срез",detail:"Валютная структура только там, где валюта подтверждена метаданными.",source:"Валюта инструмента; RUB не подставляется автоматически."},
 ],
 analysis:[
  {id:"return",code:"壱",label:"Доходность",note:"TWR · Sharpe · Sortino · rolling",detail:"Доходность и риск-скорректированные метрики на одной проверенной истории.",source:"Валидная TWR-история и risk-free контекст."},
  {id:"risk",code:"弐",label:"Риск",note:"DD · vol · VaR/CVaR · стресс",detail:"Просадка, волатильность, tail-risk и стрессовые диагностические срезы.",source:"Подтверждённая история портфеля достаточной длины."},
  {id:"structure",code:"参",label:"Структура",note:"HHI · effective positions · bonds",detail:"Концентрация, эффективное число позиций и облигационный слой.",source:"Подтверждённый текущий состав."},
  {id:"market",code:"肆",label:"Рынок",note:"IMOEX · beta · corr · TE · IR",detail:"Сопоставление портфеля и рынка на общей выборке дат.",source:"История портфеля и подтверждённый IMOEX за тот же период."},
  {id:"rebalance",code:"伍",label:"Ребалансировка",note:"цель · drift · сценарная дельта классов",detail:"Пользовательская цель и детерминированные сценарии изменения долей классов.",source:"Текущий состав и цель, введённая самим пользователем."},
  {id:"lab",code:"陸",label:"Лаборатория",note:"MCFTR · RGBITR · исторические сценарии",detail:"Сравнение двух пользовательских структур на одной исторической выборке индексов.",source:"MCFTR / RGBITR и текущий подтверждённый snapshot."},
  {id:"fallen",code:"漆",label:"Просадки",note:"high · low · SMA · восстановление",detail:"Технический discovery по подтверждённой истории: drawdown, recovery и расстояние до SMA.",source:"Валидная ценовая история текущих позиций."},
  {id:"screener",code:"捌",label:"Скринер",note:"TQBR · движение · оборот · листинг",detail:"Публичный рыночный фильтр MOEX по наблюдаемым параметрам торгового дня.",source:"MOEX ISS · TQBR. Broker-доступ не требуется.",targetId:"sam-analysis-screener"},
 ],
 income:[
  {id:"calendar",code:"壱",label:"Календарь",note:"даты · статус · источник",detail:"Будущие подтверждённые выплаты текущего портфеля по выбранному горизонту.",source:"Проверенное расписание выплат текущих позиций."},
  {id:"fact",code:"弐",label:"Факт",note:"купоны · дивиденды · месяцы",detail:"Только реально полученные купоны и дивиденды, сгруппированные по времени.",source:"Исполненные доходные операции брокера."},
  {id:"sources",code:"参",label:"Источники",note:"концентрация пассивного дохода",detail:"Какие позиции формируют фактический и будущий поток дохода.",source:"FIGI-связка выплат и текущих позиций."},
  {id:"market",code:"肆",label:"Рынок",note:"дивидендный discovery · отдельно от портфеля",detail:"Отдельный рыночный dividend-discovery, не смешанный с календарём текущего портфеля.",source:"Нужен независимый проверяемый рыночный источник."},
 ],
};

function EmptyMetric({label,note}:{label:string;note:string}){
 return <div className="sam-offline-metric"><span>{label}</span><strong>—</strong><small>{note}</small></div>;
}

function AtlasChapterCard({chapter,selected,onSelect,formation=false}:{chapter:AtlasChapter;selected:boolean;onSelect:(chapter:AtlasChapter)=>void;formation?:boolean}){
 return <article className={selected?"is-selected":""} data-atlas-chapter={chapter.id}>
  <i>{chapter.code}</i><span><b>{chapter.label}</b><small>{chapter.note}</small></span>{formation&&<em/>}
  <button type="button" className="sam-offline-chapter-hit" aria-label={"Открыть превью раздела «"+chapter.label+"»"} aria-expanded={selected} aria-controls="sam-offline-atlas-detail" onClick={()=>onSelect(chapter)}/>
 </article>;
}

type PreviewProps={
 chapters:AtlasChapter[];
 selected:string|null;
 onSelect:(chapter:AtlasChapter)=>void;
 renderDetail:(chapter:AtlasChapter)=>ReactNode;
};

function chapterNodes({chapters,selected,onSelect,renderDetail}:{chapters:AtlasChapter[];selected:string|null;onSelect:(chapter:AtlasChapter)=>void;renderDetail:(chapter:AtlasChapter)=>ReactNode},formation=false){
 return chapters.map(chapter=><Fragment key={chapter.id}>
  <AtlasChapterCard chapter={chapter} selected={selected===chapter.id} onSelect={onSelect} formation={formation}/>
  {selected===chapter.id&&renderDetail(chapter)}
 </Fragment>);
}

function HomePreview({chapters,selected,onSelect,renderDetail}:PreviewProps){
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
  <div className="sam-offline-atlas__chapters">{chapterNodes({chapters,selected,onSelect,renderDetail})}</div>
 </div>;
}

function AssetsPreview({chapters,selected,onSelect,renderDetail}:PreviewProps){
 return <div className="sam-offline-atlas__body sam-offline-atlas__body--assets">
  <section className="sam-offline-formation">
   <div className="sam-offline-formation__shield" aria-hidden="true"><i/><i/><i/><b>陣</b><span>TOP-3 —</span></div>
   <div className="sam-offline-formation__rows">{chapterNodes({chapters,selected,onSelect,renderDetail},true)}</div>
  </section>
 </div>;
}

function AnalysisPreview({chapters,selected,onSelect,renderDetail}:PreviewProps){
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
  <div className="sam-offline-atlas__chapters is-analysis">{chapterNodes({chapters,selected,onSelect,renderDetail})}</div>
 </div>;
}

function IncomePreview({chapters,selected,onSelect,renderDetail}:PreviewProps){
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
  <div className="sam-offline-atlas__chapters">{chapterNodes({chapters,selected,onSelect,renderDetail})}</div>
 </div>;
}

function scrollToTarget(id:string){
 const target=document.getElementById(id);
 if(!target)return;
 const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;
 target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
}

function scrollToSourceRoute(node:HTMLElement|null){
 if(!node)return;
 const root=node.closest(".sam-trust-gate")??node.closest(".sam-world__analytics-page");
 const target=root?.querySelector<HTMLElement>(".sam-trust-gate__route, .sam-world__awaiting--compact");
 if(!target)return;
 const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;
 target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
}

export function SamuraiFailClosedAtlas({kind,onNavigate}:{kind:SamuraiFailClosedKind;onNavigate?:(workspace:AtlasDestination)=>void}){
 const x=COPY[kind],chapters=CHAPTERS[kind];
 const[selectedId,setSelectedId]=useState<string|null>(null);
 const detailRef=useRef<HTMLElement|null>(null);
 const choose=(chapter:AtlasChapter)=>setSelectedId(current=>current===chapter.id?null:chapter.id);
 const renderDetail=(chapter:AtlasChapter)=><aside ref={detailRef} id="sam-offline-atlas-detail" className="sam-offline-atlas__detail is-inline" tabIndex={-1} aria-live="polite">
  <header><div><span>{chapter.code} · PREVIEW</span><strong>{chapter.label}</strong></div><button type="button" onClick={()=>setSelectedId(null)} aria-label="Закрыть превью">×</button></header>
  <p>{chapter.detail}</p>
  <div className="sam-offline-atlas__detail-grid">
   <article><span>СТАТУС</span><strong>DATA LOCK</strong><small>Интерфейс доступен, финансовые значения не подставляются без источника.</small></article>
   <article><span>НУЖЕН ИСТОЧНИК</span><strong>VERIFY</strong><small>{chapter.source}</small></article>
  </div>
  <div className="sam-offline-atlas__detail-actions">
   {chapter.destination&&onNavigate&&<button type="button" onClick={()=>onNavigate(chapter.destination!)}>Открыть раздел</button>}
   {chapter.targetId&&<button type="button" onClick={()=>scrollToTarget(chapter.targetId!)}>Открыть инструмент</button>}
   <button type="button" onClick={()=>scrollToSourceRoute(detailRef.current)}>Маршрут проверки</button>
  </div>
 </aside>;

 return <section className={"sam-offline-atlas sam-offline-atlas--"+kind} aria-label={x.title}>
  <header className="sam-offline-atlas__head">
   <div><span>{x.code}</span><strong>{x.title}</strong><small>{x.subtitle}</small></div>
   <i aria-hidden="true">{x.glyph}</i>
  </header>
  <div className="sam-offline-atlas__interaction-hint"><span>TAP / DETAILS</span><small>Карточки разделов раскрываются прямо под выбранным пунктом</small></div>
  {kind==="home"?<HomePreview chapters={chapters} selected={selectedId} onSelect={choose} renderDetail={renderDetail}/>:kind==="assets"?<AssetsPreview chapters={chapters} selected={selectedId} onSelect={choose} renderDetail={renderDetail}/>:kind==="analysis"?<AnalysisPreview chapters={chapters} selected={selectedId} onSelect={choose} renderDetail={renderDetail}/>:<IncomePreview chapters={chapters} selected={selectedId} onSelect={choose} renderDetail={renderDetail}/>}
  <footer className="sam-offline-atlas__status"><span>DATA LOCK</span><i/><small>«—» означает: функция есть, но значение не подтверждено источником</small></footer>
 </section>;
}
