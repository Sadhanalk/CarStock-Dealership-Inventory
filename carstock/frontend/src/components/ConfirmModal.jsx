import Modal from './Modal'

export default function ConfirmModal({ title, message, confirmLabel, busy, onConfirm, onClose }) {
  return (
    <Modal eyebrow="Admin / Confirm" title={title} onClose={onClose}>
      <p className="mt-4 text-sm leading-6 text-ink/65">{message}</p>
      <div className="mt-8 flex justify-end gap-3">
        <button className="button-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="button-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
