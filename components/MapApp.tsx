"use client"

import Map from "./Map"
import type { Spot } from "@/types/spot"

type Props = {
  spots: Spot[]
  pref?: string
  cat?: string
}

type LibrarySpot = {
  id: string
  name: string
  description: string
}

const LIBRARY_TITLES = [
  "旅の記録",
  "グルメコレクション",
  "カフェコレクション",
  "自然スポット",
]

const NEW_SPOTS: LibrarySpot[] = [
  { id: "new-1", name: "中之島公園", description: "川沿いの緑あふれる新スポット" },
  { id: "new-2", name: "梅田スカイビル", description: "最新の展望フロアを楽しもう" },
]
const FEATURED_SPOTS: LibrarySpot[] = [
  { id: "feat-1", name: "道頓堀グルメ", description: "話題のたこ焼きとお好み焼き" },
  { id: "feat-2", name: "天保山マーケットプレース", description: "人気のショッピング&グルメスポット" },
]
const RANKING_SPOTS: LibrarySpot[] = [
  { id: "rank-1", name: "大阪城", description: "定番の観光名所" },
  { id: "rank-2", name: "通天閣", description: "大阪のシンボルタワー" },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-zinc-900 mb-3">{children}</h2>
  )
}

function SpotCard({ spot }: { spot: LibrarySpot }) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-100 p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-900">{spot.name}</p>
      <p className="text-xs text-zinc-500 mt-1">{spot.description}</p>
    </div>
  )
}

export default function MapApp({ spots, pref, cat }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="space-y-5 p-4 bg-white border-b border-zinc-100">
        <div className="flex flex-wrap gap-3">
          {LIBRARY_TITLES.map((title) => (
            <button
              key={title}
              className="min-w-[150px] flex-1 h-12 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition text-center"
            >
              {title}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          <div>
            <SectionTitle>新着</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {NEW_SPOTS.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>

          <div>
            <SectionTitle>注目</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FEATURED_SPOTS.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>

          <div>
            <SectionTitle>ランキング</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {RANKING_SPOTS.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <Map spots={spots} />
      </div>
    </div>
  )
}
