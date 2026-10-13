'use server'

import { likeProduct as likeProductInDb } from '@/lib/products'
import { revalidatePath } from 'next/cache'
import { createNotice } from './notices'
import { redirect } from 'next/navigation'
import { createUser } from './users'
import { signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'

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

export async function registerAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!name || !email || !password) {
    throw new Error('이름, 이메일, 비밀번호를 모두 입력해주세요.')
  }

  if (password.length < 8) {
    throw new Error('비밀번호는 8자 이상이어야 합니다. ')
  }

  await createUser({ name, email, password })
  await signIn('credentials', { email, password, redirectTo: '/' })
}

export async function loginAction(formData: FormData) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      redirect('/login?error=1')
    }
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}
