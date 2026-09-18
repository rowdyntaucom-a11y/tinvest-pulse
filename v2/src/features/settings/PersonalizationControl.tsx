import { useRef } from 'react'
import type { UiDensity, UiModuleId, UiMotion, UiPreferences, UiTheme, UiWorkspace } from '../../lib/uiPreferences'
import './personalization.css'

type PreferencePatch = Partial<Pick<UiPreferences, 'theme' | 'density' | 'motion' | 'detailMode' | 'defaultWorkspace' | 'pinnedModules'>>
type Props = { preferences: UiPreferences; onChange: (patch: PreferencePatch) => void; onReset: () => void }

const THEMES: Array<{ key: UiTheme; label: string; note: string }> = [
  { key: 'core', label: 'CORE', note: 'мятный терминал' }, { key: 'horizon', label: 'HORIZON', note: 'стекло · консоль' },
  { key: 'carbon', label: 'CARBON', note: 'графит · строго' }, { key: 'aurora', label: 'AURORA', note: 'свечение · атмосфера' },
  { key: 'minimal', label: 'MINIMAL', note: 'данные без декора' }, { key: 'amoled', label: 'AMOLED', note: 'чёрный · контраст' },
]
const DENSITY: Array<{ key: UiDensity; label: string }> = [{ key:'compact',label:'ПЛОТНО'},{key:'balanced',label:'БАЛАНС'},{key:'focus',label:'ФОКУС'}]
const DETAIL_MODE: Array<{ key: UiPreferences['detailMode']; label: string; note: string }> = [{key:'simple',label:'ПРОСТО',note:'главное без шума'},{key:'detailed',label:'ПОДРОБНО',note:'весь контекст'}]
const MOTION: Array<{ key: UiMotion; label: string }> = [{key:'full',label:'ПОЛНОЕ'},{key:'reduced',label:'МЯГКОЕ'},{key:'off',label:'ВЫКЛ'}]
const WORKSPACES: Array<{ key: UiWorkspace; label: string }> = [{key:'board',label:'ГЛАВНАЯ'},{key:'portfolio',label:'АКТИВЫ'},{key:'analytics',label:'АНАЛИЗ'},{key:'income',label:'ДОХОД'},{key:'goals',label:'ЦЕЛЬ'},{key:'dna',label:'DNA'}]
const MODULES: Array<{ key: UiModuleId; label: string; group: string }> = [
  {key:'portfolio.value',label:'КАПИТАЛ',group:'PORTFOLIO'},{key:'portfolio.pnl',label:'P/L',group:'PORTFOLIO'},
  {key:'analytics.twr',label:'TWR',group:'ANALYTICS'},{key:'analytics.xirr',label:'XIRR',group:'ANALYTICS'},
  {key:'analytics.health',label:'HEALTH',group:'ANALYTICS'},{key:'analytics.risk',label:'RISK',group:'ANALYTICS'},
  {key:'income.fact',label:'FACT',group:'INCOME'},{key:'income.next',label:'NEXT',group:'INCOME'},{key:'macro.keyRate',label:'RATE',group:'MACRO'},
]

function ChoiceButton({active,label,note,onClick,disabled=false}:{active:boolean;label:string;note?:string;onClick:()=>void;disabled?:boolean}) {
  return <button type="button" className={`qv-choice ${active?'is-active':''}`} onClick={onClick} aria-pressed={active} disabled={disabled}><strong>{label}</strong>{note?<small>{note}</small>:null}</button>
}

export function PersonalizationControl({ preferences, onChange, onReset }: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const close = () => { if (detailsRef.current) detailsRef.current.open = false }
  const toggleModule = (id: UiModuleId) => {
    const active=preferences.pinnedModules.includes(id)
    if(active){const next=preferences.pinnedModules.filter(item=>item!==id);if(next.length)onChange({pinnedModules:next});return}
    if(preferences.pinnedModules.length>=6)return
    onChange({pinnedModules:[...preferences.pinnedModules,id]})
  }
  return <details ref={detailsRef} className="qv-personalize">
    <summary aria-label="Настроить интерфейс QVANIX" title="Персонализация QVANIX"><span>Q</span><i /></summary>
    <section className="qv-personalize__panel" aria-label="Персонализация QVANIX">
      <header><div><span>QVANIX · ИНТЕРФЕЙС</span><strong>ПЕРСОНАЛИЗАЦИЯ</strong></div><button type="button" className="qv-personalize__close" onClick={close} aria-label="Закрыть персонализацию">← <span>НАЗАД</span></button></header>
      <div className="qv-personalize__section"><div className="qv-personalize__label"><span>ОБОЛОЧКА</span><small>меняет не только цвет</small></div><div className="qv-theme-grid">{THEMES.map(theme=><ChoiceButton key={theme.key} active={preferences.theme===theme.key} label={theme.label} note={theme.note} onClick={()=>onChange({theme:theme.key})}/>)}</div></div>
      <div className="qv-personalize__section"><div className="qv-personalize__label"><span>РЕЖИМ ИНФОРМАЦИИ</span><small>цифры и расчёты не меняются</small></div><div className="qv-detail-mode">{DETAIL_MODE.map(item=><ChoiceButton key={item.key} active={preferences.detailMode===item.key} label={item.label} note={item.note} onClick={()=>onChange({detailMode:item.key})}/>)}</div></div>
      <div className="qv-personalize__section qv-personalize__split">
        <div><div className="qv-personalize__label"><span>ПЛОТНОСТЬ</span><small>информация / воздух</small></div><div className="qv-segmented">{DENSITY.map(item=><ChoiceButton key={item.key} active={preferences.density===item.key} label={item.label} onClick={()=>onChange({density:item.key})}/>)}</div></div>
        <div><div className="qv-personalize__label"><span>ДВИЖЕНИЕ</span><small>эффекты / доступность</small></div><div className="qv-segmented">{MOTION.map(item=><ChoiceButton key={item.key} active={preferences.motion===item.key} label={item.label} onClick={()=>onChange({motion:item.key})}/>)}</div></div>
      </div>
      <div className="qv-personalize__section"><div className="qv-personalize__label"><span>МОЯ ПАНЕЛЬ</span><small>{preferences.pinnedModules.length}/6 · нажмите, чтобы закрепить или убрать</small></div><div className="qv-module-grid">{MODULES.map(item=>{const active=preferences.pinnedModules.includes(item.key);return <ChoiceButton key={item.key} active={active} label={item.label} note={item.group} disabled={!active&&preferences.pinnedModules.length>=6} onClick={()=>toggleModule(item.key)}/>})}</div></div>
      <div className="qv-personalize__section"><div className="qv-personalize__label"><span>СТАРТОВОЕ ПРОСТРАНСТВО</span><small>откроется при следующем запуске</small></div><div className="qv-workspace-grid">{WORKSPACES.map(item=><ChoiceButton key={item.key} active={preferences.defaultWorkspace===item.key} label={item.label} onClick={()=>onChange({defaultWorkspace:item.key})}/>)}</div></div>
      <footer><p>Хранятся только настройки интерфейса. API-ключи, брокерские данные и финансовые секреты сюда не попадают.</p><button type="button" onClick={onReset}>СБРОСИТЬ UI</button></footer>
    </section>
  </details>
}
