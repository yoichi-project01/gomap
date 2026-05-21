"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X, MapPin, Navigation } from "lucide-react"
import dynamic from "next/dynamic"
import type { PlaceSearchResult } from "@/app/api/places/search/route"
import type { FlyTarget, PinResult } from "./MapPinSelector"

const PlaceSearchMap = dynamic(() => import("./PlaceSearchMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />,
})

const MapPinSelector = dynamic(() => import("./MapPinSelector"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />,
})

const MapPinSelectorWithMarker = dynamic(
  () => import("./MapPinSelector").then((m) => m.MapPinSelectorWithMarker),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />,
  },
)

type Props = {
  onClose: () => void
  onSelect: (result: PlaceSearchResult) => void
}

type Mode = "search" | "pin"

const DEBOUNCE_MS = 400

export default function LocationSearchModal({ onClose, onSelect }: Props) {
  const [mode, setMode] = useState<Mode>("search")

  // --- search mode state ---
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // --- pin mode state ---
  const [pinResult, setPinResult] = useState<PinResult | null>(null)
  const [pinName, setPinName] = useState("")
  const [editableAddress, setEditableAddress] = useState("")
  const [mapNavQuery, setMapNavQuery] = useState("")
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null)
  const flyKeyRef = useRef(0)

  // sync editableAddress when pin changes
  useEffect(() => {
    if (pinResult) setEditableAddress(pinResult.address)
  }, [pinResult])

  const trimmed = query.trim()
  const hasMinLength = trimmed.length >= 2

  useEffect(() => {
    if (mode !== "search") return
    if (!hasMinLength) {
      abortRef.current?.abort()
      return
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setStatus("loading")
      setErrorMessage(null)

      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        })
        const json = (await res.json()) as { results: PlaceSearchResult[]; error?: string }
        if (controller.signal.aborted) return
        if (!res.ok) {
          setStatus("error")
          setErrorMessage(json.error ?? "検索に失敗しました")
          setResults([])
          return
        }
        setResults(json.results)
        setStatus(json.results.length === 0 ? "empty" : "idle")
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return
        setStatus("error")
        setErrorMessage("通信エラーが発生しました")
        setResults([])
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [trimmed, hasMinLength, mode])

  async function searchAndFly() {
    const q = mapNavQuery.trim()
    if (q.length < 2) return
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`)
      const json = (await res.json()) as { results: PlaceSearchResult[] }
      if (json.results.length > 0) {
        const first = json.results[0]
        flyKeyRef.current += 1
        setFlyTarget({ lat: first.lat, lng: first.lng, key: flyKeyRef.current })
      }
    } catch {
      // ignore
    }
  }

  function handleAddPin() {
    if (!pinResult || !pinName.trim()) return
    onSelect({
      placeId: `pin-${Date.now()}`,
      name: pinName.trim(),
      address: editableAddress || pinResult.address,
      lat: pinResult.lat,
      lng: pinResult.lng,
      prefecture: pinResult.prefecture ?? null,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="場所を検索"
      className="fixed inset-0 z-[100] flex flex-col bg-zinc-50 dark:bg-black/95 backdrop-blur-sm"
    >
      {/* header / mode toggle */}
      <div className="sticky top-0 z-10 flex items-center gap-2 px-4 pt-10 pb-3 bg-zinc-50/95 dark:bg-black/95 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex rounded-full bg-zinc-200 dark:bg-zinc-800 p-0.5 mr-1">
          <button
            type="button"
            onClick={() => setMode("search")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              mode === "search"
                ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Search className="w-3.5 h-3.5 inline-block mr-1" />
            検索
          </button>
          <button
            type="button"
            onClick={() => setMode("pin")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              mode === "pin"
                ? "bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 inline-block mr-1" />
            ピン
          </button>
        </div>

        {mode === "search" && (
          <>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="場所名や住所で検索 (2 文字以上)"
              className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-sm"
            />
          </>
        )}

        {mode === "pin" && (
          <div className="flex-1 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={mapNavQuery}
              onChange={(e) => setMapNavQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void searchAndFly() } }}
              placeholder="住所や場所名でマップを移動"
              className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => void searchAndFly()}
              aria-label="移動"
              className="shrink-0 px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold transition"
            >
              移動
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="w-9 h-9 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* search mode body */}
      {mode === "search" && (
        <>
          {results.length > 0 && status !== "loading" && (
            <div className="h-56 shrink-0 border-b border-zinc-200 dark:border-zinc-800">
              <PlaceSearchMap results={results} onSelect={onSelect} />
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-4 py-3 [&::-webkit-scrollbar]:hidden">
            {status === "loading" && (
              <p className="text-xs text-zinc-500 py-4 text-center">検索中…</p>
            )}
            {status === "empty" && (
              <p className="text-xs text-zinc-500 py-8 text-center">該当する場所が見つかりませんでした</p>
            )}
            {status === "error" && (
              <p className="text-xs text-red-500 py-8 text-center">{errorMessage}</p>
            )}
            {!hasMinLength && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 py-8 text-center">場所名や住所を 2 文字以上入力してください</p>
            )}
            <ul className="flex flex-col gap-2">
              {hasMinLength && results.map((r, i) => (
                <li key={r.placeId}>
                  <button
                    type="button"
                    onClick={() => onSelect(r)}
                    className="w-full text-left flex items-start gap-3 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-500 text-black font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{r.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">{r.address}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* pin mode body */}
      {mode === "pin" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* map */}
          <div className="flex-1 relative">
            {pinResult ? (
              <MapPinSelectorWithMarker
                pinLat={pinResult.lat}
                pinLng={pinResult.lng}
                onPinChange={setPinResult}
                flyTarget={flyTarget}
              />
            ) : (
              <MapPinSelector onPinChange={setPinResult} flyTarget={flyTarget} />
            )}
          </div>

          {/* bottom panel */}
          <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 pt-3 pb-6 flex flex-col gap-3">
            {pinResult ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">スポット名</label>
                  <input
                    type="text"
                    value={pinName}
                    onChange={(e) => setPinName(e.target.value)}
                    placeholder="例: 渋谷スクランブル交差点"
                    className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-green-500 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">住所（自動取得・編集可）</label>
                  <textarea
                    value={editableAddress}
                    onChange={(e) => setEditableAddress(e.target.value)}
                    rows={2}
                    className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-green-500 transition resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPin}
                  disabled={!pinName.trim()}
                  className="w-full py-3 rounded-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold text-sm transition"
                >
                  このスポットを追加
                </button>
              </>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">
                マップをタップするとピンが立ちます
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
