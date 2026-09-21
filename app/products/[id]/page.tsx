import { LikeButton } from '@/components/LikeButton'
import { getProduct } from '@/lib/products'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

type Props = { params: Promise<{ id: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 px-8 py-16">
      <Link href="/products" className="text-sm text-zinc-500 hover:underline">
        ← 목록으로
      </Link>
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        {product.name}
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
      <LikeButton id={product.id} initialLikes={product.likes} />
    </div>
  )
}
