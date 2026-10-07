import{useEffect,useMemo,useState}from"react";
import{loadMarketScreener,type MarketScreenerPayload}from"./marketScreenerApi";
import{filterMarketScreener,type ScreenerFilters,type ScreenerMove,type ScreenerSort}from"./marketScreenerModel";
import"../styles/samuraiMarketScreener.css";
import{V3MarketRelativeV123}from"./V3MarketRelativeV123";
import{V3MarketTickerLensV129}from"./V3MarketTickerLensV129";import{V3MarketBreadthV139}from"./V3MarketBreadthV139";

const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2});
const compact=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2,signDisplay:"exceptZero"});

const MOVE:[ScreenerMove,string][]=[
 ["all","Все"],["gainers","Рост"],["losers","Падение"],["move2","|Δ| ≥ 2%"],["move5","|Δ| ≥ 5%"],
];
const SORT:[ScreenerSort,string][]=[
 ["turnover","Оборот"],["changeDesc","Рост ↓"],["changeAsc","Падение ↓"],["trades","Сделки"],["range","Диапазон"],
];
const TURNOVER:[[number,string],[number,string],[number,string],[number,string]]=[
 [0,"Любой"],[10_000_000,"10М+"],[100_000_000,"100М+"],[500_000_000,"500М+"],
];

function changeClass(value:number|null){
 if(value==null)return"";
 return value>0?"is-positive":value<0?"is-negative":"";
}
function changeText(value:number|null){return value==null?"—":pct.format(value)+"%"}
function listingText(value:number|null){return value==null?"—":"L"+value}
function median(values:number[]){
 if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),mid=Math.floor(sorted.length/2);
 return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
}

export function V3MarketScreener({sharedData,sharedLoading=false,onRetry,portfolioTickers}:{sharedData?:MarketScreenerPayload|null;sharedLoading?:boolean;onRetry?:()=>void;portfolioTickers?:Set<string>}={}){
 const[localData,setLocalData]=useState<MarketScreenerPayload|null>(null),[localLoading,setLocalLoading]=useState(true);
 const controlled=sharedData!==undefined,data=controlled?sharedData:localData,loading=controlled?sharedLoading:localLoading;
 const[filters,setFilters]=useState<ScreenerFilters>({query:"",move:"all",minTurnover:0,listingLevel:"all",sort:"turnover"}),[portfolioOnly,setPortfolioOnly]=useState(false),[selectedSecid,setSelectedSecid]=useState<string|null>(null);
 const resetFilters=()=>{setFilters({query:"",move:"all",minTurnover:0,listingLevel:"all",sort:"turnover"});setPortfolioOnly(false)};
 useEffect(()=>{
  if(controlled)return;
  const controller=new AbortController();
  setLocalLoading(true);
  void loadMarketScreener(controller.signal).then(setLocalData).finally(()=>{if(!controller.signal.aborted)setLocalLoading(false)});
  return()=>controller.abort();
 },[controlled]);
 const sourceRows=data?.rows??[];
 const marketSnapshot=useMemo(()=>{
  const changes=sourceRows.map(row=>row.dayChangePct).filter((value):value is number=>typeof value==="number"&&Number.isFinite(value));
  const advancing=changes.filter(value=>value>0).length,declining=changes.filter(value=>value<0).length,flat=changes.length-advancing-declining;
  const turnover=sourceRows.reduce((sum,row)=>sum+(Number.isFinite(row.turnoverRub)?row.turnoverRub:0),0);
  const trades=sourceRows.reduce((sum,row)=>sum+(Number.isFinite(row.trades)?row.trades:0),0);
  return{advancing,declining,flat,observed:changes.length,medianChange:median(changes),turnover,trades};
 },[sourceRows]);
 const rows=useMemo(()=>filterMarketScreener(sourceRows.filter(row=>!portfolioOnly||portfolioTickers?.has(row.secid.toUpperCase())),filters),[sourceRows,filters,portfolioOnly,portfolioTickers]);
 const visible=rows.slice(0,60),activeFilters=(filters.query?1:0)+(filters.move!=="all"?1:0)+(filters.minTurnover>0?1:0)+(filters.listingLevel!=="all"?1:0)+(filters.sort!=="turnover"?1:0)+(portfolioOnly?1:0);\n useEffect(()=>{if(selectedSecid&&!sourceRows.some(row=>row.secid===selectedSecid))setSelectedSecid(null)},[sourceRows,selectedSecid]);

 return <section className="sam-screener" aria-label="Рыночный скринер">
  <header className="sam-screener__head"><div><span>09 · SCREENER</span><h2>Рыночный скринер</h2><p>Публичный TQBR-срез MOEX. Фильтры сортируют наблюдаемые рыночные параметры и не являются рейтингом инвестиционной привлекательности.</p></div><i aria-hidden="true">篩</i></header>

  {!loading&&data?.available&&<section className="sam-screener__snapshot" aria-label="Сводка текущего рынка">
   <header><div><span>СЕЙЧАС · TQBR</span><strong>Короткий срез перед фильтрами</strong></div><small>{data.fetchedAt?new Date(data.fetchedAt).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}):"время источника —"}</small></header>
   <div>
    <article><span>Рост / падение</span><strong><b className="is-positive">{marketSnapshot.advancing}</b><em>/</em><b className="is-negative">{marketSnapshot.declining}</b></strong><small>{marketSnapshot.flat} без изменения · {marketSnapshot.observed} наблюдений</small></article>
    <article><span>Медиана дня</span><strong className={changeClass(marketSnapshot.medianChange)}>{changeText(marketSnapshot.medianChange)}</strong><small>медианное изменение доступных бумаг</small></article>
    <article><span>Оборот среза</span><strong>{compact.format(marketSnapshot.turnover)} ₽</strong><small>{compact.format(marketSnapshot.trades)} сделок</small></article>
   </div>
   <footer>Сводка описывает только текущие строки публичного TQBR-среза и не является оценкой направления рынка или прогнозом.</footer>
  </section>}

  <V3MarketBreadthV139 rows={sourceRows}/><V3MarketRelativeV123 rows={sourceRows}/>
  {selectedSecid&&<V3MarketTickerLensV129 rows={sourceRows} secid={selectedSecid} portfolioTickers={portfolioTickers} onClose={()=>setSelectedSecid(null)}/>}

  <div className="sam-screener__search" role="search"><button type="button" className="sam-screener__reset" onClick={resetFilters} disabled={activeFilters===0}>Сбросить фильтры{activeFilters?" · "+activeFilters:""}</button>
   <label><span>Поиск</span><input type="search" aria-label="Поиск по тикеру или названию" value={filters.query} onChange={e=>setFilters(v=>({...v,query:e.target.value.slice(0,80)}))} maxLength={80} placeholder="тикер или название" autoComplete="off" spellCheck={false}/></label>
   <label><span>Уровень листинга</span><select aria-label="Уровень листинга" value={filters.listingLevel} onChange={e=>setFilters(v=>({...v,listingLevel:e.target.value==="all"?"all":Number(e.target.value) as 1|2|3}))}><option value="all">Все</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label>
  </div>

  <div className="sam-screener__portfolio-filter" role="group" aria-label="Ограничение выборки портфелем">
   <button type="button" className={portfolioOnly?"is-active":""} disabled={!portfolioTickers?.size} aria-label="Фильтр: только бумаги текущего портфеля" aria-pressed={portfolioOnly} onClick={()=>setPortfolioOnly(v=>!v)}><b>{portfolioOnly?"Только мой портфель":"Показать только мой портфель"}</b><small>{portfolioTickers?.size?portfolioTickers.size+" тикеров для точного сопоставления":"портфельные тикеры недоступны"}</small></button>
  </div>
  <div className="sam-screener__filter-block" role="group" aria-label="Фильтр по движению дня">
   <span id="market-move-label">Движение дня</span><div aria-labelledby="market-move-label">{MOVE.map(([value,label])=><button type="button" key={value} className={filters.move===value?"is-active":""} aria-pressed={filters.move===value} onClick={()=>setFilters(v=>({...v,move:value}))}>{label}</button>)}</div>
  </div>
  <div className="sam-screener__filter-block" role="group" aria-label="Фильтр по минимальному обороту">
   <span id="market-turnover-label">Минимальный оборот</span><div aria-labelledby="market-turnover-label">{TURNOVER.map(([value,label])=><button type="button" key={value} className={filters.minTurnover===value?"is-active":""} aria-pressed={filters.minTurnover===value} onClick={()=>setFilters(v=>({...v,minTurnover:value}))}>{label}</button>)}</div>
  </div>
  <div className="sam-screener__filter-block" role="group" aria-label="Сортировка результатов скринера">
   <span id="market-sort-label">Сортировка</span><div aria-labelledby="market-sort-label">{SORT.map(([value,label])=><button type="button" key={value} className={filters.sort===value?"is-active":""} aria-pressed={filters.sort===value} onClick={()=>setFilters(v=>({...v,sort:value}))}>{label}</button>)}</div>
  </div>

  {loading?<div className="sam-screener__gate">Получаем публичный рыночный срез MOEX…</div>:!data?.available?<div className="sam-screener__gate is-warning"><strong>Скринер временно недоступен</strong><small>{data?.reason??"Источник не подтвердил рыночные строки."}</small>{onRetry&&<button type="button" onClick={onRetry}>Повторить сейчас</button>}</div>:<>
   <div className="sam-screener__meta" aria-live="polite"><span>{data.source??"MOEX ISS"} · {data.board??"TQBR"}</span><strong>{rows.length} из {data.rows.length}</strong><small>{activeFilters?"активных фильтров "+activeFilters:"фильтры по умолчанию"}</small><small>{data.fetchedAt?"обновлено "+new Date(data.fetchedAt).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}):""}</small></div>
   <div className="sam-screener__rows" role="table" aria-label="Результаты скринера" aria-rowcount={visible.length+1}>
    <div className="sam-screener__row is-head" role="row" aria-rowindex={1}><span role="columnheader">Бумага</span><span role="columnheader">Цена</span><span role="columnheader">День</span><span role="columnheader">Оборот</span><span role="columnheader">Сделки</span></div>
    {visible.map((row,index)=><article className={"sam-screener__row "+(selectedSecid===row.secid?"is-selected":"")} role="row" aria-rowindex={index+2} aria-selected={selectedSecid===row.secid} key={row.secid} tabIndex={0} aria-label={(selectedSecid===row.secid?"Закрыть":"Открыть")+" рыночный контекст "+row.secid} onClick={()=>setSelectedSecid(v=>v===row.secid?null:row.secid)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelectedSecid(v=>v===row.secid?null:row.secid)}else if(e.key==="Escape"&&selectedSecid===row.secid){setSelectedSecid(null)}}}>
     <div><strong>{row.secid}</strong><small>{row.name} · {listingText(row.listingLevel)} · лот {row.lotSize??"—"}</small></div>
     <b>{money.format(row.last)} ₽</b>
     <b className={changeClass(row.dayChangePct)}>{changeText(row.dayChangePct)}</b>
     <b>{compact.format(row.turnoverRub)} ₽</b>
     <b>{compact.format(row.trades)}</b>
     <div className="sam-screener__range"><span>день {row.low==null?"—":money.format(row.low)} → {row.high==null?"—":money.format(row.high)}</span><em>{row.rangePct==null?"":"range "+pct.format(row.rangePct)+"%"}</em></div>
    </article>)}
   </div>
   {rows.length>60&&<p className="sam-screener__limit">Показаны первые 60 строк после выбранной сортировки. Уточните фильтр или поиск.</p>}
  </>}

  <footer>Скринер v1 использует текущий публичный рынок акций MOEX TQBR: цену, дневное изменение, оборот, количество сделок, дневной диапазон и уровень листинга. Фундаментальные мультипликаторы и «справедливая цена» не добавляются без отдельного проверяемого источника.</footer>
 </section>;
}
