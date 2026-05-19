-- =====================================================================
-- place_lists に公開/非公開フラグを追加
-- =====================================================================
-- is_public = true  (デフォルト): 全員が閲覧可能
-- is_public = false              : 作成者のみが閲覧可能
-- 既存レコードは公開扱い (後方互換)。
--
-- RLS:
--   place_lists の SELECT を「公開 or 自分」に絞る。
--   place_list_spots の SELECT も「親が公開 or 親が自分」に絞る
--   (非公開リストの中身が他人に漏れないように)。
-- 再実行可能 (idempotent)
-- =====================================================================

alter table public.place_lists
  add column if not exists is_public boolean not null default true;

create index if not exists place_lists_is_public_idx
  on public.place_lists(is_public);

-- place_lists: SELECT を「公開 or 自分」に制限
drop policy if exists "place_lists_select_all"           on public.place_lists;
drop policy if exists "place_lists_select_public_or_own" on public.place_lists;
create policy "place_lists_select_public_or_own"
  on public.place_lists for select
  using (is_public = true or creator = auth.uid());

-- place_list_spots: SELECT を「親が公開 or 親が自分」に制限
drop policy if exists "place_list_spots_select_all"           on public.place_list_spots;
drop policy if exists "place_list_spots_select_public_or_own" on public.place_list_spots;
create policy "place_list_spots_select_public_or_own"
  on public.place_list_spots for select
  using (
    place_list_id in (
      select id from public.place_lists
       where is_public = true or creator = auth.uid()
    )
  );
