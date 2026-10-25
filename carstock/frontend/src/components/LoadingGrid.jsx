/** Skeleton cards shown while the first load is in flight. */
export default function LoadingGrid() {
  return (
    <div className="grid gap-5 lg:grid-cols-2" aria-busy="true" aria-label="Loading vehicles">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-48 animate-pulse rounded-2xl bg-ink/5" />
      ))}
    </div>
  )
}
