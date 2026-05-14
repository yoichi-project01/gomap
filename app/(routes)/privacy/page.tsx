import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "プライバシーポリシー | Gomap",
};

const EFFECTIVE_DATE = "2026年5月14日";

type Section = { title: string; body: string[] };

const SECTIONS: Section[] = [
  {
    title: "1. はじめに",
    body: [
      "Gomap（以下「本サービス」といいます）は、ユーザーのプライバシーを尊重し、個人情報の保護に十分な注意を払いながらサービスを提供します。本プライバシーポリシーは、当方が本サービスを通じて取得する情報の範囲、利用目的、第三者提供、ユーザーの権利等について定めるものです。",
    ],
  },
  {
    title: "2. 取得する情報",
    body: [
      "本サービスでは、以下の情報を取得することがあります。",
      "・アカウント情報: メールアドレス、表示名、登録日時、パスワード（ハッシュ化された状態でのみ保管）",
      "・ユーザーが投稿した情報: スポット、プレイスリスト、画像、説明文、緯度・経度",
      "・利用に関する情報: いいね、保存、閲覧履歴（ブラウザのローカルストレージに保存）",
      "・端末情報: ブラウザ種別、OS、IPアドレス、Cookie等",
    ],
  },
  {
    title: "3. 利用目的",
    body: [
      "取得した情報は、以下の目的の範囲内で利用します。",
      "・本サービスの提供、維持、保護、改善のため",
      "・利用規約に違反する行為への対応のため",
      "・お問い合わせへの対応のため",
      "・利用状況の分析および新機能の開発のため",
      "・重要なお知らせ等を必要に応じてご連絡するため",
    ],
  },
  {
    title: "4. 第三者への提供",
    body: [
      "当方は、以下のいずれかに該当する場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。",
      "・法令に基づく場合",
      "・人の生命、身体または財産の保護のために必要がある場合であって、ユーザーの同意を得ることが困難であるとき",
      "・公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、ユーザーの同意を得ることが困難であるとき",
    ],
  },
  {
    title: "5. 外部サービス",
    body: [
      "本サービスは、以下の外部サービスを利用しています。各サービスのプライバシーポリシーもあわせてご確認ください。",
      "・Supabase（認証・データベース）",
      "・地図タイル提供サービス",
    ],
  },
  {
    title: "6. Cookieおよびローカルストレージ",
    body: [
      "本サービスでは、ログイン状態の維持、テーマ（ダーク/ライト）等の設定の保存、閲覧履歴の保持などの目的で Cookie およびブラウザのローカルストレージを利用します。",
      "ユーザーはブラウザの設定により Cookie の使用を拒否することができますが、その場合本サービスの一部の機能が利用できなくなる可能性があります。",
    ],
  },
  {
    title: "7. データの保管期間",
    body: [
      "ユーザーが登録した情報は、アカウントが有効である限り保管されます。アカウントを削除した場合、プロフィール、いいね、保存、お気に入りに関する情報は削除されます。ユーザーが作成したプレイスリストおよびスポットは、サービス上の他ユーザーへの影響を考慮し、「匿名ユーザー」名義で残ります。",
    ],
  },
  {
    title: "8. ユーザーの権利",
    body: [
      "ユーザーは、いつでも自身の個人情報の開示、訂正、削除を請求することができます。請求は、本サービス内のお問い合わせ窓口までご連絡ください。",
    ],
  },
  {
    title: "9. 安全管理",
    body: [
      "当方は、取得した個人情報の漏えい、滅失またはき損の防止その他個人情報の安全管理のために、必要かつ適切な措置を講じます。",
    ],
  },
  {
    title: "10. プライバシーポリシーの変更",
    body: [
      "本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく変更することができるものとします。変更後のプライバシーポリシーは、本サービス上に掲載した時点から効力を生じるものとします。",
    ],
  },
  {
    title: "11. お問い合わせ",
    body: [
      "本ポリシーに関するお問い合わせは、以下の連絡先までお願いします。",
      "メール: corelift.system@gmail.com",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href="/mypage"
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          aria-label="マイページに戻る"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-700 dark:text-white" />
        </Link>
        <ShieldCheck className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">プライバシーポリシー</h1>
      </header>

      <main className="px-4 mt-6 max-w-2xl mx-auto">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6 px-1">
          施行日: {EFFECTIVE_DATE}
        </p>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-6">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.body.map((p, i) => (
                  <p
                    key={i}
                    className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
