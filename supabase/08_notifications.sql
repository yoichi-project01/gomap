-- =====================================================================
-- Gomap 追加スキーマ: 通知
-- =====================================================================
-- 04_place_list_saves.sql までを流したあとに実行してください。冪等。

-- =====================================================================
-- notifications テーブル
-- =====================================================================
create table if not exists public.notifications (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  type          text        not null check (type in ('place_list_liked')),
  place_list_id uuid        references public.place_lists(id) on delete set null,
  actor_id      uuid        references auth.users(id) on delete set null,
  is_read       boolean     not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, is_read)
  where is_read = false;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =====================================================================
-- トリガー: place_list_likes INSERT → 通知を生成
-- =====================================================================
create or replace function public.notify_place_list_liked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator uuid;
begin
  select creator into v_creator
    from public.place_lists
   where id = new.place_list_id;

  -- 自分自身のいいね / 編集部コンテンツ (creator IS NULL) は通知しない
  if v_creator is null or v_creator = new.user_id then
    return new;
  end if;

  insert into public.notifications (user_id, type, place_list_id, actor_id)
  values (v_creator, 'place_list_liked', new.place_list_id, new.user_id);

  return new;
end;
$$;

drop trigger if exists place_list_liked_notify_trg on public.place_list_likes;
create trigger place_list_liked_notify_trg
  after insert on public.place_list_likes
  for each row execute function public.notify_place_list_liked();
