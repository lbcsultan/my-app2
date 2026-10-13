// Next.js 16에서 searchParams도 params처럼 Promise입니다 — await가 필요합니다.
// loginAction이 로그인에 실패하면 /login?error=1 로 돌려보내는데, 그 값을

import { SubmitButton } from '@/components/SubmitButton'
import { loginAction } from '@/lib/actions'
import Link from 'next/link'

// 여기서 읽어서 에러 메시지를 보여줍니다.
type Props = { searchParams: Promise<{ error?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="mx-auto flex max-w-sm flex-1 flex-col gap-6 px-8 py-16">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        로그인
      </h1>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          이메일 또는 비밀번호가 올바르지 않습니다.
        </p>
      )}

      <form action={loginAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="rounded-md border border-black/[.08] px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="rounded-md border border-black/[.08] px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-white/[.145] dark:bg-transparent"
          />
        </div>
        <SubmitButton label="로그인" />
      </form>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        계정이 없나요?{' '}
        <Link
          href="/register"
          className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
        >
          회원가입
        </Link>
      </p>
    </div>
  )
}
