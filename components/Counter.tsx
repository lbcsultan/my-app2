'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div className="flex items-center gap-3 rounded-lg border border-black[.08] px-4 py-3 dark:border-white/[.145]">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Client Component (버튼을 눌러보세요)
      </span>
      <button
        className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        onClick={() => setCount((c) => c + 1)}
      >
        카운터 - {count}
      </button>
    </div>
  )
}
