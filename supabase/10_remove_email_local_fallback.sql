-- =====================================================================
-- Gomap: profiles.display_name のメアドローカル部フォールバック撤廃
-- =====================================================================
-- 旧: 表示名が未設定なら split_part(email, '@', 1) を fallback として使う
-- 新: 表示名が未設定なら '匿名ユーザー' を入れる (メアド漏洩を防ぐ)
--
-- 対象:
--   * handle_new_user()                  (signup 時 profiles 作成)
--   * handle_user_metadata_update()      (auth metadata 変更時の追従)
--   * 既存行: display_name がメアドローカル部と完全一致するものは
--     '匿名ユーザー' に書き換える
--
-- 冪等。Supabase Dashboard > SQL Editor で 1 度実行すれば OK。
-- =====================================================================


-- 1) signup トリガ: メアドローカル部のフォールバックを除去
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


-- 2) metadata 更新トリガ: 同じくフォールバックを除去
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


-- 3) 既存行のバックフィル
--    display_name が「email の @ より前」と完全一致するものは、
--    自前で表示名を設定していないと判断して '匿名ユーザー' に置き換える。
--    (ユーザーが意図的に local 部と同じ名前を選んでいるケースは
--     非常に稀なため、誤検知より漏洩の方が深刻として許容する)
update public.profiles p
   set display_name = '匿名ユーザー',
       updated_at   = now()
  from auth.users u
 where p.id = u.id
   and u.email is not null
   and p.display_name = split_part(u.email, '@', 1)
   and (u.raw_user_meta_data->>'name')         is null
   and (u.raw_user_meta_data->>'display_name') is null;


-- =====================================================================
-- 確認用 (任意):
--   select count(*) from public.profiles where display_name = '匿名ユーザー';
--   -- 期待: trigger が name/display_name 未設定で作成した行ぶん増えている
-- =====================================================================
