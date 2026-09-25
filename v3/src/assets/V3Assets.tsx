import{lazy,Suspense,useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import type{V3DetailMode,V3Shell}from"../app/model";
import{ratioToPercent,clampPercent}from"../data/units";
import{positionAssetClassLabel,assetClassKey}from"../data/assetClasses";
import{V3SectionSelector}from"../navigation/V3SectionSelector";import{SamuraiWorkspaceChrome}from"../samurai/SamuraiWorkspaceChrome";import{SamuraiChapterNav}from"../samurai/SamuraiChapterNav";import{SamuraiTrustGate}from"../samurai/SamuraiTrustGate";import{CosmosTrustGate}from"../cosmos/CosmosTrustGate";import{CosmosWorkspaceStage}from"../cosmos/CosmosWorkspaceStage";import{NordTrustGate}from"../nord/NordTrustGate";import{NordWorkspaceStage}from"../nord/NordWorkspaceStage";import{NordAssetsTerminal}from"../nord/NordTerminals";

const V3HoldingsExplorer=lazy(()=>import("./V3HoldingsExplorer").then(m=>({default:m.V3HoldingsExplorer})));
const V3AssetsDepth=lazy(()=>import("./V3AssetsDepth").then(m=>({default:m.V3AssetsDepth})));
const V3OperationsDepth=lazy(()=>import("../operations/V3OperationsDepth").then(m=>({default:m.V3OperationsDepth})));\nconst V3PortfolioReportDepth=lazy(()=>import("../report/V3PortfolioReportDepth").then(m=>({default:m.V3PortfolioReportDepth})));
const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}),num=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const PORTFOLIO_VIEWS=[
  {value:"overview",label:"Позиции",description:"Быстрый список текущих активов, веса и накопленный broker P/L."},
  {value:"explorer",label:"Структура",description:"Глубокие срезы по классам, инструментам, эмитентам, отраслям и валютам."},
] as const;
type PortfolioView=typeof PORTFOLIO_VIEWS[number]["value"];
function kind(v:string){return positionAssetClassLabel(v)}

export function V3Assets({items,trusted,shell,mode,allowAssetWorkspace=true,onOpenAsset,onRefresh,refreshing=false}:{items:PositionSnapshot[];trusted:boolean;shell:V3Shell;mode:V3DetailMode;allowAssetWorkspace?:boolean;onOpenAsset?:(position:PositionSnapshot)=>void;onRefresh?:()=>void|Promise<void>;refreshing?:boolean}){
  const[filter,setFilter]=useState<"all"|"stock"|"bond"|"fund">("all"),[sort,setSort]=useState<"value"|"result">("value"),[open,setOpen]=useState<string|null>(null),[view,setView]=useState<PortfolioView>("overview");
  const base=trusted?[...items]:[],ranked=[...base].sort((a,b)=>b.currentValue-a.currentValue),total=base.reduce((s,x)=>s+x.currentValue,0),top3=ranked.slice(0,3).reduce((s,x)=>s+x.weight,0)*100,positive=base.filter(x=>x.expectedYield>0).length,nordLeaders=ranked.slice(0,3).map(x=>({ticker:x.ticker,weight:x.weight,currentValue:x.currentValue}));
  const rows=useMemo(()=>base.filter(x=>filter==="all"||assetClassKey(x.instrumentType)===(filter==="stock"?"shares":filter==="bond"?"bonds":"funds")).sort((a,b)=>sort==="value"?b.currentValue-a.currentValue:b.expectedYield-a.expectedYield),[items,trusted,filter,sort]);
  const overview=mode==="simple"||view==="overview",themedDepth=shell==="samurai"||shell==="carbon"||shell==="aurora";
  const scrollToDepth=()=>{const el=document.getElementById("v3-assets-depth");if(!el)return;const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})};
  if(shell==="carbon"&&!trusted)return <CosmosTrustGate kind="assets" onRefresh={onRefresh} refreshing={refreshing}/>;if(shell==="aurora"&&!trusted)return <NordTrustGate kind="assets" onRefresh={onRefresh} refreshing={refreshing}/>;
  return <main className="v3-assets" data-shell={shell} data-trusted={trusted}><SamuraiWorkspaceChrome shell={shell} glyph="陣" code="FORMATION // 02" label="PORTFOLIO ROSTER"/>{shell==="carbon"&&<CosmosWorkspaceStage/>}{shell==="aurora"&&trusted&&<NordWorkspaceStage kind="assets" targetId="nord-assets-terminal" value={rub.format(total)+" ₽"} meta={base.length+" позиций · топ-3 "+num.format(top3)+"% портфеля"}/>} 
    {shell!=="aurora"&&<header className="v3-page-head"><span>ПОРТФЕЛЬ · СОСТАВ</span><h1>Активы</h1><p>{trusted?"Подтверждённый состав · веса и текущий broker P/L":"Состав скрыт до подтверждения данных"}</p></header>}
    {shell==="samurai"&&!trusted&&<SamuraiTrustGate kind="assets" onRefresh={onRefresh} refreshing={refreshing}/>}
    {shell==="aurora"&&trusted&&<div id="nord-assets-terminal" className="nord-terminal-anchor" aria-hidden="true"/>}{shell==="aurora"&&trusted&&<NordAssetsTerminal total={total} count={base.length} top3={top3} positive={positive} leaders={nordLeaders}/>} {shell!=="aurora"&&trusted&&<section className="v3-assets-hero"><div><span>Стоимость портфеля</span><strong>{rub.format(total)} ₽</strong><small>{base.length} позиций · текущая подтверждённая стоимость</small></div><i aria-hidden="true">◆</i></section>}
    {shell!=="aurora"&&trusted&&<section className="v3-assets-summary"><article><span>Топ-3</span><strong>{num.format(top3)}%</strong><small>капитала</small></article><article><span>В плюсе</span><strong>{positive}/{base.length}</strong><small>по текущему broker P/L</small></article></section>}
    {trusted&&themedDepth&&<button type="button" className="v3-assets-depth-cue" onClick={scrollToDepth} aria-label="Перейти к глубокому разбору активов"><i aria-hidden="true">⌄</i></button>}
    {trusted&&themedDepth&&<div className="v3-assets-depth-spacer" aria-hidden="true"/>}
    {!themedDepth&&mode==="detailed"&&trusted&&<V3SectionSelector label="Раздел портфеля" value={view} onChange={next=>{setView(next);setOpen(null)}} options={PORTFOLIO_VIEWS}/>} 
    {!themedDepth&&overview&&<>
      {mode==="detailed"&&trusted&&<section className="v3-asset-tools"><div role="group" aria-label="Фильтр активов">{([["all","Все"],["stock","Акции"],["bond","Облигации"],["fund","Фонды"]] as const).map(([id,label])=><button key={id} className={filter===id?"is-active":""} onClick={()=>{setFilter(id);setOpen(null)}}>{label}</button>)}</div><button className="v3-asset-sort" onClick={()=>{setSort(sort==="value"?"result":"value");setOpen(null)}}>Сортировка · {sort==="value"?"вес":"результат"}</button></section>}
      <section className="v3-asset-list">{rows.length?rows.map((x,i)=>{const id=x.figi||x.instrumentUid||x.ticker,expanded=mode==="detailed"&&open===id,resultClass=x.expectedYield>0?"is-positive":x.expectedYield<0?"is-negative":"is-neutral";return <article className={"v3-asset"+(expanded?" is-open":"")} key={id}>
        <button className="v3-asset-row" type="button" disabled={!allowAssetWorkspace} onClick={()=>allowAssetWorkspace&&onOpenAsset?.(x)} aria-label={allowAssetWorkspace?"Открыть актив "+x.ticker:"Демо-позиция "+x.ticker+"; глубокая карточка отключена"}>
          <div className="v3-asset-rank">{String(i+1).padStart(2,"0")}</div>
          <div className="v3-asset-id"><strong>{x.ticker}</strong><span>{x.name}</span><small>{kind(x.instrumentType)}</small></div>
          <div className="v3-asset-value"><strong>{rub.format(x.currentValue)} ₽</strong><span>{num.format(ratioToPercent(x.weight)??0)}%</span><small className={resultClass}>{x.expectedYield>0?"+":""}{rub.format(x.expectedYield)} ₽</small></div>
          <i className="v3-asset-chevron" aria-hidden="true">{allowAssetWorkspace?"›":"·"}</i>
          <div className="v3-weight"><i style={{width:clampPercent(ratioToPercent(x.weight))+"%"}}/></div>
        </button>
        {mode==="detailed"&&<button className="v3-asset-inspect" aria-expanded={expanded} aria-label={(expanded?"Скрыть":"Показать")+" детали "+x.ticker} onClick={()=>setOpen(expanded?null:id)}>{expanded?"Скрыть":"Детали"}<i aria-hidden="true">⌄</i></button>}
        {expanded&&<section className="v3-asset-inspector" aria-label={"Детали позиции "+x.ticker}><div><span>Количество</span><strong>{num.format(x.quantity)} шт.</strong></div><div><span>Цена</span><strong>{rub.format(x.currentPrice)} ₽</strong></div><div><span>Результат</span><strong className={resultClass}>{x.expectedYield>0?"+":""}{rub.format(x.expectedYield)} ₽</strong></div><div><span>Вес</span><strong>{num.format(ratioToPercent(x.weight)??0)}%</strong></div><small>{allowAssetWorkspace?"Текущие подтверждённые данные позиции · без торговой рекомендации":"Синтетическая демо-позиция · live-источники не запрашиваются"}</small></section>}
      </article>}):<div className="v3-empty">{trusted&&mode==="detailed"?"Нет позиций в выбранном фильтре":"Нет подтверждённых позиций для отображения"}</div>}</section>
    </>}
    {!themedDepth&&mode==="detailed"&&trusted&&view==="explorer"&&<Suspense fallback={<section className="v3-empty">Открываем глубокую структуру портфеля…</section>}><V3HoldingsExplorer positions={base} onOpenAsset={allowAssetWorkspace?onOpenAsset:undefined}/></Suspense>}
    {trusted&&themedDepth&&<>
      {shell==="samurai"&&<SamuraiChapterNav label="Активы Samurai" chapters={[
       {id:"sam-assets-classes",code:"壱",label:"Состав",note:"классы активов"},
       {id:"sam-assets-pnl",code:"弐",label:"Результат",note:"broker P/L"},
       {id:"sam-assets-sectors",code:"参",label:"Отрасли",note:"покрытие метаданных"},
       {id:"sam-assets-bonds",code:"肆",label:"Облигации",note:"сроки · эмитенты"},
       {id:"sam-assets-positions",code:"伍",label:"Позиции",note:"карточки инструментов"},
       {id:"sam-assets-operations",code:"陸",label:"Операции",note:"сделки · потоки · доход"},
       {id:"sam-assets-integrity",code:"漆",label:"Целостность",note:"покрытие · события"},\n       {id:"sam-assets-report",code:"捌",label:"Отчёт",note:"стоимость · база · P/L"},\n       {id:"sam-assets-categories",code:"玖",label:"Категории",note:"классы · доли"},\n       {id:"sam-assets-currencies",code:"拾",label:"Валюты",note:"покрытие · структура"}
      ]}/>}
      <Suspense fallback={<section id="v3-assets-depth" className="v3-empty">Открываем Assets Depth…</section>}><V3AssetsDepth positions={base} onOpenAsset={allowAssetWorkspace?onOpenAsset:undefined}/></Suspense>
      {shell==="samurai"&&allowAssetWorkspace&&<Suspense fallback={<section className="v3-empty">Открываем журнал операций…</section>}><V3OperationsDepth/></Suspense>}
    </>}
  </main>;
}
