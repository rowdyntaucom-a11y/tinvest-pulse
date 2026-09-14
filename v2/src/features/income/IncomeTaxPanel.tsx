import { useMemo, useState } from 'react'
import type { PayoutCalendar } from '../../lib/payoutsApi'
import {
  buildIncomeTaxBridge,
  estimateIisLongTermDeduction,
  IIS_LONG_TERM_DEDUCTION_BASE_LIMIT,
  IIS_LONG_TERM_DEDUCTION_RULE_VERSION,
} from './incomeTax'
import './incomeTax.css'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

const parseRub = (value: string) => {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  if (!normalized) return 0
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function amount(value: number | null) {
  return value == null ? '—' : `${money.format(value)} ₽`
}

export default function IncomeTaxPanel({ calendar }: { calendar: PayoutCalendar }) {
  const bridge = useMemo(() => buildIncomeTaxBridge(calendar), [calendar])
  const [contributionText, setContributionText] = useState('')
  const [otherBaseText, setOtherBaseText] = useState('')
  const [taxPaidText, setTaxPaidText] = useState('')
  const [rate, setRate] = useState<0.13 | 0.15>(0.13)

  const estimate = useMemo(() => estimateIisLongTermDeduction({
    contribution: parseRub(contributionText),
    otherLongTermSavingsBaseUsed: parseRub(otherBaseText),
    ndflRate: rate,
    refundableNdflAvailable: taxPaidText.trim() ? parseRub(taxPaidText) : null,
  }), [contributionText, otherBaseText, rate, taxPaidText])

  return (
    <div className="income-tax-layout">
      <section className="panel income-tax-bridge">
        <div className="income-panel-head">
          <div><span className="eyebrow">ФАКТ И 12М · НАЛОГОВЫЙ МОСТ</span><h2>ДО НАЛОГА → НАЛОГ → НА РУКИ</h2></div>
          <small>без подмены отсутствующих сумм</small>
        </div>

        <div className="tax-flow-grid">
          <article>
            <span>ФАКТ · ДО НАЛОГА</span><strong>{amount(bridge.actual.gross)}</strong>
            <small>{bridge.actual.completeRows}/{bridge.actual.rows} выплат имеют полный gross/tax/net</small>
          </article>
          <i aria-hidden="true">→</i>
          <article>
            <span>ФАКТ · УДЕРЖАНО</span><strong>{amount(bridge.actual.tax)}</strong>
            <small>только явное поле tax из фактических выплат</small>
          </article>
          <i aria-hidden="true">→</i>
          <article className="is-net">
            <span>ФАКТ · НА РУКИ</span><strong>{amount(bridge.actual.net)}</strong>
            <small>полученный net; пропуски не реконструируются</small>
          </article>
        </div>

        <div className="tax-forecast-row">
          <span>12М · ПОДТВЕРЖДЁННЫЙ ГРАФИК</span>
          <b>{amount(bridge.forecast12m.gross)}</b><em>до</em>
          <b>{amount(bridge.forecast12m.tax)}</b><em>налог</em>
          <strong>{amount(bridge.forecast12m.net)}</strong><em>на руки</em>
        </div>
        <p className="income-method-note">Факт строится только из выплат со статусом FACT. QVANIX не вычисляет отсутствующий gross или tax обратным счётом из net. Блок 12М использует уже нормализованные gross/tax/net официального расписания и не смешивается с полученным фактом.</p>
      </section>

      <section className="panel iis-deduction-panel">
        <div className="income-panel-head">
          <div><span className="eyebrow">ИИС С 01.01.2024 · ОЦЕНКА v{IIS_LONG_TERM_DEDUCTION_RULE_VERSION}</span><h2>ВОЗВРАТ НДФЛ С ВЗНОСОВ</h2></div>
          <small>ст. 219.2 НК РФ · ФНС</small>
        </div>

        <div className="deduction-grid">
          <label><span>Взносы на ИИС за год</span><input inputMode="decimal" value={contributionText} onChange={event => setContributionText(event.target.value)} placeholder="например 200000" /></label>
          <label><span>Уже использовано лимита ДС</span><input inputMode="decimal" value={otherBaseText} onChange={event => setOtherBaseText(event.target.value)} placeholder="0" /></label>
          <label><span>Доступный НДФЛ к возврату</span><input inputMode="decimal" value={taxPaidText} onChange={event => setTaxPaidText(event.target.value)} placeholder="необязательно" /></label>
          <div className="deduction-rate" role="group" aria-label="Ставка НДФЛ для оценки"><span>Ставка</span><button className={rate === .13 ? 'is-active' : ''} onClick={() => setRate(.13)}>13%</button><button className={rate === .15 ? 'is-active' : ''} onClick={() => setRate(.15)}>15%</button></div>
        </div>

        <div className="deduction-results">
          <article><span>БАЗА ВЫЧЕТА</span><strong>{amount(estimate.eligibleBase)}</strong><small>из общего лимита {money.format(IIS_LONG_TERM_DEDUCTION_BASE_LIMIT)} ₽</small></article>
          <article><span>ТЕОРЕТИЧЕСКИЙ ЭФФЕКТ</span><strong>{amount(estimate.theoreticalRefund)}</strong><small>база × выбранная ставка</small></article>
          <article className="is-net"><span>ОЦЕНКА К ВОЗВРАТУ</span><strong>{estimate.refundableEstimate == null ? 'укажите НДФЛ' : amount(estimate.refundableEstimate)}</strong><small>{estimate.limitedByTaxPaid ? 'ограничено доступным уплаченным НДФЛ' : 'не больше уплаченного НДФЛ'}</small></article>
        </div>

        <p className="income-method-note">По информации ФНС, для ИИС, открытых начиная с 01.01.2024, взносы входят в общий вычет на долгосрочные сбережения; совокупная база по соответствующим инструментам ограничена 400 000 ₽ за налоговый период. Для договоров ИИС, заключённых в 2024–2026 годах, действует переходный минимальный срок 5 лет. Досрочное закрытие без допустимого перевода может потребовать восстановить ранее полученный налоговый эффект.</p>
        <p className="income-method-note">Это калькулятор, а не подтверждение права на вычет. QVANIX не знает из брокерского API ваш общий НДФЛ, использование лимита по другим долгосрочным сбережениям и все юридические условия. Поэтому итог «к возврату» появляется только после вашего ввода доступного уплаченного НДФЛ.</p>
      </section>
    </div>
  )
}
