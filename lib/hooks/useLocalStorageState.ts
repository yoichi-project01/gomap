"use client"

import { useCallback, useRef, useSyncExternalStore } from "react"

type CacheEntry = { raw: string | null; parsed: unknown }
const snapshotCache = new Map<string, CacheEntry>()

function readSnapshot<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    const cached = snapshotCache.get(key)
    if (cached && cached.raw === raw) return cached.parsed as T
    const parsed = raw !== null ? (JSON.parse(raw) as T) : fallback
    snapshotCache.set(key, { raw, parsed })
    return parsed
  } catch {
    return fallback
  }
}

export function useLocalStorageState<T>(key: string, initial: T): [T, (value: T) => void] {
  const initialRef = useRef(initial)

  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) {
          snapshotCache.delete(key)
          onChange()
        }
      }
      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    },
    [key]
  )

  const getSnapshot = useCallback(() => readSnapshot(key, initialRef.current), [key])
  const getServerSnapshot = useCallback(() => initialRef.current, [])

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const set = useCallback(
    (next: T) => {
      try {
        const serialized = JSON.stringify(next)
        window.localStorage.setItem(key, serialized)
        snapshotCache.set(key, { raw: serialized, parsed: next })
        window.dispatchEvent(new StorageEvent("storage", { key }))
      } catch {
      }
    },
    [key]
  )

  return [value, set]
}
