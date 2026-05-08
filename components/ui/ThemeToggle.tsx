'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label="テーマを切り替える"
      className={`flex items-center justify-center rounded-full transition-colors ${className}`}
    >
      {theme === 'dark'
        ? <Sun className="w-5 h-5" />
        : <Moon className="w-5 h-5" />}
    </button>
  )
}
