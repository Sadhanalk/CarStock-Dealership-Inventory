import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('keeps the old value until the delay has passed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } })
    rerender({ value: 'ab' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('ab')
  })

  it('only emits the last value of a quick burst of changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: '' } })
    ;['t', 'te', 'tes', 'tesl', 'tesla'].forEach((value) => {
      rerender({ value })
      act(() => vi.advanceTimersByTime(100))
    })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('tesla')
  })
})
