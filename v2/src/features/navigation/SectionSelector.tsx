import type { SectionGroup } from './navigationModel'
import './navigation.css'

export function SectionSelector<T extends string>({ workspace, value, groups, onChange, aside }: { workspace: string; value: T; groups: ReadonlyArray<SectionGroup<T>>; onChange: (value: T) => void; aside?: React.ReactNode }) {
  const options = groups.flatMap(group => group.options)
  const current = options.find(option => option.id === value)
  return <div className="section-selector">
    <label><span>{workspace}</span><select value={value} onChange={event => onChange(event.target.value as T)} aria-label={`${workspace}: текущий раздел`}>
      {groups.map(group => <optgroup label={group.label} key={group.label}>{group.options.map(option => <option value={option.id} key={option.id}>{option.label}</option>)}</optgroup>)}
    </select><small aria-live="polite">{current?.description ?? current?.label ?? '—'}</small></label>
    <nav aria-label={`${workspace}: разделы`}>{options.map(option => <button type="button" key={option.id} aria-current={value === option.id ? 'page' : undefined} className={value === option.id ? 'is-active' : ''} onClick={() => onChange(option.id)}>{option.label}</button>)}</nav>
    {aside}
  </div>
}
