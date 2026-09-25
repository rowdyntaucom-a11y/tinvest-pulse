import type { UiWorkspace } from '../../lib/uiPreferences'

export const PRIMARY_NAVIGATION: ReadonlyArray<{ id: UiWorkspace; label: string; mobileLabel: string; icon: string }> = [
  { id: 'board', label: 'Главная', mobileLabel: 'Главная', icon: '⌂' },
  { id: 'portfolio', label: 'Портфель', mobileLabel: 'Активы', icon: '◫' },
  { id: 'analytics', label: 'Аналитика', mobileLabel: 'Анализ', icon: '⌁' },
  { id: 'income', label: 'Доход', mobileLabel: 'Доход', icon: '₽' },
  { id: 'goals', label: 'Цель', mobileLabel: 'Цель', icon: '◎' },
  { id: 'dna', label: 'DNA', mobileLabel: 'DNA', icon: '◇' },
] as const

export type SectionOption<T extends string> = { id: T; label: string; description?: string }
export type SectionGroup<T extends string> = { label: string; options: ReadonlyArray<SectionOption<T>> }

export const ANALYTICS_SECTIONS = [{ label: 'Аналитика', options: [
  { id: 'overview', label: 'Доходность', description: 'Результат портфеля и сравнение с IMOEX' }, { id: 'risk', label: 'Риски', description: 'Риск портфеля, стресс-тесты и связи активов' },
  { id: 'health', label: 'Здоровье', description: 'Сводная диагностика качества портфеля' }, { id: 'drift', label: 'Доли и цель', description: 'Фактическая структура относительно целевой' },
  { id: 'montecarlo', label: 'Сценарии', description: 'Диапазон возможных траекторий Монте-Карло' },
]}] as const

export const RISK_SECTIONS = [
  { label: 'Основное', options: [{ id: 'portfolio', label: 'Портфель', description: 'Просадка, волатильность и концентрация' }, { id: 'benchmark', label: 'Сравнение с IMOEX', description: 'Доходность и отклонение относительно индекса' }] },
  { label: 'Историческое', options: [{ id: 'rolling', label: 'История риска', description: 'Как риск менялся на исторических окнах' }, { id: 'stress', label: 'Стресс-тесты', description: 'Поведение портфеля в исторических шоках' }] },
  { label: 'Статистическое', options: [{ id: 'tail', label: 'Редкие потери', description: 'Неблагоприятные дни и хвост распределения' }, { id: 'corr', label: 'Связи активов', description: 'Какие активы двигались вместе' }] },
] as const

export const PORTFOLIO_SECTIONS = [{ label: 'Портфель', options: [{ id: 'overview', label: 'Обзор' }, { id: 'positions', label: 'Позиции' }, { id: 'structure', label: 'Структура' }] }] as const
export const INCOME_SECTIONS = [{ label: 'Доход', options: [{ id: 'overview', label: 'Обзор' }, { id: 'calendar', label: 'Календарь' }, { id: 'sources', label: 'Источники дохода' }, { id: 'taxes', label: 'Налоги и ИИС' }] }] as const

export function sectionLabel<T extends string>(groups: ReadonlyArray<SectionGroup<T>>, value: T) {
  return groups.flatMap(group => group.options).find(option => option.id === value)?.label ?? null
}
