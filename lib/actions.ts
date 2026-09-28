'use server'

import { likeProduct as likeProductInDb } from '@/lib/products'
import { revalidatePath } from 'next/cache'
import { createNotice } from './notices'
import { redirect } from 'next/navigation'

export async function likeProductAction(id: string) {
  const newLikes = await likeProductInDb(id)
  revalidatePath(`/products/${id}`)
  return newLikes
}

export async function createNoticeAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const author = String(formData.get('author') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !author || !content) {
    // 실습 단계의 아주 단순한 검증입니다.
    // 실제 서비스라면 에러 상태를 돌려주고 폼에 메시지를 보여줘야 합니다.
    throw new Error('제목, 작성자, 내용을 모두 입력해주세요.')
  }

  const notice = await createNotice({ title, author, content })
  revalidatePath('/notices')
  redirect(`/notices/${notice.id}`)
}
