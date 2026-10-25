import { X } from 'lucide-react'
import { useEffect } from 'react'

/** Dialog shell: closes on Escape or a click on the backdrop. */
export default function Modal({ eyebrow, title, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/50 p-5 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-2xl bg-paper p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 className="mt-2 text-2xl font-bold">{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
