import { connectDB } from '@/lib/mongodb'
import { Order as OrderModel } from '@/models/Order'

export type OrderItem = {
  productId: string
  name: string
  price: number
  qty: number
}

export type Order = {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  createdAt: string
}

type OrderDoc = {
  _id: unknown
  userId: unknown
  items: { productId: unknown; name: string; price: number; qty: number }[]
  total: number
  createdAt: Date
}

function toOrder(doc: OrderDoc): Order {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    items: doc.items.map((i) => ({
      productId: String(i.productId),
      name: i.name,
      price: i.price,
      qty: i.qty,
    })),
    total: doc.total,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function createOrder(
  userId: string,
  items: OrderItem[],
): Promise<Order> {
  await connectDB()
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const doc = await OrderModel.create({ userId, items, total })
  return toOrder(doc.toObject())
}

// 로그인한 사용자 본인의 주문만 조회합니다 — userId를 쿼리 조건에 직접
// 넣는 것이 핵심입니다. "주문 id만 알면 아무나 볼 수 있는" IDOR
// (Insecure Direct Object Reference) 취약점을 여기서 미리 막아둔
// 형태이며, 12~14주차 OWASP 실습에서 이 패턴을 일부러 깨보고 다시
// 고치는 실습을 합니다.
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  await connectDB()
  const docs = await OrderModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean<OrderDoc[]>()
  return docs.map(toOrder)
}

export async function getOrder(id: string): Promise<Order | null> {
  await connectDB()
  try {
    const doc = await OrderModel.findById(id).lean<OrderDoc | null>()
    return doc ? toOrder(doc) : null
  } catch {
    return null
  }
}
