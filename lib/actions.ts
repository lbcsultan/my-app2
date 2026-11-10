'use server'

import { revalidatePath } from 'next/cache'
import { createNotice, deleteNotice, getNotice } from './notices'
import { redirect } from 'next/navigation'
import { createUser } from './users'
import { auth, signIn, signOut } from '@/auth'
import { AuthError } from 'next-auth'
import { decrementStock, getProduct, getProductsByIds } from './products'
import {
  addToCart,
  clearCart,
  getCartLines,
  removeFromCart,
  updateCartQty,
} from './cart'
import { createOrder } from './orders'

// 10주차부터 상품 목록/상세 페이지는 "좋아요" 대신 실제 장바구니 담기를
// 지원합니다. 폼에서 넘어온 수량(qty)을 그대로 믿지 않고, 실제 재고를
// 다시 조회해서 그 범위 안으로 맞춥니다 — "클라이언트가 보낸 값은 항상
// 조작될 수 있다"는 9주차의 교훈이 장바구니에도 그대로 적용됩니다.
export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get('productId') ?? '')
  const requestedQty = Math.max(1, Number(formData.get('qty') ?? 1) || 1)
  if (!productId) {
    throw new Error('잘못된 상품입니다.')
  }

  const product = await getProduct(productId)
  if (!product || product.stock === 0) {
    throw new Error('담을 수 없는 상품입니다.')
  }

  const qty = Math.min(requestedQty, product.stock)
  await addToCart(productId, qty)

  // 장바구니 개수 배지는 모든 페이지의 SiteHeader(루트 레이아웃)에 있으므로,
  // 특정 경로가 아니라 레이아웃 자체를 다시 그리도록 알려줘야 합니다.
  revalidatePath('/', 'layout')
}

export async function updateCartQtyAction(formData: FormData) {
  const productId = String(formData.get('productId') ?? '')
  const requestedQty = Number(formData.get('qty') ?? 0)
  if (!productId) {
    throw new Error('잘못된 상품입니다.')
  }

  if (requestedQty <= 0) {
    await removeFromCart(productId)
  } else {
    const product = await getProduct(productId)
    const qty = product ? Math.min(requestedQty, product.stock) : requestedQty
    await updateCartQty(productId, qty)
  }

  revalidatePath('/', 'layout')
}

export async function removeFromCartAction(formData: FormData) {
  const productId = String(formData.get('productId') ?? '')
  if (!productId) {
    throw new Error('잘못된 상품입니다.')
  }
  await removeFromCart(productId)
  revalidatePath('/', 'layout')
}

// 11주차: 장바구니를 실제 주문으로 바꿉니다. 결제 대행사 연동은 이
// 과목 범위 밖이므로 "결제하기"는 곧바로 주문을 만드는 것으로
// 단순화합니다. 핵심은 결제 자체가 아니라, 아래 세 가지입니다.
//
// 1) 로그인하지 않으면 애초에 주문을 만들 수 없다 (인증)
// 2) 가격/이름은 쿠키(클라이언트가 들고 있는 값)가 아니라 DB에서
//    다시 조회해 채운다 (가격 변조 방지 — 10주차 lib/cart.ts와 같은 원칙)
// 3) 주문에는 반드시 로그인한 사용자의 id가 서버에서 채워진다
//    (다른 사람 이름으로 주문을 만들 수 없게)
export async function checkoutAction() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const lines = await getCartLines()
  if (lines.length === 0) {
    throw new Error('장바구니가 비어 있습니다.')
  }

  const products = await getProductsByIds(lines.map((line) => line.productId))
  const items = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId)
      if (!product) return null
      // 재고를 다시 한 번 이 시점 기준으로 강제합니다 — 장바구니에
      // 담아둔 사이 재고가 줄어들었을 수도 있습니다.
      const qty = Math.min(line.qty, product.stock)
      if (qty <= 0) return null
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        qty,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (items.length === 0) {
    throw new Error('주문할 수 있는 상품이 없습니다(품절되었을 수 있습니다).')
  }

  const order = await createOrder(session.user.id, items)
  await Promise.all(
    items.map((item) => decrementStock(item.productId, item.qty)),
  )
  await clearCart()

  revalidatePath('/', 'layout')
  revalidatePath('/orders')
  redirect(`/orders/${order.id}`)
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
