import type { SupabaseClient } from "@supabase/supabase-js";

// 単一ユーザーの display_name と avatar_url を一括取得。
export async function getProfile(
  client: SupabaseClient,
  userId: string,
): Promise<{ displayName: string | null; avatarUrl: string | null }> {
  const { data, error } = await client
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const name = (data?.display_name as string | undefined)?.trim();
  return {
    displayName: name ? name : null,
    avatarUrl: (data?.avatar_url as string | null | undefined) ?? null,
  };
}

// 単一ユーザーの display_name を取得。未登録 / 空文字なら null。
export async function getDisplayName(
  client: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await client
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const name = (data?.display_name as string | undefined)?.trim();
  return name ? name : null;
}

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

// 与えられた creator の配列に対して display_name と avatar_url を一括取得する。
// 未登録 / NULL はデフォルト値で Map に含まれる。
export async function fetchCreatorProfiles(
  client: SupabaseClient,
  ids: Array<string | null | undefined>,
): Promise<Map<string, { displayName: string | null; avatarUrl: string | null }>> {
  const unique = Array.from(
    new Set(ids.filter((v): v is string => typeof v === "string" && v.length > 0)),
  );
  if (unique.length === 0) return new Map();

  const { data, error } = await client
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", unique);

  if (error) throw error;
  return new Map(
    (data ?? []).map((row) => [
      row.id as string,
      {
        displayName: (row.display_name as string | null | undefined) ?? null,
        avatarUrl: (row.avatar_url as string | null | undefined) ?? null,
      },
    ]),
  );
}
