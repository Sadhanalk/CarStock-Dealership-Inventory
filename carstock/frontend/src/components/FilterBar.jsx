import { Search } from 'lucide-react'

export default function FilterBar({ filters, categories, onChange, onClear }) {
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value })
  const active = Object.values(filters).some(Boolean)

  return (
    <div role="search" className="mt-5 grid gap-3 rounded-2xl border border-ink/10 bg-white/50 p-3 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] sm:p-4">
      <label className="relative block">
        <Search className="absolute left-3 top-3 text-ink/40" size={17} />
        <input aria-label="Search make or model" className="field pl-10" placeholder="Make or model" value={filters.query} onChange={set('query')} />
      </label>
      <select aria-label="Category" className="field" value={filters.category} onChange={set('category')}>
        <option value="">All types</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <input aria-label="Minimum price" className="field" type="number" min="0" placeholder="Min price" value={filters.min_price} onChange={set('min_price')} />
      <input aria-label="Maximum price" className="field" type="number" min="0" placeholder="Max price" value={filters.max_price} onChange={set('max_price')} />
      <button className="button-secondary justify-center" onClick={onClear} disabled={!active}>
        Clear
      </button>
    </div>
  )
}
