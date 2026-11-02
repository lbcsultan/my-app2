import { cookies } from 'next/headers'

// 장바구니는 로그인 여부와 무관하게 누구나 쓸 수 있어야 하므로
// (실제 쇼핑몰도 비로그인 상태에서 장바구니에 담을 수 있습니다),
// DB 대신 쿠키에 담습니다. httpOnly로 설정해 브라우저 자바스크립트에서
// document.cookie로 직접 읽거나 조작할 수는 없게 하지만, 그렇다고
// "서버가 검증하지 않아도 되는 신뢰할 수 있는 값"이 되는 것은 아닙니다
// — 여전히 쿠키 자체를 직접 편집하는 것은 가능하므로, 실제 수량/재고
// 검증은 lib/actions.ts의 Server Action에서 다시 합니다.
const CART_COOKIE = 'cart'
const CART_MAX_AGE = 60 * 60 * 24 * 30 // 30일

export type CartLine = { productId: string; qty: number }

async function readCart(): Promise<CartLine[]> {
  const store = await cookies()
  const raw = store.get(CART_COOKIE)?.value
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.productId === 'string' &&
        typeof line?.qty === 'number' &&
        line.qty > 0,
    )
  } catch {
    // 쿠키 값이 조작되어 JSON으로 파싱되지 않으면, 에러를 던지는 대신
    // 빈 장바구니로 취급합니다.
    return []
  }
}

async function writeCart(lines: CartLine[]) {
  const store = await cookies()
  store.set(CART_COOKIE, JSON.stringify(lines), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: CART_MAX_AGE,
  })
}

export async function getCartLines(): Promise<CartLine[]> {
  return readCart()
}

export async function getCartCount(): Promise<number> {
  const lines = await readCart()
  return lines.reduce((sum, line) => sum + line.qty, 0)
}

export async function addToCart(productId: string, qty: number) {
  const lines = await readCart()
  const existing = lines.find((line) => line.productId === productId)
  if (existing) {
    existing.qty += qty
  } else {
    lines.push({ productId, qty })
  }
  await writeCart(lines)
}

export async function updateCartQty(productId: string, qty: number) {
  const lines = await readCart()
  const next =
    qty <= 0
      ? lines.filter((line) => line.productId !== productId)
      : lines.map((line) =>
          line.productId === productId ? { ...line, qty } : line,
        )
  await writeCart(next)
}

export async function removeFromCart(productId: string) {
  const lines = await readCart()
  await writeCart(lines.filter((line) => line.productId !== productId))
}
