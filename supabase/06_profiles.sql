-- =====================================================================
-- Gomap 追加スキーマ: profiles (ユーザーの表示名)
-- =====================================================================
-- auth.users は anon/authenticated から直接 SELECT できないため、
-- 表示用の表示名 (display_name) は public.profiles に持つ。
-- auth.users と 1:1 で id を共有 (PK = auth.users.id)。
--
-- * SELECT は全員可 (作者名はパブリックに表示するため)
-- * UPDATE は自分自身のみ (将来のプロフィール編集 UI 用)
-- * INSERT は signup トリガで自動 (security definer)
-- * 初期 display_name は email の @ より前
-- =====================================================================
-- migrate_all.sql 適用後に 1 度だけ実行してください。冪等。

create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  display_name text        not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists profiles_display_name_idx on public.profiles(display_name);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using      (id = auth.uid())
  with check (id = auth.uid());

-- 既存の set_updated_at() を利用 (schema.sql / migrate_all.sql で定義済み)
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- auth.users に行が追加されたら profiles を自動作成
-- security definer で elevated 権限。RLS をバイパスして INSERT する。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(split_part(new.email, '@', 1), ''), '匿名ユーザー'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 既存ユーザーをバックフィル (email の @ より前を初期表示名に)
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(nullif(split_part(u.email, '@', 1), ''), '匿名ユーザー')
from auth.users u
on conflict (id) do nothing;
