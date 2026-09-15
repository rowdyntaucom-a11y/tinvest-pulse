import type { PositionSnapshot } from '../../lib/portfolioApi'

export function resolveCanonicalAsset(current: PositionSnapshot | null, positions: PositionSnapshot[]): PositionSnapshot | null {
  if (!current) return null
  const uid = current.instrumentUid?.trim() || null
  const figi = current.figi?.trim() || null
  if (!uid && !figi) return null
  const matches = positions.filter(position => uid ? position.instrumentUid === uid : position.figi === figi)
  return matches.length === 1 ? matches[0] : null
}
