import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { vehiclesApi } from '../api/client'
import { AuthProvider } from '../context/AuthContext'
import { App } from '../App'
import Dashboard from './Dashboard'

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, vehiclesApi: { search: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), purchase: vi.fn(), restock: vi.fn() } }
})

const lumen = { id: 1, make: 'Lumen', model: 'Arc GT', category: 'Electric', price: 58900, quantity: 4 }
const nori = { id: 2, make: 'Nori', model: 'City E', category: 'Compact', price: 28900, quantity: 0 }
const vela = { id: 3, make: 'Vela', model: 'Corsa S', category: 'Sport', price: 73900, quantity: 2 }

function renderAs(user) {
  sessionStorage.setItem('carstock_token', 't')
  sessionStorage.setItem('carstock_user', JSON.stringify(user))
  return render(<AuthProvider><Dashboard /></AuthProvider>)
}
const buyer = { id: 2, full_name: 'Jordan Reyes', email: 'buyer@carstock.com', is_admin: false }
const admin = { id: 1, full_name: 'Avery Stone', email: 'admin@carstock.com', is_admin: true }

beforeEach(() => {
  vi.clearAllMocks()
  vehiclesApi.search.mockResolvedValue([lumen, nori, vela])
})

describe('Dashboard (customer)', () => {
  it('lists vehicles with stats', async () => {
    renderAs(buyer)
    expect(await screen.findByRole('heading', { name: 'Lumen Arc GT' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nori City E' })).toBeInTheDocument()
    expect(screen.getByText('Units on floor').nextSibling).toHaveTextContent('6') // 4 + 0 + 2
    expect(screen.getByText('Low stock').nextSibling).toHaveTextContent('1') // only Vela (2 units)
  })

  it('disables purchase for the out-of-stock vehicle only', async () => {
    renderAs(buyer)
    await screen.findByRole('heading', { name: 'Lumen Arc GT' })
    expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: /reserve one/i })).toHaveLength(2)
  })

  it('purchases and updates the quantity shown', async () => {
    vehiclesApi.purchase.mockResolvedValue({ ...lumen, quantity: 3 })
    renderAs(buyer)
    const card = (await screen.findByRole('heading', { name: 'Lumen Arc GT' })).closest('article')
    await userEvent.click(within(card).getByRole('button', { name: /reserve one/i }))
    expect(vehiclesApi.purchase).toHaveBeenCalledWith(1)
    expect(await screen.findByText(/3 units on floor/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('reserved from stock')
  })

  it('shows the error and refreshes when a purchase fails', async () => {
    vehiclesApi.purchase.mockRejectedValue(new Error('Vehicle is out of stock'))
    renderAs(buyer)
    await userEvent.click((await screen.findAllByRole('button', { name: /reserve one/i }))[0])
    expect(await screen.findByRole('alert')).toHaveTextContent('Vehicle is out of stock')
    await waitFor(() => expect(vehiclesApi.search).toHaveBeenCalledTimes(2)) // reloaded real stock
  })

  it('searches after a pause in typing, not on every keystroke', async () => {
    renderAs(buyer)
    await screen.findByRole('heading', { name: 'Lumen Arc GT' })
    vehiclesApi.search.mockClear()
    await userEvent.type(screen.getByLabelText('Search make or model'), 'tesla')
    await waitFor(() => expect(vehiclesApi.search).toHaveBeenCalledTimes(1))
    expect(vehiclesApi.search).toHaveBeenCalledWith({ q: 'tesla', category: '', min_price: '', max_price: '' })
  })

  it('sends category and price filters to the API', async () => {
    renderAs(buyer)
    await screen.findByRole('heading', { name: 'Lumen Arc GT' })
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Electric')
    await userEvent.type(screen.getByLabelText('Minimum price'), '40000')
    await waitFor(() => expect(vehiclesApi.search).toHaveBeenLastCalledWith({ q: '', category: 'Electric', min_price: '40000', max_price: '' }))
  })

  it('shows an empty state when nothing matches', async () => {
    vehiclesApi.search.mockResolvedValue([])
    renderAs(buyer)
    expect(await screen.findByText(/no vehicles match/i)).toBeInTheDocument()
  })

  it('surfaces a load failure', async () => {
    vehiclesApi.search.mockRejectedValue(new Error('Network down'))
    renderAs(buyer)
    expect(await screen.findByRole('alert')).toHaveTextContent('Network down')
  })

  it('does not offer admin controls', async () => {
    renderAs(buyer)
    await screen.findByRole('heading', { name: 'Lumen Arc GT' })
    expect(screen.queryByRole('button', { name: /add vehicle/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('signs out and returns to the login screen', async () => {
    sessionStorage.setItem('carstock_token', 't')
    sessionStorage.setItem('carstock_user', JSON.stringify(buyer))
    render(<App />)
    await screen.findByRole('heading', { name: 'Lumen Arc GT' })
    await userEvent.click(screen.getAllByRole('button', { name: /sign out/i })[0])
    expect(sessionStorage.getItem('carstock_token')).toBeNull()
    expect(await screen.findByText('Back to the floor.')).toBeInTheDocument()
  })
})

describe('Dashboard (admin)', () => {
  it('adds a vehicle through the form and reloads the list', async () => {
    vehiclesApi.create.mockResolvedValue({ id: 9, make: 'Kestrel', model: 'Haul', category: 'Truck', price: 44800, quantity: 5 })
    renderAs(admin)
    await userEvent.click(await screen.findByRole('button', { name: /add vehicle/i }))
    const dialog = screen.getByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Make'), 'Kestrel')
    await userEvent.type(within(dialog).getByLabelText('Model'), 'Haul')
    await userEvent.type(within(dialog).getByLabelText(/price/i), '44800')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add vehicle' }))
    expect(vehiclesApi.create).toHaveBeenCalledWith({ make: 'Kestrel', model: 'Haul', category: 'SUV', price: 44800, quantity: 1 })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(vehiclesApi.search).toHaveBeenCalledTimes(2))
  })

  it('edits an existing vehicle', async () => {
    vehiclesApi.update.mockResolvedValue({ ...lumen, price: 55000 })
    renderAs(admin)
    const card = (await screen.findByRole('heading', { name: 'Lumen Arc GT' })).closest('article')
    await userEvent.click(within(card).getByRole('button', { name: 'Edit' }))
    const price = within(screen.getByRole('dialog')).getByLabelText(/price/i)
    await userEvent.clear(price)
    await userEvent.type(price, '55000')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(vehiclesApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ price: 55000, make: 'Lumen' }))
  })

  it('restocks a vehicle', async () => {
    vehiclesApi.restock.mockResolvedValue({ ...nori, quantity: 5 })
    renderAs(admin)
    const card = (await screen.findByRole('heading', { name: 'Nori City E' })).closest('article')
    await userEvent.click(within(card).getByRole('button', { name: /\+ stock/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Add to stock' }))
    expect(vehiclesApi.restock).toHaveBeenCalledWith(2, 5)
    expect(await screen.findByText(/5 units on floor/)).toBeInTheDocument()
  })

  it('asks for confirmation before deleting, and can be cancelled', async () => {
    renderAs(admin)
    const card = (await screen.findByRole('heading', { name: 'Lumen Arc GT' })).closest('article')
    await userEvent.click(within(card).getByRole('button', { name: /delete lumen arc gt/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(vehiclesApi.remove).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Lumen Arc GT' })).toBeInTheDocument()
  })

  it('deletes after confirmation', async () => {
    vehiclesApi.remove.mockResolvedValue(null)
    renderAs(admin)
    const card = (await screen.findByRole('heading', { name: 'Lumen Arc GT' })).closest('article')
    await userEvent.click(within(card).getByRole('button', { name: /delete lumen arc gt/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete listing' }))
    expect(vehiclesApi.remove).toHaveBeenCalledWith(1)
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Lumen Arc GT' })).not.toBeInTheDocument())
  })
})
