import { apiUrl } from './config'

/**
 * POST /api/signup — JSON: email, password, fullName, phone
 * @returns {Promise<{ ok: true } | { ok: false, error: string }>}
 */
export async function postSignUp({ email, password, fullName, phone }) {
  let res
  try {
    res = await fetch(apiUrl('/api/signup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: String(phone).trim(),
      }),
    })
  } catch {
    return { ok: false, error: 'Could not reach the server. Check the API URL and that Spring is running.' }
  }

  if (res.ok) {
    try {
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        const data = await res.json()
        const backendUserId = data?.id ?? data?.userId ?? data?.user?.id
        if (Number.isFinite(Number(backendUserId))) {
          return { ok: true, backendUserId: Number(backendUserId) }
        }
      }
    } catch {
      /* plain text or empty body */
    }
    return { ok: true }
  }

  let error = `Sign up failed (${res.status}).`
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
