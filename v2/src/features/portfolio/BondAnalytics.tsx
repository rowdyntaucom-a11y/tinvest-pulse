import { useMemo } from 'react'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import './bondAnalytics.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })

type Props = { positions: PositionSnapshot[] }

type Bucket = { key: string; label: string; value: number }

function isBond(position: PositionSnapshot) {
  const type = String(position.instrumentType || '').toLowerCase()
  const ticker = String(position.ticker || '').toUpperCase()
  return type.includes('bond') || /^SU\d{5,}/.test(ticker) || /ОФЗ/i.test(position.name || '')
}

function isOfz(position: PositionSnapshot) {
  const ticker = String(position.ticker || '').toUpperCase()
  return /^SU\d{5,}/.test(ticker) || /ОФЗ/i.test(position.name || '')
}

function hasVerifiedBondMeta(position: PositionSnapshot) {
  const meta = position.bond
  if (!meta) return false
  return Boolean(
    meta.maturityDate ||
    (meta.nominal != null && meta.nominal > 0) ||
    meta.currency ||
    meta.couponQuantityPerYear != null ||
    meta.issueKind ||
    meta.countryOfRisk ||
    meta.countryOfRiskName ||
    meta.sector ||
    meta.floatingCoupon === true ||
    meta.perpetual === true ||
    meta.amortizing === true
  )
}

function maturityBucket(position: PositionSnapshot) {
  const meta = position.bond
  if (!meta) return 'unknown'
  if (meta.perpetual) return 'perpetual'
  if (!meta.maturityDate) return 'unknown'
  const maturity = new Date(meta.maturityDate).getTime()
  if (!Number.isFinite(maturity)) return 'unknown'
  const years = (maturity - Date.now()) / (365.25 * 24 * 60 * 60 * 1000)
  if (years <= 3) return '0-3'
  if (years <= 7) return '3-7'
  if (years <= 15) return '7-15'
  return '15+'
}

function addBucket(map: Map<string, number>, key: string, value: number) {
  map.set(key, (map.get(key) || 0) + value)
}

export function BondAnalytics({ positions }: Props) {
  const model = useMemo(() => {
    const bonds = positions.filter(isBond)
    const total = bonds.reduce((sum, position) => sum + position.currentValue, 0)
    const metadataValue = bonds.filter(hasVerifiedBondMeta).reduce((sum, position) => sum + position.currentValue, 0)
    const ofzValue = bonds.filter(isOfz).reduce((sum, position) => sum + position.currentValue, 0)

    const maturity = new Map<string, number>()
    const coupon = new Map<string, number>()
    const currency = new Map<string, number>()

    for (const position of bonds) {
      addBucket(maturity, maturityBucket(position), position.currentValue)

      const meta = position.bond
      if (meta?.floatingCoupon === true) addBucket(coupon, 'floating', position.currentValue)
      else if (meta?.floatingCoupon === false && meta.couponQuantityPerYear != null) addBucket(coupon, 'nonfloating', position.currentValue)
      else addBucket(coupon, 'unknown', position.currentValue)

      addBucket(currency, meta?.currency || 'UNKNOWN', position.currentValue)
    }

    const maturityLabels: Record<string, string> = {
      '0-3': '≤ 3 лет',
      '3-7': '3–7 лет',
      '7-15': '7–15 лет',
      '15+': '15+ лет',
      perpetual: 'Бессрочные',
      unknown: 'Нет данных',
    }
    const maturityOrder = ['0-3', '3-7', '7-15', '15+', 'perpetual', 'unknown']
    const maturityRows: Bucket[] = maturityOrder
      .map(key => ({ key, label: maturityLabels[key], value: maturity.get(key) || 0 }))
      .filter(row => row.value > 0)

    const nearest = bonds
      .filter(position => position.bond?.maturityDate && !position.bond?.perpetual)
      .map(position => ({ position, time: new Date(position.bond!.maturityDate!).getTime() }))
      .filter(row => Number.isFinite(row.time) && row.time >= Date.now())
      .sort((a, b) => a.time - b.time)[0] || null

    const couponRows: Bucket[] = [
      { key: 'floating', label: 'Плавающий', value: coupon.get('floating') || 0 },
      { key: 'nonfloating', label: 'Не плавающий', value: coupon.get('nonfloating') || 0 },
      { key: 'unknown', label: 'Нет данных', value: coupon.get('unknown') || 0 },
    ].filter(row => row.value > 0)

    const currencyRows = [...currency.entries()]
      .map(([key, value]) => ({ key, label: key === 'UNKNOWN' ? 'Нет данных' : key, value }))
      .sort((a, b) => b.value - a.value)

    return {
      bonds,
      total,
      metadataValue,
      metadataCoverage: total > 0 ? metadataValue / total : 0,
      ofzValue,
      ofzShare: total > 0 ? ofzValue / total : 0,
      maturityRows,
      couponRows,
      currencyRows,
      nearest,
      amortizingCount: bonds.filter(position => position.bond?.amortizing === true).length,
      floatingCount: bonds.filter(position => position.bond?.floatingCoupon === true).length,
    }
  }, [positions])

  if (!model.bonds.length) {
    return <div className="bond-empty">Облигаций в текущем портфеле нет.</div>
  }

  return (
    <div className="bond-analytics">
      <div className="bond-summary">
        <article><span>ОБЛИГАЦИИ</span><strong>{model.bonds.length}</strong><small>{money.format(model.total)} ₽</small></article>
        <article><span>ОФЗ В BOND-СЛИВЕ</span><strong>{pct.format(model.ofzShare * 100)}%</strong><small>{money.format(model.ofzValue)} ₽</small></article>
        <article><span>МЕТАДАННЫЕ</span><strong>{pct.format(model.metadataCoverage * 100)}%</strong><small>по стоимости позиций</small></article>
        <article><span>БЛИЖАЙШЕЕ ПОГАШЕНИЕ</span><strong>{model.nearest ? model.nearest.position.ticker : '—'}</strong><small>{model.nearest ? dateFmt.format(new Date(model.nearest.position.bond!.maturityDate!)) : 'нет подтверждённой даты'}</small></article>
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
          </div>
          <div>
            <div className="bond-block__head"><strong>ВАЛЮТА НОМИНАЛА</strong><span>из metadata</span></div>
            <div className="bond-mini-list">
              {model.currencyRows.map(row => <div key={row.key}><span>{row.label}</span><b>{pct.format(model.total > 0 ? row.value / model.total * 100 : 0)}%</b></div>)}
            </div>
          </div>
        </section>
      </div>

      <p className="bond-method-note">Погашения, валюта и тип купона показываются только из инструментальных данных Т‑Банка. QVANIX не угадывает их по тикеру. Доходность к погашению и duration пока намеренно не показываются: сначала нужно зафиксировать и проверить семантику цен/номинала для всех выпусков.</p>
    </div>
  )
}
