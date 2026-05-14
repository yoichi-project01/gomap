-- =====================================================================
-- Gomap: アカウント削除時に作成物を残す (creator を NULL にする)
-- =====================================================================
-- 旧運用: アカウント削除すると自分が作成した spots / place_lists も
--         cascade で全削除されていた。
-- 新運用: 退会しても自作コンテンツは残し、creator を NULL に落とす。
--         他ユーザーの「保存」「いいね」が突然消えないようにするため。
--
-- 影響範囲:
--   * spots.creator       : cascade → set null
--   * place_lists.creator : cascade → set null
--
-- 以下は引き続き cascade (個人の操作ログなので退会時に消す):
--   * favorites.user_id
--   * place_list_likes.user_id
--   * place_list_saves.user_id
--   * profiles.id
--   * place_list_spots.{place_list_id, spot_id} (親が残るので影響なし)
--
-- 表示上の扱い:
--   * 元から creator IS NULL = 編集部コンテンツ
--   * 退会後の creator IS NULL = 退会済みユーザーのコンテンツ
--   * 両者は区別せず「匿名ユーザー」で表示する (UI 側で対応済み)
--
-- 冪等。
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
