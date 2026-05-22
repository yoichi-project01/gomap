"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export default function BackButton({ className, iconClassName, children }: BackButtonProps) {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className={className} aria-label="前の画面に戻る">
      {children ?? <ChevronLeft className={iconClassName ?? "w-6 h-6"} />}
    </button>
  );
}
