import MapApp from "@/components/MapApp"
import { DUMMY_SPOTS } from "@/lib/client/dummySpots"

type SearchParams = Promise<{
  pref?: string   // 都道府県
  cat?: string    // カテゴリ（カンマ区切りで複数）
  order?: string  // 並び順
}>

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { pref, cat, order } = await searchParams

  let spots = [...DUMMY_SPOTS]

  // 都道府県で絞り込み
  if (pref) {
    spots = spots.filter((s) => s.prefecture === pref)
  }

  // カテゴリで絞り込み（複数選択対応）
  if (cat) {
    const cats = cat.split(",")
    spots = spots.filter((s) => cats.includes(s.category))
  }

  // 並び順
  if (order === "登録が古い順") {
    spots.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  } else {
    // デフォルト: 登録が新しい順
    spots.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  // Supabase連携後は以下に差し替える:
  //   const spots = await supabase.from("spots").select("*").eq("prefecture", pref ?? "")

  return <MapApp spots={spots} pref={pref} cat={cat} />
}
