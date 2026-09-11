import { useEffect, useMemo, useState } from 'react'
import './keyRateWidget.css'

type CbrMacro = {
  rate: number | null
  rateDate: string | null
  nextMeeting: string | null
}

const OFFICIAL_2026_MEETINGS = [
  '2026-02-13',
  '2026-03-20',
  '2026-04-24',
  '2026-06-19',
  '2026-07-24',
  '2026-09-11',
  '2026-10-23',
  '2026-12-18',
]

const rateFmt = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const meetingFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })

function validIsoDate(value: unknown) {
  const text = String(value || '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null
}

function decisionTimestamp(date: string) {
  // Bank of Russia publishes the scheduled rate decision at about 13:30 Moscow time (UTC+3).
  return Date.parse(`${date}T10:30:00Z`)
}

function resolveNextMeeting(reported: string | null) {
  const now = Date.now()
  const fromServer = validIsoDate(reported)
  if (fromServer && decisionTimestamp(fromServer) > now) return fromServer
  return OFFICIAL_2026_MEETINGS.find(date => decisionTimestamp(date) > now) ?? fromServer
}

function shortDate(value: string | null, formatter: Intl.DateTimeFormat) {
  if (!value) return '—'
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) ? formatter.format(date).replace('.', '') : '—'
}

export function KeyRateWidget() {
  const [macro, setMacro] = useState<CbrMacro>({ rate: null, rateDate: null, nextMeeting: null })

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch('/api/dashboard', { cache: 'no-store' })
        if (!response.ok) return
        const raw = await response.json() as Record<string, unknown>
        const cbr = (raw.cbr ?? {}) as Record<string, unknown>
        const parsedRate = Number(cbr.rate)
        if (!active) return
        setMacro({
          rate: Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : null,
          rateDate: validIsoDate(cbr.rateDate),
          nextMeeting: validIsoDate(cbr.nextMeeting),
        })
      } catch {
        // Fail closed: keep placeholders instead of inventing macro data.
      }
    }

    void load()
    const timer = window.setInterval(load, 60 * 60_000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  const nextMeeting = useMemo(() => resolveNextMeeting(macro.nextMeeting), [macro.nextMeeting])

  return (
    <a
      className="key-rate-widget"
      href="https://www.cbr.ru/press/keypr/"
      target="_blank"
      rel="noreferrer"
      aria-label={`Ключевая ставка ${macro.rate == null ? 'нет данных' : `${rateFmt.format(macro.rate)} процентов`}. Следующее заседание ${shortDate(nextMeeting, meetingFmt)}.`}
      title="Банк России · ключевая ставка и следующее заседание"
    >
      <span className="key-rate-widget__rate">
        <small>КЛЮЧЕВАЯ</small>
        <strong>{macro.rate == null ? '—' : `${rateFmt.format(macro.rate)}%`}</strong>
      </span>
      <i aria-hidden="true" />
      <span className="key-rate-widget__meeting">
        <small>ПЕРЕСМОТР</small>
        <strong>{shortDate(nextMeeting, meetingFmt)}</strong>
        <b>13:30 МСК</b>
      </span>
      <span className="key-rate-widget__source">ЦБ РФ{macro.rateDate ? ` · ${shortDate(macro.rateDate, dateFmt)}` : ''}</span>
    </a>
  )
}
