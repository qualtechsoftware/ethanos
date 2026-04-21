import { useCallback, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { searchTimeEntries } from '../api/timeEntries'
import {
  IconBuilding,
  IconCalendar,
  IconClipboardList,
  IconClock,
  IconHistory,
  IconRefresh,
} from '../components/Icons'

export default function AdminUsersPage() {
  const { currentUser } = useApp()

  const [emailInput, setEmailInput] = useState('')
  const [serverUserIdInput, setServerUserIdInput] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [adminEntries, setAdminEntries] = useState([])
  const [queryStatus, setQueryStatus] = useState('idle')
  const [adminError, setAdminError] = useState('')

  const dateIso = filterDate.trim() && /^\d{4}-\d{2}-\d{2}$/.test(filterDate.trim()) ? filterDate.trim() : ''
  const parsedUserId = Number.parseInt(String(serverUserIdInput).trim(), 10)
  const hasValidUserId = Number.isFinite(parsedUserId) && parsedUserId >= 1
  const emailTrimmed = emailInput.trim()
  const hasEmail = emailTrimmed.length > 0
  const hasDate = Boolean(dateIso)

  const searchSummaryLabel = useMemo(() => {
    const parts = []
    if (hasValidUserId) parts.push(`user id ${parsedUserId}`)
    if (hasEmail) parts.push(`email ${emailTrimmed}`)
    if (hasDate) parts.push(`date ${dateIso}`)
    return parts.length ? parts.join(' · ') : '—'
  }, [hasValidUserId, parsedUserId, hasEmail, emailTrimmed, hasDate, dateIso])

  if (!currentUser) return null
  if (currentUser.role !== 'admin') {
    return <Navigate to="/tasks" replace />
  }

  const loadAdminTimeEntries = useCallback(async () => {
    setAdminError('')
    if (!hasValidUserId && !hasEmail && !hasDate) {
      setAdminEntries([])
      setQueryStatus('idle')
      setAdminError('Enter a user id, email, or date (you can combine them).')
      return
    }

    setQueryStatus('loading')
    const result = await searchTimeEntries({
      ...(hasValidUserId ? { userId: parsedUserId } : {}),
      ...(hasEmail ? { email: emailTrimmed } : {}),
      ...(hasDate ? { date: dateIso } : {}),
    })
    if (!result.ok) {
      setAdminEntries([])
      setAdminError(result.error)
      setQueryStatus('error')
      return
    }
    setAdminError('')
    setAdminEntries(result.entries)
    setQueryStatus('ok')
  }, [hasValidUserId, parsedUserId, hasEmail, emailTrimmed, hasDate, dateIso])

  return (
    <div className="page">
      <header className="page-header">
        <h1>Admin</h1>
        <p className="muted">Search server time entries by user id, email, and/or date.</p>
      </header>

      <section className="card card-log admin-time-card">
        <div className="log-panel-header">
          <div className="log-panel-title-block">
            <span className="log-panel-icon" aria-hidden>
              <IconHistory size={22} />
            </span>
            <div>
              <h2 className="log-panel-title">Time entries (server)</h2>

            </div>
          </div>
        </div>

        <div className="admin-time-toolbar-wrap">
          <div className="admin-time-toolbar admin-time-toolbar-search">
            <div className="admin-time-field admin-time-field-email">
              <label className="admin-time-label" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="e.g. name@company.com"
                className="admin-time-control"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value)
                  setAdminError('')
                  setAdminEntries([])
                  setQueryStatus('idle')
                }}
              />
            </div>
            <div className="admin-time-field admin-time-field-narrow">
              <label className="admin-time-label" htmlFor="admin-server-id">
                User id
              </label>
              <input
                id="admin-server-id"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="e.g. 1"
                className="admin-time-control"
                value={serverUserIdInput}
                onChange={(e) => {
                  setServerUserIdInput(e.target.value)
                  setAdminError('')
                  setAdminEntries([])
                  setQueryStatus('idle')
                }}
              />
            </div>
            <div className="admin-time-field admin-time-field-date">
              <label className="admin-time-label" htmlFor="admin-filter-date">
                Date (optional)
              </label>
              <div className="field-date-wrap admin-toolbar-date-wrap">
                <input
                  id="admin-filter-date"
                  type="date"
                  className="input-date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value)
                    setAdminError('')
                    setAdminEntries([])
                    setQueryStatus('idle')
                  }}
                />
              </div>
            </div>
            <div className="admin-time-actions">
              <button
                type="button"
                className="btn primary admin-time-btn-primary"
                onClick={() => void loadAdminTimeEntries()}
                disabled={queryStatus === 'loading'}
              >
                {queryStatus === 'loading' ? 'Loading…' : 'Load entries'}
              </button>
              <button
                type="button"
                className="btn btn-refresh admin-time-btn-refresh"
                onClick={() => void loadAdminTimeEntries()}
                disabled={queryStatus === 'loading'}
                aria-label="Reload entries"
              >
                <IconRefresh size={16} className={queryStatus === 'loading' ? 'ui-icon-spin' : ''} />
              </button>
            </div>
          </div>
          <p className="muted small admin-time-toolbar-hint">
            Use any combination: user id only, email only, date only, or combine (e.g. user id + date).
          </p>
        </div>

        {adminError ? (
          <div className="log-banner log-banner-error" role="alert">
            <p className="log-banner-body">{adminError}</p>
          </div>
        ) : null}

        {queryStatus === 'loading' && adminEntries.length === 0 && !adminError ? (
          <div className="log-empty log-empty-loading">
            <span className="log-empty-icon" aria-hidden>
              <IconRefresh size={28} className="ui-icon-spin" />
            </span>
            <p className="muted">Loading…</p>
          </div>
        ) : null}

        {queryStatus === 'idle' && !adminError && adminEntries.length === 0 ? (
          <p className="muted admin-time-hint">Enter email, user id, and/or date, then load entries.</p>
        ) : null}

        {queryStatus === 'ok' && adminEntries.length === 0 ? (
          <div className="log-empty">
            <span className="log-empty-icon" aria-hidden>
              <IconClipboardList size={32} />
            </span>
            <p className="muted">No entries for {searchSummaryLabel}.</p>
          </div>
        ) : null}

        {adminEntries.length > 0 ? (
          <>
            <p className="muted small admin-time-meta">
              {adminEntries.length} entr{adminEntries.length === 1 ? 'y' : 'ies'} · {searchSummaryLabel}
            </p>
            <ul className="log-list task-list-scroll">
              {adminEntries.map((t) => (
                <li key={t.id} className="log-entry">
                  <div className="log-entry-accent" aria-hidden />
                  <div className="log-entry-icon-wrap" aria-hidden>
                    <IconClipboardList size={20} />
                  </div>
                  <div className="log-entry-body">
                    <p className="log-entry-title">{t.description}</p>
                    <div className="log-entry-chips">
                      <span className="log-chip">
                        <IconBuilding size={14} />
                        {t.clientName}
                      </span>
                      <span className="log-chip">
                        <IconCalendar size={14} />
                        {t.date || '—'}
                      </span>
                      <span className="log-chip">
                        <IconClock size={14} />
                        {t.hours != null ? `${t.hours}h` : '—'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </div>
  )
}
