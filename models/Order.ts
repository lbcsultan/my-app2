import { Schema, model, models } from 'mongoose'

// 주문에 담긴 상품 한 줄입니다. Product를 참조(ref)만 하지 않고
// name/price를 이 시점 그대로 복사해서 저장합니다 — 나중에 상품 가격이
// 바뀌거나 상품이 삭제되어도, 이미 만들어진 주문 내역은 "그 당시 얼마에
// 샀는지"를 그대로 보존해야 하기 때문입니다(실제 커머스의 표준 관행).
const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

export const Order = models.Order || model('Order', orderSchema)
