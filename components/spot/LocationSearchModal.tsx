"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import dynamic from "next/dynamic"
import type { PlaceSearchResult } from "@/app/api/places/search/route"

const PlaceSearchMap = dynamic(() => import("./PlaceSearchMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-200 dark:bg-zinc-900 animate-pulse" />,
})

type Props = {
  onClose: () => void
  onSelect: (result: PlaceSearchResult) => void
}

const DEBOUNCE_MS = 400

export default function LocationSearchModal({ onClose, onSelect }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const trimmed = query.trim()
  const hasMinLength = trimmed.length >= 2

  useEffect(() => {
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
  }, [trimmed, hasMinLength])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="場所を検索"
      className="fixed inset-0 z-[100] flex flex-col bg-white/95 dark:bg-black/95 backdrop-blur-sm"
    >
      <div className="sticky top-0 flex items-center gap-2 px-4 pt-10 pb-3 bg-white/95 dark:bg-black/95 border-b border-zinc-200 dark:border-zinc-800">
        <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-400 shrink-0" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="場所名や住所で検索 (2 文字以上)"
          className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-sm"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="w-9 h-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
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
          <p className="text-xs text-zinc-500 py-8 text-center">該当する場所が見つかりませんでした</p>
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
    </div>
  )
}
