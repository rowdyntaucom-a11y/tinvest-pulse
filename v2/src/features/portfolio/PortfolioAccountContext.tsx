import { useEffect, useState } from 'react'

type AccountContext = {
  available: boolean
  type: string | null
  status: string | null
  openedDate: string | null
  accessLevel: string | null
}

const empty: AccountContext = {
  available: false,
  type: null,
  status: null,
  openedDate: null,
  accessLevel: null,
}

function selectAccount(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null
  const accounts = (raw as { accounts?: unknown }).accounts
  if (!Array.isArray(accounts) || !accounts.length) return null
  return accounts.find(account => {
    if (!account || typeof account !== 'object') return false
    return String((account as Record<string, unknown>).accessLevel || '').toUpperCase().includes('FULL')
  }) ?? accounts[0]
}

function accountLabel(type: string | null) {
  const key = String(type || '').toUpperCase()
  if (key.includes('IIS')) return 'ИИС'
  if (key.includes('INVEST_BOX')) return 'ИНВЕСТКОПИЛКА'
  if (key.includes('TINKOFF')) return 'БРОКЕРСКИЙ'
  return type ? type.replace(/^ACCOUNT_TYPE_/, '') : '—'
}

function accessLabel(access: string | null) {
  const key = String(access || '').toUpperCase()
  if (key.includes('READ_ONLY')) return 'READ ONLY'
  if (key.includes('FULL')) return 'FULL'
  return access ? access.replace(/^ACCOUNT_ACCESS_LEVEL_/, '') : null
}

export function PortfolioAccountContext() {
  const [context, setContext] = useState<AccountContext>(empty)

  useEffect(() => {
    let active = true
    void fetch('/api/accounts', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(raw => {
        if (!active) return
        const account = selectAccount(raw)
        if (!account || typeof account !== 'object') return setContext(empty)
        const row = account as Record<string, unknown>
        setContext({
          available: true,
          type: row.type ? String(row.type) : null,
          status: row.status ? String(row.status) : null,
          openedDate: row.openedDate ? String(row.openedDate) : null,
          accessLevel: row.accessLevel ? String(row.accessLevel) : null,
        })
      })
      .catch(() => { if (active) setContext(empty) })
    return () => { active = false }
  }, [])

  const label = accountLabel(context.type)
  const access = accessLabel(context.accessLevel)
  const title = context.available
    ? [context.type, context.status, context.openedDate ? `opened ${context.openedDate.slice(0, 10)}` : null, context.accessLevel].filter(Boolean).join(' · ')
    : 'Тип счёта не получен из T-Bank /api/accounts'

  return (
    <>
      <span>СЧЁТ</span>
      <strong title={title}>{label}{access ? ` · ${access}` : ''}</strong>
    </>
  )
}
