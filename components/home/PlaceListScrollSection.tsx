'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Trophy } from 'lucide-react';

type Props = {
  title: string;
  type: 'new' | 'featured' | 'ranking';
};

export default function PlaceListScrollSection({ title, type }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const collections = {
    new: [
      { id: 'placelist-new1', title: '大阪の新定番プレイスリスト', desc: 'USJ新エリア、あべのハルカスなど' },
      { id: 'placelist-new2', title: '話題のNEWオープン', desc: 'KITTE大阪、グラングリーン大阪など' },
      { id: 'placelist-new3', title: '最新カフェ巡りin中崎町', desc: 'レトロでおしゃれな隠れ家カフェ' },
      { id: 'placelist-new4', title: '季節のイベント・お祭り', desc: '天神祭、御堂筋イルミネーション' },
      { id: 'placelist-new5', title: '写真映えスイーツ', desc: '難波・心斎橋エリアの最新SNS映えスイーツ' },
      { id: 'placelist-new6', title: '日帰り温泉＆スパ', desc: '空庭温泉、スパワールドなどリラックスできる場所' },
      { id: 'placelist-new7', title: '最新の体験型アート', desc: 'チームラボボタニカルガーデン大阪' },
    ],
    featured: [
      { id: 'placelist-feat1', title: '大阪観光名所7選', desc: '大阪城、道頓堀、通天閣など王道ルート' },
      { id: 'placelist-feat2', title: '家族で楽しむ大阪', desc: '海遊館、天王寺動物園など' },
      { id: 'placelist-feat3', title: 'ディープな大阪体験', desc: '新世界、鶴橋、京橋などローカルな魅力' },
      { id: 'placelist-feat4', title: '大阪食い倒れツアー', desc: 'たこ焼き、お好み焼き、串カツなど必食グルメ' },
      { id: 'placelist-feat5', title: '歴史を感じる寺社仏閣', desc: '住吉大社、大阪天満宮、四天王寺を巡るルート' },
      { id: 'placelist-feat6', title: 'お買い物プレイスリスト', desc: 'グランフロント大阪、心斎橋筋商店街など' },
      { id: 'placelist-feat7', title: 'テーマパークで遊ぶ', desc: 'USJ、ひらかたパークなど1日遊べる場所' },
    ],
    ranking: [
      { id: 'placelist-rank1', title: '絶景の夜景プレイスリスト', desc: '梅田スカイビル、コスモタワーなど' },
      { id: 'placelist-rank2', title: 'お土産探しプレイスリスト', desc: '阪急うめだ本店、なんば周辺など' },
      { id: 'placelist-rank3', title: 'カップル向けデート', desc: '中之島公園、万博記念公園などおすすめの場所' },
      { id: 'placelist-rank4', title: '一人でゆっくり過ごす', desc: '大阪府立中之島図書館、国立国際美術館など' },
      { id: 'placelist-rank5', title: '雨の日でも遊べる施設', desc: 'ニフレル、大阪市立科学館など室内プレイスリスト' },
      { id: 'placelist-rank6', title: '自然を感じるハイキング', desc: '箕面大滝、金剛山などリフレッシュできるエリア' },
      { id: 'placelist-rank7', title: 'アニメの聖地巡礼', desc: '日本橋オタロード周辺のサブカルプレイスリスト' },
    ],
  };

  const currentData = collections[type] || [];
  const displayLimit = 5;
  const hasMore = currentData.length > displayLimit;
  const displayedData = isExpanded ? currentData : currentData.slice(0, displayLimit);

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>

        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition"
          >
            すべて表示
          </button>
        )}
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white transition"
          >
            一部を表示
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayedData.map((item, index) => (
          <Link href={`/placelists/${item.id}`} key={item.id} className="flex flex-col group cursor-pointer">
            <div className="aspect-square w-full bg-zinc-200 dark:bg-zinc-800 rounded-md mb-3 shadow-lg group-hover:opacity-80 transition relative overflow-hidden flex items-center justify-center">
              {type === 'new' && <Sparkles className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />}
              {type === 'featured' && <Flame className="w-10 h-10 text-red-500" />}
              {type === 'ranking' && (
                <>
                  <span className="absolute -left-2 -bottom-5 text-[80px] font-bold text-zinc-400/40 dark:text-zinc-600/40 italic z-0 select-none">
                    {index + 1}
                  </span>
                  <Trophy className="w-8 h-8 text-yellow-500 z-10" />
                </>
              )}
            </div>

            <h3 className="font-bold text-sm truncate mb-1 text-zinc-900 dark:text-zinc-100">
              {item.title}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 whitespace-normal leading-relaxed">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
