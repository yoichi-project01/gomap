import { notFound, redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"
import { getSpotById } from "@/lib/server/spots"
import EditSpotForm from "./EditSpotForm"

export default async function EditSpotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const spot = await getSpotById(supabase, id)
  if (!spot) notFound()

  if (spot.creator !== user.id) notFound()

  return <EditSpotForm spot={spot} />
}
