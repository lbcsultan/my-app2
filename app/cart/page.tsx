import Link from 'next/link'
import { getCartLines } from '@/lib/cart'
import { getProductsByIds } from '@/lib/products'
import { updateCartQtyAction, removeFromCartAction } from '@/lib/actions'

// 장바구니는 로그인 여부와 무관하게 누구나 볼 수 있습니다(lib/cart.ts의
// 쿠키 기반 구현 참고). 쿠키에는 { productId, qty } 목록만 저장되어
// 있으므로, 실제 상품 정보(이름/가격/재고)는 여기서 다시 MongoDB에
// 조회해 합칩니다 — 쿠키에 가격을 직접 저장하지 않는 것이 중요합니다.
// 가격을 쿠키에 저장하면 사용자가 쿠키를 조작해 가격을 바꿔치기할 수
// 있기 때문입니다.
export default async function CartPage() {
  const lines = await getCartLines()
  const products = await getProductsByIds(lines.map((line) => line.productId))

  const items = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId)
      return product ? { ...line, product } : null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  )

  return (
    <div className="mx-auto max-w-2xl flex-1 px-8 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-black dark:text-zinc-50">
        장바구니
      </h1>

      {items.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          장바구니가 비어 있습니다.{' '}
          <Link href="/products" className="underline underline-offset-4">
            상품 목록
          </Link>
          에서 담아보세요.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-black/[.08] px-5 py-4 dark:border-white/[.145]"
              >
                <span className="text-3xl" aria-hidden>
                  {item.product.emoji}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-black dark:text-zinc-50">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {item.product.price.toLocaleString()}원 × {item.qty} ={' '}
                    {(item.product.price * item.qty).toLocaleString()}원
                  </p>
                </div>
                <form
                  action={updateCartQtyAction}
                  className="flex items-center gap-2"
                >
                  <input
                    type="hidden"
                    name="productId"
                    value={item.productId}
                  />
                  <input
                    type="number"
                    name="qty"
                    min={1}
                    max={item.product.stock}
                    defaultValue={item.qty}
                    className="w-16 rounded-md border border-black/[.08] px-2 py-1 text-sm dark:border-white/[.145] dark:bg-transparent"
                  />
                  <button
                    type="submit"
                    className="text-sm text-zinc-500 underline underline-offset-4 hover:text-black dark:hover:text-zinc-50"
                  >
                    수량 변경
                  </button>
                </form>
                <form action={removeFromCartAction}>
                  <input
                    type="hidden"
                    name="productId"
                    value={item.productId}
                  />
                  <button
                    type="submit"
                    className="text-sm text-red-600 underline underline-offset-4 hover:text-red-700"
                  >
                    삭제
                  </button>
                </form>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between border-t border-black/[.08] pt-6 dark:border-white/[.145]">
            <p className="text-lg font-semibold text-black dark:text-zinc-50">
              총 {total.toLocaleString()}원
            </p>
            <button
              type="button"
              disabled
              title="결제/주문 생성은 11주차에서 완성합니다"
              className="cursor-not-allowed rounded-md bg-black/30 px-4 py-2 text-sm font-medium text-white dark:bg-white/30"
            >
              결제하기 (11주차 예정)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
