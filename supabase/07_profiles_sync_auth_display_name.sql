-- =====================================================================
-- Gomap: profiles.display_name を auth.users.raw_user_meta_data の表示名と
-- 同期する
-- =====================================================================
-- 本マイグレーションで、auth.users 側の表示名をソース・オブ・トゥルースに
-- 切り替える。
--
-- Supabase ダッシュボードの "Display Name" 列は raw_user_meta_data->>'name'
-- に保存される (display_name キーではない)。互換のため両方をフォールバック
-- 候補とする: name → display_name → '匿名ユーザー'
-- (メアドのローカル部はプライバシー上の理由でフォールバックに含めない)
--
-- * 新規サインアップ時:   auth metadata → profiles に転記 (handle_new_user)
-- * auth metadata 更新時: profiles に追従 (handle_user_metadata_update)
-- * 既存行:               このマイグレーション末尾で一括同期
--
-- migrate_all.sql / 06_profiles.sql 適用後に 1 度実行してください。冪等。
-- =====================================================================

-- 1) サインアップ用トリガを上書き
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


-- 2) auth.users.raw_user_meta_data.display_name の更新を profiles に追従
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
           )
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_metadata_update();


-- 3) 既存ユーザーの一括同期: auth.users.raw_user_meta_data に name か
--    display_name が入っているなら profiles 側を上書きする
update public.profiles p
   set display_name = coalesce(
         nullif(trim(u.raw_user_meta_data->>'name'), ''),
         nullif(trim(u.raw_user_meta_data->>'display_name'), '')
       )
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
