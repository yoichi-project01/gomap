-- =====================================================================
-- Gomap 追加スキーマ: お気に入り / プレイスリストいいね
-- =====================================================================
-- schema.sql / seed.sql を流したあとに 1 度だけ実行してください
-- 再実行可能 (if not exists / drop policy if exists で冪等)

-- =====================================================================
-- favorites: ユーザーのスポットお気に入り
-- =====================================================================
create table if not exists public.favorites (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  spot_id    uuid        not null references public.spots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_spot_id_idx on public.favorites(spot_id);

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated
  using (user_id = auth.uid());


-- =====================================================================
-- place_list_likes: プレイスリストへのいいね (1 ユーザー 1 件)
-- =====================================================================
create table if not exists public.place_list_likes (
  user_id       uuid        not null references auth.users(id) on delete cascade,
  place_list_id uuid        not null references public.place_lists(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, place_list_id)
);

create index if not exists place_list_likes_user_id_idx       on public.place_list_likes(user_id);
create index if not exists place_list_likes_place_list_id_idx on public.place_list_likes(place_list_id);

alter table public.place_list_likes enable row level security;

drop policy if exists "place_list_likes_select_own" on public.place_list_likes;
create policy "place_list_likes_select_own" on public.place_list_likes
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "place_list_likes_insert_own" on public.place_list_likes;
create policy "place_list_likes_insert_own" on public.place_list_likes
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "place_list_likes_delete_own" on public.place_list_likes;
create policy "place_list_likes_delete_own" on public.place_list_likes
  for delete to authenticated
  using (user_id = auth.uid());


-- =====================================================================
-- place_lists.likes_count を自動同期するトリガ
-- =====================================================================
create or replace function public.bump_place_list_likes_count()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    update public.place_lists
       set likes_count = likes_count + 1
     where id = new.place_list_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.place_lists
       set likes_count = greatest(likes_count - 1, 0)
     where id = old.place_list_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists place_list_likes_count_trg on public.place_list_likes;
create trigger place_list_likes_count_trg
  after insert or delete on public.place_list_likes
  for each row execute function public.bump_place_list_likes_count();
