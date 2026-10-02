import{lazy,Suspense,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3DetailMode,V3Shell}from"../app/model";
import{ratioToPercent,clampPercent}from"../data/units";
import{positionAssetClassLabel,assetClassKey}from"../data/assetClasses";
import{V3SectionSelector}from"../navigation/V3SectionSelector";import{SamuraiWorkspaceChrome}from"../samurai/SamuraiWorkspaceChrome";import{SamuraiChapterNav}from"../samurai/SamuraiChapterNav";import{SamuraiTrustGate}from"../samurai/SamuraiTrustGate";import{CosmosTrustGate}from"../cosmos/CosmosTrustGate";import{CosmosWorkspaceStage}from"../cosmos/CosmosWorkspaceStage";import{NordTrustGate}from"../nord/NordTrustGate";import{NordWorkspaceStage}from"../nord/NordWorkspaceStage";import{NordAssetsTerminal}from"../nord/NordTerminals";
import{buildAssetsWorkspaceSummary}from"./assetsWorkspaceSummary";
import"../styles/assetsProgressiveV89.css";

const V3HoldingsExplorer=lazy(()=>import("./V3HoldingsExplorer").then(m=>({default:m.V3HoldingsExplorer})));
const V3AssetsDepth=lazy(()=>import("./V3AssetsDepth").then(m=>({default:m.V3AssetsDepth})));
const V3OperationsDepth=lazy(()=>import("../operations/V3OperationsDepth").then(m=>({default:m.V3OperationsDepth})));
const V3PortfolioReportDepth=lazy(()=>import("../report/V3PortfolioReportDepth").then(m=>({default:m.V3PortfolioReportDepth})));
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}),num=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const PORTFOLIO_VIEWS=[
  {value:"summary",label:"Сводка",description:"Стоимость, концентрация, ширина P/L и визуальная карта капитала."},
  {value:"positions",label:"Позиции",description:"Текущие активы, веса и накопленный broker P/L."},
  {value:"structure",label:"Структура",description:"Классы, инструменты, эмитенты, отрасли и валюты."},
  {value:"pro",label:"Профи",description:"Концентрация, P/L-атрибуция, фундаментальные данные и облигационный слой."},
] as const;
type PortfolioView=typeof PORTFOLIO_VIEWS[number]["value"];
function kind(v:string){return positionAssetClassLabel(v)}

export function V3Assets({items,trusted,shell,mode,allowAssetWorkspace=true,onOpenAsset,onRefresh,refreshing=false}:{items:PositionSnapshot[];trusted:boolean;shell:V3Shell;mode:V3DetailMode;allowAssetWorkspace?:boolean;onOpenAsset?:(position:PositionSnapshot)=>void;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
  const[filter,setFilter]=useState<"all"|"stock"|"bond"|"fund">("all"),[sort,setSort]=useState<"value"|"result">("value"),[open,setOpen]=useState<string|null>(null),[view,setView]=useState<PortfolioView>("summary");
  const base=trusted?[...items]:[],summary=useMemo(()=>buildAssetsWorkspaceSummary(base),[base]),ranked=[...base].sort((a,b)=>b.currentValue-a.currentValue),total=summary.total,top3=(summary.top3??0)*100,positive=summary.positiveCount,nordLeaders=ranked.slice(0,3).map(x=>({ticker:x.ticker,weight:x.weight,currentValue:x.currentValue}));
  const rows=useMemo(()=>base.filter(x=>filter==="all"||assetClassKey(x.instrumentType)===(filter==="stock"?"shares":filter==="bond"?"bonds":"funds")).sort((a,b)=>sort==="value"?b.currentValue-a.currentValue:b.expectedYield-a.expectedYield),[items,trusted,filter,sort]);
  const samuraiReference=shell==="samurai",themedShell=samuraiReference||shell==="carbon"||shell==="aurora",showSelector=!samuraiReference&&mode==="detailed"&&trusted,showSummary=!samuraiReference&&(mode==="simple"||view==="summary"),showPositions=!samuraiReference&&mode==="detailed"&&view==="positions";
  const scrollToDepth=()=>{const el=document.getElementById("v3-assets-depth");if(!el)return;const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})};
  if(shell==="carbon"&&!trusted)return <CosmosTrustGate kind="assets" onRefresh={onRefresh} refreshing={refreshing}/>;if(shell==="aurora"&&!trusted)return <NordTrustGate kind="assets" onRefresh={onRefresh} refreshing={refreshing}/>;
  return <main className="v3-assets" data-shell={shell} data-trusted={trusted} data-detail-mode={mode}><SamuraiWorkspaceChrome shell={shell} glyph="陣" code="FORMATION // 02" label="PORTFOLIO ROSTER"/>{shell==="carbon"&&<CosmosWorkspaceStage/>}{shell==="aurora"&&trusted&&<NordWorkspaceStage kind="assets" targetId="nord-assets-terminal" value={rub.format(total)+" ₽"} meta={base.length+" позиций · топ-3 "+num.format(top3)+"% портфеля"}/>} 
    {shell!=="aurora"&&<header className="v3-page-head"><span>ПОРТФЕЛЬ · СОСТАВ</span><h1>Активы</h1><p>{trusted?"Подтверждённый состав · веса и текущий broker P/L":"Состав скрыт до подтверждения данных"}</p></header>}
    {shell==="samurai"&&!trusted&&<SamuraiTrustGate kind="assets" onRefresh={onRefresh} refreshing={refreshing}/>}
    {shell==="aurora"&&trusted&&<div id="nord-assets-terminal" className="nord-terminal-anchor" aria-hidden="true"/>}{shell==="aurora"&&trusted&&<NordAssetsTerminal total={total} count={base.length} top3={top3} positive={positive} leaders={nordLeaders}/>} {shell!=="aurora"&&trusted&&<section className="v3-assets-hero"><div><span>Стоимость портфеля</span><strong>{rub.format(total)} ₽</strong><small>{base.length} позиций · текущая подтверждённая стоимость</small></div><i aria-hidden="true">◆</i></section>}
    {shell!=="aurora"&&trusted&&<section className="v3-assets-summary"><article><span>Топ-3</span><strong>{num.format(top3)}%</strong><small>капитала</small></article><article><span>В плюсе</span><strong>{positive}/{base.length}</strong><small>по текущему broker P/L</small></article></section>}
    {trusted&&themedShell&&<button type="button" className="v3-assets-depth-cue" onClick={scrollToDepth} aria-label="Перейти к рабочей зоне активов"><i aria-hidden="true">⌄</i></button>}
    {trusted&&themedShell&&<div className="v3-assets-depth-spacer" aria-hidden="true"/>}

    {showSelector&&<V3SectionSelector label="Раздел портфеля" value={view} onChange={next=>{setView(next);setOpen(null)}} options={PORTFOLIO_VIEWS}/>} 

    {trusted&&showSummary&&<section id="v3-assets-depth" className="v3-assets-workspace-summary" aria-label="Сводка портфеля">
      <header><div><span>{mode==="simple"?"ПОРТФЕЛЬ · ПРОСТО":"БЫСТРЫЙ СРЕЗ"}</span><h2>Что происходит с капиталом</h2></div><small>текущий состав · без прогноза</small></header>
      <div className="v3-assets-summary-grid">
        <article><span>Текущий P/L</span><strong className={summary.pnl>0?"is-positive":summary.pnl<0?"is-negative":""}>{summary.pnl>0?"+":""}{rub.format(summary.pnl)} ₽</strong><small>{summary.pnlPct==null?"к базе —":(summary.pnlPct>0?"+":"")+num.format(summary.pnlPct)+"% к себестоимости"}</small></article>
        <article><span>Эффективных позиций</span><strong>{summary.effectiveCount==null?"—":num.format(summary.effectiveCount)}</strong><small>по распределению текущих весов</small></article>
        <article><span>Крупнейшая позиция</span><strong>{summary.largest?.ticker??"—"}</strong><small>{summary.top1==null?"вес —":num.format(summary.top1*100)+"% капитала"}</small></article>
        <article><span>Ширина P/L</span><strong>{summary.positiveCount}/{summary.positionCount}</strong><small>в плюсе · {summary.negativeCount} в минусе</small></article>
      </div>
      <section className="v3-assets-capital-map" aria-label="Визуальная карта капитала">
        <div className="v3-assets-capital-map__head"><div><span>КАРТА КАПИТАЛА</span><h3>Позиции по весу и знаку P/L</h3></div><small>размер ≈ доля капитала</small></div>
        <div className="v3-assets-capital-map__mosaic">{summary.mosaic.map(item=>{const share=summary.total>0?item.currentValue/summary.total:0,cls=item.expectedYield>0?"is-positive":item.expectedYield<0?"is-negative":"is-neutral";return <button key={item.figi||item.instrumentUid||item.ticker} type="button" className={"v3-assets-capital-map__cell "+cls} style={{flexGrow:Math.max(1,Math.round(share*100))}} disabled={!allowAssetWorkspace} onClick={()=>allowAssetWorkspace&&onOpenAsset?.(item)}><strong>{item.ticker}</strong><span>{num.format(share*100)}%</span><small>{item.expectedYield>0?"+":""}{rub.format(item.expectedYield)} ₽</small></button>})}</div>
        <footer>Размер плитки показывает только текущую долю капитала. Цвет — знак накопленного broker P/L открытой позиции; это не рейтинг и не торговый сигнал.</footer>
      </section>
      {mode==="detailed"&&<div className="v3-assets-workspace-actions">
        <button type="button" onClick={()=>setView("positions")}><span>Позиции</span><strong>Список и детали</strong><small>веса · цена · количество · P/L</small></button>
        <button type="button" onClick={()=>setView("structure")}><span>Структура</span><strong>Разобрать состав</strong><small>классы · отрасли · валюты</small></button>
        <button type="button" onClick={()=>setView("pro")}><span>Профи</span><strong>Глубокая аналитика</strong><small>концентрация · акции · облигации</small></button>
      </div>}
    </section>}

    {showPositions&&<>
      <section className="v3-asset-tools"><div role="group" aria-label="Фильтр активов">{([["all","Все"],["stock","Акции"],["bond","Облигации"],["fund","Фонды"]] as const).map(([id,label])=><button key={id} className={filter===id?"is-active":""} onClick={()=>{setFilter(id);setOpen(null)}}>{label}</button>)}</div><button className="v3-asset-sort" onClick={()=>{setSort(sort==="value"?"result":"value");setOpen(null)}}>Сортировка · {sort==="value"?"вес":"результат"}</button></section>
      <section className="v3-asset-list">{rows.length?rows.map((x,i)=>{const id=x.figi||x.instrumentUid||x.ticker,expanded=open===id,resultClass=x.expectedYield>0?"is-positive":x.expectedYield<0?"is-negative":"is-neutral";return <article className={"v3-asset"+(expanded?" is-open":"")} key={id}>
        <button className="v3-asset-row" type="button" disabled={!allowAssetWorkspace} onClick={()=>allowAssetWorkspace&&onOpenAsset?.(x)} aria-label={allowAssetWorkspace?"Открыть актив "+x.ticker:"Демо-позиция "+x.ticker+"; глубокая карточка отключена"}>
          <div className="v3-asset-rank">{String(i+1).padStart(2,"0")}</div>
          <div className="v3-asset-id"><strong>{x.ticker}</strong><span>{x.name}</span><small>{kind(x.instrumentType)}</small></div>
          <div className="v3-asset-value"><strong>{rub.format(x.currentValue)} ₽</strong><span>{num.format(ratioToPercent(x.weight)??0)}%</span><small className={resultClass}>{x.expectedYield>0?"+":""}{rub.format(x.expectedYield)} ₽</small></div>
          <i className="v3-asset-chevron" aria-hidden="true">{allowAssetWorkspace?"›":"·"}</i>
          <div className="v3-weight"><i style={{width:clampPercent(ratioToPercent(x.weight))+"%"}}/></div>
        </button>
        <button className="v3-asset-inspect" aria-expanded={expanded} aria-label={(expanded?"Скрыть":"Показать")+" детали "+x.ticker} onClick={()=>setOpen(expanded?null:id)}>{expanded?"Скрыть":"Детали"}<i aria-hidden="true">⌄</i></button>
        {expanded&&<section className="v3-asset-inspector" aria-label={"Детали позиции "+x.ticker}><div><span>Количество</span><strong>{num.format(x.quantity)} шт.</strong></div><div><span>Цена</span><strong>{rub.format(x.currentPrice)} ₽</strong></div><div><span>Результат</span><strong className={resultClass}>{x.expectedYield>0?"+":""}{rub.format(x.expectedYield)} ₽</strong></div><div><span>Вес</span><strong>{num.format(ratioToPercent(x.weight)??0)}%</strong></div><small>{allowAssetWorkspace?"Текущие подтверждённые данные позиции · без торговой рекомендации":"Синтетическая демо-позиция · live-источники не запрашиваются"}</small></section>}
      </article>}):<div className="v3-empty">Нет позиций в выбранном фильтре</div>}</section>
    </>}

    {!samuraiReference&&mode==="detailed"&&trusted&&view==="structure"&&<Suspense fallback={<section className="v3-empty">Открываем глубокую структуру портфеля…</section>}><V3HoldingsExplorer positions={base} onOpenAsset={allowAssetWorkspace?onOpenAsset:undefined}/></Suspense>}
    {!samuraiReference&&mode==="detailed"&&trusted&&view==="pro"&&<Suspense fallback={<section id="v3-assets-depth" className="v3-empty">Открываем профессиональную аналитику…</section>}><V3AssetsDepth positions={base} onOpenAsset={allowAssetWorkspace?onOpenAsset:undefined}/></Suspense>}

    {trusted&&samuraiReference&&<>
      <SamuraiChapterNav label="Активы Samurai" chapters={[
       {id:"sam-assets-classes",code:"壱",label:"Состав",note:"классы активов"},
       {id:"sam-assets-pnl",code:"弐",label:"Результат",note:"broker P/L"},
       {id:"sam-assets-sectors",code:"参",label:"Отрасли",note:"покрытие метаданных"},
       {id:"sam-assets-fundamentals",code:"肆",label:"Акции",note:"фундаментальные показатели"},
       {id:"sam-assets-bonds",code:"伍",label:"Облигации",note:"доходность · duration"},
       {id:"sam-assets-positions",code:"陸",label:"Позиции",note:"карточки инструментов"},
       {id:"sam-assets-operations",code:"漆",label:"Операции",note:"сделки · потоки · доход"},
       {id:"sam-assets-integrity",code:"捌",label:"Целостность",note:"покрытие · события"},
       {id:"sam-assets-report",code:"玖",label:"Отчёт",note:"стоимость · база · P/L"},
       {id:"sam-assets-categories",code:"拾",label:"Категории",note:"классы · доли"},
       {id:"sam-assets-currencies",code:"拾壱",label:"Валюты",note:"покрытие · структура"}
      ]}/>
      <Suspense fallback={<section id="v3-assets-depth" className="v3-empty">Открываем Assets Depth…</section>}><V3AssetsDepth positions={base} onOpenAsset={allowAssetWorkspace?onOpenAsset:undefined}/></Suspense>
      {allowAssetWorkspace&&<Suspense fallback={<section className="v3-empty">Открываем журнал операций…</section>}><V3OperationsDepth/></Suspense>}
      {allowAssetWorkspace&&<Suspense fallback={<section className="v3-empty">Открываем отчёт портфеля…</section>}><V3PortfolioReportDepth positions={base}/></Suspense>}
    </>}
  </main>;
}
