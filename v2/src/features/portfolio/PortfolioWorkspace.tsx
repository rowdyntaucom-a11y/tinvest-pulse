import { useMemo, useState } from 'react'
import type { PortfolioSnapshot, PositionSnapshot } from '../../lib/portfolioApi'
import { PortfolioValueChart } from './PortfolioValueChart'
import './portfolio.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const money2 = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })
const quantityFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 4 })
const pctPlain = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const pctSigned = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' })

const POSITION_PAGE_SIZE = 5

type View = 'overview' | 'positions' | 'structure'
type PositionSort = 'weight' | 'pnl' | 'pnlPct'

type Props = { snapshot: PortfolioSnapshot }

function assetTypeLabel(type: string) {
  const key = String(type || '').toLowerCase()
  if (key.includes('bond')) return 'Облигации'
  if (key.includes('share') || key.includes('stock')) return 'Акции'
  if (key.includes('etf') || key.includes('fund')) return 'Фонды'
  if (key.includes('currency')) return 'Валюта'
  if (key.includes('future')) return 'Фьючерсы'
  return 'Прочее'
}

function positionKey(position: PositionSnapshot) {
  return `${position.ticker}|${position.name}|${position.instrumentType}`
}

function positionPnl(position: PositionSnapshot) {
  const amount = Number.isFinite(position.expectedYield) ? position.expectedYield : 0
  const impliedBasis = position.currentValue - amount
  const pct = impliedBasis > 0 ? amount / impliedBasis : null
  return { amount, pct }
}

function signedMoney(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${money.format(Math.abs(value))} ₽`
}

function PositionList({ positions, selectedKey, onSelect }: {
  positions: PositionSnapshot[]
  selectedKey: string
  onSelect: (key: string) => void
}) {
  if (!positions.length) return <div className="empty-state">Позиции загружаются…</div>
  return (
    <div className="positions-list">
      {positions.map(position => {
        const ticker = position.ticker || position.name || '—'
        const sameName = !position.name || position.name.trim().toUpperCase() === ticker.trim().toUpperCase()
        const subtitle = sameName ? assetTypeLabel(position.instrumentType) : position.name
        const key = positionKey(position)
        const pnl = positionPnl(position)
        return (
          <button
            type="button"
            className={`position-row position-row--selectable ${selectedKey === key ? 'is-selected' : ''}`}
            key={key}
            onClick={() => onSelect(key)}
            aria-pressed={selectedKey === key}
          >
            <div className="position-main"><strong>{ticker}</strong><span>{subtitle}</span></div>
            <div className="position-weight"><span>{pctPlain.format(position.weight * 100)}%</span><i><b style={{ width: `${Math.min(100, position.weight * 100)}%` }} /></i></div>
            <div className="position-value">
              <strong>{money.format(position.currentValue)} ₽</strong>
              <small className={pnl.amount > 0 ? 'is-positive' : pnl.amount < 0 ? 'is-negative' : ''}>{signedMoney(pnl.amount)}</small>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function PortfolioWorkspace({ snapshot }: Props) {
  const [view, setView] = useState<View>('overview')
  const [positionPage, setPositionPage] = useState(0)
  const [positionSort, setPositionSort] = useState<PositionSort>('weight')
  const [selectedPositionKey, setSelectedPositionKey] = useState('')

  const allocation = useMemo(() => {
    const groups = new Map<string, number>()
    for (const position of snapshot.positionItems) {
      const label = assetTypeLabel(position.instrumentType)
      groups.set(label, (groups.get(label) || 0) + position.currentValue)
    }
    const total = [...groups.values()].reduce((sum, value) => sum + value, 0)
    return [...groups.entries()]
      .map(([label, value]) => ({ label, value, weight: total > 0 ? value / total : 0 }))
      .sort((a, b) => b.value - a.value)
  }, [snapshot.positionItems])

  const sortedPositions = useMemo(() => {
    const rows = [...snapshot.positionItems]
    if (positionSort === 'pnl') return rows.sort((a, b) => positionPnl(b).amount - positionPnl(a).amount)
    if (positionSort === 'pnlPct') {
      return rows.sort((a, b) => (positionPnl(b).pct ?? -Infinity) - (positionPnl(a).pct ?? -Infinity))
    }
    return rows.sort((a, b) => b.weight - a.weight)
  }, [snapshot.positionItems, positionSort])

  const positionPages = Math.max(1, Math.ceil(sortedPositions.length / POSITION_PAGE_SIZE))
  const safePositionPage = Math.min(positionPage, positionPages - 1)
  const visiblePositions = sortedPositions.slice(
    safePositionPage * POSITION_PAGE_SIZE,
    safePositionPage * POSITION_PAGE_SIZE + POSITION_PAGE_SIZE,
  )
  const selectedPosition = visiblePositions.find(position => positionKey(position) === selectedPositionKey) ?? visiblePositions[0] ?? null
  const selectedPnl = selectedPosition ? positionPnl(selectedPosition) : null

  const startDate = snapshot.startDate ? new Date(snapshot.startDate).toLocaleDateString('ru-RU') : '—'
  const topPosition = snapshot.positionItems[0]
  const top3 = snapshot.positionItems.slice(0, 3).reduce((sum, item) => sum + item.weight, 0)

  const chooseSort = (sort: PositionSort) => {
    setPositionSort(sort)
    setPositionPage(0)
    setSelectedPositionKey('')
  }

  const changePage = (nextPage: number) => {
    setPositionPage(nextPage)
    setSelectedPositionKey('')
  }

  return (
    <div className="portfolio-workspace">
      <nav className="subnav" aria-label="Разделы портфеля">
        <button onClick={() => setView('overview')} className={view === 'overview' ? 'subnav--active' : ''}>ОБЗОР</button>
        <button onClick={() => setView('positions')} className={view === 'positions' ? 'subnav--active' : ''}>ПОЗИЦИИ</button>
        <button onClick={() => setView('structure')} className={view === 'structure' ? 'subnav--active' : ''}>СТРУКТУРА</button>
        <span className={`sample-badge ${snapshot.source !== 'fallback' ? 'sample-badge--mature' : ''}`}>{snapshot.source !== 'fallback' ? 'LIVE' : 'API WAIT'}</span>
      </nav>

      {view === 'overview' && (
        <div className="portfolio-overview">
          <section className="portfolio-summary portfolio-summary--overview">
            <article className="metric-card metric-card--hero">
              <span className="metric-label">КАПИТАЛ</span>
              <strong>{snapshot.value ? `${money.format(snapshot.value)} ₽` : '—'}</strong>
              <small>текущая стоимость портфеля</small>
            </article>
            <article className="metric-card">
              <span className="metric-label">ДЕНЕЖНЫЙ РЕЗУЛЬТАТ</span>
              <strong>{snapshot.value ? `${snapshot.profit >= 0 ? '+' : ''}${money.format(snapshot.profit)} ₽` : '—'}</strong>
              <small>{snapshot.value ? `${pctSigned.format(snapshot.profitPct)}% к внешним потокам` : 'ожидаем данные'}</small>
            </article>
            <article className="context-card">
              <span>СТАРТ</span><strong>{startDate}</strong>
              <span>ПОЗИЦИЙ</span><strong>{snapshot.positions || '—'}</strong>
              <span>TOP 1</span><strong>{topPosition ? `${pctPlain.format(topPosition.weight * 100)}%` : '—'}</strong>
            </article>
          </section>

          <section className="panel portfolio-chart-panel">
            <div className="panel-head">
              <div><span className="eyebrow">ИСТОРИЯ</span><h2>ПОРТФЕЛЬ</h2></div>
              <small>{snapshot.history.length ? `${snapshot.history.length} точек` : 'история загружается'}</small>
            </div>
            <PortfolioValueChart points={snapshot.history} />
          </section>
        </div>
      )}

      {view === 'positions' && (
        <section className="panel portfolio-fill-panel portfolio-positions-panel">
          <div className="panel-head panel-head--paged">
            <div><span className="eyebrow">СОСТАВ · DRILL-DOWN</span><h2>ТЕКУЩИЕ ПОЗИЦИИ</h2></div>
            <div className="pager" aria-label="Страницы позиций">
              <button disabled={safePositionPage === 0} onClick={() => changePage(Math.max(0, safePositionPage - 1))}>‹</button>
              <span>{sortedPositions.length ? `${safePositionPage + 1}/${positionPages}` : '—'}</span>
              <button disabled={safePositionPage >= positionPages - 1} onClick={() => changePage(Math.min(positionPages - 1, safePositionPage + 1))}>›</button>
            </div>
          </div>

          <div className="position-sortbar" aria-label="Сортировка позиций">
            <span>СОРТИРОВКА</span>
            <button className={positionSort === 'weight' ? 'is-active' : ''} onClick={() => chooseSort('weight')}>ВЕС</button>
            <button className={positionSort === 'pnl' ? 'is-active' : ''} onClick={() => chooseSort('pnl')}>P/L ₽</button>
            <button className={positionSort === 'pnlPct' ? 'is-active' : ''} onClick={() => chooseSort('pnlPct')}>P/L %</button>
          </div>

          <PositionList positions={visiblePositions} selectedKey={selectedPosition ? positionKey(selectedPosition) : ''} onSelect={setSelectedPositionKey} />

          {selectedPosition && selectedPnl && (
            <div className="position-inspector">
              <div className="position-inspector__head">
                <div><span>ВЫБРАНО</span><strong>{selectedPosition.ticker || selectedPosition.name}</strong></div>
                <small>{assetTypeLabel(selectedPosition.instrumentType)} · вес {pctPlain.format(selectedPosition.weight * 100)}%</small>
              </div>
              <div className="position-inspector__grid">
                <div><span>КОЛ-ВО</span><strong>{quantityFmt.format(selectedPosition.quantity)}</strong></div>
                <div><span>СР. ЦЕНА</span><strong>{selectedPosition.averagePrice ? money2.format(selectedPosition.averagePrice) : '—'}</strong></div>
                <div><span>ТЕК. ЦЕНА</span><strong>{selectedPosition.currentPrice ? money2.format(selectedPosition.currentPrice) : '—'}</strong></div>
                <div><span>СТОИМОСТЬ</span><strong>{money.format(selectedPosition.currentValue)} ₽</strong></div>
                <div><span>P/L · API</span><strong className={selectedPnl.amount > 0 ? 'is-positive' : selectedPnl.amount < 0 ? 'is-negative' : ''}>{signedMoney(selectedPnl.amount)}</strong></div>
                <div><span>P/L %</span><strong className={(selectedPnl.pct ?? 0) > 0 ? 'is-positive' : (selectedPnl.pct ?? 0) < 0 ? 'is-negative' : ''}>{selectedPnl.pct == null ? '—' : `${pctSigned.format(selectedPnl.pct * 100)}%`}</strong></div>
              </div>
              <p>Результат позиции берётся из broker `expectedYield`; процент рассчитан относительно подразумеваемой базы позиции. Это не TWR и не вклад позиции в доходность всего портфеля.</p>
            </div>
          )}
        </section>
      )}

      {view === 'structure' && (
        <section className="panel portfolio-fill-panel">
          <div className="panel-head"><div><span className="eyebrow">СТРУКТУРА</span><h2>КЛАССЫ АКТИВОВ</h2></div><small>TOP 3 позиций · {pctPlain.format(top3 * 100)}%</small></div>
          <div className="allocation-list portfolio-allocation-list">
            {allocation.length ? allocation.map(item => (
              <div className="allocation-row" key={item.label}>
                <div><strong>{item.label}</strong><span>{money.format(item.value)} ₽</span></div>
                <b>{pctPlain.format(item.weight * 100)}%</b>
                <i><span style={{ width: `${item.weight * 100}%` }} /></i>
              </div>
            )) : <div className="empty-state">Структура появится после загрузки позиций.</div>}
          </div>
          <p className="method-note">Здесь только состав портфеля. Оценка концентрации HHI и Health остаются в «Аналитике», чтобы не дублировать одни и те же показатели.</p>
        </section>
      )}
    </div>
  )
}
