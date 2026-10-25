import { useCallback, useEffect, useState } from 'react'

/** One dismissible banner message that clears itself after a few seconds. */
export function useNotice(timeout = 4500) {
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), timeout)
    return () => clearTimeout(timer)
  }, [notice, timeout])

  return {
    notice,
    success: useCallback((message) => setNotice({ type: 'success', message }), []),
    error: useCallback((message) => setNotice({ type: 'error', message }), []),
    dismiss: useCallback(() => setNotice(null), [])
  }
}
