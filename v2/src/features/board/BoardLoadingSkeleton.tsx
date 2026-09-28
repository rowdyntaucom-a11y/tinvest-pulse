import './boardLoadingSkeleton.css'

type Props = {
  accountName: string
}

const contextCells = ['ИСТОЧНИК', 'ИСТОРИЯ', 'ПОКРЫТИЕ ВЫПЛАТ', 'КЛЮЧЕВАЯ СТАВКА']
const moduleCells = ['КАПИТАЛ', 'РЕЗУЛЬТАТ', 'СТРАТЕГИЯ', 'ЗДОРОВЬЕ', 'ДОХОД', 'СТАВКА']

export function BoardLoadingSkeleton({ accountName }: Props) {
  return (
    <div className="qv-board qv-board--loading" aria-live="polite" aria-busy="true" aria-label="Загружаем данные портфеля">
      <section className="qv-board__hero qv-board__hero--loading">
        <div className="qv-board__hero-copy">
          <span className="qv-board__kicker">КАПИТАЛ · {accountName || 'ПОРТФЕЛЬ'}</span>
          <div className="qv-board-loading__capital" aria-hidden="true" />
          <div className="qv-board-loading__pnl" aria-hidden="true" />
          <p>Подтверждаем актуальный снимок брокера…</p>
        </div>
        <div className="qv-board__trace" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <section className="qv-board__rail" aria-label="Контекст данных загружается">
        {contextCells.map(label => (
          <article key={label}>
            <span>{label}</span>
            <strong className="qv-board-loading__line" aria-hidden="true" />
            <small className="qv-board-loading__line is-short" aria-hidden="true" />
          </article>
        ))}
      </section>

      <section className="qv-board__modules">
        <header>
          <div><span>ИЗБРАННЫЕ ПОКАЗАТЕЛИ</span><strong>МОЯ ПАНЕЛЬ</strong></div>
          <small>подтверждаем данные</small>
        </header>
        <div className="qv-board__module-grid">
          {moduleCells.map(label => (
            <article className="qv-board-card qv-board-card--loading" key={label} aria-hidden="true">
              <span>{label}</span>
              <strong className="qv-board-loading__value" />
              <b className="qv-board-loading__line" />
              <small className="qv-board-loading__line is-short" />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
