import { ArrowUpRight, CarFront, Trash2 } from 'lucide-react'
import { LOW_STOCK_THRESHOLD, formatPrice } from '../constants'

/** Colour of the status dot: sold out, low stock, or healthy. */
function stockColor(quantity) {
  if (quantity === 0) return '#c66a4c'
  return quantity <= LOW_STOCK_THRESHOLD ? '#f0a84b' : '#75856b'
}

function stockLabel(quantity) {
  if (quantity === 0) return 'No units available'
  return `${quantity} ${quantity === 1 ? 'unit' : 'units'} on floor`
}

export default function VehicleCard({ vehicle, isAdmin, busy, onPurchase, onEdit, onRestock, onDelete }) {
  const soldOut = vehicle.quantity === 0
  return (
    <article className="vehicle-card group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stockColor(vehicle.quantity) }} />
          <span className="eyebrow">{vehicle.category}</span>
        </div>
        <span className="font-mono text-[10px] text-ink/35">ID / {String(vehicle.id).padStart(4, '0')}</span>
      </div>

      <div className="mt-7 flex items-end justify-between gap-5">
        <div>
          <h3 className="text-2xl font-bold tracking-[-0.04em]">
            {vehicle.make} <span className="text-moss">{vehicle.model}</span>
          </h3>
          <p className="mt-2 font-mono text-xs text-ink/50">
            {formatPrice(vehicle.price)} <span className="mx-2 text-ink/20">/</span> {stockLabel(vehicle.quantity)}
          </p>
        </div>
        <div className="hidden h-16 w-24 items-end justify-end sm:flex">
          <CarFront size={70} strokeWidth={1} className="text-ink/10 transition group-hover:text-amber/50" />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {isAdmin && (
          <>
            <button className="button-ghost" onClick={() => onEdit(vehicle)}>
              Edit
            </button>
            <button className="button-ghost" onClick={() => onRestock(vehicle)}>
              + stock
            </button>
            <button className="button-ghost text-rust hover:bg-rust/10" onClick={() => onDelete(vehicle)} aria-label={`Delete ${vehicle.make} ${vehicle.model}`}>
              <Trash2 size={14} />
            </button>
          </>
        )}
        <button className="button-primary ml-auto" disabled={soldOut || busy} onClick={() => onPurchase(vehicle)}>
          {soldOut ? 'Out of stock' : busy ? 'Reserving…' : 'Reserve one'} <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  )
}
