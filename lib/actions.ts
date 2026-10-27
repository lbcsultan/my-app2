'use server'

import { likeProduct as likeProductInDb } from '@/lib/products'
import { revalidatePath } from 'next/cache'
import { createNotice, deleteNotice, getNotice } from './notices'
import { redirect } from 'next/navigation'
import { createUser } from './users'
import { auth, signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'

export async function likeProductAction(id: string) {
  const newLikes = await likeProductInDb(id)
  revalidatePath(`/products/${id}`)
  return newLikes
}

export async function createNoticeAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !content) {
    // 실습 단계의 아주 단순한 검증입니다.
    // 실제 서비스라면 에러 상태를 돌려주고 폼에 메시지를 보여줘야 합니다.
    throw new Error('제목, 내용을 모두 입력해주세요.')
  }

  const notice = await createNotice({
    title,
    content,
    authorId: session.user.id,
    authorName: session.user.name ?? '이름 없음',
  })
  revalidatePath('/notices')
  redirect(`/notices/${notice.id}`)
}

// 삭제 권한 검사가 이번 주의 핵심입니다. 화면에는 작성자 본인 또는
// admin에게만 삭제 버튼이 보이지만(app/notices/[id]/page.tsx), 그건 어디까지나
// 사용자 경험일 뿐입니다. 버튼이 안 보인다고 해서 요청 자체를 막을 수는
// 없습니다 — 개발자 도구나 직접 조작한 요청으로 얼마든지 이 함수를 호출할
// 수 있으므로, 진짜 방어는 반드시 여기, 서버 코드 안에 있어야 합니다.
export async function deleteNoticeAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) {
    throw new Error('잘못된 요청입니다.')
  }

  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const notice = await getNotice(id)
  if (!notice) {
    throw new Error('존재하지 않는 게시글입니다.')
  }

  const isOwner = notice.authorId === session.user.id
  const isAdmin = session.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    throw new Error('삭제 권한이 없습니다.')
  }

  await deleteNotice(id)
  revalidatePath('/notices')
  redirect('/notices')
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
