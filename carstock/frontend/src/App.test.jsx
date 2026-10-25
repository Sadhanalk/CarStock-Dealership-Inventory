import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_EXPIRED_EVENT } from './api/client'
import { App } from './App'

beforeEach(() => {
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) }))
})

describe('App', () => {
  it('shows the login screen when nobody is signed in', () => {
    render(<App />)
    expect(screen.getByText('Back to the floor.')).toBeInTheDocument()
  })

  it('shows the dashboard for a stored session', async () => {
    sessionStorage.setItem('carstock_token', 't')
    sessionStorage.setItem('carstock_user', JSON.stringify({ id: 1, full_name: 'Avery Stone', email: 'a@b.com', is_admin: true }))
    render(<App />)
    expect(await screen.findByRole('heading', { name: /move the right/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument()
  })

  it('returns to login with a notice when the session expires', async () => {
    sessionStorage.setItem('carstock_token', 't')
    sessionStorage.setItem('carstock_user', JSON.stringify({ id: 2, full_name: 'Jordan Reyes', email: 'j@b.com', is_admin: false }))
    render(<App />)
    await screen.findByRole('heading', { name: /move the right/i })
    act(() => {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    })
    expect(await screen.findByText('Back to the floor.')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/session expired/i)
  })
})
