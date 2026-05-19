-- =====================================================================
-- Gomap: 既存 DB 向け追いつきマイグレーション (catch-up patch)
-- =====================================================================
-- 対象: 旧 migrate_all.sql を流して稼働中の Supabase インスタンス
-- 目的: データを消さずに、新 migrate_all.sql と同等の状態へ揃える
--
-- 取り込む差分:
--   * 07_profiles_sync_auth_display_name.sql  (旧 07_profile_sync を置き換え)
--   * 08_place_list_category.sql              (place_lists.category カラム)
--   * 09_creator_on_delete_set_null.sql       (creator FK の on delete set null)
--
-- このファイルは:
--   * 冪等 (drop ... if exists / add column if not exists / 等)
--   * truncate を一切行わない (既存ユーザーデータを保持)
--
-- 使い方: Supabase Dashboard > SQL Editor に貼り付けて Run。
--
-- すでに新 migrate_all.sql で建て直した新規 DB に対しては実行不要 (流しても無害)。
-- =====================================================================


-- =====================================================================
-- [1/3] 08_place_list_category: place_lists.category カラム追加
-- =====================================================================
alter table public.place_lists
  add column if not exists category text;

create index if not exists place_lists_category_idx
  on public.place_lists(category);


-- =====================================================================
-- [2/3] 09_creator_on_delete_set_null: 退会してもコンテンツを残す
-- =====================================================================
-- spots.creator
alter table public.spots
  drop constraint if exists spots_creator_fkey;

alter table public.spots
  add constraint spots_creator_fkey
  foreign key (creator) references auth.users(id) on delete set null;

-- place_lists.creator
alter table public.place_lists
  drop constraint if exists place_lists_creator_fkey;

alter table public.place_lists
  add constraint place_lists_creator_fkey
  foreign key (creator) references auth.users(id) on delete set null;


-- =====================================================================
-- [3/3] 07_profiles_sync_auth_display_name: 表示名同期ロジックの刷新
-- =====================================================================
-- 表示名のソース・オブ・トゥルースは auth.users.raw_user_meta_data。
-- Supabase ダッシュボードの "Display Name" 列は raw_user_meta_data->>'name'
-- に入る (display_name キーではない)。互換のため両方をフォールバック候補にする:
--   name → display_name → email の @ 前 → '匿名ユーザー'

-- 旧実装の掃除
drop trigger if exists on_auth_user_metadata_updated on auth.users;
drop function if exists public.sync_profile_display_name() cascade;


-- 1) signup: auth.users への INSERT で profiles を自動作成
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      '匿名ユーザー'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2) metadata 更新: raw_user_meta_data の name / display_name 変更を追従
create or replace function public.handle_user_metadata_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.raw_user_meta_data->>'name')         is distinct from (old.raw_user_meta_data->>'name')
  or (new.raw_user_meta_data->>'display_name') is distinct from (old.raw_user_meta_data->>'display_name') then
    update public.profiles
       set display_name = coalesce(
             nullif(trim(new.raw_user_meta_data->>'name'), ''),
             nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
             '匿名ユーザー'
           ),
           updated_at   = now()
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_metadata_update();


-- 3) 既存ユーザーのバックフィル
-- 3-1) profiles 行が無い人は新規作成 (auth metadata の表示名を優先)
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    nullif(trim(u.raw_user_meta_data->>'display_name'), ''),
    '匿名ユーザー'
  )
from auth.users u
on conflict (id) do nothing;

-- 3-2) auth metadata に表示名が入っている人は profiles 側を上書き
update public.profiles p
   set display_name = coalesce(
         nullif(trim(u.raw_user_meta_data->>'name'), ''),
         nullif(trim(u.raw_user_meta_data->>'display_name'), '')
       ),
       updated_at   = now()
  from auth.users u
 where p.id = u.id
   and coalesce(
         nullif(trim(u.raw_user_meta_data->>'name'), ''),
         nullif(trim(u.raw_user_meta_data->>'display_name'), '')
       ) is not null
   and p.display_name is distinct from coalesce(
         nullif(trim(u.raw_user_meta_data->>'name'), ''),
         nullif(trim(u.raw_user_meta_data->>'display_name'), '')
       );


-- =====================================================================
-- 完了
-- =====================================================================
-- 確認用: 以下のクエリで状態をチェックできます (実行は任意)
--
--   -- category カラムが付いていること
--   select column_name from information_schema.columns
--    where table_schema = 'public' and table_name = 'place_lists' and column_name = 'category';
--
--   -- creator FK が set null になっていること
--   select conname, confdeltype from pg_constraint
--    where conname in ('spots_creator_fkey', 'place_lists_creator_fkey');
--   -- 期待: confdeltype = 'n' (set null)
--
--   -- 新トリガが入っていること
--   select tgname from pg_trigger
--    where tgname in ('on_auth_user_created', 'on_auth_user_updated')
--      and tgrelid = 'auth.users'::regclass;
