import type { SupabaseClient } from "@supabase/supabase-js";

// 与えられた creator (auth.users.id) の配列に対して、表示用の display_name を
// profiles テーブルから一括取得する。
// 未登録 / NULL は Map に含まれない。
export async function fetchDisplayNames(
  client: SupabaseClient,
  ids: Array<string | null | undefined>,
): Promise<Map<string, string>> {
  const unique = Array.from(
    new Set(ids.filter((v): v is string => typeof v === "string" && v.length > 0)),
  );
  if (unique.length === 0) return new Map();

  const { data, error } = await client
    .from("profiles")
    .select("id, display_name")
    .in("id", unique);

  if (error) throw error;
  return new Map(
    (data ?? []).map((row) => [row.id as string, row.display_name as string]),
  );
}
