-- =====================================================================
-- Gomap 追加スキーマ: ユーザーアバター画像
-- =====================================================================
-- profiles にアバター URL カラムを追加し、
-- Supabase Storage に avatars バケットを作成する。
-- 冪等化済み (再実行可能)

-- profiles に avatar_url カラム追加
alter table public.profiles
  add column if not exists avatar_url text;


-- =====================================================================
-- avatars バケット
-- =====================================================================
-- public = true: バケット内のオブジェクトは URL を知っていれば誰でも取得可
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MiB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- =====================================================================
-- ストレージオブジェクト RLS
-- =====================================================================
-- パス規約: {user_id}/{uuid}.jpg

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
