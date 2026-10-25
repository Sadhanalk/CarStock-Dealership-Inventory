import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import VehicleFormModal, { validateVehicle } from './VehicleFormModal'

describe('validateVehicle', () => {
  const valid = { make: 'A', model: 'B', category: 'SUV', price: '100', quantity: '0' }

  it('accepts a valid listing (zero quantity is allowed)', () => expect(validateVehicle(valid)).toEqual({}))

  it.each([
    [{ make: '  ' }, 'make'],
    [{ model: '' }, 'model'],
    [{ category: '' }, 'category'],
    [{ price: '0' }, 'price'],
    [{ price: '' }, 'price'],
    [{ quantity: '-1' }, 'quantity'],
    [{ quantity: '1.5' }, 'quantity'],
    [{ quantity: '' }, 'quantity']
  ])('flags %j', (override, field) => expect(validateVehicle({ ...valid, ...override })).toHaveProperty(field))
})

describe('VehicleFormModal', () => {
  it('blocks submit and shows errors for an empty form', async () => {
    const onSave = vi.fn()
    render(<VehicleFormModal vehicle={null} onSave={onSave} onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getAllByText('Required').length).toBeGreaterThanOrEqual(2)
  })

  it('submits trimmed text and numeric price/quantity', async () => {
    const onSave = vi.fn()
    render(<VehicleFormModal vehicle={null} onSave={onSave} onClose={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Make'), '  Nori ')
    await userEvent.type(screen.getByLabelText('Model'), 'City E')
    await userEvent.type(screen.getByLabelText(/price/i), '28900')
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }))
    expect(onSave).toHaveBeenCalledWith({ make: 'Nori', model: 'City E', category: 'SUV', price: 28900, quantity: 1 })
  })

  it('pre-fills the form when editing', () => {
    const car = { id: 1, make: 'Vela', model: 'Corsa S', category: 'Sport', price: 73900, quantity: 2 }
    render(<VehicleFormModal vehicle={car} onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByLabelText('Make')).toHaveValue('Vela')
    expect(screen.getByLabelText(/price/i)).toHaveValue(73900)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('closes on Escape and on Cancel', async () => {
    const onClose = vi.fn()
    render(<VehicleFormModal vehicle={null} onSave={vi.fn()} onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
