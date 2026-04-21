import Link from 'next/link';
import { Sparkles, Flame, Trophy } from 'lucide-react';

type Props = {
  title: string;
  type: 'new' | 'featured' | 'ranking';
};

export default function SpotScrollSection({ title, type }: Props) {
  // セクションごとの「スポットのまとまり（コレクション）」のデータ
  const collections = {
    new: [
      { id: 1, title: '大阪の新定番スポット', desc: 'USJ新エリア、あべのハルカス、ひらかたパークなど...' },
      { id: 2, title: '最新カフェ巡りin中崎町', desc: 'レトロでおしゃれな隠れ家カフェを厳選しました。' },
      { id: 3, title: '話題のNEWオープン', desc: 'KITTE大阪、グラングリーン大阪など最新施設。' },
      { id: 4, title: '季節のイベント・お祭り', desc: '天神祭、御堂筋イルミネーションなど...' },
      { id: 5, title: '写真映えスイーツ', desc: '難波・心斎橋エリアの最新SNS映えスイーツまとめ。' },
      { id: 6, title: '日帰り温泉＆スパ', desc: '空庭温泉、スパワールドなどリラックスできる場所。' },
    ],
    featured: [
      { id: 7, title: '大阪観光名所7選', desc: '大阪城、道頓堀、通天閣など、初めての大阪ならここ！' },
      { id: 8, title: 'ディープな大阪体験', desc: '新世界、鶴橋、京橋など、ローカルな魅力満載のエリア。' },
      { id: 9, title: '大阪食い倒れツアー', desc: 'たこ焼き、お好み焼き、串カツなど必食グルメスポット。' },
      { id: 10, title: '家族で楽しむ大阪', desc: '海遊館、天王寺動物園、キッズプラザ大阪など。' },
      { id: 11, title: '歴史を感じる寺社仏閣', desc: '住吉大社、大阪天満宮、四天王寺を巡るルート。' },
      { id: 12, title: 'お買い物スポット', desc: 'グランフロント大阪、心斎橋筋商店街、りんくうアウトレット。' },
    ],
    ranking: [
      { id: 13, title: '絶景の夜景スポット', desc: '梅田スカイビル、コスモタワーなどロマンチックな場所。' },
      { id: 14, title: 'カップル向けデートコース', desc: '中之島公園、万博記念公園などおすすめのデートスポット。' },
      { id: 15, title: '一人でゆっくり過ごす休日', desc: '大阪府立中之島図書館、国立国際美術館など。' },
      { id: 16, title: '雨の日でも遊べる施設', desc: 'ニフレル、大阪市立科学館など室内スポット。' },
      { id: 17, title: '自然を感じるハイキング', desc: '箕面大滝、金剛山などリフレッシュできる自然エリア。' },
      { id: 18, title: 'お土産探しスポット', desc: '阪急うめだ本店、なんばグランド花月周辺など。' },
    ],
  };

  const currentData = collections[type];

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden">
        {currentData.map((item, index) => (
          <Link href={`/spots/collection/${item.id}`} key={item.id} className="flex-none w-36 snap-start cursor-pointer group">
            <div className="w-36 h-36 bg-zinc-800 rounded-md mb-3 shadow-lg group-hover:opacity-80 transition relative overflow-hidden flex items-center justify-center">
              
              {/* 各セクションごとのアイコン・装飾出し分け */}
              {type === 'new' && <Sparkles className="w-10 h-10 text-yellow-400" />}
              {type === 'featured' && <Flame className="w-10 h-10 text-red-500" />}
              {type === 'ranking' && (
                <>
                  {/* ランキング特有の大きな背景数字 */}
                  <span className="absolute -left-2 -bottom-5 text-[80px] font-bold text-zinc-600/40 italic z-0 select-none">
                    {index + 1}
                  </span>
                  <Trophy className="w-8 h-8 text-yellow-500 z-10" />
                </>
              )}
            </div>
            
            {/* コレクションのタイトル */}
            <h3 className="font-bold text-sm truncate mb-1">
              {item.title}
            </h3>
            
            {/* コレクションに含まれるスポットの説明文 */}
            <p className="text-zinc-400 text-xs truncate line-clamp-2 whitespace-normal">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}