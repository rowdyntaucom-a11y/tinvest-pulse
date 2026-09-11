export type StressExposure = {
  key: string
  label: string
  classKey: string
  currentValue: number
}

export type StressScenario = {
  id: string
  label: string
  source: string
  sourceDate: string | null
  shocks: Record<string, number>
}

export type StressRow = {
  key: string
  label: string
  classKey: string
  currentValue: number
  shock: number | null
  shockedValue: number | null
  pnl: number | null
}

export type StressResult = {
  available: boolean
  scenarioId: string
  scenarioLabel: string
  source: string
  sourceDate: string | null
  currentValue: number
  coveredValue: number
  coverageRatio: number
  shockedCoveredValue: number | null
  pnlCovered: number | null
  pnlCoveredPct: number | null
  rows: StressRow[]
  note: string
}

export function calculateStressScenario(exposures: StressExposure[], scenario: StressScenario): StressResult {
  const rows = exposures
    .filter(exposure => Number.isFinite(exposure.currentValue) && exposure.currentValue > 0)
    .map(exposure => {
      const rawShock = scenario.shocks[exposure.classKey]
      const shock = Number.isFinite(rawShock) ? rawShock : null
      const shockedValue = shock == null ? null : exposure.currentValue * (1 + shock)
      return {
        ...exposure,
        shock,
        shockedValue,
        pnl: shockedValue == null ? null : shockedValue - exposure.currentValue,
      }
    })

  const currentValue = rows.reduce((sum, row) => sum + row.currentValue, 0)
  const coveredRows = rows.filter(row => row.shock != null && row.shockedValue != null)
  const coveredValue = coveredRows.reduce((sum, row) => sum + row.currentValue, 0)
  const shockedCoveredValue = coveredRows.length ? coveredRows.reduce((sum, row) => sum + row.shockedValue!, 0) : null
  const pnlCovered = shockedCoveredValue == null ? null : shockedCoveredValue - coveredValue
  const coverageRatio = currentValue > 0 ? coveredValue / currentValue : 0

  return {
    available: coveredRows.length > 0,
    scenarioId: scenario.id,
    scenarioLabel: scenario.label,
    source: scenario.source,
    sourceDate: scenario.sourceDate,
    currentValue,
    coveredValue,
    coverageRatio,
    shockedCoveredValue,
    pnlCovered,
    pnlCoveredPct: pnlCovered == null || coveredValue <= 0 ? null : pnlCovered / coveredValue,
    rows,
    note: coveredRows.length
      ? `Сценарий применён только к классам с явным shock-return. Покрытие ${(coverageRatio * 100).toFixed(1)}%. Непокрытые активы не получают выдуманный шок.`
      : 'Нет ни одного класса активов с заданным shock-return; результат не рассчитывается.',
  }
}
