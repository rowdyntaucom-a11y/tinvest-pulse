import{useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import{
  aggregateHoldings,
  classifyPosition,
  filterAndSortHoldings,
  type AssetClassFilter,
  type HoldingDimension,
  type HoldingPreset,
  type HoldingSort,
}from"../../../v2/src/features/analytics/holdingsExplorer";
import{ratioToPercent,clampPercent}from"../data/units";
import{assetClassLabel}from"../data/assetClasses";
import"../styles/holdingsExplorer.css";

const rub=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const FILTERS:Array<[AssetClassFilter,string]>=[
  ["all","Все"],["shares","Акции"],["bonds","Облигации"],["funds","Фонды"],["currency","Валюта"],["futures","Фьючерсы"],["other","Другое"],
];
const DIMENSIONS:Array<[HoldingDimension,string]>=[
  ["instrument","Инструменты"],["class","Классы"],["issuer","Эмитенты"],["sector","Отрасли"],["currency","Валюты"],
];
const PRESETS:Array<[HoldingPreset,string]>=[
  ["compact","Компактно"],["return","Результат"],["risk","Концентрация"],["fundamental","Карточка"],
];

function identity(position:PositionSnapshot){return position.instrumentUid||position.figi||position.ticker}
function normalized(value:string){return value.trim().toLocaleLowerCase("ru-RU")}
function matches(position:PositionSnapshot,query:string){
  if(!query)return true;
  const q=normalized(query);
  return [position.ticker,position.name,position.instrumentType,position.bond?.issuerName,position.bond?.sector,position.bond?.currency].some(value=>normalized(String(value??"")).includes(q));
}

export function V3HoldingsExplorer({positions,onOpenAsset}:{positions:PositionSnapshot[];onOpenAsset?:(position:PositionSnapshot)=>void}){
  const[filter,setFilter]=useState<AssetClassFilter>("all");
  const[dimension,setDimension]=useState<HoldingDimension>("class");
  const[preset,setPreset]=useState<HoldingPreset>("compact");
  const[sort,setSort]=useState<HoldingSort>("weight");
  const[query,setQuery]=useState("");

  const searched=useMemo(()=>positions.filter(position=>matches(position,query)),[positions,query]);
  const filtered=useMemo(()=>filterAndSortHoldings(searched,filter,sort),[searched,filter,sort]);
  const aggregate=useMemo(()=>aggregateHoldings(filtered,dimension),[filtered,dimension]);
  const classAggregate=useMemo(()=>aggregateHoldings(searched,"class"),[searched]);
  const selectedTotal=filtered.reduce((sum,row)=>sum+row.currentValue,0);
  const portfolioTotal=positions.reduce((sum,row)=>sum+row.currentValue,0);
  const classifiedValue=aggregate.rows.reduce((sum,row)=>sum+row.value,0);
  const coverage=selectedTotal>0?classifiedValue/selectedTotal:null;
  const instrumentView=dimension==="instrument";

  return <section className="v3-holdings-explorer">
    <div className="v3-holdings-head"><div><span>HOLDINGS EXPLORER</span><h2>Структура портфеля</h2></div><div><strong>{filtered.length}</strong><small>позиций</small></div></div>

    <div className="v3-holdings-class-strip" aria-label="Классы активов">
      {classAggregate.rows.slice(0,6).map(row=>{
        const share=portfolioTotal>0?row.value/portfolioTotal:0;
        return <button key={row.label} type="button" onClick={()=>{const key=row.label as Exclude<AssetClassFilter,"all">;setFilter(key);setDimension("instrument")}}>
          <span>{assetClassLabel(row.label)}</span><strong>{rub.format(row.value)} ₽</strong><small>{pct.format(share*100)}%</small><i aria-hidden="true"><b style={{width:clampPercent(share*100)+"%"}}/></i>
        </button>
      })}
    </div>

    <label className="v3-holdings-search"><span>Поиск</span><input type="search" inputMode="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Тикер, название, эмитент, отрасль…"/>{query&&<button type="button" aria-label="Очистить поиск" onClick={()=>setQuery("")}>×</button>}</label>

    <div className="v3-holdings-control"><small>АКТИВЫ</small><div className="v3-holdings-rail" role="group" aria-label="Фильтр активов">{FILTERS.map(([id,label])=><button type="button" key={id} className={filter===id?"is-active":""} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div></div>
    <div className="v3-holdings-control"><small>ПОКАЗАТЬ ПО</small><div className="v3-holdings-rail" role="group" aria-label="Группировка активов">{DIMENSIONS.map(([id,label])=><button type="button" key={id} className={dimension===id?"is-active":""} aria-pressed={dimension===id} onClick={()=>setDimension(id)}>{label}</button>)}</div></div>

    {instrumentView&&<div className="v3-holdings-toolbar">
      <div className="v3-holdings-rail" role="group" aria-label="Представление списка">{PRESETS.map(([id,label])=><button type="button" key={id} className={preset===id?"is-active":""} aria-pressed={preset===id} onClick={()=>setPreset(id)}>{label}</button>)}</div>
      <label><span>Сортировка</span><select value={sort} onChange={e=>setSort(e.target.value as HoldingSort)}><option value="weight">По доле</option><option value="value">По стоимости</option><option value="pnl">По P/L</option><option value="name">По названию</option></select></label>
    </div>}

    {instrumentView?<div className="v3-holdings-instruments">
      {filtered.length?filtered.map(position=>{
        const weightPct=ratioToPercent(position.weight)??0;
        const resultClass=position.expectedYield>0?"is-positive":position.expectedYield<0?"is-negative":"is-neutral";
        return <button type="button" className="v3-holdings-row" key={identity(position)} onClick={()=>onOpenAsset?.(position)}>
          <div className="v3-holdings-id"><strong>{position.ticker}</strong><span>{position.name}</span><small>{assetClassLabel(classifyPosition(position.instrumentType))}</small></div>
          <div className="v3-holdings-primary"><strong>{rub.format(position.currentValue)} ₽</strong><span>{pct.format(weightPct)}% портфеля</span></div>
          {preset==="return"&&<div className={"v3-holdings-extra "+resultClass}><span>Broker P/L</span><strong>{position.expectedYield>0?"+":""}{rub.format(position.expectedYield)} ₽</strong></div>}
          {preset==="risk"&&<div className="v3-holdings-extra"><span>Концентрация</span><strong>{pct.format(weightPct)}%</strong></div>}
          {preset==="fundamental"&&<div className="v3-holdings-extra"><span>Глубже</span><strong>Карточка →</strong></div>}
          <i className="v3-holdings-bar" aria-hidden="true"><b style={{width:clampPercent(weightPct)+"%"}}/></i>
        </button>
      }):<div className="v3-holdings-empty">Совпадающих позиций нет. Фильтр и поиск не создают отсутствующие данные.</div>}
    </div>:<div className="v3-holdings-aggregate">
      <div className="v3-holdings-coverage"><div><span>{dimension==="class"?"Классификация":dimension==="issuer"?"Эмитенты":dimension==="sector"?"Отрасли":"Валюты"}</span><strong>{coverage==null?"—":pct.format(coverage*100)+"%"}</strong></div><small>{aggregate.unclassified>0?"Без подтверждённой классификации: "+rub.format(aggregate.unclassified)+" ₽":"Выбранный срез полностью классифицирован"}</small></div>
      {aggregate.rows.length?aggregate.rows.map(row=>{
        const share=selectedTotal>0?row.value/selectedTotal:0;
        return <article key={row.label}><div><strong>{dimension==="class"?assetClassLabel(row.label):row.label}</strong><span>{rub.format(row.value)} ₽</span></div><i aria-hidden="true"><b style={{width:clampPercent(share*100)+"%"}}/></i><small>{pct.format(share*100)}% выбранного среза</small></article>
      }):<div className="v3-holdings-empty">Для этого среза нет подтверждённых метаданных.</div>}
      {aggregate.unclassified>0&&<article className="is-unclassified"><div><strong>Без подтверждённой классификации</strong><span>{rub.format(aggregate.unclassified)} ₽</span></div><small>QVANIX не угадывает отсутствующий эмитент, отрасль или валюту.</small></article>}
    </div>}

    {filter==="bonds"&&filtered.length>0&&<section className="v3-holdings-bond-context">
      <div><span>Погашение известно</span><strong>{filtered.filter(x=>x.bond?.maturityDate).length}/{filtered.length}</strong></div>
      <div><span>Флоатеры</span><strong>{filtered.filter(x=>x.bond?.floatingCoupon===true).length}</strong></div>
      <div><span>Амортизируемые</span><strong>{filtered.filter(x=>x.bond?.amortizing===true).length}</strong></div>
      <small>Только нормализованные bond metadata текущих позиций; YTM и duration здесь не рассчитываются.</small>
    </section>}

    <p className="v3-holdings-method">Срезы «эмитент», «отрасль» и «валюта» строятся только из подтверждённых нормализованных метаданных. Неизвестное остаётся неизвестным. Broker P/L — накопленный контекст позиции, а не дневное изменение. «Концентрация» показывает долю капитала, не рыночный риск.</p>
  </section>
}
