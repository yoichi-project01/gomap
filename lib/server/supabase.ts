// バックエンド担当
// Supabaseクライアントの初期化
// app/api/ 以下のRoute Handlerからのみ呼び出すこと

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
