-- place_list_likes の SELECT を全員に開放（いいね数のカウントに必要）
-- 書き込み系 (insert/delete) は引き続き本人のみ
drop policy if exists "place_list_likes_select_own" on public.place_list_likes;
create policy "place_list_likes_select_all" on public.place_list_likes
  for select using (true);
