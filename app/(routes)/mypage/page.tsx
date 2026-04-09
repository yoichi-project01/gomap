// マイページ
// URL: /mypage
// ログインユーザーの情報・登録したスポットを表示する

// ダミーのユーザー情報（後で認証と連携する）
// TODO: Supabaseの認証から取得するように変更する
const DUMMY_USER = {
  name: "ゲストユーザー",
  email: "guest@example.com",
  spotsCount: 3,
};

export default function MyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">マイページ</h1>

      {/* ユーザー情報 */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        {/* アイコン（仮） */}
        <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center text-2xl mb-4">
          👤
        </div>

        <p className="text-lg font-semibold text-zinc-900">{DUMMY_USER.name}</p>
        <p className="text-sm text-zinc-500 mt-1">{DUMMY_USER.email}</p>

        {/* 統計 */}
        <div className="mt-6 pt-4 border-t border-zinc-100">
          <p className="text-sm text-zinc-600">
            登録スポット数：
            <span className="font-bold text-zinc-900">{DUMMY_USER.spotsCount}</span> 件
          </p>
        </div>
      </div>

      {/* TODO: ログイン・ログアウトボタン */}
      <button className="mt-4 w-full border border-zinc-300 text-zinc-600 text-sm font-medium px-4 py-2 rounded-full hover:bg-zinc-100 transition-colors">
        ログイン / 新規登録
      </button>
    </div>
  );
}
