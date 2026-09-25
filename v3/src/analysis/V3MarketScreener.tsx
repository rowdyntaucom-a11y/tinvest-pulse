import{useEffect,useMemo,useState}from"react";
import{loadMarketScreener,type MarketScreenerPayload}from"./marketScreenerApi";
import{filterMarketScreener,type ScreenerFilters,type ScreenerMove,type ScreenerSort}from"./marketScreenerModel";
import"../styles/samuraiMarketScreener.css";

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

export function V3MarketScreener(){
 const[data,setData]=useState<MarketScreenerPayload|null>(null),[loading,setLoading]=useState(true);
 const[filters,setFilters]=useState<ScreenerFilters>({query:"",move:"all",minTurnover:0,listingLevel:"all",sort:"turnover"});
 useEffect(()=>{
  const controller=new AbortController();
  setLoading(true);
  void loadMarketScreener(controller.signal).then(setData).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[]);
 const rows=useMemo(()=>filterMarketScreener(data?.rows??[],filters),[data,filters]);
 const visible=rows.slice(0,60);

 return <section className="sam-screener" aria-label="Рыночный скринер">
  <header className="sam-screener__head"><div><span>09 · SCREENER</span><h2>Рыночный скринер</h2><p>Публичный TQBR-срез MOEX. Фильтры сортируют наблюдаемые рыночные параметры и не являются рейтингом инвестиционной привлекательности.</p></div><i aria-hidden="true">篩</i></header>

  <div className="sam-screener__search">
   <label><span>Поиск</span><input type="search" value={filters.query} onChange={e=>setFilters(v=>({...v,query:e.target.value}))} placeholder="тикер или название"/></label>
   <label><span>Уровень листинга</span><select value={filters.listingLevel} onChange={e=>setFilters(v=>({...v,listingLevel:e.target.value==="all"?"all":Number(e.target.value) as 1|2|3}))}><option value="all">Все</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label>
  </div>

  <div className="sam-screener__filter-block">
   <span>Движение дня</span><div>{MOVE.map(([value,label])=><button type="button" key={value} className={filters.move===value?"is-active":""} onClick={()=>setFilters(v=>({...v,move:value}))}>{label}</button>)}</div>
  </div>
  <div className="sam-screener__filter-block">
   <span>Минимальный оборот</span><div>{TURNOVER.map(([value,label])=><button type="button" key={value} className={filters.minTurnover===value?"is-active":""} onClick={()=>setFilters(v=>({...v,minTurnover:value}))}>{label}</button>)}</div>
  </div>
  <div className="sam-screener__filter-block">
   <span>Сортировка</span><div>{SORT.map(([value,label])=><button type="button" key={value} className={filters.sort===value?"is-active":""} onClick={()=>setFilters(v=>({...v,sort:value}))}>{label}</button>)}</div>
  </div>

  {loading?<div className="sam-screener__gate">Получаем публичный рыночный срез MOEX…</div>:!data?.available?<div className="sam-screener__gate is-warning"><strong>Скринер временно недоступен</strong><small>{data?.reason??"Источник не подтвердил рыночные строки."}</small></div>:<>
   <div className="sam-screener__meta"><span>{data.source??"MOEX ISS"} · {data.board??"TQBR"}</span><strong>{rows.length} из {data.rows.length}</strong><small>{data.fetchedAt?"обновлено "+new Date(data.fetchedAt).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}):""}</small></div>
   <div className="sam-screener__rows" role="table" aria-label="Результаты скринера">
    <div className="sam-screener__row is-head" role="row"><span>Бумага</span><span>Цена</span><span>День</span><span>Оборот</span><span>Сделки</span></div>
    {visible.map(row=><article className="sam-screener__row" role="row" key={row.secid}>
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
