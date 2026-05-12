-- =====================================================================
-- Gomap 追加スキーマ: カバー画像ストレージ
-- =====================================================================
-- Supabase Storage の covers バケット + RLS ポリシー + spots カラム追加
-- 冪等化済み (再実行可能)

-- =====================================================================
-- spots に cover_image_url を追加
-- =====================================================================
alter table public.spots
  add column if not exists cover_image_url text;


-- =====================================================================
-- covers バケット
-- =====================================================================
-- public = true: バケット内のオブジェクトは URL を知っていれば誰でも取得可
-- (取り扱う画像はプレイスリスト/スポットのカバー画像で公開前提)
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


-- =====================================================================
-- ストレージオブジェクト RLS
-- =====================================================================
-- パス規約: {user_id}/{uuid}.{ext}
-- (storage.foldername(name))[1] が user_id

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
