import { CarFront } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 px-6 py-16 text-center">
      <CarFront className="mx-auto text-ink/20" size={36} />
      <p className="mt-4 text-sm font-semibold">No vehicles match that view.</p>
      <p className="mt-1 text-sm text-ink/50">Try widening the filters or clearing the search.</p>
    </div>
  )
}
