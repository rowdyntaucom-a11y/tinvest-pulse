import{useMemo,useState}from"react";
import type{PositionSnapshot}from"../../../v2/src/lib/portfolioApi";
import"../styles/bondIntelligenceV117.css";
import{V3BondMaturityConcentrationV125}from"./V3BondMaturityConcentrationV125";
import{V3BondIssuerMaturityCollisionV132}from"./V3BondIssuerMaturityCollisionV132";
import{V3BondYearDiversificationV144}from"./V3BondYearDiversificationV144";
import{V3BondMaturityBreadthV149}from"./V3BondMaturityBreadthV149";
import{V3BondIssuerBreadthV154}from"./V3BondIssuerBreadthV154";
import{V3BondIssueBreadthV159}from"./V3BondIssueBreadthV159";
import{V3BondMaturityMedianV164}from"./V3BondMaturityMedianV164";
import{V3BondCouponBreadthV169}from"./V3BondCouponBreadthV169";

type BondFilter="all"|"fixed"|"floating"|"amortizing"|"perpetual";
type BondSort="capital"|"maturity"|"pnl";
type BondRow={position:PositionSnapshot;issuer:string;currency:string;maturity:string|null;daysToMaturity:number|null;couponKind:"floating"|"fixed"|"unknown";amortizing:boolean|null;perpetual:boolean|null};

const money=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0});
const compact=new Intl.NumberFormat("ru-RU",{notation:"compact",maximumFractionDigits:1});
const pct=new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1});
const dateFmt=new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"});
const DAY=86_400_000;
function finite(value:unknown){const n=Number(value);return Number.isFinite(n)?n:0}
function isBond(position:PositionSnapshot){return position.instrumentType.toLowerCase().includes("bond")||Boolean(position.bond)}
function daysUntil(date:string|null){if(!date)return null;const ts=Date.parse(date+"T00:00:00Z");if(!Number.isFinite(ts))return null;return Math.ceil((ts-Date.now())/DAY)}
function formatDate(value:string|null){if(!value)return"—";const ts=Date.parse(value+"T00:00:00Z");return Number.isFinite(ts)?dateFmt.format(new Date(ts)):"—"}
function formatTerm(days:number|null,perpetual:boolean|null){if(perpetual===true)return"бессрочная";if(days==null)return"—";if(days<=0)return"погашение прошло";if(days<365)return`${days} дн.`;const years=days/365.25;return years<2?`${pct.format(years)} г.`:`${pct.format(years)} лет`}
function signMoney(value:number){return`${value>0?"+":""}${money.format(value)} ₽`}
function pnlPct(position:PositionSnapshot){const basis=finite(position.costBasis);return basis>0?finite(position.expectedYield)/basis*100:null}
function bucketFor(row:BondRow){if(row.perpetual===true)return"Бессрочные";const d=row.daysToMaturity;if(d==null)return"Нет даты";if(d<=365)return"≤ 1 года";if(d<=365*3)return"1–3 года";if(d<=365*5)return"3–5 лет";return"> 5 лет"}

export function V3BondIntelligenceWorkspace({positions}:{positions:PositionSnapshot[]}){
 const[filter,setFilter]=useState<BondFilter>("all"),[sort,setSort]=useState<BondSort>("capital"),[query,setQuery]=useState("");
 const rows=useMemo<BondRow[]>(()=>positions.filter(isBond).map(position=>({
  position,
  issuer:position.bond?.issuerName?.trim()||position.name||position.ticker,
  currency:position.bond?.currency?.trim().toUpperCase()||"—",
  maturity:position.bond?.maturityDate??null,
  daysToMaturity:daysUntil(position.bond?.maturityDate??null),
  couponKind:position.bond?.floatingCoupon===true?"floating":position.bond?.floatingCoupon===false?"fixed":"unknown",
  amortizing:position.bond?.amortizing??null,
  perpetual:position.bond?.perpetual??null,
 })),[positions]);
 const portfolioTotal=useMemo(()=>positions.reduce((s,p)=>s+Math.max(0,finite(p.currentValue)),0),[positions]);
 const bondTotal=useMemo(()=>rows.reduce((s,r)=>s+Math.max(0,finite(r.position.currentValue)),0),[rows]);
 const bondPnl=useMemo(()=>rows.reduce((s,r)=>s+finite(r.position.expectedYield),0),[rows]);
 const metadataCoverage=rows.length?rows.filter(r=>Boolean(r.position.bond)).length/rows.length*100:0;
 const maturityCoverage=rows.length?rows.filter(r=>r.perpetual===true||r.maturity!=null).length/rows.length*100:0;
 const couponCoverage=rows.length?rows.filter(r=>r.couponKind!=="unknown").length/rows.length*100:0;
 const buckets=useMemo(()=>{
  const order=["≤ 1 года","1–3 года","3–5 лет","> 5 лет","Бессрочные","Нет даты"];
  const map=new Map<string,{value:number;count:number}>();
  for(const row of rows){const key=bucketFor(row),prev=map.get(key)??{value:0,count:0};prev.value+=Math.max(0,finite(row.position.currentValue));prev.count++;map.set(key,prev)}
  return order.map(label=>({label,...(map.get(label)??{value:0,count:0})})).filter(x=>x.count>0);
 },[rows]);
 const issuerRows=useMemo(()=>{
  const map=new Map<string,{value:number;count:number}>();
  for(const row of rows){const prev=map.get(row.issuer)??{value:0,count:0};prev.value+=Math.max(0,finite(row.position.currentValue));prev.count++;map.set(row.issuer,prev)}
  return [...map.entries()].map(([issuer,data])=>({issuer,...data})).sort((a,b)=>b.value-a.value);
 },[rows]);
 const currencyRows=useMemo(()=>{
  const map=new Map<string,number>();for(const row of rows)map.set(row.currency,(map.get(row.currency)??0)+Math.max(0,finite(row.position.currentValue)));
  return [...map.entries()].map(([currency,value])=>({currency,value})).sort((a,b)=>b.value-a.value);
 },[rows]);
 const couponRows=useMemo(()=>{
  const map={fixed:{label:"Фиксированный",value:0,count:0},floating:{label:"Плавающий",value:0,count:0},unknown:{label:"Не подтверждено",value:0,count:0}};
  for(const row of rows){map[row.couponKind].value+=Math.max(0,finite(row.position.currentValue));map[row.couponKind].count++}
  return Object.values(map).filter(x=>x.count>0);
 },[rows]);
 const filtered=useMemo(()=>{
  const q=query.trim().toLowerCase();
  return rows.filter(row=>{
   const okFilter=filter==="all"||(filter==="fixed"&&row.couponKind==="fixed")||(filter==="floating"&&row.couponKind==="floating")||(filter==="amortizing"&&row.amortizing===true)||(filter==="perpetual"&&row.perpetual===true);
   const okQuery=!q||`${row.position.ticker} ${row.position.name} ${row.issuer}`.toLowerCase().includes(q);
   return okFilter&&okQuery;
  }).sort((a,b)=>sort==="capital"?finite(b.position.currentValue)-finite(a.position.currentValue):sort==="pnl"?finite(b.position.expectedYield)-finite(a.position.expectedYield):(a.daysToMaturity??Number.POSITIVE_INFINITY)-(b.daysToMaturity??Number.POSITIVE_INFINITY));
 },[rows,filter,sort,query]);
 const maxIssuer=issuerRows[0]?.value||1,maxBucket=Math.max(1,...buckets.map(x=>x.value)),maxCurrency=Math.max(1,...currencyRows.map(x=>x.value));
 const largestIssuer=issuerRows[0];
 const amortizingCount=rows.filter(r=>r.amortizing===true).length,perpetualCount=rows.filter(r=>r.perpetual===true).length;
 if(!rows.length)return <section className="v3-bond-intelligence"><header><div><span>ОБЛИГАЦИИ // ПРОВЕРЕННЫЕ ПОЛЯ</span><h3>Облигационный контур</h3><p>В текущем подтверждённом снимке портфеля нет облигационных позиций.</p></div><strong>0</strong></header><div className="v3-bond-intelligence__empty">QVANIX не создаёт облигационные метрики без позиций и метаданных брокера.</div></section>;
 return <section className="v3-bond-intelligence" aria-label="Облигационная аналитика">
  <header><div><span>ОБЛИГАЦИИ // ПРОВЕРЕННЫЕ ПОЛЯ</span><h3>Облигационный контур</h3><p>Сроки, эмитенты, валюты и тип купона из текущего брокерского снимка. Без расчёта YTM, duration и купонных сумм, если источник их не передал.</p></div><strong>{rows.length}</strong></header>
  <div className="v3-bond-intelligence__metrics">
   <article><span>Стоимость облигаций</span><strong>{money.format(bondTotal)} ₽</strong><small>{portfolioTotal>0?pct.format(bondTotal/portfolioTotal*100)+"% портфеля":"—"}</small></article>
   <article><span>Открытый P/L</span><strong className={bondPnl>0?"is-positive":bondPnl<0?"is-negative":""}>{signMoney(bondPnl)}</strong><small>{bondTotal-bondPnl>0?pct.format(bondPnl/(bondTotal-bondPnl)*100)+"% к себестоимости":"—"}</small></article>
   <article><span>Крупнейший эмитент</span><strong>{largestIssuer?.issuer??"—"}</strong><small>{largestIssuer&&bondTotal>0?pct.format(largestIssuer.value/bondTotal*100)+"% облигаций":"—"}</small></article>
   <article><span>Покрытие метаданных</span><strong>{pct.format(metadataCoverage)}%</strong><small>срок {pct.format(maturityCoverage)}% · купон {pct.format(couponCoverage)}%</small></article>
  </div>
  <V3BondMaturityConcentrationV125 rows={rows.map(r=>({ticker:r.position.ticker,issuer:r.issuer,value:Math.max(0,finite(r.position.currentValue)),maturity:r.maturity,perpetual:r.perpetual}))}/><V3BondIssuerMaturityCollisionV132 rows={rows.map(r=>({ticker:r.position.ticker,issuer:r.issuer,value:Math.max(0,finite(r.position.currentValue)),maturity:r.maturity,perpetual:r.perpetual}))}/><V3BondYearDiversificationV144 rows={rows.map(r=>({ticker:r.position.ticker,issuer:r.issuer,value:Math.max(0,finite(r.position.currentValue)),maturity:r.maturity,perpetual:r.perpetual}))}/><V3BondMaturityBreadthV149 rows={rows.map(r=>({ticker:r.position.ticker,issuer:r.issuer,value:Math.max(0,finite(r.position.currentValue)),maturity:r.maturity,perpetual:r.perpetual}))}/><V3BondIssuerBreadthV154 rows={rows.map(r=>({ticker:r.position.ticker,issuer:r.issuer,value:Math.max(0,finite(r.position.currentValue)),maturity:r.maturity,perpetual:r.perpetual}))}/><V3BondIssueBreadthV159 rows={rows.map(r=>({ticker:r.position.ticker,issuer:r.issuer,value:Math.max(0,finite(r.position.currentValue)),maturity:r.maturity,perpetual:r.perpetual}))}/><V3BondMaturityMedianV164 rows={rows.map(r=>({ticker:r.position.ticker,issuer:r.issuer,value:Math.max(0,finite(r.position.currentValue)),maturity:r.maturity,perpetual:r.perpetual}))}/><V3BondCouponBreadthV169 positions={positions}/>
  <div className="v3-bond-intelligence__grid">
   <section className="v3-bond-intelligence__panel"><header><div><span>ЛЕСТНИЦА ПОГАШЕНИЙ</span><strong>Капитал по срокам</strong></div><small>{perpetualCount?`${perpetualCount} бесср.`:"по подтверждённым датам"}</small></header><div className="v3-bond-intelligence__bars">{buckets.map(item=><article key={item.label}><div><strong>{item.label}</strong><span>{item.count} шт. · {compact.format(item.value)} ₽</span></div><i><b style={{width:`${Math.max(2,item.value/maxBucket*100)}%`}}/></i><small>{bondTotal>0?pct.format(item.value/bondTotal*100):"0"}%</small></article>)}</div></section>
   <section className="v3-bond-intelligence__panel"><header><div><span>ЭМИТЕНТЫ</span><strong>Концентрация облигаций</strong></div><small>по текущей стоимости</small></header><div className="v3-bond-intelligence__bars">{issuerRows.slice(0,6).map(item=><article key={item.issuer}><div><strong>{item.issuer}</strong><span>{item.count} поз. · {compact.format(item.value)} ₽</span></div><i><b style={{width:`${Math.max(2,item.value/maxIssuer*100)}%`}}/></i><small>{bondTotal>0?pct.format(item.value/bondTotal*100):"0"}%</small></article>)}</div></section>
   <section className="v3-bond-intelligence__panel"><header><div><span>КУПОННЫЙ ТИП</span><strong>Структура по капиталу</strong></div><small>{amortizingCount?`${amortizingCount} амортиз.`:"амортизация не отмечена"}</small></header><div className="v3-bond-intelligence__segments">{couponRows.map(item=><article key={item.label}><div><strong>{item.label}</strong><b>{item.count}</b></div><i><b style={{width:`${bondTotal>0?item.value/bondTotal*100:0}%`}}/></i><small>{compact.format(item.value)} ₽ · {bondTotal>0?pct.format(item.value/bondTotal*100):"0"}%</small></article>)}</div></section>
   <section className="v3-bond-intelligence__panel"><header><div><span>ВАЛЮТА НОМИНАЛА</span><strong>Метаданные выпусков</strong></div><small>не валютный P/L</small></header><div className="v3-bond-intelligence__bars">{currencyRows.map(item=><article key={item.currency}><div><strong>{item.currency}</strong><span>{compact.format(item.value)} ₽ капитала</span></div><i><b style={{width:`${Math.max(2,item.value/maxCurrency*100)}%`}}/></i><small>{bondTotal>0?pct.format(item.value/bondTotal*100):"0"}%</small></article>)}</div></section>
  </div>
  <section className="v3-bond-intelligence__table">
   <header><div><span>ПОЗИЦИИ</span><strong>Точная облигационная ведомость</strong></div><small>{filtered.length} из {rows.length}</small></header>
   <div className="v3-bond-intelligence__controls" role="group" aria-label="Поиск, фильтр и сортировка облигаций"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Тикер, выпуск или эмитент" aria-label="Поиск облигаций"/><select value={filter} onChange={e=>setFilter(e.target.value as BondFilter)} aria-label="Фильтр облигаций"><option value="all">Все облигации</option><option value="fixed">Фиксированный купон</option><option value="floating">Плавающий купон</option><option value="amortizing">Амортизируемые</option><option value="perpetual">Бессрочные</option></select><select value={sort} onChange={e=>setSort(e.target.value as BondSort)} aria-label="Сортировка облигаций"><option value="capital">По капиталу</option><option value="maturity">По погашению</option><option value="pnl">По P/L</option></select></div>
   <div className="v3-bond-intelligence__rows" role="list" aria-label="Облигационные позиции">{filtered.map(row=>{const p=row.position,pl=pnlPct(p);return <article role="listitem" key={p.figi||p.instrumentUid||p.ticker}><div className="v3-bond-intelligence__identity"><strong>{p.ticker}</strong><span>{p.name}</span><small>{row.issuer}</small></div><div><span>Капитал</span><strong>{money.format(p.currentValue)} ₽</strong><small>{bondTotal>0?pct.format(p.currentValue/bondTotal*100):"0"}% облигаций</small></div><div><span>P/L</span><strong className={p.expectedYield>0?"is-positive":p.expectedYield<0?"is-negative":""}>{signMoney(p.expectedYield)}</strong><small>{pl==null?"—":(pl>0?"+":"")+pct.format(pl)+"%"}</small></div><div><span>Погашение</span><strong>{row.perpetual===true?"Бессрочная":formatDate(row.maturity)}</strong><small>{formatTerm(row.daysToMaturity,row.perpetual)}</small></div><div><span>Купон</span><strong>{row.couponKind==="floating"?"Плавающий":row.couponKind==="fixed"?"Фиксированный":"—"}</strong><small>{p.bond?.couponQuantityPerYear?`${p.bond.couponQuantityPerYear} раз/год`:"частота —"}</small></div><div><span>Особенности</span><strong>{row.amortizing===true?"Амортизация":row.perpetual===true?"Бессрочная":"Стандарт"}</strong><small>{row.currency}{p.bond?.issueKind?` · ${p.bond.issueKind}`:""}</small></div></article>})}</div>
  </section>
  <footer>Это описание текущих облигаций по подтверждённым полям брокера. QVANIX не рассчитывает YTM, duration, будущий купонный поток или кредитный рейтинг из отсутствующих данных и не формирует рекомендаций.</footer>
 </section>;
}
