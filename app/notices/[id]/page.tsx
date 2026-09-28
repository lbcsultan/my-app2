import { getNotice } from '@/lib/notices'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params
  const notice = await getNotice(id)

  if (!notice) {
    notFound()
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-4 px-8 py-16">
      <Link href="/notices" className="text-sm text-zinc-500 hover:underline">
        ← 목록으로
      </Link>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        {notice.title}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {notice.author} · {notice.createdAt}
      </p>
      <p className="whitespace-pre-wrap leading-7 text-zinc-700 dark:text-zinc-300">
        {notice.content}
      </p>
    </div>
  )
}
