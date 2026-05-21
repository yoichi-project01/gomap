import { createSupabaseServerClient } from "./supabaseAuth"
import { fetchDisplayNames } from "./profiles"

export type AppNotification = {
  id: string
  type: "place_list_liked" | "place_list_saved"
  placeListId: string | null
  placeListName: string | null
  actorName: string | null
  isRead: boolean
  createdAt: string
}

type NotificationRow = {
  id: string
  type: string
  place_list_id: string | null
  actor_id: string | null
  is_read: boolean
  created_at: string
  place_lists: { name: string } | null
}

export async function listNotifications(): Promise<AppNotification[]> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, place_list_id, actor_id, is_read, created_at, place_lists(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("listNotifications", error)
    throw new Error(error.message)
  }

  const rows = (data ?? []) as unknown as NotificationRow[]
  const nameByActor = await fetchDisplayNames(supabase, rows.map((r) => r.actor_id))

  return rows.map((row) => ({
    id: row.id,
    type: row.type as "place_list_liked" | "place_list_saved",
    placeListId: row.place_list_id,
    placeListName: row.place_lists?.name ?? null,
    actorName: nameByActor.get(row.actor_id ?? "") ?? null,
    isRead: row.is_read,
    createdAt: row.created_at,
  }))
}

export async function countUnreadNotifications(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) return 0
  return count ?? 0
}
