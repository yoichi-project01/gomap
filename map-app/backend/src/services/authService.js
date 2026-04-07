// 認証関連のビジネスロジック
// 今は仮の処理。後で Supabase Auth に置き換える

// ログイン処理
export async function loginUser(email, password) {
  // TODO: Supabase Auth でのログイン
  // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  console.log(`ログイン試行: ${email}`);
  return { message: "ログイン成功（仮）", user: { email } };
}

// 会員登録処理
export async function signupUser(username, email, password) {
  // TODO: Supabase Auth での会員登録
  // const { data, error } = await supabase.auth.signUp({ email, password })
  console.log(`会員登録試行: ${username} / ${email}`);
  return { message: "会員登録成功（仮）", user: { username, email } };
}
