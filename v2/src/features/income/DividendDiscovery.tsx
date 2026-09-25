import { useEffect, useMemo, useState } from 'react'
import './dividendDiscovery.css'
type Row={assetUid:string;instrumentUid:string;ticker:string;name:string;dividendYield:number;marketCap:number|null}
type Payload={available:boolean;rows?:Row[];coverage?:{shares?:number;fundamentals?:number;dividendRows?:number}}
const pct=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1})
const compact=new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1})
export function DividendDiscovery(){
 const [data,setData]=useState<Payload|null>(null),[error,setError]=useState(false),[query,setQuery]=useState('')
 useEffect(()=>{let active=true;fetch('/api/dividend-discovery',{headers:{Accept:'application/json'}}).then(async r=>{if(!r.ok)throw new Error(String(r.status));return r.json()}).then(x=>{if(active)setData(x)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[])
 const rows=useMemo(()=>{const q=query.trim().toUpperCase();return(data?.rows??[]).filter(row=>!q||row.ticker.toUpperCase().includes(q)||row.name.toUpperCase().includes(q)).slice(0,40)},[data,query])
 return <section className="panel dividend-discovery"><div className="income-panel-head"><div><span className="eyebrow">РЫНОК · ПОДТВЕРЖДЁННЫЕ ФУНДАМЕНТАЛЫ</span><h2>ДИВИДЕНДНЫЙ ОБЗОР</h2></div><small>{data?.coverage?.dividendRows??'—'} бумаг</small></div>
 <p className="dividend-discovery__lead">Рыночный список T‑Invest. Доходность не прогнозируется: строки без точного asset UID и положительного reported dividend yield скрыты.</p>
 <input className="dividend-discovery__search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Тикер или компания" aria-label="Поиск по дивидендному обзору"/>
 {!data&&!error&&<div className="income-empty">Загружаем подтверждённые фундаментальные данные…</div>}{error&&<div className="income-empty">Рыночные фундаментальные данные сейчас недоступны.</div>}{data&&!data.available&&<div className="income-empty">Подтверждённых строк с дивидендной доходностью нет.</div>}
 {rows.length>0&&<div className="dividend-discovery__table"><div className="dividend-discovery__row is-head"><span>Компания</span><span>Yield</span><span>Капитализация</span></div>{rows.map(row=><div className="dividend-discovery__row" key={row.assetUid}><span><b>{row.ticker}</b><small>{row.name}</small></span><strong>{pct.format(row.dividendYield)}%</strong><span>{row.marketCap?compact.format(row.marketCap):'—'}</span></div>)}</div>}
 {data&&<p className="income-method-note">Покрытие: акции {data.coverage?.shares??'—'} · fundamentals {data.coverage?.fundamentals??'—'} · строки {data.coverage?.dividendRows??'—'}. Сортировка описательная, не рейтинг привлекательности и не сигнал купить/продать.</p>}</section>
}