"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Search, X } from "lucide-react"
import dynamic from "next/dynamic"
import type { PlaceSearchResult } from "@/app/api/places/search/route"
import type { PinResult, FlyTarget } from "./MapPinSelector"

const PlaceSearchMap = dynamic(() => import("./PlaceSearchMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-200 dark:bg-zinc-900 animate-pulse" />,
})

const MapPinSelector = dynamic(() => import("./MapPinSelector"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-200 dark:bg-zinc-900 animate-pulse" />,
})

type Mode = "search" | "pin"

type Props = {
  onClose: () => void
  onSelect: (result: PlaceSearchResult) => void
}

const DEBOUNCE_MS = 400

export default function LocationSearchModal({ onClose, onSelect }: Props) {
  const [mode, setMode] = useState<Mode>("search")

  // 検索モード
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // マップで指定モード
  const [pinResult, setPinResult] = useState<PinResult | null>(null)
  const [pinName, setPinName] = useState("")
  const [editableAddress, setEditableAddress] = useState("")
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null)
  const [mapSearchQuery, setMapSearchQuery] = useState("")
  const [mapSearching, setMapSearching] = useState(false)
  const mapSearchAbortRef = useRef<AbortController | null>(null)

  // ピンが移動したとき住所フィールドを更新（ユーザーが手編集済みでも上書き）
  useEffect(() => {
    if (pinResult) setEditableAddress(pinResult.address)
  }, [pinResult])

  const trimmed = query.trim()
  const hasMinLength = trimmed.length >= 2

  useEffect(() => {
    if (mode !== "search" || !hasMinLength) {
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
    const q = mapSearchQuery.trim()
    if (q.length < 2) return
    mapSearchAbortRef.current?.abort()
    const controller = new AbortController()
    mapSearchAbortRef.current = controller
    setMapSearching(true)
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
      const json = (await res.json()) as { results: PlaceSearchResult[] }
      if (controller.signal.aborted) return
      if (json.results?.length > 0) {
        const first = json.results[0]
        setFlyTarget({ lat: first.lat, lng: first.lng, key: Date.now() })
      }
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return
    } finally {
      setMapSearching(false)
    }
  }

  function handleAddPin() {
    if (!pinResult || !pinName.trim()) return
    onSelect({
      placeId: `manual-${Date.now()}`,
      name: pinName.trim(),
      address: editableAddress.trim() || pinResult.address,
      prefecture: pinResult.prefecture,
      lat: pinResult.lat,
      lng: pinResult.lng,
    })
  }

  const canAddPin = pinResult !== null && pinName.trim().length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="場所を検索"
      className="fixed inset-0 z-[100] flex flex-col bg-white/95 dark:bg-black/95 backdrop-blur-sm"
    >
      {/* ヘッダー */}
      <div className="sticky top-0 flex items-center gap-2 px-4 pt-10 pb-3 bg-white/95 dark:bg-black/95 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-1 gap-1">
          <button
            type="button"
            onClick={() => setMode("search")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              mode === "search"
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            検索
          </button>
          <button
            type="button"
            onClick={() => setMode("pin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              mode === "pin"
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            マップで指定
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="w-9 h-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── 検索モード ── */}
      {mode === "search" && (
        <>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="場所名や住所で検索 (2 文字以上)"
              className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
                aria-label="クリア"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

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
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-zinc-500">該当する場所が見つかりませんでした</p>
                <button
                  type="button"
                  onClick={() => setMode("pin")}
                  className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  マップで直接指定する
                </button>
              </div>
            )}
            {status === "error" && (
              <p className="text-xs text-red-500 dark:text-red-400 py-8 text-center">{errorMessage}</p>
            )}
            {!hasMinLength && (
              <p className="text-xs text-zinc-500 py-8 text-center">場所名や住所を 2 文字以上入力してください</p>
            )}

            <ul className="flex flex-col gap-2">
              {hasMinLength && results.map((r, i) => (
                <li key={r.placeId}>
                  <button
                    type="button"
                    onClick={() => onSelect(r)}
                    className="w-full text-left flex items-start gap-3 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 transition"
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

      {/* ── マップで指定モード ── */}
      {mode === "pin" && (
        <>
          <div className="flex-1 relative min-h-0">
            <MapPinSelector onPinChange={setPinResult} flyTarget={flyTarget} />
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-3 bg-white dark:bg-zinc-950">
            {/* 地図移動用の住所検索 */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") searchAndFly() }}
                placeholder="住所・場所名で地図を移動"
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
              />
              {mapSearching ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <button
                  type="button"
                  onClick={searchAndFly}
                  disabled={mapSearchQuery.trim().length < 2}
                  className="text-xs font-semibold text-green-600 dark:text-green-400 disabled:opacity-40 shrink-0"
                >
                  移動
                </button>
              )}
            </div>

            {/* 場所の名前 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                場所の名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pinName}
                onChange={(e) => setPinName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddPin() }}
                placeholder="例: お気に入りの公園"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {pinResult ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  住所
                  <span className="ml-1.5 font-normal text-zinc-400 dark:text-zinc-500">（自動取得・番地まで編集可）</span>
                </label>
                <textarea
                  value={editableAddress}
                  onChange={(e) => setEditableAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-green-500 transition-colors resize-none"
                />
              </div>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">マップをタップして場所を指定してください</p>
            )}

            <button
              type="button"
              onClick={handleAddPin}
              disabled={!canAddPin}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm transition"
            >
              この場所を追加
            </button>
          </div>
        </>
      )}
    </div>
  )
}
