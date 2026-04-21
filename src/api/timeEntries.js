import { apiUrl } from './config'

function normalizeTimeEntry(item, index) {
  const id = item?.id != null ? String(item.id) : `srv-${index}`
  const description = item?.taskDescription ?? item?.description ?? '—'
  const date = item?.workDate ?? item?.date ?? ''
  const hours = item?.hours != null && !Number.isNaN(Number(item.hours)) ? Number(item.hours) : null
  const clientName = item?.clientName ?? '—'
  return { id, description, date, hours, clientName }
}

/** Pull array of raw entry objects from various Spring / JSON shapes. */
function extractEntryArray(data) {
  if (Array.isArray(data)) return data
  if (data?.content && Array.isArray(data.content)) return data.content
  if (data?.entries && Array.isArray(data.entries)) return data.entries
  if (data?.timeEntries && Array.isArray(data.timeEntries)) return data.timeEntries
  if (data?.data && Array.isArray(data.data)) return data.data
  if (data && typeof data === 'object') {
    if ('taskDescription' in data || 'task_description' in data) return [data]
  }
  return []
}

function isSpringPage(data) {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.content) &&
    typeof data.totalPages === 'number' &&
    data.totalPages > 1
  )
}

/** User-facing message for failed GET / time-entry loads (avoid raw status codes in UI). */
function friendlyLoadErrorMessage(status, bodyText) {
  const trimmed = typeof bodyText === 'string' ? bodyText.trim() : ''
  const shortBody = trimmed && trimmed.length <= 140 ? trimmed : ''

  if (status === 404) {
    return 'No time log was found on the server for this user. Check that GET /api/time-entries/user/{id} exists and the numeric user id matches your database.'
  }
  if (status === 401 || status === 403) {
    return 'You are not allowed to load time entries. Try signing in again or contact an administrator.'
  }
  if (status === 408 || status === 504) {
    return 'The server took too long to respond. Check your connection and try Refresh again.'
  }
  if (status >= 500) {
    return 'The server had a problem loading time entries. Please try again in a few minutes.'
  }
  if (status >= 400) {
    if (shortBody && !/^\s*[{[]/.test(shortBody)) {
      return `Time entries could not be loaded: ${shortBody}`
    }
    return 'Time entries could not be loaded. Check your request and try again.'
  }
  if (shortBody) {
    return `Time entries could not be loaded: ${shortBody}`
  }
  return 'Time entries could not be loaded. Please try again.'
}

function friendlySearchErrorMessage(status, bodyText) {
  const trimmed = typeof bodyText === 'string' ? bodyText.trim() : ''
  const shortBody = trimmed && trimmed.length <= 140 ? trimmed : ''

  if (status === 404) {
    return 'No time entries matched this search. Check user id, email, and date, or confirm the search API is available.'
  }
  if (status === 401 || status === 403) {
    return 'You are not allowed to run this search. Try signing in again or contact an administrator.'
  }
  if (status === 408 || status === 504) {
    return 'The server took too long to respond. Check your connection and try again.'
  }
  if (status >= 500) {
    return 'The server had a problem running the search. Please try again in a few minutes.'
  }
  if (status >= 400) {
    if (shortBody && !/^\s*[{[]/.test(shortBody)) {
      return `Search could not be completed: ${shortBody}`
    }
    return 'Search could not be completed. Check your filters and try again.'
  }
  if (shortBody) {
    return `Search could not be completed: ${shortBody}`
  }
  return 'Search could not be completed. Please try again.'
}

/**
 * GET /api/time-entries/search — optional query params: userId, email, date (ISO YYYY-MM-DD).
 * At least one of userId, email, or date must be provided.
 * @param {{ userId?: string|number, email?: string, date?: string }} params
 * @returns {Promise<{ ok: true, entries: Array } | { ok: false, error: string }>}
 */
export async function searchTimeEntries(params = {}) {
  const rawUid = params.userId
  const uid =
    rawUid != null && String(rawUid).trim() !== ''
      ? Number.parseInt(String(rawUid).trim(), 10)
      : NaN
  const hasUserId = Number.isFinite(uid) && uid >= 1

  const email = typeof params.email === 'string' ? params.email.trim() : ''
  const hasEmail = email.length > 0

  const dateRaw = typeof params.date === 'string' ? params.date.trim() : ''
  const hasDate = Boolean(dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw))

  if (!hasUserId && !hasEmail && !hasDate) {
    return { ok: false, error: 'Enter a user id, email, or date (you can combine them).' }
  }

  function buildSearchUrl(extra = {}) {
    const sp = new URLSearchParams()
    if (hasUserId) sp.set('userId', String(uid))
    if (hasEmail) sp.set('email', email)
    if (hasDate) sp.set('date', dateRaw)
    if (extra.page != null) sp.set('page', String(extra.page))
    if (extra.size != null) sp.set('size', String(extra.size))
    return apiUrl(`/api/time-entries/search?${sp.toString()}`)
  }

  async function fetchOne(url) {
    let res
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
    } catch {
      return { ok: false, error: 'Could not reach the server. Check the API URL and that Spring is running.' }
    }
    if (!res.ok) {
      let bodyText = ''
      try {
        bodyText = await res.text()
      } catch {
        /* ignore */
      }
      return { ok: false, error: friendlySearchErrorMessage(res.status, bodyText) }
    }
    try {
      const data = await res.json()
      return { ok: true, data }
    } catch {
      return { ok: false, error: 'Invalid response from server.' }
    }
  }

  const firstUrl = buildSearchUrl()
  const first = await fetchOne(firstUrl)
  if (!first.ok) return first

  const rawList = []
  const firstChunk = extractEntryArray(first.data)
  rawList.push(...firstChunk)

  if (isSpringPage(first.data)) {
    const { totalPages, size } = first.data
    const pageSize = size || firstChunk.length || 20
    for (let p = 1; p < totalPages; p += 1) {
      const pageUrl = buildSearchUrl({ page: p, size: pageSize })
      const next = await fetchOne(pageUrl)
      if (!next.ok) return next
      rawList.push(...extractEntryArray(next.data))
    }
  }

  const entries = rawList.map((item, i) => normalizeTimeEntry(item, i))
  return { ok: true, entries }
}

/**
 * Build GET URL for /api/time-entries/user/{userId} with optional ?date=YYYY-MM-DD and pagination.
 * @param {number} id
 * @param {{ date?: string, page?: number, size?: number }} query
 */
function timeEntriesUserUrl(id, query = {}) {
  const sp = new URLSearchParams()
  const d = typeof query.date === 'string' ? query.date.trim() : ''
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    sp.set('date', d)
  }
  if (query.page != null) sp.set('page', String(query.page))
  if (query.size != null) sp.set('size', String(query.size))
  const q = sp.toString()
  const path = `/api/time-entries/user/${id}`
  return apiUrl(q ? `${path}?${q}` : path)
}

/**
 * GET /api/time-entries/user/{userId}?date= optional — all pages when the API returns a Spring Page.
 * @param {number|string} userId
 * @param {{ date?: string }} [options] ISO date (YYYY-MM-DD) filters entries for that day on the server.
 * @returns {Promise<{ ok: true, entries: Array } | { ok: false, error: string }>}
 */
export async function getTimeEntriesByUser(userId, options = {}) {
  const id = Number(userId)
  if (!Number.isFinite(id) || id < 1) {
    return { ok: false, error: 'Enter a valid numeric server user id.' }
  }

  const dateOpt = typeof options.date === 'string' ? options.date : ''

  async function fetchOne(url) {
    let res
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
    } catch {
      return { ok: false, error: 'Could not reach the server. Check the API URL and that Spring is running.' }
    }
    if (!res.ok) {
      let bodyText = ''
      try {
        bodyText = await res.text()
      } catch {
        /* ignore */
      }
      return { ok: false, error: friendlyLoadErrorMessage(res.status, bodyText) }
    }
    try {
      const data = await res.json()
      return { ok: true, data }
    } catch {
      return { ok: false, error: 'Invalid response from server.' }
    }
  }

  const firstUrl = timeEntriesUserUrl(id, { date: dateOpt })
  const first = await fetchOne(firstUrl)
  if (!first.ok) return first

  const rawList = []
  const firstChunk = extractEntryArray(first.data)
  rawList.push(...firstChunk)

  if (isSpringPage(first.data)) {
    const { totalPages, size } = first.data
    const pageSize = size || firstChunk.length || 20
    for (let p = 1; p < totalPages; p += 1) {
      const pageUrl = timeEntriesUserUrl(id, { date: dateOpt, page: p, size: pageSize })
      const next = await fetchOne(pageUrl)
      if (!next.ok) return next
      rawList.push(...extractEntryArray(next.data))
    }
  }

  const entries = rawList.map((item, i) => normalizeTimeEntry(item, i))
  return { ok: true, entries }
}

/**
 * POST /api/time-entries — Spring payload: userId, taskDescription, hours, workDate, clientName
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function postTimeEntry({ userId, taskDescription, hours, workDate, clientName }) {
  let res
  try {
    res = await fetch(apiUrl('/api/time-entries'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        userId: Number(userId),
        taskDescription,
        hours: Number(hours),
        workDate,
        clientName,
      }),
    })
  } catch {
    return { ok: false, error: 'Could not reach the server. Check the API URL and that Spring is running.' }
  }

  if (res.ok) {
    return { ok: true }
  }

  let error = `Save failed (${res.status}).`
  const contentType = res.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      const data = await res.json()
      if (Array.isArray(data)) {
        const parts = data
          .map((e) => e?.defaultMessage || e?.message || (typeof e === 'string' ? e : null))
          .filter(Boolean)
        if (parts.length) error = parts.join(' ')
      } else if (typeof data === 'string') {
        error = data
      } else if (data?.message) {
        error = String(data.message)
      }
    } else {
      const text = await res.text()
      if (text) error = text.length > 200 ? `${text.slice(0, 200)}…` : text
    }
  } catch {
    /* keep default error */
  }
  return { ok: false, error }
}
