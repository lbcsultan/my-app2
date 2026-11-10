import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { getOrder } from '@/lib/orders'

type Props = { params: Promise<{ id: string }> }

// 이 페이지가 이번 학기 "소유권 검사"의 마지막 예시입니다. 9주차에서
// 공지사항에 authorId를 두고 본인 글인지 확인했던 것과 똑같은 패턴을
// 주문에도 그대로 적용합니다:
//
//   isOwner = order.userId === session.user.id
//
// 이 체크가 없으면 어떻게 될까요? 로그인만 되어 있으면 누구든 URL의
// id만 바꿔서(/orders/<다른 사람의 주문 id>) 다른 사람의 구매 내역과
// 배송/결제 정보를 볼 수 있게 됩니다 — 이것이 바로 12~14주차에 다룰
// IDOR(Insecure Direct Object Reference, 안전하지 않은 직접 객체 참조)
// 취약점의 전형적인 형태입니다. "로그인했는지"만 확인하고 "그 사람
// 것인지"를 확인하지 않으면 인증은 있어도 인가는 없는 상태가 됩니다.
export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const order = await getOrder(id)
  if (!order) {
    notFound()
  }

  const isOwner = order.userId === session.user.id
  const isAdmin = session.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    // 존재는 하지만 내 것이 아닌 주문입니다. "없다"고 답하는 것과
    // "권한이 없다"고 답하는 것 중 무엇이 나을지는 상황에 따라
    // 다르지만, 여기서는 존재 자체를 숨기기 위해 404와 동일하게
    // 처리합니다 — 다른 사람의 주문이 존재한다는 사실조차 알려주지
    // 않기 위함입니다.
    notFound()
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 px-8 py-16">
      <Link href="/orders" className="text-sm text-zinc-500 hover:underline">
        ← 주문 내역으로
      </Link>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        주문 상세
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {new Date(order.createdAt).toLocaleString('ko-KR')}
        {isAdmin && !isOwner && (
          <span className="ml-2 rounded bg-black/[.06] px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300">
            관리자 열람
          </span>
        )}
      </p>

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center justify-between rounded-lg border border-black/[.08] px-5 py-3 dark:border-white/[.145]"
          >
            <span className="text-black dark:text-zinc-50">{item.name}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {item.price.toLocaleString()}원 × {item.qty}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-black/[.08] pt-6 dark:border-white/[.145]">
        <p className="text-lg font-semibold text-black dark:text-zinc-50">
          총 {order.total.toLocaleString()}원
        </p>
      </div>
    </div>
  )
}
