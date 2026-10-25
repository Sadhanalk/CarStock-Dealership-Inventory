import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { emptyFilters } from '../constants'
import FilterBar from './FilterBar'

describe('FilterBar', () => {
  it('lists every category plus "All types"', () => {
    render(<FilterBar filters={emptyFilters} categories={['Electric', 'SUV']} onChange={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByRole('option', { name: 'All types' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Electric' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'SUV' })).toBeInTheDocument()
  })

  it('reports each filter change with the other values preserved', () => {
    const onChange = vi.fn()
    render(<FilterBar filters={{ ...emptyFilters, category: 'SUV' }} categories={['SUV']} onChange={onChange} onClear={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Search make or model'), { target: { value: 'tesla' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...emptyFilters, category: 'SUV', query: 'tesla' })
    fireEvent.change(screen.getByLabelText('Minimum price'), { target: { value: '20000' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...emptyFilters, category: 'SUV', min_price: '20000' })
    fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: '50000' } })
    expect(onChange).toHaveBeenLastCalledWith({ ...emptyFilters, category: 'SUV', max_price: '50000' })
  })

  it('only enables Clear when a filter is active', async () => {
    const onClear = vi.fn()
    const { rerender } = render(<FilterBar filters={emptyFilters} categories={[]} onChange={vi.fn()} onClear={onClear} />)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
    rerender(<FilterBar filters={{ ...emptyFilters, query: 'x' }} categories={[]} onChange={vi.fn()} onClear={onClear} />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalled()
  })
})
