/** Base URL without trailing slash, e.g. http://localhost:8080. Empty = same-origin (use Vite proxy in dev). */
export function getApiBaseUrl() {
  const base = import.meta.env.VITE_API_BASE_URL
  return typeof base === 'string' ? base.replace(/\/$/, '') : ''
}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = getApiBaseUrl()
  if (!base) return p
  return `${base}${p}`
}
