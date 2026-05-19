-- =====================================================================
-- 絞り込みプリセット保存テーブル
-- =====================================================================
-- 各ユーザーが「絞り込み条件 + 並び順」に名前を付けて保存し、
-- 後でワンタップで再適用できるようにする。
-- params: PlaceListFilters と互換の JSON (pref / cats / distance / etc.)
--
-- RLS: 自分のプリセットのみ CRUD 可能。
-- 再実行可能 (idempotent)
-- =====================================================================

create table if not exists public.filter_presets (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  params     jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists filter_presets_user_id_idx on public.filter_presets(user_id);
create index if not exists filter_presets_created_at_idx on public.filter_presets(created_at desc);

alter table public.filter_presets enable row level security;

drop policy if exists "filter_presets_select_own" on public.filter_presets;
create policy "filter_presets_select_own" on public.filter_presets
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "filter_presets_insert_own" on public.filter_presets;
create policy "filter_presets_insert_own" on public.filter_presets
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "filter_presets_update_own" on public.filter_presets;
create policy "filter_presets_update_own" on public.filter_presets
  for update to authenticated
  using      (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "filter_presets_delete_own" on public.filter_presets;
create policy "filter_presets_delete_own" on public.filter_presets
  for delete to authenticated
  using (user_id = auth.uid());

-- updated_at 自動更新トリガ (共通の set_updated_at 関数を使う)
drop trigger if exists filter_presets_set_updated_at on public.filter_presets;
create trigger filter_presets_set_updated_at
  before update on public.filter_presets
  for each row execute function public.set_updated_at();
