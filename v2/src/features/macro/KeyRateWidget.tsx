import './keyRateWidget.css'

type Props = {
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null
  const timestamp = Date.parse(`${text}T00:00:00.000Z`)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === text ? text : null
}

function decisionTimestamp(date: string) {
  // Scheduled key-rate decisions are published at about 13:30 Moscow time (UTC+3).
  return Date.parse(`${date}T10:30:00Z`)
}

function resolveNextMeeting(reported: string | null) {
  const now = Date.now()
  const fromServer = validIsoDate(reported)
  if (fromServer && decisionTimestamp(fromServer) > now) return fromServer
  return OFFICIAL_2026_MEETINGS.find(date => decisionTimestamp(date) > now) ?? null
}

function shortDate(value: string | null, formatter: Intl.DateTimeFormat) {
  if (!value) return '—'
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) ? formatter.format(date).replace('.', '') : '—'
}

export function KeyRateWidget({ rate, rateDate, nextMeeting: reportedNextMeeting }: Props) {
  const safeRate = rate != null && Number.isFinite(rate) ? rate : null
  const safeRateDate = validIsoDate(rateDate)
  const nextMeeting = resolveNextMeeting(reportedNextMeeting)

  return (
    <a
      className="key-rate-widget"
      href="https://www.cbr.ru/press/keypr/"
      target="_blank"
      rel="noreferrer"
      aria-label={`Ключевая ставка ${safeRate == null ? 'нет данных' : `${rateFmt.format(safeRate)} процентов`}. Следующее заседание ${shortDate(nextMeeting, meetingFmt)}.`}
      title="Банк России · ключевая ставка и следующее заседание"
    >
      <span className="key-rate-widget__rate">
        <small>КЛЮЧЕВАЯ</small>
        <strong>{safeRate == null ? '—' : `${rateFmt.format(safeRate)}%`}</strong>
      </span>
      <i aria-hidden="true" />
      <span className="key-rate-widget__meeting">
        <small>ПЕРЕСМОТР</small>
        <strong>{shortDate(nextMeeting, meetingFmt)}</strong>
        <b>13:30 МСК</b>
      </span>
      <span className="key-rate-widget__source">ЦБ РФ{safeRateDate ? ` · ${shortDate(safeRateDate, dateFmt)}` : ''}</span>
    </a>
  )
}
