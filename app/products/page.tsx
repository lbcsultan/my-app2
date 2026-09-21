import { getProducts } from '@/lib/products'
import Link from 'next/link'

export default async function ProductsPage() {
  const products = await getProducts()
  // console.log(products)

  return (
    <div className="mx-auto max-w-2xl flex-1 px-8 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-black dark:text-zinc-50">
        상품 목록
      </h1>
      <ul className="flex flex-col gap-4">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={`/products/${p.id}`}
              className="block rounded-lg border border-black/8 px-5 py-4 transition-colors hover:bg-black/3 dark:border-white/14 dark:hover:bg-white/5"
            >
              <p className="font-medium text-black dark:text-zinc-50">
                {p.name}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {p.description} - 좋아요 {p.likes}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
