import { useEffect, useMemo, useState } from 'react'
import './dividendDiscovery.css'

type DiscoveryRow = {
  assetUid: string
  instrumentUid: string
  ticker: string
  name: string
  dividendYield: number
  marketCap: number | null
}

type DiscoveryCoverage = {
  shares?: number
  fundamentals?: number
  matchedFundamentals?: number
  dividendRows?: number
  missingDividendYield?: number
  nonPositiveDividendYield?: number
}

type DiscoveryPayload = {
  available: boolean
  rows: DiscoveryRow[]
  coverage?: DiscoveryCoverage
}

const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 })

function isPayload(value: unknown): value is DiscoveryPayload {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<DiscoveryPayload>
  return typeof candidate.available === 'boolean' && Array.isArray(candidate.rows)
}

export function DividendDiscovery() {
  const [data, setData] = useState<DiscoveryPayload | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setFailed(false)
    fetch('/api/dividend-discovery', {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async response => {
        if (!response.ok) throw new Error(String(response.status))
        const payload: unknown = await response.json()
        if (!isPayload(payload)) throw new Error('invalid payload')
        setData(payload)
      })
      .catch(error => {
        if ((error as Error).name !== 'AbortError') setFailed(true)
      })
    return () => controller.abort()
  }, [])

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleUpperCase('ru-RU')
    return (data?.rows ?? [])
      .filter(row => !normalizedQuery
        || row.ticker.toLocaleUpperCase('ru-RU').includes(normalizedQuery)
        || row.name.toLocaleUpperCase('ru-RU').includes(normalizedQuery))
      .slice(0, 40)
  }, [data, query])

  const coverage = data?.coverage
  const coverageRatio = coverage?.shares && coverage.matchedFundamentals != null
    ? coverage.matchedFundamentals / coverage.shares * 100
    : null

  return (
    <section className="panel dividend-discovery" aria-labelledby="dividend-discovery-title">
      <div className="income-panel-head">
        <div>
          <span className="eyebrow">РЫНОК · T‑INVEST FUNDAMENTALS</span>
          <h2 id="dividend-discovery-title">ДИВИДЕНДНЫЙ ОБЗОР</h2>
        </div>
        <small>{coverage?.dividendRows ?? '—'} бумаг</small>
      </div>

      <p className="dividend-discovery__lead">
        Аналитический список рынка. Доходность не прогнозируется: используются только положительные значения,
        полученные из GetAssetFundamentals и связанные с акцией по точному asset UID.
      </p>
      <input
        className="dividend-discovery__search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Тикер или компания"
        aria-label="Поиск по дивидендному обзору"
      />

      {!data && !failed && <div className="income-empty">Загружаем подтверждённые фундаментальные данные…</div>}
      {failed && <div className="income-empty">Рыночные фундаментальные данные сейчас недоступны. Значения не подменяются.</div>}
      {data && !data.available && (
        <div className="income-empty">
          Недостаточное покрытие: подтверждённых строк с положительной дивидендной доходностью нет.
        </div>
      )}
      {data?.available && rows.length === 0 && (
        <div className="income-empty">По текущему запросу подтверждённых строк нет.</div>
      )}

      {rows.length > 0 && (
        <div className="dividend-discovery__table" role="table" aria-label="Акции с подтверждённой дивидендной доходностью">
          <div className="dividend-discovery__row is-head" role="row">
            <span role="columnheader">Компания</span><span role="columnheader">Доходность</span><span role="columnheader">Капитализация</span>
          </div>
          {rows.map(row => (
            <div className="dividend-discovery__row" role="row" key={row.assetUid}>
              <span role="cell"><b>{row.ticker}</b><small>{row.name}</small></span>
              <strong role="cell">{pct.format(row.dividendYield)}%</strong>
              <span role="cell">{row.marketCap != null ? compact.format(row.marketCap) : 'нет данных'}</span>
            </div>
          ))}
        </div>
      )}

      {data && (
        <p className="income-method-note">
          Покрытие fundamentals: {coverage?.matchedFundamentals ?? '—'} из {coverage?.shares ?? '—'} акций
          {coverageRatio == null ? '' : ` (${pct.format(coverageRatio)}%)`} · положительная доходность: {coverage?.dividendRows ?? '—'}
          {' '}· доходность отсутствует: {coverage?.missingDividendYield ?? '—'} · нулевая/отрицательная: {coverage?.nonPositiveDividendYield ?? '—'}.
          Сортировка описательная, не рейтинг привлекательности и не сигнал купить или продать.
        </p>
      )}
    </section>
  )
}
