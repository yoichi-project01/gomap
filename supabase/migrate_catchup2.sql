-- =====================================================================
-- Gomap: 追いつきマイグレーション #2 (migrate_catchup.sql の続き)
-- =====================================================================
-- 対象: migrate_all.sql + migrate_catchup.sql を流した既存 DB
-- 含む差分:
--   08_notifications          (通知テーブル + いいね通知トリガー)
--   12_place_list_visibility  (place_lists.is_public カラム)
--   12_feedback               (feedback テーブル)
--   13_spot_likes             (spot_likes テーブル + likes_count)
--   13_filter_presets         (filter_presets テーブル)
--   14_avatar                 (profiles.avatar_url + avatars バケット)
--   15_save_notification      (保存通知トリガー)
--
-- 冪等 (何度実行しても安全)
-- 使い方: Supabase Dashboard > SQL Editor に貼り付けて Run。
-- =====================================================================


-- =====================================================================
-- [1/7] 08_notifications: 通知テーブル + いいね通知トリガー
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL CHECK (type IN ('place_list_liked', 'place_list_saved')),
  place_list_id UUID        REFERENCES public.place_lists(id) ON DELETE SET NULL,
  actor_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  is_read       BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications(user_id, is_read)
  WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notify_place_list_liked()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_creator UUID;
BEGIN
  SELECT creator INTO v_creator FROM public.place_lists WHERE id = NEW.place_list_id;
  IF v_creator IS NULL OR v_creator = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, type, place_list_id, actor_id)
  VALUES (v_creator, 'place_list_liked', NEW.place_list_id, NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS place_list_liked_notify_trg ON public.place_list_likes;
CREATE TRIGGER place_list_liked_notify_trg
  AFTER INSERT ON public.place_list_likes
  FOR EACH ROW EXECUTE FUNCTION public.notify_place_list_liked();


-- =====================================================================
-- [2/7] 12_place_list_visibility: place_lists.is_public カラム追加
-- =====================================================================

ALTER TABLE public.place_lists
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS place_lists_is_public_idx
  ON public.place_lists(is_public);

DROP POLICY IF EXISTS "place_lists_select_all"           ON public.place_lists;
DROP POLICY IF EXISTS "place_lists_select_public_or_own" ON public.place_lists;
CREATE POLICY "place_lists_select_public_or_own"
  ON public.place_lists FOR SELECT
  USING (is_public = true OR creator = auth.uid());

DROP POLICY IF EXISTS "place_list_spots_select_all"           ON public.place_list_spots;
DROP POLICY IF EXISTS "place_list_spots_select_public_or_own" ON public.place_list_spots;
CREATE POLICY "place_list_spots_select_public_or_own"
  ON public.place_list_spots FOR SELECT
  USING (
    place_list_id IN (
      SELECT id FROM public.place_lists
       WHERE is_public = true OR creator = auth.uid()
    )
  );


-- =====================================================================
-- [3/7] 12_feedback: フィードバックテーブル
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  category   TEXT        NOT NULL,
  subject    TEXT        NOT NULL CHECK (char_length(subject) <= 100),
  body       TEXT        NOT NULL CHECK (char_length(body) <= 2000),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_insert" ON public.feedback;
CREATE POLICY "feedback_insert" ON public.feedback
  FOR INSERT WITH CHECK (true);


-- =====================================================================
-- [4/7] 13_spot_likes: スポットいいね
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.spot_likes (
  spot_id    UUID        NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (spot_id, user_id)
);

ALTER TABLE public.spot_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spot_likes_select_own" ON public.spot_likes;
CREATE POLICY "spot_likes_select_own" ON public.spot_likes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "spot_likes_insert_own" ON public.spot_likes;
CREATE POLICY "spot_likes_insert_own" ON public.spot_likes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "spot_likes_delete_own" ON public.spot_likes;
CREATE POLICY "spot_likes_delete_own" ON public.spot_likes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.spots ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_spot_likes(spot_id_param UUID, delta INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.spots
  SET likes_count = GREATEST(0, likes_count + delta)
  WHERE id = spot_id_param;
END;
$$;


-- =====================================================================
-- [5/7] 13_filter_presets: 絞り込みプリセット
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.filter_presets (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  params     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS filter_presets_user_id_idx    ON public.filter_presets(user_id);
CREATE INDEX IF NOT EXISTS filter_presets_created_at_idx ON public.filter_presets(created_at DESC);

ALTER TABLE public.filter_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "filter_presets_select_own" ON public.filter_presets;
CREATE POLICY "filter_presets_select_own" ON public.filter_presets
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "filter_presets_insert_own" ON public.filter_presets;
CREATE POLICY "filter_presets_insert_own" ON public.filter_presets
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "filter_presets_update_own" ON public.filter_presets;
CREATE POLICY "filter_presets_update_own" ON public.filter_presets
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "filter_presets_delete_own" ON public.filter_presets;
CREATE POLICY "filter_presets_delete_own" ON public.filter_presets
  FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS filter_presets_set_updated_at ON public.filter_presets;
CREATE TRIGGER filter_presets_set_updated_at
  BEFORE UPDATE ON public.filter_presets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =====================================================================
-- [6/7] 14_avatar: profiles.avatar_url + avatars バケット
-- =====================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "avatars_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_insert"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_update"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_delete"  ON storage.objects;

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);


-- =====================================================================
-- [7/7] 15_save_notification: 保存通知トリガー
-- =====================================================================

CREATE OR REPLACE FUNCTION public.notify_place_list_saved()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_creator UUID;
BEGIN
  SELECT creator INTO v_creator FROM public.place_lists WHERE id = NEW.place_list_id;
  IF v_creator IS NULL OR v_creator = NEW.user_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, type, place_list_id, actor_id)
  VALUES (v_creator, 'place_list_saved', NEW.place_list_id, NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS place_list_saved_notify_trg ON public.place_list_saves;
CREATE TRIGGER place_list_saved_notify_trg
  AFTER INSERT ON public.place_list_saves
  FOR EACH ROW EXECUTE FUNCTION public.notify_place_list_saved();


-- スキーマキャッシュ再読み込み
NOTIFY pgrst, 'reload schema';
