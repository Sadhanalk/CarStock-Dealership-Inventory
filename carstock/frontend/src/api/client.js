/**
 * Thin wrapper around fetch for the CarStock API.
 * - attaches the JWT from sessionStorage
 * - turns error responses into `ApiError`s with a readable message
 * - if a *logged-in* request gets a 401, the session has expired: clear it and tell the app
 */
const API = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'carstock_token'
const USER_KEY = 'carstock_user'

export const SESSION_EXPIRED_EVENT = 'carstock:session-expired'

export const session = {
  load() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  },
  save({ access_token, user }) {
    sessionStorage.setItem(TOKEN_KEY, access_token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  },
  token: () => sessionStorage.getItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** FastAPI sends `detail` as a string for our own errors and as a list for validation errors. */
export function formatError(payload) {
  const detail = payload?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0]
    const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : null
    const message = String(first.msg || 'Invalid value').replace(/^Value error, /, '')
    return field && field !== 'body' ? `${field}: ${message}` : message
  }
  return 'Something went wrong. Please try again.'
}

export async function request(path, { body, headers, ...options } = {}) {
  const token = session.token()
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  })
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 && token) {
      session.clear()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw new ApiError(formatError(payload), response.status)
  }
  return payload
}

export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (full_name, email, password) => request('/auth/register', { method: 'POST', body: { full_name, email, password } })
}

/** Drops empty filter values and builds the query string. */
export function toQuery(filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params.set(key, value)
  })
  return params.toString()
}

export const vehiclesApi = {
  search: (filters = {}) => request(`/vehicles/search?${toQuery(filters)}`),
  create: (vehicle) => request('/vehicles', { method: 'POST', body: vehicle }),
  update: (id, vehicle) => request(`/vehicles/${id}`, { method: 'PUT', body: vehicle }),
  remove: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),
  purchase: (id) => request(`/vehicles/${id}/purchase`, { method: 'POST' }),
  restock: (id, quantity) => request(`/vehicles/${id}/restock`, { method: 'POST', body: { quantity } })
}
