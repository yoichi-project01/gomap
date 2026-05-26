import Link from "next/link";
import { HelpCircle, ChevronDown, MessageSquare } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "ヘルプ | Gomap",
};

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "スポットとプレイスリストはどう違いますか？",
    a: "スポットは1つの地点を表す最小単位です。プレイスリストは複数のスポットをまとめたコレクションで、音楽のプレイリストのようにテーマごとに整理できます。",
  },
  {
    q: "プレイスリストの「保存」と「いいね」は何が違いますか？",
    a: "「保存」は他のユーザーのプレイスリストを自分のマイライブラリにブックマークする操作です。「いいね」は評価・お気に入りのマークで、作成者にも数として表示されます。",
  },
  {
    q: "新しいスポットはどこから登録できますか？",
    a: "マイページの「登録したスポット」、またはホームから /spots/create に移動して登録できます。緯度・経度は地図上のピンで指定します。",
  },
  {
    q: "登録したスポットを削除すると、含めているプレイスリストはどうなりますか？",
    a: "スポットがプレイスリストから自動的に取り除かれます。プレイスリスト自体は残ります。",
  },
  {
    q: "アカウントを削除するとデータはどうなりますか？",
    a: "プロフィール・いいね・保存・お気に入りは削除されます。あなたが作成したプレイスリストとスポットは「匿名ユーザー」名義で残ります。",
  },
  {
    q: "ダークモードの切り替え方は？",
    a: "ヘッダー右側のテーマ切り替えアイコン、またはマイページの「外観 → ダークモード」から切り替えできます。",
  },
  {
    q: "ログインしていなくても使えますか？",
    a: "プレイスリストやスポットの閲覧は誰でも可能です。作成・保存・いいねなどの操作にはログインが必要です。",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
      <header className="sticky top-0 z-50 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <BackButton
          className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition mr-3"
          iconClassName="w-6 h-6 text-zinc-700 dark:text-white"
        />
        <HelpCircle className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">ヘルプ</h1>
      </header>

      <main className="px-4 mt-6 max-w-2xl mx-auto space-y-6">
        <section>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">
            よくある質問
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group border-b border-zinc-100 dark:border-zinc-800 last:border-0"
              >
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <span className="text-sm text-zinc-800 dark:text-zinc-200 pr-3">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-1">
            問題が解決しない場合
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <Link
              href="/feedback"
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-800 dark:text-zinc-200">フィードバックを送る</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">改善要望・バグ報告など</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
