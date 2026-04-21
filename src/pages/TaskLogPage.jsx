import { useState, useEffect, useCallback, useMemo } from 'react'
import { useApp } from '../context/useApp'
import { getTimeEntriesByUser } from '../api/timeEntries'
import {
  IconBuilding,
  IconCalendar,
  IconCirclePlus,
  IconClipboard,
  IconClipboardList,
  IconClock,
  IconHistory,
  IconLayers,
  IconRefresh,
  IconSave,
} from '../components/Icons'

export default function TaskLogPage() {
  const { currentUser, addTaskEntry } = useApp()
  const appUserId = currentUser?.id
  const backendUserId = currentUser?.backendUserId
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [clientName, setClientName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [serverEntries, setServerEntries] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  const fetchServerLog = useCallback(
    async ({ showSpinner = false, signal } = {}) => {
      if (!appUserId) return
      if (showSpinner) setListLoading(true)
      setListError('')
      const sid = Number.isFinite(Number(backendUserId)) ? Number(backendUserId) : 1
      const result = await getTimeEntriesByUser(sid)
      if (signal?.aborted) {
        setListLoading(false)
        return
      }
      setListLoading(false)
      if (!result.ok) {
        setServerEntries([])
        setListError(result.error)
        return
      }
      setListError('')
      setServerEntries(result.entries)
    },
    [appUserId, backendUserId]
  )

  useEffect(() => {
    if (!appUserId) return
    const ac = new AbortController()
    const t = window.setTimeout(() => {
      fetchServerLog({ showSpinner: false, signal: ac.signal })
    }, 0)
    return () => {
      window.clearTimeout(t)
      ac.abort()
    }
  }, [appUserId, backendUserId, fetchServerLog])

  /** Your log = server database only (browser local cache is not mixed in here). */
  const displayEntries = useMemo(() => {
    if (listError) return []
    return serverEntries
  }, [listError, serverEntries])

  if (!currentUser) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const h = parseFloat(hours)
    if (Number.isNaN(h) || h <= 0) {
      setError('Please enter a positive number of hours.')
      return
    }
    setSubmitting(true)
    try {
      const result = await addTaskEntry({
        description,
        hours: h,
        date,
        clientName,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setDescription('')
      setHours('')
      setClientName('')
      setDate(new Date().toISOString().slice(0, 10))
      setSuccess('Entry saved successfully')
      await fetchServerLog({ showSpinner: false })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page page-tasks">
      <header className="page-hero">
        <div className="page-hero-icon" aria-hidden>
          <IconLayers size={26} />
        </div>
        <div className="page-hero-text">
          <h1>Time & tasks</h1>
          <p className="muted page-hero-sub">Log what you worked on, for which client, and how long it took.</p>
        </div>
      </header>

      <div className="grid-two grid-tasks">
        <section className="card card-form">
          <div className="card-head">
            <span className="card-head-icon" aria-hidden>
              <IconCirclePlus size={20} />
            </span>
            <h2>New entry</h2>
          </div>
          <form onSubmit={handleSubmit} className="form-stack">
            <label className="field">
              <span className="field-label">
                <IconClipboard size={15} />
                Task / work description
              </span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. API integration for billing module"
                required
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span className="field-label">
                  <IconClock size={15} />
                  Hours
                </span>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
              </label>
              <label className="field field-date">
                <span className="field-label">
                  <IconCalendar size={15} />
                  Date
                </span>
                <div className="field-date-wrap">
                  <input
                    id="entry-work-date"
                    className="input-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </label>
            </div>
            <label className="field">
              <span className="field-label">
                <IconBuilding size={15} />
                Client name
              </span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client or account"
                required
              />
            </label>
            {error ? (
              <p className="form-error form-alert-inline" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="form-success form-alert-inline" role="status">
                {success}
              </p>
            ) : null}
            <button type="submit" className="btn primary btn-with-icon" disabled={submitting}>
              {submitting ? (
                'Saving…'
              ) : (
                <>
                  <IconSave size={18} />
                  Save entry
                </>
              )}
            </button>
          </form>
        </section>

        <section className="card card-log">
          <div className="log-panel-header">
            <div className="log-panel-title-block">
              <span className="log-panel-icon" aria-hidden>
                <IconHistory size={22} />
              </span>
              <div>
                <h2 className="log-panel-title">Your log</h2>
                <p className="muted small log-panel-meta">
                  {listError ? (
                    <>User #{Number.isFinite(Number(backendUserId)) ? Number(backendUserId) : 1}</>
                  ) : (
                    <>
                      {displayEntries.length} entr{displayEntries.length === 1 ? 'y' : 'ies'} · user #
                      {Number.isFinite(Number(backendUserId)) ? Number(backendUserId) : 1}
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-refresh"
              onClick={() => fetchServerLog({ showSpinner: true })}
              disabled={listLoading}
            >
              <IconRefresh size={16} className={listLoading ? 'ui-icon-spin' : ''} />
              {listLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {listError ? (
            <div className="log-banner log-banner-error" role="alert">
              <p className="log-banner-body">{listError}</p>
            </div>
          ) : null}

          {listLoading && displayEntries.length === 0 && !listError ? (
            <div className="log-empty log-empty-loading">
              <span className="log-empty-icon" aria-hidden>
                <IconRefresh size={28} className="ui-icon-spin" />
              </span>
              <p className="muted">Loading…</p>
            </div>
          ) : null}

          {!listLoading && !listError && displayEntries.length === 0 ? (
            <div className="log-empty">
              <span className="log-empty-icon" aria-hidden>
                <IconClipboardList size={32} />
              </span>
              <p className="muted">No entries yet.</p>
            </div>
          ) : null}

          {displayEntries.length > 0 ? (
            <ul className="log-list task-list-scroll">
              {displayEntries.map((t) => (
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
          ) : null}
        </section>
      </div>
    </div>
  )
}
