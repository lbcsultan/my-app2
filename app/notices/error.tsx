'use client'
// 같은 폴더에 error.tsx를 두면, 이 경로 아래에서 발생하는 에러(예: DB 연결
// 실패)를 Next.js가 자동으로 이 컴포넌트로 잡아 보여줍니다. error.tsx는
// 항상 Client Component여야 합니다.
//
// 보안 관점에서도 중요합니다: 이게 없으면 개발 모드에서는 에러 메시지와
// 스택 트레이스가 그대로 화면에 노출될 수 있습니다. 실제 서비스에서는
// DB 접속 정보 같은 내부 정보가 사용자에게 노출되면 안 되므로, 사용자에게는
// 이렇게 안전한 문구만 보여주고 자세한 내용은 서버 로그로만 남깁니다.
export default function NoticesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <p className="text-lg font-medium text-black dark:text-zinc-50">
        공지사항을 불러오지 못했습니다.
      </p>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        일시적인 서버/DB 연결 문제일 수 있습니다. 잠시 후 다시 시도해주세요.
        {error.digest && ` (참고번호: ${error.digest})`}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md border border-black/[.08] px-4 py-2 text-sm hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]"
      >
        다시 시도
      </button>
    </div>
  )
}
