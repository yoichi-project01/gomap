import Link from 'next/link';
import { Map as MapIcon } from 'lucide-react';

export default function FloatingMapButton() {
  return (
    <div className="fixed bottom-24 right-6 z-40">
      <Link href="/spots" className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform text-black">
        <MapIcon fill="currentColor" className="w-6 h-6" />
      </Link>
    </div>
  );
}