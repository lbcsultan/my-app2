import Link from 'next/link'
import { searchProducts } from '@/lib/products'
import { addToCartAction } from '@/lib/actions'

// Next.js 16에서 searchParams도 params처럼 Promise입니다 — await 필요.
type Props = { searchParams: Promise<{ q?: string }> }

// Server Component에서 바로 await로 데이터를 가져올 수 있습니다.
// 이 함수가 끝날 때까지 Next.js는 같은 폴더의 loading.tsx를 대신 보여줍니다.
//
// 4주차에 in-memory로 흉내냈던 상품 목록을, 10주차부터는 실제 MongoDB
// 컬렉션(lib/products.ts)으로 관리합니다. 13주차부터 검색(q)을 지원합니다
// — searchProducts()가 안전하게 만들어진 이유는 lib/products.ts의 주석을
// 참고하세요.
export default async function ProductsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const products = await searchProducts(q)

  return (
    <div className="mx-auto max-w-2xl flex-1 px-8 py-16">
      <h1 className="mb-2 text-2xl font-semibold text-black dark:text-zinc-50">
        쇼핑몰 — 상품 목록
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        MongoDB 컬렉션에서 불러온 실제 상품입니다. 담기 버튼을 누르면 쿠키 기반
        장바구니(lib/cart.ts)에 저장됩니다 — 로그인하지 않아도 사용할 수
        있습니다.
      </p>

      <form className="mb-6 flex gap-2" action="/products">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="상품 이름으로 검색"
          className="w-full max-w-xs rounded-md border border-black/[.08] px-3 py-1.5 text-sm dark:border-white/[.145] dark:bg-transparent"
        />
        <button
          type="submit"
          className="rounded-md border border-black/[.08] px-3 py-1.5 text-sm hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-white/[.05]"
        >
          검색
        </button>
        {q && (
          <Link
            href="/products"
            className="flex items-center text-sm text-zinc-500 underline underline-offset-4 hover:text-black dark:hover:text-zinc-50"
          >
            초기화
          </Link>
        )}
      </form>

      {products.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          &ldquo;{q}&rdquo;에 대한 검색 결과가 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-lg border border-black/[.08] px-5 py-4 dark:border-white/[.145]"
            >
              <span className="text-3xl" aria-hidden>
                {p.emoji}
              </span>
              <Link
                href={`/products/${p.id}`}
                className="flex-1 transition-colors hover:opacity-80"
              >
                <p className="font-medium text-black dark:text-zinc-50">
                  {p.name}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {p.description} · {p.price.toLocaleString()}원 · 재고{' '}
                  {p.stock}개
                </p>
              </Link>
              <form action={addToCartAction}>
                <input type="hidden" name="productId" value={p.id} />
                <input type="hidden" name="qty" value={1} />
                <button
                  type="submit"
                  disabled={p.stock === 0}
                  className="rounded-md border border-black/[.08] px-3 py-1.5 text-sm hover:bg-black/[.03] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/[.145] dark:hover:bg-white/[.05]"
                >
                  {p.stock === 0 ? '품절' : '담기'}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link
          href="/cart"
          className="text-sm font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50"
        >
          장바구니 보기 →
        </Link>
      </div>
    </div>
  )
}
