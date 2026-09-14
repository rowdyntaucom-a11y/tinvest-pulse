import { canUseCapability, type ProductCapability, type ProductPlan } from './accessPolicy.ts'

export type ProductWorkspace = 'portfolio' | 'analytics' | 'income' | 'terminal' | 'dna' | 'reports'

export type ProductSurface = {
  capability: ProductCapability
  workspace: ProductWorkspace
  title: string
  summary: string
}

export const PRODUCT_SURFACES: readonly ProductSurface[] = [
  { capability: 'portfolio.current', workspace: 'portfolio', title: 'Текущий портфель', summary: 'Капитал, позиции и текущий денежный результат.' },
  { capability: 'portfolio.structure', workspace: 'portfolio', title: 'Структура портфеля', summary: 'Доли классов активов и концентрация.' },
  { capability: 'portfolio.fullCoverage', workspace: 'portfolio', title: 'Полный охват портфеля', summary: 'Расчёты по всем позициям без лимита бесплатного тарифа.' },
  { capability: 'analytics.basicReturn', workspace: 'analytics', title: 'Базовая доходность', summary: 'Краткая оценка результата портфеля.' },
  { capability: 'analytics.healthBasic', workspace: 'analytics', title: 'Базовая оценка портфеля', summary: 'Упрощённая проверка состояния портфеля.' },
  { capability: 'analytics.fullPerformance', workspace: 'analytics', title: 'Расширенная доходность', summary: 'TWR, XIRR, сравнение с индексом и подробная история.' },
  { capability: 'analytics.advancedRisk', workspace: 'analytics', title: 'Расширенный риск', summary: 'Просадка, волатильность, Sharpe, Sortino, VaR/CVaR и связанные разрезы.' },
  { capability: 'analytics.monteCarlo', workspace: 'analytics', title: 'Монте-Карло', summary: 'Распределение сценариев по исторической выборке.' },
  { capability: 'analytics.driftScenarios', workspace: 'analytics', title: 'Отклонение от стратегии', summary: 'Сценарии довнесения, вывода и перераспределения капитала.' },
  { capability: 'analytics.bondsAdvanced', workspace: 'portfolio', title: 'Облигации', summary: 'Сроки, эмитенты, купоны, валюты и концентрация облигационной части.' },
  { capability: 'income.fact', workspace: 'income', title: 'Полученный доход', summary: 'Фактически полученные дивиденды и купоны.' },
  { capability: 'income.calendarPreview', workspace: 'income', title: 'Ближайшие выплаты', summary: 'Краткий календарь подтверждённых выплат.' },
  { capability: 'income.sourcesAdvanced', workspace: 'income', title: 'Источники дохода', summary: 'Подробная структура выплат, концентрация и YoC.' },
  { capability: 'income.taxTools', workspace: 'income', title: 'Налоги и вычеты', summary: 'До налога, удержано, на руки и расчёт доступного вычета.' },
  { capability: 'terminal.indicators', workspace: 'terminal', title: 'Технические индикаторы', summary: 'Детерминированные индикаторы по проверенным рыночным данным.' },
  { capability: 'terminal.alerts', workspace: 'terminal', title: 'Мои уведомления', summary: 'Условия, которые задаёт сам пользователь.' },
  { capability: 'terminal.screeners', workspace: 'terminal', title: 'Мои фильтры', summary: 'Пользовательские правила отбора без рекомендаций купить или продать.' },
  { capability: 'dna.basic', workspace: 'dna', title: 'DNA', summary: 'Базовый прогресс и состояние инвестиционного мира.' },
  { capability: 'dna.richWorld', workspace: 'dna', title: 'Живой мир', summary: 'Расширенные события, визуальные состояния и коллекционные механики.' },
  { capability: 'reports.advanced', workspace: 'reports', title: 'Расширенные отчёты', summary: 'Подробные отчёты и экспорт с версией методологии.' },
] as const

const byCapability = new Map<ProductCapability, ProductSurface>(PRODUCT_SURFACES.map(surface => [surface.capability, surface]))

export function getProductSurface(capability: ProductCapability) {
  return byCapability.get(capability) ?? null
}

export function getMinimumPlan(capability: ProductCapability): ProductPlan {
  return canUseCapability('BASE', capability) ? 'BASE' : 'PRO'
}

export function getPlanSurfaces(plan: ProductPlan) {
  return PRODUCT_SURFACES.filter(surface => canUseCapability(plan, surface.capability))
}
