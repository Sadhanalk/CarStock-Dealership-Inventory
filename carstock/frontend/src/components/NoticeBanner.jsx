import { Check, CircleAlert, X } from 'lucide-react'

export default function NoticeBanner({ notice, onDismiss }) {
  if (!notice) return null
  const isError = notice.type === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`mt-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${isError ? 'border-rust/30 bg-rust/10 text-rust' : 'border-moss/30 bg-moss/10 text-moss'}`}
    >
      <div className="flex items-center gap-2">
        {isError ? <CircleAlert size={16} /> : <Check size={16} />}
        {notice.message}
      </div>
      <button onClick={onDismiss} aria-label="Dismiss notice">
        <X size={16} />
      </button>
    </div>
  )
}
