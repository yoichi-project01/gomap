import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function AddSpotButton() {
  return (
    // ボトムナビゲーションに被らないよう、bottom-24 で少し上に配置
    <div className="fixed bottom-24 right-6 z-40">
      <Link 
        href="/spots/create" // スポット作成ページへのリンク（必要に応じて変更してください）
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:scale-105 hover:bg-green-400 transition-all text-black group"
      >
        {/* ホバー時に少し回転するアニメーションを追加 */}
        <Plus 
          strokeWidth={2.5} 
          className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" 
        />
      </Link>
    </div>
  );
}