import { useEffect, useRef } from 'react'
import type { MetricDetailModel } from './metricRegistry'

export function MetricDetailSheet({ model, onClose }: { model: MetricDetailModel | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!model) return
    const prior = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; prior?.focus() }
  }, [model, onClose])
  if (!model) return null
  return <div className="metric-detail-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="metric-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="metric-detail-title">
      <header><div><span>МЕТРИКА · {model.status.toUpperCase()}</span><h2 id="metric-detail-title">{model.title}</h2></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Закрыть подробности">×</button></header>
      <div className="metric-detail-scroll">
        <div className="metric-detail-answer"><strong>{model.value}</strong><p>{model.explanation}</p></div>
        <dl><div><dt>Период / контекст</dt><dd>{model.period}</dd></div><div><dt>Покрытие и качество</dt><dd>{model.coverage}</dd></div><div><dt>Источник</dt><dd>{model.source}</dd></div><div><dt>Свежесть</dt><dd>{model.freshness}</dd></div><div><dt>Метод · {model.methodVersion}</dt><dd>{model.methodology}</dd></div></dl>
        {model.components?.length ? <div className="metric-detail-components"><h3>Почему такой результат</h3>{model.components.map(item => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.note}</small></article>)}</div> : null}
        <div className="metric-detail-limits"><h3>Ограничения</h3><ul>{model.limitations.map(item => <li key={item}>{item}</li>)}</ul></div>
        {model.deeperAction && <button className="metric-detail-deeper" type="button" onClick={() => { model.deeperAction?.onSelect(); onClose() }}>{model.deeperAction.label}</button>}
      </div>
    </section>
  </div>
}
