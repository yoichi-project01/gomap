// Supabase 接続 + テーブル/データ確認スクリプト
// 実行: node --env-file=.env.local scripts/check-supabase.mjs

import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("[NG] SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が読み込めていません")
  process.exit(1)
}

const supabase = createClient(url, key)

console.log("URL:", url, "\n")

const expected = {
  spots: 7,
  place_lists: 3,
  place_list_spots: 9,
}

let allOk = true
for (const [table, expectedCount] of Object.entries(expected)) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })

  if (error) {
    console.log(`[NG] ${table}: ${error.message}`)
    allOk = false
    continue
  }

  const mark = count === expectedCount ? "[OK]" : "[??]"
  console.log(`${mark} ${table}: ${count} 行 (期待値 ${expectedCount})`)
  if (count !== expectedCount) allOk = false
}

console.log()

// place_list_spots 経由でリレーションが繋がっているかも確認
const { data, error } = await supabase
  .from("place_lists")
  .select("name, place_list_spots(position, spots(name))")
  .order("name")

if (error) {
  console.log("[NG] リレーション取得失敗:", error.message)
  process.exit(1)
}

console.log("リレーション確認:")
for (const list of data) {
  const spotNames = list.place_list_spots
    .sort((a, b) => a.position - b.position)
    .map((pls) => pls.spots.name)
    .join(", ")
  console.log(`  ${list.name}: ${spotNames}`)
}

process.exit(allOk ? 0 : 1)
