import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import VehicleCard from './VehicleCard'

const car = { id: 7, make: 'Lumen', model: 'Arc GT', category: 'Electric', price: 58900, quantity: 4 }
const handlers = () => ({ onPurchase: vi.fn(), onEdit: vi.fn(), onRestock: vi.fn(), onDelete: vi.fn() })

describe('VehicleCard', () => {
  it('shows make, model, category, formatted price, zero-padded id and stock', () => {
    render(<VehicleCard vehicle={car} {...handlers()} />)
    expect(screen.getByRole('heading', { name: 'Lumen Arc GT' })).toBeInTheDocument()
    expect(screen.getByText('Electric')).toBeInTheDocument()
    expect(screen.getByText(/\$58,900/)).toBeInTheDocument()
    expect(screen.getByText('ID / 0007')).toBeInTheDocument()
    expect(screen.getByText(/4 units on floor/)).toBeInTheDocument()
  })

  it('uses the singular for one unit', () => {
    render(<VehicleCard vehicle={{ ...car, quantity: 1 }} {...handlers()} />)
    expect(screen.getByText(/1 unit on floor/)).toBeInTheDocument()
  })

  it('DISABLES the purchase button when quantity is zero', async () => {
    const h = handlers()
    render(<VehicleCard vehicle={{ ...car, quantity: 0 }} {...h} />)
    const button = screen.getByRole('button', { name: /out of stock/i })
    expect(button).toBeDisabled()
    expect(screen.getByText(/no units available/i)).toBeInTheDocument()
    await userEvent.click(button)
    expect(h.onPurchase).not.toHaveBeenCalled()
  })

  it('enables purchase when in stock and passes the vehicle to the handler', async () => {
    const h = handlers()
    render(<VehicleCard vehicle={car} {...h} />)
    await userEvent.click(screen.getByRole('button', { name: /reserve one/i }))
    expect(h.onPurchase).toHaveBeenCalledWith(car)
  })

  it('disables the button while a purchase is in flight', () => {
    render(<VehicleCard vehicle={car} busy {...handlers()} />)
    expect(screen.getByRole('button', { name: /reserving/i })).toBeDisabled()
  })

  it('hides admin actions from normal users', () => {
    render(<VehicleCard vehicle={car} isAdmin={false} {...handlers()} />)
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /\+ stock/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows edit / restock / delete to admins and wires each handler', async () => {
    const h = handlers()
    render(<VehicleCard vehicle={car} isAdmin {...h} />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: /\+ stock/ }))
    await userEvent.click(screen.getByRole('button', { name: /delete lumen arc gt/i }))
    expect(h.onEdit).toHaveBeenCalledWith(car)
    expect(h.onRestock).toHaveBeenCalledWith(car)
    expect(h.onDelete).toHaveBeenCalledWith(car)
  })
})
