import { useState } from 'react'
import { BASE_CATEGORIES } from '../constants'
import Modal from './Modal'

const FIELDS = [
  { key: 'make', label: 'Make', type: 'text' },
  { key: 'model', label: 'Model', type: 'text' },
  { key: 'category', label: 'Category', type: 'text', wide: true, list: 'category-options' },
  { key: 'price', label: 'Price (USD)', type: 'number', min: 1, step: '0.01' },
  { key: 'quantity', label: 'Quantity', type: 'number', min: 0, step: '1' }
]

/** Client-side checks that mirror the API rules, so people get feedback before a round trip. */
export function validateVehicle(form) {
  const errors = {}
  ;['make', 'model', 'category'].forEach((key) => {
    if (!String(form[key]).trim()) errors[key] = 'Required'
  })
  if (!(Number(form.price) > 0)) errors.price = 'Must be greater than 0'
  const quantity = Number(form.quantity)
  if (form.quantity === '' || !Number.isInteger(quantity) || quantity < 0) errors.quantity = 'Must be a whole number, 0 or more'
  return errors
}

/** Add (vehicle = null) or edit (vehicle = existing listing). */
export default function VehicleFormModal({ vehicle, busy, onSave, onClose }) {
  const editing = Boolean(vehicle)
  const [form, setForm] = useState({
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    category: vehicle?.category ?? 'SUV',
    price: vehicle?.price ?? '',
    quantity: vehicle?.quantity ?? 1
  })
  const [errors, setErrors] = useState({})

  const submit = (event) => {
    event.preventDefault()
    const found = validateVehicle(form)
    setErrors(found)
    if (Object.keys(found).length) return
    onSave({
      make: form.make.trim(),
      model: form.model.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity)
    })
  }

  return (
    <Modal eyebrow={`Admin / ${editing ? 'Edit listing' : 'New listing'}`} title={editing ? 'Tune the listing.' : 'Put it on the floor.'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {FIELDS.map(({ key, label, wide, ...input }) => (
            <label key={key} className={wide ? 'sm:col-span-2' : ''}>
              <span className="label">{label}</span>
              <input className="field mt-2" {...input} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
              {errors[key] && <span className="field-error">{errors[key]}</span>}
            </label>
          ))}
          <datalist id="category-options">
            {BASE_CATEGORIES.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
