'use server'

import { likeProduct as likeProductInDb } from '@/lib/products'
import { revalidatePath } from 'next/cache'

export async function likeProductAction(id: string) {
  const newLikes = await likeProductInDb(id)
  revalidatePath(`/products/${id}`)
  return newLikes
}
