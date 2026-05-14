-- =====================================================================
-- place_lists にカテゴリを追加 (プレイスリスト作成時の任意項目)
-- =====================================================================
-- 既存スポットの category と同じ運用 (text, NULL 許容)
-- 再実行可能 (if not exists)

alter table public.place_lists
  add column if not exists category text;

create index if not exists place_lists_category_idx on public.place_lists(category);
