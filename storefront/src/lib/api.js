const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '')

export function mediaUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL.replace(/\/api\/v1$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiRequest(path, { signal, method = 'GET', body, headers = {}, credentials = 'omit' } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal,
      method,
      credentials,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw { status: 0, code: 'NETWORK_ERROR', message: 'We could not reach the service.' }
  }
  let payload = null
  try { payload = await response.json() } catch { /* non-JSON response */ }
  if (!response.ok) throw { status: response.status, code: payload?.error?.code || 'API_ERROR', message: payload?.error?.message || 'We could not complete that request.' }
  return payload
}
