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
  { id: 'overview', label: 'Обзор доходности' }, { id: 'risk', label: 'Риски' },
  { id: 'health', label: 'Здоровье портфеля' }, { id: 'drift', label: 'Цель и фактические доли' },
  { id: 'montecarlo', label: 'Сценарии Монте-Карло' },
]}] as const

export const RISK_SECTIONS = [
  { label: 'Основное', options: [{ id: 'portfolio', label: 'Риск портфеля' }, { id: 'benchmark', label: 'Сравнение с IMOEX' }] },
  { label: 'Историческое', options: [{ id: 'rolling', label: 'Исторические окна' }, { id: 'stress', label: 'Стресс-тесты' }] },
  { label: 'Статистическое', options: [{ id: 'tail', label: 'Хвостовые риски' }, { id: 'corr', label: 'Связи активов' }] },
] as const

export const PORTFOLIO_SECTIONS = [{ label: 'Портфель', options: [{ id: 'overview', label: 'Обзор' }, { id: 'positions', label: 'Позиции' }, { id: 'structure', label: 'Структура' }] }] as const
export const INCOME_SECTIONS = [{ label: 'Доход', options: [{ id: 'overview', label: 'Обзор' }, { id: 'calendar', label: 'Календарь' }, { id: 'sources', label: 'Источники дохода' }, { id: 'taxes', label: 'Налоги и ИИС' }] }] as const

export function sectionLabel<T extends string>(groups: ReadonlyArray<SectionGroup<T>>, value: T) {
  return groups.flatMap(group => group.options).find(option => option.id === value)?.label ?? null
}
