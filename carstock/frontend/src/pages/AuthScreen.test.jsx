import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import AuthScreen from './AuthScreen'

const reply = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) })
const renderScreen = () => render(<AuthProvider><AuthScreen /></AuthProvider>)

beforeEach(() => {
  global.fetch = vi.fn()
})

describe('AuthScreen', () => {
  it('shows the login form by default', () => {
    renderScreen()
    expect(screen.getByText('Back to the floor.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter inventory/i })).toBeInTheDocument()
    expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
  })

  it('shows the working demo admin credentials', () => {
    renderScreen()
    expect(screen.getByText(/admin@carstock\.com/)).toBeInTheDocument()
    expect(screen.queryByText(/carstock\.local/)).not.toBeInTheDocument()
  })

  it('switches to registration and back', async () => {
    renderScreen()
    await userEvent.click(screen.getByRole('button', { name: /need an operator account/i }))
    expect(await screen.findByText('Open your station.')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /already have access/i }))
    expect(screen.getByText('Back to the floor.')).toBeInTheDocument()
  })

  it('posts the credentials to /auth/login and stores the session', async () => {
    fetch.mockReturnValue(reply(200, { access_token: 'tok', user: { id: 1, full_name: 'Admin', email: 'a@b.com', is_admin: true } }))
    renderScreen()
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /enter inventory/i }))
    await waitFor(() => expect(sessionStorage.getItem('carstock_token')).toBe('tok'))
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(JSON.parse(options.body)).toEqual({ email: 'a@b.com', password: 'Password123' })
  })

  it('shows the API error when login fails', async () => {
    fetch.mockReturnValue(reply(401, { detail: 'Email or password is incorrect' }))
    renderScreen()
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'WrongPass1')
    await userEvent.click(screen.getByRole('button', { name: /enter inventory/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect')
    expect(sessionStorage.getItem('carstock_token')).toBeNull()
  })

  it('registers with the full name', async () => {
    fetch.mockReturnValue(reply(201, { access_token: 'tok2', user: { id: 2, full_name: 'New Buyer', email: 'n@b.com', is_admin: false } }))
    renderScreen()
    await userEvent.click(screen.getByRole('button', { name: /need an operator account/i }))
    await userEvent.type(await screen.findByLabelText(/full name/i), 'New Buyer')
    await userEvent.type(screen.getByLabelText(/email/i), 'n@b.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(fetch.mock.calls[0][0]).toBe('/api/auth/register')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ full_name: 'New Buyer', email: 'n@b.com', password: 'Password123' })
  })
})
