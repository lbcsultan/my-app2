import { Schema, model, models } from 'mongoose'

// 상품 카탈로그 스키마입니다. 4주차에서 in-memory 배열로 흉내냈던 상품
// 목록을, 이번 주부터는 공지사항과 마찬가지로 실제 MongoDB 컬렉션으로
// 관리합니다. 이미지 업로드는 이 과목 범위를 벗어나므로, 실제 이미지
// 대신 이모지 하나로 상품을 표시해 실습을 단순화합니다.
const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    emoji: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
)

export const Product = models.Product || model('Product', productSchema)
