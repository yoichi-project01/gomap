'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Trophy } from 'lucide-react';

type Props = {
  title: string;
  type: 'new' | 'featured' | 'ranking';
};

export default function SpotScrollSection({ title, type }: Props) {
  // すべて表示ボタンが押されたかどうかの状態を管理
  const [isExpanded, setIsExpanded] = useState(false);

  // 表示しきれない状態を作るために、モックデータを少し増やしています
  const collections = {
    new: [
      { id: 'spot-new1', title: '大阪の新定番スポット', desc: 'USJ新エリア、あべのハルカスなど' },
      { id: 'spot-new2', title: '話題のNEWオープン', desc: 'KITTE大阪、グラングリーン大阪など' },
      { id: 'spot-new3', title: '最新カフェ巡りin中崎町', desc: 'レトロでおしゃれな隠れ家カフェ' },
      { id: 'spot-new4', title: '季節のイベント・お祭り', desc: '天神祭、御堂筋イルミネーション' },
      { id: 'spot-new5', title: '写真映えスイーツ', desc: '難波・心斎橋エリアの最新SNS映えスイーツ' },
      { id: 'spot-new6', title: '日帰り温泉＆スパ', desc: '空庭温泉、スパワールドなどリラックスできる場所' },
      { id: 'spot-new7', title: '最新の体験型アート', desc: 'チームラボボタニカルガーデン大阪' },
    ],
    featured: [
      { id: 'spot-feat1', title: '大阪観光名所7選', desc: '大阪城、道頓堀、通天閣など王道ルート' },
      { id: 'spot-feat2', title: '家族で楽しむ大阪', desc: '海遊館、天王寺動物園など' },
      { id: 'spot-feat3', title: 'ディープな大阪体験', desc: '新世界、鶴橋、京橋などローカルな魅力' },
      { id: 'spot-feat4', title: '大阪食い倒れツアー', desc: 'たこ焼き、お好み焼き、串カツなど必食グルメ' },
      { id: 'spot-feat5', title: '歴史を感じる寺社仏閣', desc: '住吉大社、大阪天満宮、四天王寺を巡るルート' },
      { id: 'spot-feat6', title: 'お買い物スポット', desc: 'グランフロント大阪、心斎橋筋商店街など' },
      { id: 'spot-feat7', title: 'テーマパークで遊ぶ', desc: 'USJ、ひらかたパークなど1日遊べる場所' },
    ],
    ranking: [
      { id: 'spot-rank1', title: '絶景の夜景スポット', desc: '梅田スカイビル、コスモタワーなど' },
      { id: 'spot-rank2', title: 'お土産探しスポット', desc: '阪急うめだ本店、なんば周辺など' },
      { id: 'spot-rank3', title: 'カップル向けデート', desc: '中之島公園、万博記念公園などおすすめの場所' },
      { id: 'spot-rank4', title: '一人でゆっくり過ごす', desc: '大阪府立中之島図書館、国立国際美術館など' },
      { id: 'spot-rank5', title: '雨の日でも遊べる施設', desc: 'ニフレル、大阪市立科学館など室内スポット' },
      { id: 'spot-rank6', title: '自然を感じるハイキング', desc: '箕面大滝、金剛山などリフレッシュできるエリア' },
      { id: 'spot-rank7', title: 'アニメの聖地巡礼', desc: '日本橋オタロード周辺のサブカルスポット' },
    ],
  };

  const currentData = collections[type] || [];
  
  // 最初に表示する上限数（PC画面の幅に合わせて5個〜6個が目安）
  const displayLimit = 5; 
  
  // データが上限数より多ければ「すべて表示」を出す条件を満たす
  const hasMore = currentData.length > displayLimit;
  
  // 表示モードに応じて、データを切り出すか全件渡すか決定
  const displayedData = isExpanded ? currentData : currentData.slice(0, displayLimit);

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        
        {/* 「すべて表示」ボタンの表示制御 */}
        {hasMore && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-xs font-bold text-zinc-400 hover:text-white transition"
          >
            すべて表示
          </button>
        )}
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-xs font-bold text-zinc-400 hover:text-white transition"
          >
            一部を表示
          </button>
        )}
      </div>

      {/* 横スクロールをやめ、PC画面幅に合わせて列数が増えるグリッドレイアウトに変更 
        スマホ(2列) -> タブレット(3~4列) -> PC(5~6列) と自動で画面いっぱいに並びます
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayedData.map((item, index) => (
          <Link href={`/spots/collection/${item.id}`} key={item.id} className="flex flex-col group cursor-pointer">
            {/* 固定幅(w-36)をやめ、aspect-square(正方形)で画面幅に合わせて伸縮するように変更 */}
            <div className="aspect-square w-full bg-zinc-800 rounded-md mb-3 shadow-lg group-hover:opacity-80 transition relative overflow-hidden flex items-center justify-center">
              
              {type === 'new' && <Sparkles className="w-10 h-10 text-yellow-400" />}
              {type === 'featured' && <Flame className="w-10 h-10 text-red-500" />}
              {type === 'ranking' && (
                <>
                  <span className="absolute -left-2 -bottom-5 text-[80px] font-bold text-zinc-600/40 italic z-0 select-none">
                    {index + 1}
                  </span>
                  <Trophy className="w-8 h-8 text-yellow-500 z-10" />
                </>
              )}
            </div>
            
            <h3 className="font-bold text-sm truncate mb-1">
              {item.title}
            </h3>
            
            <p className="text-zinc-400 text-xs line-clamp-2 whitespace-normal leading-relaxed">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}