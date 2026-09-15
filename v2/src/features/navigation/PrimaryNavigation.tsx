import type { UiWorkspace } from '../../lib/uiPreferences'
import { PRIMARY_NAVIGATION } from './navigationModel'
import './navigation.css'
export function PrimaryNavigation({ active, onNavigate, onPulse }: { active: UiWorkspace; onNavigate: (workspace: UiWorkspace) => void; onPulse: () => void }) {
  return <><nav className="desktop-primary-nav" aria-label="Основные разделы">{PRIMARY_NAVIGATION.map(item => <button type="button" key={item.id} onClick={() => onNavigate(item.id)} aria-current={active === item.id ? 'page' : undefined} className={`chip ${active === item.id ? 'chip--active' : ''}`}>{item.label.toUpperCase()}</button>)}<button type="button" onClick={onPulse} className="chip chip--pulse">ПУЛЬС ↗</button></nav>
  <nav className="mobile-primary-nav" aria-label="Основные разделы">{PRIMARY_NAVIGATION.map(item => <button type="button" key={item.id} onClick={() => onNavigate(item.id)} aria-current={active === item.id ? 'page' : undefined}><span aria-hidden="true">{item.icon}</span><b>{item.mobileLabel}</b></button>)}</nav></>
}
