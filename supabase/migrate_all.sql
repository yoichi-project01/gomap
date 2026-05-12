-- =====================================================================
-- Gomap: 認証対応 (creator → uuid + RLS) 統合マイグレーション
-- =====================================================================
-- このファイルを Supabase Dashboard > SQL Editor に 1 回貼り付けて Run。
-- 内容: schema.sql + 02_likes_favorites.sql + 03_storage_covers.sql + seed.sql
-- 冪等 (drop ... cascade と create ... if not exists で再実行可能)
-- =====================================================================


-- =====================================================================
-- [1/4] schema.sql ─ spots / place_lists / place_list_spots + RLS
-- =====================================================================

create extension if not exists "pgcrypto";

-- 既存オブジェクトを掃除
drop table if exists public.place_list_spots cascade;
drop table if exists public.place_lists      cascade;
drop table if exists public.spots            cascade;
drop function if exists public.set_updated_at cascade;


-- spots: 個別スポット
-- source:
--   'user'    : ユーザーがスポットとして明示的に登録したもの (マイページに表示)
--   'map_ref' : プレイスリスト作成時のマップ検索から作られた参照 (マイページには出さない)
create table public.spots (
  id          uuid             primary key default gen_random_uuid(),
  name        text             not null,
  description text,
  lat         double precision not null,
  lng         double precision not null,
  prefecture  text,
  category    text,
  creator     uuid             references auth.users(id) on delete cascade,  -- NULL = 編集部
  source      text             not null default 'user' check (source in ('user', 'map_ref')),
  created_at  timestamptz      not null default now(),
  updated_at  timestamptz      not null default now()
);

create index spots_prefecture_idx on public.spots(prefecture);
create index spots_category_idx   on public.spots(category);
create index spots_created_at_idx on public.spots(created_at desc);
create index spots_creator_idx    on public.spots(creator);
create index spots_source_idx     on public.spots(source);


-- place_lists: プレイスリスト
create table public.place_lists (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  description     text,
  cover_image_url text,
  creator         uuid        references auth.users(id) on delete cascade,  -- NULL = 編集部
  likes_count     integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index place_lists_created_at_idx on public.place_lists(created_at desc);
create index place_lists_creator_idx    on public.place_lists(creator);


-- place_list_spots: 中間 (M:N)
create table public.place_list_spots (
  place_list_id uuid        not null references public.place_lists(id) on delete cascade,
  spot_id       uuid        not null references public.spots(id)       on delete cascade,
  position      integer     not null,
  added_at      timestamptz not null default now(),
  primary key (place_list_id, spot_id)
);

create index place_list_spots_order_idx
  on public.place_list_spots(place_list_id, position);


-- updated_at 自動更新トリガ
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


-- ─── Row Level Security ─────────────────────────────────────────────
-- SELECT: 誰でも / INSERT・UPDATE・DELETE: 自分のレコードのみ
-- service_role は RLS をバイパス → 編集部 (NULL creator) コンテンツ管理に使用

alter table public.spots            enable row level security;
alter table public.place_lists      enable row level security;
alter table public.place_list_spots enable row level security;

-- spots
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

-- place_lists
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

-- place_list_spots (親プレイスリストの所有者のみ)
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


-- =====================================================================
-- [2/4] 02_likes_favorites.sql ─ お気に入り / プレイスリストいいね
-- =====================================================================

-- favorites: ユーザーのスポットお気に入り
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


-- place_list_likes: プレイスリストいいね (1 ユーザー 1 件)
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


-- place_lists.likes_count 自動同期トリガ
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


-- place_list_saves: ブックマーク (likes と別の「後で見る」用)
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


-- =====================================================================
-- [3/4] 03_storage_covers.sql ─ カバー画像 (spots.cover_image_url + Storage)
-- =====================================================================

-- spots に cover_image_url を追加
alter table public.spots
  add column if not exists cover_image_url text;


-- covers バケット (public read, owner write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'covers',
  'covers',
  true,
  5242880,  -- 5 MiB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ストレージオブジェクト RLS (パス: {user_id}/{uuid}.{ext})
drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'covers');

drop policy if exists "covers_owner_insert" on storage.objects;
create policy "covers_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "covers_owner_update" on storage.objects;
create policy "covers_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "covers_owner_delete" on storage.objects;
create policy "covers_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =====================================================================
-- [3.5/4] 06_profiles.sql ─ profiles テーブル + signup トリガ
-- =====================================================================

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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();


-- auth.users への INSERT で profiles を自動作成
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


-- 既存ユーザーをバックフィル
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(nullif(split_part(u.email, '@', 1), ''), '匿名ユーザー')
from auth.users u
on conflict (id) do nothing;


-- =====================================================================
-- [4/4] seed.sql ─ 編集部ダミーデータ (creator NULL)
-- =====================================================================

truncate table public.place_list_spots, public.place_lists, public.spots restart identity cascade;


-- spots
insert into public.spots (id, name, description, lat, lng, prefecture, category, creator, created_at) values
  ('11111111-1111-1111-1111-000000000001', '大阪城',     '豊臣秀吉が築いた歴史的な城',                34.6873, 135.5262, '大阪府', '観光',   null, '2026-04-09'),
  ('11111111-1111-1111-1111-000000000002', '道頓堀',     '大阪を代表する繁華街。グリコサインで有名', 34.6687, 135.5014, '大阪府', 'グルメ', null, '2026-04-08'),
  ('11111111-1111-1111-1111-000000000003', '通天閣',     '新世界のシンボルタワー',                    34.6526, 135.5061, '大阪府', '観光',   null, '2026-04-07'),
  ('11111111-1111-1111-1111-000000000004', 'USJ',        'ユニバーサル・スタジオ・ジャパン',          34.6654, 135.4323, '大阪府', 'その他', null, '2026-04-06'),
  ('11111111-1111-1111-1111-000000000005', '金閣寺',     '世界遺産。正式名は鹿苑寺',                  35.0394, 135.7292, '京都府', '観光',   null, '2026-04-05'),
  ('11111111-1111-1111-1111-000000000006', '錦市場',     '京の台所と呼ばれる商店街',                  35.0047, 135.7648, '京都府', 'グルメ', null, '2026-04-04'),
  ('11111111-1111-1111-1111-000000000007', '北野天満宮', '学問の神様・菅原道真を祀る神社',            35.0325, 135.7356, '京都府', '観光',   null, '2026-04-03');


-- place_lists
insert into public.place_lists (id, name, description, creator, likes_count) values
  ('22222222-2222-2222-2222-000000000001', '大阪の観光地7選',           '最近登録された大阪の観光スポット', null, 12),
  ('22222222-2222-2222-2222-000000000002', '京都の人気スポット',         'おすすめの京都観光スポット',        null,  8),
  ('22222222-2222-2222-2222-000000000003', 'グルメスポットランキング', '人気のあるグルメスポット',          null, 20);


-- place_list_spots
-- 大阪: 大阪城・道頓堀・通天閣・USJ
insert into public.place_list_spots (place_list_id, spot_id, position) values
  ('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000001', 1),
  ('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000002', 2),
  ('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000003', 3),
  ('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000004', 4);

-- 京都: 金閣寺・錦市場・北野天満宮
insert into public.place_list_spots (place_list_id, spot_id, position) values
  ('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000005', 1),
  ('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000006', 2),
  ('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000007', 3);

-- グルメ: 道頓堀・錦市場
insert into public.place_list_spots (place_list_id, spot_id, position) values
  ('22222222-2222-2222-2222-000000000003', '11111111-1111-1111-1111-000000000002', 1),
  ('22222222-2222-2222-2222-000000000003', '11111111-1111-1111-1111-000000000006', 2);
