import Link from "next/link"
import { MapPin, Sparkles, X } from "lucide-react"
import type { PlaceList } from "@/types/spot"
import type { PlaceListFilters } from "@/lib/filter/placeLists"

type Props = {
  placeLists: PlaceList[]
  filters: PlaceListFilters
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
      {children}
    </span>
  )
}

export default function FilteredResults({ placeLists, filters }: Props) {
  const chips: string[] = []
  if (filters.pref) chips.push(filters.pref)
  if (filters.cats?.length) chips.push(...filters.cats)
  if (filters.distance) chips.push(filters.distance)
  if (filters.query) chips.push(`"${filters.query}"`)
  if (filters.order && filters.order !== "登録が新しい順") chips.push(filters.order)

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">絞り込み結果</h2>
          <span className="text-sm text-zinc-400 dark:text-zinc-500">({placeLists.length})</span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
          クリア
        </Link>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {chips.map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
      )}

      {placeLists.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
          条件に合うプレイスリストが見つかりませんでした
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {placeLists.map((p) => (
            <Link
              href={`/placelists/${p.id}`}
              key={p.id}
              className="flex flex-col group cursor-pointer"
            >
              <div className="aspect-square w-full bg-zinc-200 dark:bg-zinc-800 rounded-md mb-3 shadow-lg group-hover:opacity-80 transition flex items-center justify-center">
                <MapPin className="w-9 h-9 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3 className="font-bold text-sm truncate mb-1 text-zinc-900 dark:text-zinc-100">
                {p.name}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 whitespace-normal leading-relaxed">
                {p.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
