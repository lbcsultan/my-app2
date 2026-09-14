import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-24 text-center">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        이 페이지는 app/about/page.tsx 입니다
      </h1>
      <p className="max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
        app 폴더 아래에 새 폴더를 만들고 그 안에 page.tsx를 두면, 폴더 이름이
        그대로 경로가 됩니다. app/about → /about, app/products/[id] →
        /products/123 처럼 동적 경로도 같은 방식입니다. (동적 라우팅은 4주차에서
        다룹니다.)
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
      >
        ← 홈으로 돌아가기
      </Link>
    </div>
  )
}
