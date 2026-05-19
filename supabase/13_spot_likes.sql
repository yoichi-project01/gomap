-- スポットいいねテーブル
CREATE TABLE IF NOT EXISTS public.spot_likes (
  spot_id    UUID        NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (spot_id, user_id)
);

ALTER TABLE public.spot_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spot_likes_select_own" ON public.spot_likes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "spot_likes_insert_own" ON public.spot_likes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "spot_likes_delete_own" ON public.spot_likes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- spots テーブルにいいね数カラムを追加
ALTER TABLE public.spots ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- いいね数を安全に増減する RPC (SECURITY DEFINER で RLS バイパス)
CREATE OR REPLACE FUNCTION public.increment_spot_likes(spot_id_param UUID, delta INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.spots
  SET likes_count = GREATEST(0, likes_count + delta)
  WHERE id = spot_id_param;
END;
$$;

-- スキーマキャッシュを再読み込み（ALTER TABLE 後に PostgREST の FK 認識を更新）
NOTIFY pgrst, 'reload schema';
