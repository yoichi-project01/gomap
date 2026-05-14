-- =====================================================================
-- likes_count 管理をトリガーから Server Action (service role) に移行
-- =====================================================================
-- SECURITY DEFINER トリガーが Supabase 環境で RLS をバイパスできないため、
-- service_role クライアントから直接更新する方式に切り替える。
-- トリガーを残すと Server Action と二重カウントになるため削除する。

drop trigger if exists place_list_likes_count_trg on public.place_list_likes;
drop function if exists public.bump_place_list_likes_count();
