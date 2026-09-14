import { useState } from 'react'
import type { PositionSnapshot } from '../../lib/portfolioApi'
import { findInstrumentBadge, instrumentFallbackLabel, instrumentLogoUrl, type InstrumentBadgePayload } from './instrumentBadges'

type Props = { payload: InstrumentBadgePayload | null; position: PositionSnapshot; size?: 'row' | 'detail' }

export function InstrumentBadge({ payload, position, size = 'row' }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const logoUrl = instrumentLogoUrl(payload, findInstrumentBadge(payload, position), size === 'detail' ? 320 : 160)
  const showLogo = logoUrl != null && logoUrl !== failedUrl
  const assetLabel = instrumentFallbackLabel(position.instrumentType)
  const name = position.name || position.ticker || 'Инструмент'

  return (
    <span className={`instrument-badge instrument-badge--${size} ${showLogo ? 'has-logo' : 'is-fallback'}`}
      title={showLogo ? `${name} · логотип из метаданных T-Invest` : `${name} · резервный знак класса актива`}
      aria-label={showLogo ? `Логотип ${name}` : `Класс актива: ${assetLabel}`}>
      {showLogo ? <img src={logoUrl} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailedUrl(logoUrl)} /> : <span aria-hidden="true">{assetLabel}</span>}
    </span>
  )
}
