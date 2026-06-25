export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="h-24 bg-gradient-to-br from-azure/40 to-night" />
      <div className="space-y-4 px-5 py-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-hairline bg-panel">
            <div className="aspect-[16/10] w-full tocca-shimmer" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-20 rounded tocca-shimmer" />
              <div className="h-5 w-2/3 rounded tocca-shimmer" />
              <div className="h-3 w-full rounded tocca-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
