import { User } from "lucide-react"

function Card({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
      {children}
    </div>
  )
}

function Bar({ w, h = "h-3" }: { w: string; h?: string }) {
  return <div className={`${w} ${h} rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse`} />
}

function Row() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <Bar w="w-32" />
      <Bar w="w-4" />
    </div>
  )
}

export default function MyPageLoading() {
  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 flex items-center px-4 pt-10 pb-4 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <User className="w-6 h-6 text-green-500 mr-2" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">マイページ</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <Bar w="w-32" h="h-4" />
              <Bar w="w-48" />
              <Bar w="w-24" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 py-1">
                <Bar w="w-6" h="h-5" />
                <Bar w="w-16" />
              </div>
            ))}
          </div>
        </Card>

        {[1, 2].map((s) => (
          <Card key={s} className="overflow-hidden">
            <Row />
            <Row />
          </Card>
        ))}
      </div>
    </div>
  )
}
