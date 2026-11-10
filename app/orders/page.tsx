import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getOrdersByUser } from '@/lib/orders'

// 주문 내역은 로그인이 필요합니다 — 그리고 "내" 주문만 봅니다.
// getOrdersByUser(session.user.id)처럼 항상 로그인한 사용자의 id를
// 조건으로 걸어서 조회하는 것이 핵심입니다. 만약 여기서 전체 Order
// 컬렉션을 걸러내지 않고 보여준다면, 다른 사람의 주문(이름/구매 내역)이
// 그대로 노출되는 정보 유출 사고가 됩니다.
export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const orders = await getOrdersByUser(session.user.id)

  return (
    <div className="mx-auto max-w-2xl flex-1 px-8 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-black dark:text-zinc-50">
        주문 내역
      </h1>

      {orders.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          아직 주문이 없습니다.{' '}
          <Link href="/products" className="underline underline-offset-4">
            상품 목록
          </Link>
          에서 쇼핑을 시작해보세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="block rounded-lg border border-black/[.08] px-5 py-4 transition-colors hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]"
              >
                <p className="font-medium text-black dark:text-zinc-50">
                  {new Date(order.createdAt).toLocaleString('ko-KR')}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  상품 {order.items.length}종 · 총{' '}
                  {order.total.toLocaleString()}원
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
