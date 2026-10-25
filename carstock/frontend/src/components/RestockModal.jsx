import { useState } from 'react'
import Modal from './Modal'

export default function RestockModal({ vehicle, busy, onSubmit, onClose }) {
  const [amount, setAmount] = useState('5')
  const quantity = Number(amount)
  const valid = Number.isInteger(quantity) && quantity > 0

  const submit = (event) => {
    event.preventDefault()
    if (valid) onSubmit(quantity)
  }

  return (
    <Modal eyebrow="Admin / Restock" title={`${vehicle.make} ${vehicle.model}`} onClose={onClose}>
      <form onSubmit={submit} className="mt-6">
        <label className="block">
          <span className="label">Units to add</span>
          <input className="field mt-2" type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} autoFocus />
        </label>
        {!valid && <span className="field-error">Enter a whole number of at least 1.</span>}
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary" disabled={!valid || busy}>
            {busy ? 'Adding…' : 'Add to stock'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
