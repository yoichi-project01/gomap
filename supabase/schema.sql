-- =====================================================================
-- Gomap スキーマ定義 (認証対応版)
-- =====================================================================
-- Supabase ダッシュボードの SQL Editor で実行してください。
--
-- 方針:
--   * creator は auth.users(id) を参照する uuid
--   * creator IS NULL は「編集部 / システム」コンテンツ (service_role でのみ作成)
--   * 読み取りは全員可、書き込みは authenticated かつ自分のレコードのみ (RLS)
--   * service_role キーは RLS をバイパスするので運営用バッチ等で使用可能
--
-- 再実行可能 (drop ... cascade で既存テーブルを掃除してから作り直す)

create extension if not exists "pgcrypto";

-- =====================================================================
-- 既存オブジェクトを掃除
-- =====================================================================
drop table if exists public.place_list_spots cascade;
drop table if exists public.place_lists      cascade;
drop table if exists public.spots            cascade;
drop function if exists public.set_updated_at cascade;


-- =====================================================================
-- spots: 個別スポット
-- =====================================================================
create table public.spots (
  id          uuid             primary key default gen_random_uuid(),
  name        text             not null,
  description text,
  lat         double precision not null,
  lng         double precision not null,
  prefecture  text,
  category    text,
  creator     uuid             references auth.users(id) on delete cascade,  -- NULL = 編集部コンテンツ
  created_at  timestamptz      not null default now(),
  updated_at  timestamptz      not null default now()
);

create index spots_prefecture_idx on public.spots(prefecture);
create index spots_category_idx   on public.spots(category);
create index spots_created_at_idx on public.spots(created_at desc);
create index spots_creator_idx    on public.spots(creator);


-- =====================================================================
-- place_lists: プレイスリスト(複数スポットのまとめ)
-- =====================================================================
create table public.place_lists (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  description     text,
  cover_image_url text,
  creator         uuid        references auth.users(id) on delete cascade,  -- NULL = 編集部コンテンツ
  likes_count     integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index place_lists_created_at_idx on public.place_lists(created_at desc);
create index place_lists_creator_idx    on public.place_lists(creator);


-- =====================================================================
-- place_list_spots: 中間テーブル (M:N)
-- =====================================================================
create table public.place_list_spots (
  place_list_id uuid        not null references public.place_lists(id) on delete cascade,
  spot_id       uuid        not null references public.spots(id)       on delete cascade,
  position      integer     not null,
  added_at      timestamptz not null default now(),
  primary key (place_list_id, spot_id)
);

create index place_list_spots_order_idx
  on public.place_list_spots(place_list_id, position);


-- =====================================================================
-- updated_at 自動更新トリガ
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger spots_set_updated_at
  before update on public.spots
  for each row execute function public.set_updated_at();

create trigger place_lists_set_updated_at
  before update on public.place_lists
  for each row execute function public.set_updated_at();


-- =====================================================================
-- Row Level Security
-- =====================================================================
-- SELECT  : 誰でも可 (anon + authenticated)
-- INSERT  : authenticated かつ creator = auth.uid()
-- UPDATE  : authenticated かつ creator = auth.uid()
-- DELETE  : authenticated かつ creator = auth.uid()
-- service_role キーは RLS をバイパスするので編集部コンテンツの作成・管理に使う。

alter table public.spots            enable row level security;
alter table public.place_lists      enable row level security;
alter table public.place_list_spots enable row level security;

-- ---- spots ----------------------------------------------------------
create policy "spots_select_all"
  on public.spots for select
  using (true);

create policy "spots_insert_own"
  on public.spots for insert to authenticated
  with check (creator = auth.uid());

create policy "spots_update_own"
  on public.spots for update to authenticated
  using      (creator = auth.uid())
  with check (creator = auth.uid());

create policy "spots_delete_own"
  on public.spots for delete to authenticated
  using (creator = auth.uid());

-- ---- place_lists ----------------------------------------------------
create policy "place_lists_select_all"
  on public.place_lists for select
  using (true);

create policy "place_lists_insert_own"
  on public.place_lists for insert to authenticated
  with check (creator = auth.uid());

create policy "place_lists_update_own"
  on public.place_lists for update to authenticated
  using      (creator = auth.uid())
  with check (creator = auth.uid());

create policy "place_lists_delete_own"
  on public.place_lists for delete to authenticated
  using (creator = auth.uid());

-- ---- place_list_spots (親 place_list の所有者でないと書き込めない) --
create policy "place_list_spots_select_all"
  on public.place_list_spots for select
  using (true);

create policy "place_list_spots_insert_owner"
  on public.place_list_spots for insert to authenticated
  with check (
    place_list_id in (select id from public.place_lists where creator = auth.uid())
  );

create policy "place_list_spots_update_owner"
  on public.place_list_spots for update to authenticated
  using      (place_list_id in (select id from public.place_lists where creator = auth.uid()))
  with check (place_list_id in (select id from public.place_lists where creator = auth.uid()));

create policy "place_list_spots_delete_owner"
  on public.place_list_spots for delete to authenticated
  using (
    place_list_id in (select id from public.place_lists where creator = auth.uid())
  );
