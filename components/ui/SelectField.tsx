'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Props = {
  icon: React.ReactNode;
  ariaLabel: string;
  value: string | null;
  options: string[];
  onChange: (next: string | null) => void;
  // value === null のときに表示する文字列。省略時は "すべて"。
  placeholder?: string;
  // false にすると先頭の "すべて (= null)" 選択肢を出さない。
  // 並び順のように「常に何か選択する」フィルタに使う。デフォルト true。
  clearable?: boolean;
};

export default function SelectField({
  icon,
  ariaLabel,
  value,
  options,
  onChange,
  placeholder = 'すべて',
  clearable = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 外側クリック / Esc でクローズ
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = value !== null;
  const displayValue = value ?? placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`w-full inline-flex items-center justify-between gap-1.5 rounded-full border text-xs px-3 py-2 transition ${
          isActive
            ? 'bg-green-500 border-green-500 text-black font-bold'
            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
        }`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="flex-shrink-0">{icon}</span>
          <span className="truncate">{displayValue}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl border border-zinc-700 bg-zinc-950 shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          {clearable && (
            <OptionItem
              selected={value === null}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              {placeholder}
            </OptionItem>
          )}
          {options.map((opt) => (
            <OptionItem
              key={opt}
              selected={value === opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </OptionItem>
          ))}
        </ul>
      )}
    </div>
  );
}

function OptionItem({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center justify-between gap-2 text-left text-xs px-3 py-2 transition ${
          selected ? 'bg-green-500/15 text-green-400 font-bold' : 'text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        <span className="truncate">{children}</span>
        {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
      </button>
    </li>
  );
}
