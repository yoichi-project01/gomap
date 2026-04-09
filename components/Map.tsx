"use client"

// LeafletはブラウザAPIに依存するため、ssr: false でSSRをスキップする
// ssr: false はClient Component内でのみ有効（Next.js 16の制約）
import dynamic from "next/dynamic"
import type { Spot } from "@/types/spot"

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-500 text-sm">
      地図を読み込み中...
    </div>
  ),
})

type Props = {
  spots: Spot[]
}

export default function Map({ spots }: Props) {
  return <LeafletMap spots={spots} />
}
