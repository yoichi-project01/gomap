-- =====================================================================
-- Gomap 追加スキーマ: profiles と auth.users.user_metadata.name の同期
-- =====================================================================
-- mypage は supabase.auth.updateUser({ data: { name } }) で
-- auth.users.raw_user_meta_data->>'name' に書く。これを canonical として
-- profiles.display_name に自動同期する。
-- =====================================================================
-- migrate_all.sql 適用後に 1 度だけ実行してください。冪等。

-- handle_new_user を強化: signup 時に user_metadata.name があればそれを優先
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_name text;
  fallback  text;
begin
  meta_name := nullif(coalesce(new.raw_user_meta_data->>'name', ''), '');
  fallback  := coalesce(nullif(split_part(new.email, '@', 1), ''), '匿名ユーザー');
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(meta_name, fallback))
  on conflict (id) do nothing;
  return new;
end;
$$;


-- raw_user_meta_data の name が変更されたら profiles.display_name を同期
create or replace function public.sync_profile_display_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_name text;
begin
  new_name := nullif(coalesce(new.raw_user_meta_data->>'name', ''), '');
  if new_name is not null then
    insert into public.profiles (id, display_name)
    values (new.id, new_name)
    on conflict (id) do update
      set display_name = excluded.display_name,
          updated_at   = now();
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_metadata_updated on auth.users;
create trigger on_auth_user_metadata_updated
  after update of raw_user_meta_data on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute function public.sync_profile_display_name();


-- 既存ユーザーをバックフィル: user_metadata.name がある人は profiles.display_name を上書き
update public.profiles p
   set display_name = trim(u.raw_user_meta_data->>'name'),
       updated_at   = now()
  from auth.users u
 where p.id = u.id
   and nullif(coalesce(u.raw_user_meta_data->>'name', ''), '') is not null;
