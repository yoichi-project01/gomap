-- =====================================================================
-- Gomap 追加スキーマ: プレイスリスト「保存」(ブックマーク)
-- =====================================================================
-- いいね (place_list_likes) とは別概念:
--   * likes : 公開的な評価。likes_count として表示
--   * saves : プライベートな「後で見る」用ブックマーク。カウンタなし
-- =====================================================================
-- migrate_all.sql 適用後に 1 度だけ実行してください。冪等。

create table if not exists public.place_list_saves (
  user_id       uuid        not null references auth.users(id) on delete cascade,
  place_list_id uuid        not null references public.place_lists(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, place_list_id)
);

create index if not exists place_list_saves_user_id_idx       on public.place_list_saves(user_id);
create index if not exists place_list_saves_place_list_id_idx on public.place_list_saves(place_list_id);

alter table public.place_list_saves enable row level security;

drop policy if exists "place_list_saves_select_own" on public.place_list_saves;
create policy "place_list_saves_select_own" on public.place_list_saves
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "place_list_saves_insert_own" on public.place_list_saves;
create policy "place_list_saves_insert_own" on public.place_list_saves
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "place_list_saves_delete_own" on public.place_list_saves;
create policy "place_list_saves_delete_own" on public.place_list_saves
  for delete to authenticated
  using (user_id = auth.uid());
