"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, MapPin, LayoutList } from "lucide-react"

export default function AddPlaceListButton() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Element
      if (!target.closest("[data-fab]")) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [open])

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3" data-fab>
      {open && (
        <>
          <Link
            href="/spots/create"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <MapPin className="w-4 h-4 text-green-500 shrink-0" />
            スポットを追加
          </Link>
          <Link
            href="/placelists/create"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150 [animation-delay:50ms]"
          >
            <LayoutList className="w-4 h-4 text-indigo-500 shrink-0" />
            プレイスリストを追加
          </Link>
        </>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "メニューを閉じる" : "追加メニューを開く"}
        className={`w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:scale-105 hover:bg-green-400 transition-all text-black ${open ? "rotate-45" : ""} duration-300`}
      >
        <Plus strokeWidth={2.5} className="w-7 h-7" />
      </button>
    </div>
  )
}
