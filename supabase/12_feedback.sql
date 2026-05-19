-- フィードバックテーブル
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  category    TEXT        NOT NULL,
  subject     TEXT        NOT NULL CHECK (char_length(subject) <= 100),
  body        TEXT        NOT NULL CHECK (char_length(body) <= 2000),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ログイン済み・未ログインどちらも投稿可能
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert" ON feedback
  FOR INSERT WITH CHECK (true);

-- SELECT は service_role のみ（管理者が Supabase ダッシュボードで確認）
