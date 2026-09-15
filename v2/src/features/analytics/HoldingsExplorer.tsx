import { useMemo, useState } from 'react'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { aggregateHoldings, filterAndSortHoldings, type AssetClassFilter, type HoldingDimension, type HoldingPreset, type HoldingSort } from './holdingsExplorer'
import './holdingsExplorer.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const filters: Array<[AssetClassFilter, string]> = [['all','ВСЕ'],['shares','АКЦИИ'],['bonds','ОБЛИГАЦИИ'],['funds','ФОНДЫ'],['currency','ВАЛЮТА'],['futures','ФЬЮЧЕРСЫ'],['other','ДРУГОЕ']]
const dimensions: Array<[HoldingDimension, string]> = [['class','КЛАССЫ'],['instrument','ИНСТРУМЕНТЫ'],['issuer','ЭМИТЕНТЫ'],['sector','ОТРАСЛИ'],['currency','ВАЛЮТЫ']]

export function HoldingsExplorer({ positions, onOpenAsset }: { positions: PositionSnapshot[]; onOpenAsset: (position: PositionSnapshot) => void }) {
  const [filter, setFilter] = useState<AssetClassFilter>('all')
  const [dimension, setDimension] = useState<HoldingDimension>('instrument')
  const [preset, setPreset] = useState<HoldingPreset>('compact')
  const [sort, setSort] = useState<HoldingSort>('weight')
  const filtered = useMemo(() => filterAndSortHoldings(positions, filter, dimension === 'instrument' ? sort : 'weight'), [positions, filter, sort, dimension])
  const aggregate = useMemo(() => aggregateHoldings(filtered, dimension), [filtered, dimension])
  const instrumentView = dimension === 'instrument'
  return <section className="panel holdings-explorer">
    <div className="panel-head"><div><span className="eyebrow">ОДИН НАБОР ПОЗИЦИЙ · ГИБКИЙ СРЕЗ</span><h2>СТРУКТУРА</h2></div><small>{filtered.length} поз.</small></div>
    <div className="holdings-controls" aria-label="Фильтры активов">{filters.map(([key,label]) => <button key={key} className={filter===key?'is-active':''} onClick={()=>setFilter(key)}>{label}</button>)}</div>
    <div className="holdings-controls">{dimensions.map(([key,label]) => <button key={key} className={dimension===key?'is-active':''} onClick={()=>setDimension(key)}>{label}</button>)}</div>
    {instrumentView&&<div className="holdings-toolbar"><div>{([['compact','КОМПАКТНО'],['return','НАКОПЛЕННЫЙ P/L'],['risk','РИСК'],['fundamental','ФУНДАМЕНТАЛ']] as Array<[HoldingPreset,string]>).map(([key,label])=><button key={key} className={preset===key?'is-active':''} onClick={()=>setPreset(key)}>{label}</button>)}</div><select value={sort} onChange={event=>setSort(event.target.value as HoldingSort)} aria-label="Сортировка"><option value="weight">По доле</option><option value="value">По стоимости</option><option value="pnl">По P/L</option><option value="name">По названию</option></select></div>}
    {instrumentView ? <div className="holdings-rows">{filtered.map(position => <button className="holdings-row" key={position.instrumentUid || position.figi || position.ticker} onClick={()=>onOpenAsset(position)}><span><strong>{position.ticker}</strong><small>{position.name}</small></span><span>{money.format(position.currentValue)} ₽<small>{pct.format(position.weight*100)}%</small></span>{preset==='return'&&<b>{position.expectedYield >= 0 ? '+' : ''}{money.format(position.expectedYield)} ₽</b>}{preset==='risk'&&<b>{pct.format(position.weight*100)}% концентрации</b>}{preset==='fundamental'&&<b>Открыть показатели</b>}</button>)}</div> : <div className="holdings-rows">{aggregate.rows.map(row=><div className="holdings-row" key={row.label}><strong>{row.label}</strong><span>{money.format(row.value)} ₽</span></div>)}{aggregate.unclassified>0&&<div className="holdings-missing">БЕЗ ПОДТВЕРЖДЁННОЙ КЛАССИФИКАЦИИ · {money.format(aggregate.unclassified)} ₽</div>}</div>}
    <p className="method-note">Эмитент, отрасль и валюта показываются только из нормализованных метаданных. QVANIX не угадывает отсутствующую классификацию. Пресеты и сортировка применяются к списку инструментов; агрегированные срезы ранжируются по стоимости. Риск в пресете означает концентрацию, а не VaR.</p>
  </section>
}