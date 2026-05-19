"use server"

import { createSupabaseServerClient } from "@/lib/server/supabaseAuth"

export type SubmitFeedbackResult =
  | { ok: true }
  | { ok: false; message: string }

export async function submitFeedbackAction(input: {
  category: string
  subject: string
  body: string
}): Promise<SubmitFeedbackResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("feedback").insert({
    category: input.category,
    subject: input.subject,
    body: input.body,
    user_id: user?.id ?? null,
  })

  if (error) return { ok: false, message: error.message }
  return { ok: true }
}
