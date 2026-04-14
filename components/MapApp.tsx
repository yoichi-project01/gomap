"use client"

import { useState } from "react"
import Map from "./Map"
import type { Spot } from "@/types/spot"

type Props = {
  spots: Spot[]
  pref?: string
  cat?: string
}

export default function MapApp({ spots, pref, cat }: Props) {
  const [query, setQuery] = useState("")

  const filtered = spots.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    (s.description ?? "").toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      {/* 地図エリア（検索バーを重ねる） */}
      <div className="relative flex-1 overflow-hidden">
        {/* 検索バー */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <input
            type="text"
            placeholder="スポットを検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full bg-white shadow-md text-sm outline-none border border-zinc-200 placeholder:text-zinc-400"
          />
          {/* アクティブフィルターバッジ */}
          {(pref || cat) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pref && (
                <span className="bg-zinc-900 text-white text-xs px-2.5 py-0.5 rounded-full">
                  {pref}
                </span>
              )}
              {cat?.split(",").map((c) => (
                <span key={c} className="bg-zinc-700 text-white text-xs px-2.5 py-0.5 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          )}
          {/* ヒット件数バッジ（検索中のみ表示） */}
          {query && (
            <p className="mt-2 ml-2 text-xs text-zinc-600 bg-white/80 px-2 py-0.5 rounded-full w-fit shadow-sm">
              {filtered.length} 件
            </p>
          )}
        </div>

        <Map spots={filtered} />
      </div>
    </div>
  )
}
