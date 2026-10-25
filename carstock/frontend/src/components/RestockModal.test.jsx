import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RestockModal from './RestockModal'

const car = { id: 1, make: 'Nori', model: 'City E' }

describe('RestockModal', () => {
  it('submits the entered amount as a number', async () => {
    const onSubmit = vi.fn()
    render(<RestockModal vehicle={car} onSubmit={onSubmit} onClose={vi.fn()} />)
    const input = screen.getByLabelText('Units to add')
    await userEvent.clear(input)
    await userEvent.type(input, '12')
    await userEvent.click(screen.getByRole('button', { name: 'Add to stock' }))
    expect(onSubmit).toHaveBeenCalledWith(12)
  })

  it.each(['0', '-3', '2.5', ''])('rejects %j', async (value) => {
    const onSubmit = vi.fn()
    render(<RestockModal vehicle={car} onSubmit={onSubmit} onClose={vi.fn()} />)
    const input = screen.getByLabelText('Units to add')
    await userEvent.clear(input)
    if (value) await userEvent.type(input, value)
    expect(screen.getByRole('button', { name: 'Add to stock' })).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
