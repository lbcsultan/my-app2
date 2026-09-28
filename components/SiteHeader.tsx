import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-8 py-4">
        <Link
          href="/"
          className="text-sm font-semibold text-black dark:text-zinc-50"
        >
          웹서버보안프로그래밍
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/products"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            상품
          </Link>
          <Link
            href="/notices"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            공지사항
          </Link>
          <Link
            href="/notices/new"
            className="rounded-md border border-black/[.08] px-3 py-1.5 hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]"
          >
            글쓰기
          </Link>
        </nav>
      </div>
    </header>
  )
}
