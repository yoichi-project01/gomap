'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Props = {
  icon: React.ReactNode;
  ariaLabel: string;
  values: string[];
  options: string[];
  onChange: (next: string[]) => void;
  // values が空のときに表示する文字列。省略時は "すべて"。
  placeholder?: string;
};

// SelectField と同じビジュアル言語の複数選択プルダウン。
// ボタン本体は「すべて」/「観光」/「観光 ほか2件」のように選択数で表示が変わる。
// ドロップダウンを開いている間は項目クリックでトグルし続け、閉じない。
export default function MultiSelectField({
  icon,
  ariaLabel,
  values,
  options,
  onChange,
  placeholder = 'すべて',
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

  const isActive = values.length > 0;
  const displayValue =
    values.length === 0
      ? placeholder
      : values.length === 1
        ? values[0]
        : `${values[0]} ほか${values.length - 1}件`;

  const toggle = (opt: string) => {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  };

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
            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500'
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
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          {/* すべて解除 */}
          <li role="option" aria-selected={values.length === 0}>
            <button
              type="button"
              onClick={() => onChange([])}
              className={`w-full flex items-center justify-between gap-2 text-left text-xs px-3 py-2 transition ${
                values.length === 0
                  ? 'bg-green-500/15 text-green-600 dark:text-green-400 font-bold'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="truncate">{placeholder}</span>
              {values.length === 0 && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
            </button>
          </li>
          {options.map((opt) => {
            const selected = values.includes(opt);
            return (
              <li key={opt} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`w-full flex items-center justify-between gap-2 text-left text-xs px-3 py-2 transition ${
                    selected
                      ? 'bg-green-500/15 text-green-400 font-bold'
                      : 'text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
