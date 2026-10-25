import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, SESSION_EXPIRED_EVENT, formatError, request, session, toQuery, vehiclesApi } from './client'

const reply = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) })

beforeEach(() => {
  global.fetch = vi.fn()
})

describe('formatError', () => {
  it('uses a string detail as-is', () => expect(formatError({ detail: 'Vehicle is out of stock' })).toBe('Vehicle is out of stock'))

  it('summarises FastAPI validation errors', () => {
    const payload = { detail: [{ loc: ['body', 'password'], msg: 'Value error, must contain at least one letter and one number' }] }
    expect(formatError(payload)).toBe('password: must contain at least one letter and one number')
  })

  it('falls back to a friendly message', () => expect(formatError({})).toMatch(/something went wrong/i))
})

describe('toQuery', () => {
  it('drops empty values', () => expect(toQuery({ q: 'tesla', category: '', min_price: 0, max_price: undefined })).toBe('q=tesla&min_price=0'))
})

describe('request', () => {
  it('sends the bearer token and a JSON body', async () => {
    session.save({ access_token: 'abc', user: { id: 1 } })
    fetch.mockReturnValue(reply(200, { ok: true }))
    await request('/vehicles', { method: 'POST', body: { make: 'X' } })
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/api/vehicles')
    expect(options.headers.Authorization).toBe('Bearer abc')
    expect(options.body).toBe('{"make":"X"}')
  })

  it('returns null for 204 responses', async () => {
    fetch.mockReturnValue(Promise.resolve({ ok: true, status: 204 }))
    expect(await vehiclesApi.remove(3)).toBeNull()
  })

  it('throws an ApiError carrying the server message and status', async () => {
    fetch.mockReturnValue(reply(409, { detail: 'Vehicle is out of stock' }))
    await expect(vehiclesApi.purchase(1)).rejects.toMatchObject({ name: 'ApiError', message: 'Vehicle is out of stock', status: 409 })
    expect(new ApiError('x', 1)).toBeInstanceOf(Error)
  })

  it('clears the session and announces expiry when a logged-in request gets 401', async () => {
    session.save({ access_token: 'old', user: { id: 1 } })
    const onExpired = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    fetch.mockReturnValue(reply(401, { detail: 'Invalid or expired token' }))
    await expect(vehiclesApi.search()).rejects.toThrow('Invalid or expired token')
    expect(session.token()).toBeNull()
    expect(onExpired).toHaveBeenCalledOnce()
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  })

  it('does not announce expiry for a failed login (no token was in use)', async () => {
    const onExpired = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    fetch.mockReturnValue(reply(401, { detail: 'Email or password is incorrect' }))
    await expect(request('/auth/login', { method: 'POST', body: {} })).rejects.toThrow('Email or password is incorrect')
    expect(onExpired).not.toHaveBeenCalled()
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  })
})

describe('session', () => {
  it('round-trips the stored user and survives corrupted storage', () => {
    session.save({ access_token: 't', user: { id: 7, full_name: 'A B' } })
    expect(session.load()).toEqual({ id: 7, full_name: 'A B' })
    sessionStorage.setItem('carstock_user', '{not json')
    expect(session.load()).toBeNull()
  })
})
