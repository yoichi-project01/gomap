-- =====================================================================
-- Gomap 追加スキーマ: spots.source カラム
-- =====================================================================
-- スポットの由来を表すタグ:
--   * 'user'    : ユーザーがスポットとして明示的に登録したもの
--                 マイページ「登録したスポット」に表示される
--   * 'map_ref' : プレイスリスト作成時にマップ検索から参照として作られたもの
--                 公開スポット一覧 (/spots) には出るが、マイページの
--                 「登録したスポット」には出さない
-- =====================================================================
-- migrate_all.sql 適用後に 1 度だけ実行してください。冪等。

alter table public.spots
  add column if not exists source text not null default 'user';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'spots_source_check'
  ) then
    alter table public.spots
      add constraint spots_source_check
      check (source in ('user', 'map_ref'));
  end if;
end $$;

create index if not exists spots_source_idx on public.spots(source);
