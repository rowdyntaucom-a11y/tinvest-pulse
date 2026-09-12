import { useMemo } from 'react'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { buildBondMaturityDiagnostics } from './bondMaturityDiagnostics'
import { buildBondRiskDimensions, type BondDimension } from './bondRiskDimensions'
import './bondAnalytics.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const yearsFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })

type Props = { positions: PositionSnapshot[] }

function BondRiskLine({ label, dimension }: { label: string; dimension: BondDimension }) {
  const top = dimension.rows[0]
  if (!dimension.available || !top) {
    return (
      <div className="bond-risk-line">
        <span>{label}</span>
        <small>нет metadata</small>
      </div>
    )
  }

  return (
    <div className="bond-risk-line">
      <span>{label} · покрытие {pct.format(dimension.coverageRatio * 100)}%</span>
      <small title={`HHI ${dimension.hhi == null ? '—' : dimension.hhi.toFixed(3)} · эффективное число ${dimension.effectiveCount == null ? '—' : dimension.effectiveCount.toFixed(2)}`}>
        {top.label} {pct.format(top.shareOfCovered * 100)}% покрытого · Nₑ {dimension.effectiveCount == null ? '—' : pct.format(dimension.effectiveCount)}
      </small>
    </div>
  )
}

export function BondAnalytics({ positions }: Props) {
  const riskDimensions = useMemo(() => buildBondRiskDimensions(positions), [positions])
  const model = useMemo(() => buildBondMaturityDiagnostics(positions), [positions])

  if (!model.bondCount) {
    return <div className="bond-empty">Облигаций в текущем портфеле нет.</div>
  }

  return (
    <div className="bond-analytics">
      <div className="bond-summary">
        <article><span>ОБЛИГАЦИИ</span><strong>{model.bondCount}</strong><small>{money.format(model.total)} ₽</small></article>
        <article><span>ОФЗ В BOND-СЛИВЕ</span><strong>{pct.format(model.ofzShare * 100)}%</strong><small>{money.format(model.ofzValue)} ₽</small></article>
        <article><span>ДАТЫ ПОГАШЕНИЯ</span><strong>{pct.format(model.maturityDateCoverage * 100)}%</strong><small>{model.weightedYearsToMaturity == null ? 'средний срок —' : `ср. ${yearsFmt.format(model.weightedYearsToMaturity)} г.`} · meta {pct.format(model.metadataCoverage * 100)}%</small></article>
        <article><span>БЛИЖАЙШЕЕ ПОГАШЕНИЕ</span><strong>{model.nearest ? model.nearest.ticker : '—'}</strong><small>{model.nearest ? dateFmt.format(new Date(model.nearest.maturityDate)) : 'нет подтверждённой даты'}</small></article>
      </div>

      <div className="bond-grid">
        <section className="bond-block">
          <div className="bond-block__head"><strong>ЛЕСТНИЦА ПОГАШЕНИЙ</strong><span>текущая стоимость</span></div>
          <div className="bond-bars">
            {model.maturityRows.map(row => {
              const share = model.total > 0 ? row.value / model.total : 0
              return (
                <div className="bond-bar" key={row.key}>
                  <div><span>{row.label}</span><b>{pct.format(share * 100)}%</b></div>
                  <i><span style={{ width: `${Math.min(100, share * 100)}%` }} /></i>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bond-block bond-block--split">
          <div>
            <div className="bond-block__head"><strong>КУПОН</strong><span>{model.floatingCount} float · {model.amortizingCount} amort.</span></div>
            <div className="bond-mini-list">
              {model.couponRows.map(row => <div key={row.key}><span>{row.label}</span><b>{pct.format(model.total > 0 ? row.value / model.total * 100 : 0)}%</b></div>)}
            </div>
            <BondRiskLine label="ЭМИТЕНТ" dimension={riskDimensions.issuer} />
            <BondRiskLine label="СЕКТОР" dimension={riskDimensions.sector} />
          </div>
          <div>
            <div className="bond-block__head"><strong>ВАЛЮТА НОМИНАЛА</strong><span>из metadata</span></div>
            <div className="bond-mini-list">
              {model.currencyRows.map(row => <div key={row.key}><span>{row.label}</span><b>{pct.format(model.total > 0 ? row.value / model.total * 100 : 0)}%</b></div>)}
            </div>
            <BondRiskLine label="СТРАНА РИСКА" dimension={riskDimensions.countryOfRisk} />
          </div>
        </section>
      </div>

      <p className="bond-method-note">Погашения, валюта, тип купона, сектор и страна риска показываются только из инструментальных данных Т‑Банка. Эмитент определяется только через подтверждённую цепочку bond asset UID → AssetFull brand UID; название используется лишь как подпись, группировка — по UID. Для issuer/sector/country доля лидера и Nₑ считаются только внутри покрытой metadata-выборки, поэтому покрытие всегда показывается отдельно. Средний срок — взвешенный текущей стоимостью календарный срок до подтверждённых будущих дат погашения; бессрочные и выпуски без валидной даты из среднего исключаются. Это не duration и не оценка чувствительности цены. Доходность к погашению пока намеренно не показывается: сначала нужно зафиксировать и проверить семантику цены и номинала для всех выпусков.</p>
    </div>
  )
}
