"use client"

import { useState } from "react"
import Map from "./Map"
import type { Spot } from "@/types/spot"
import type { SpotGroup } from "@/lib/client/dummySpots"
import { DUMMY_SPOT_GROUPS } from "@/lib/client/dummySpots"

type Props = {
  spots: Spot[]
  pref?: string
  cat?: string
}

const LIBRARY_TITLES = [
  "旅の記録",
  "グルメコレクション",
  "カフェコレクション",
  "自然スポット",
]

// スポット集合を取得
const getNewSpots = (): SpotGroup => {
  return DUMMY_SPOT_GROUPS[0]
}

const getPopularSpots = (): SpotGroup => {
  return DUMMY_SPOT_GROUPS[1]
}

const getRankingSpots = (): SpotGroup => {
  return DUMMY_SPOT_GROUPS[2]
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-zinc-900 mb-3">{children}</h2>
  )
}

function SpotCard({ group, onClick }: { group: SpotGroup; onClick: (group: SpotGroup) => void }) {
  return (
    <div 
      className="bg-white rounded-3xl border border-zinc-100 p-4 shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={() => onClick(group)}
    >
      <p className="text-sm font-semibold text-zinc-900">{group.name}</p>
      <p className="text-xs text-zinc-500 mt-1">{group.description}</p>
      <p className="text-xs text-zinc-400 mt-2">{group.spots.length}件のスポット</p>
    </div>
  )
}

export default function MapApp({ spots, pref, cat }: Props) {
  const [showMap, setShowMap] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<SpotGroup | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  const handleGroupClick = (group: SpotGroup) => {
    setSelectedGroup(group)
    setShowMap(true)
    setSelectedSpot(null)
    setIsMapExpanded(false)
  }

  const handleBackClick = () => {
    setShowMap(false)
    setSelectedGroup(null)
    setSelectedSpot(null)
    setIsMapExpanded(false)
  }

  const handleSpotClick = (spot: Spot) => {
    setSelectedSpot(spot)
  }

  return (
    <div className="h-full flex flex-col">
      {!showMap && (
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
                <SpotCard group={getNewSpots()} onClick={handleGroupClick} />
              </div>
            </div>

            <div>
              <SectionTitle>人気</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SpotCard group={getPopularSpots()} onClick={handleGroupClick} />
              </div>
            </div>

            <div>
              <SectionTitle>ランキング</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SpotCard group={getRankingSpots()} onClick={handleGroupClick} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showMap && selectedGroup && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-zinc-100 p-4 flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 transition flex items-center justify-center"
            >
              ←
            </button>
            <div className="flex-1">
              {!isMapExpanded && (
                <p className="text-sm text-zinc-500">スポット集合</p>
              )}
              <h1 className="text-lg font-semibold text-zinc-900">{selectedGroup.name}</h1>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Normal View */}
            {!isMapExpanded && (
              <>
                {/* Map Section */}
                <div className="flex-[0.35] relative overflow-hidden">
                  <Map 
                    spots={selectedGroup.spots} 
                    fitBounds={true} 
                    selectedSpot={selectedSpot}
                    onMarkerClick={handleSpotClick}
                  />
                  <button
                    onClick={() => setIsMapExpanded(true)}
                    className="absolute top-4 right-4 z-50 bg-white rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 shadow-md hover:shadow-lg transition"
                  >
                    🔍 拡大
                  </button>
                </div>

                {/* Spot List Section */}
                <div className="flex-[0.65] bg-white border-t border-zinc-100 p-4 overflow-y-auto">
                  <p className="text-xs text-zinc-500 mb-3">登録地点</p>
                  <div className="space-y-2">
                    {selectedGroup.spots.map((spot) => (
                      <div
                        key={spot.id}
                        onClick={() => handleSpotClick(spot)}
                        className={`p-3 rounded-lg border transition cursor-pointer ${
                          selectedSpot?.id === spot.id
                            ? "bg-blue-50 border-blue-300"
                            : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        <p className="text-sm font-semibold text-zinc-900">{spot.name}</p>
                        <p className="text-xs text-zinc-500 mt-1">{spot.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Expanded View */}
            {isMapExpanded && (
              <div className="flex-1 relative overflow-hidden">
                <Map 
                  spots={selectedGroup.spots} 
                  fitBounds={true} 
                  selectedSpot={selectedSpot}
                  onMarkerClick={handleSpotClick}
                />
                <button
                  onClick={() => setIsMapExpanded(false)}
                  className="absolute top-4 right-4 z-50 bg-white rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 shadow-md hover:shadow-lg transition"
                >
                  🔍 縮小
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
