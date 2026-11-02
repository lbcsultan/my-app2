import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProduct } from '@/lib/products'
import { addToCartAction } from '@/lib/actions'

// [id] 폴더 이름의 대괄호가 "동적 세그먼트"를 의미합니다.
// Next.js 16에서 params는 Promise이므로 반드시 await 해야 합니다.
type Props = { params: Promise<{ id: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    // 존재하지 않는 id는 물론, 형식이 잘못된 id(조작된 URL)로 접근해도
    // lib/products.ts의 getProduct가 null을 반환하도록 만들어뒀습니다 —
    // 서버가 예외로 죽지 않고 자연스럽게 404로 이어집니다.
    notFound()
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 px-8 py-16">
      <Link href="/products" className="text-sm text-zinc-500 hover:underline">
        ← 목록으로
      </Link>
      <span className="text-5xl" aria-hidden>
        {product.emoji}
      </span>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        {product.name}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
      <p className="text-xl font-semibold text-black dark:text-zinc-50">
        {product.price.toLocaleString()}원
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        재고 {product.stock}개
      </p>

      <form action={addToCartAction} className="flex items-center gap-3">
        <input type="hidden" name="productId" value={product.id} />
        <label
          className="text-sm text-zinc-600 dark:text-zinc-400"
          htmlFor="qty"
        >
          수량
        </label>
        <input
          id="qty"
          name="qty"
          type="number"
          min={1}
          max={Math.max(product.stock, 1)}
          defaultValue={1}
          disabled={product.stock === 0}
          className="w-20 rounded-md border border-black/[.08] px-2 py-1.5 text-sm dark:border-white/[.145] dark:bg-transparent"
        />
        <button
          type="submit"
          disabled={product.stock === 0}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {product.stock === 0 ? '품절' : '장바구니에 담기'}
        </button>
      </form>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        폼에 적은 수량은 그대로 저장되지 않습니다 — addToCartAction이 실제
        재고를 다시 조회해서 그 범위 안으로 맞춥니다(lib/actions.ts 참고).
      </p>
    </div>
  )
}
