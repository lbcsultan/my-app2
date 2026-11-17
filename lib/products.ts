import { connectDB } from '@/lib/mongodb'
import { Product as ProductModel } from '@/models/Product'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  emoji: string
  stock: number
}

type ProductDoc = {
  _id: unknown
  name: string
  description: string
  price: number
  emoji: string
  stock: number
}

function toProduct(doc: ProductDoc): Product {
  return {
    id: String(doc._id),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    emoji: doc.emoji,
    stock: doc.stock,
  }
}

// 데모용 초기 상품 데이터입니다. 4주차 in-memory 샘플과 겹치는 상품도
// 있지만, 이번엔 실제 컬렉션에 저장되어 여러 사용자/요청이 같은 데이터를
// 공유합니다.
const SEED_PRODUCTS = [
  {
    name: '웹서버보안프로그래밍 머그컵',
    description: '수업 중 마실 커피를 위한 머그컵',
    price: 12000,
    emoji: '☕',
    stock: 42,
  },
  {
    name: 'Next.js 스티커 팩',
    description: '노트북에 붙이는 프레임워크 스티커 모음',
    price: 5000,
    emoji: '🏷️',
    stock: 100,
  },
  {
    name: 'OWASP Top 10 포스터',
    description: '책상 앞에 붙여두는 보안 체크리스트',
    price: 8000,
    emoji: '🛡️',
    stock: 30,
  },
  {
    name: '기계식 키보드',
    description: '타건감 좋은 87키 기계식 키보드',
    price: 89000,
    emoji: '⌨️',
    stock: 15,
  },
  {
    name: '노트북 거치대',
    description: '목/어깨 건강을 지키는 알루미늄 거치대',
    price: 32000,
    emoji: '💻',
    stock: 20,
  },
  {
    name: '노트북 키보드 스킨',
    description: '투명 재질의 부드러운 스킨',
    price: 7000,
    emoji: '💻',
    stock: 30,
  },
]

// 상품 카탈로그는 (공지사항과 달리) 사용자가 아니라 운영자가 채워 넣는
// 데이터입니다. 그래서 9주차에서 없앤 "자동 시드"를 여기서는 다시
// 씁니다 — 컬렉션이 비어있으면 데모 상품으로 자동 채웁니다. 실제
// 서비스라면 관리자 도구나 별도 시드 스크립트가 이 역할을 대신합니다.
async function seedIfEmpty() {
  const count = await ProductModel.countDocuments()
  if (count === 0) {
    await ProductModel.insertMany(SEED_PRODUCTS)
  }
}

export async function getProducts(): Promise<Product[]> {
  await connectDB()
  await seedIfEmpty()
  const docs = await ProductModel.find()
    .sort({ createdAt: 1 })
    .lean<ProductDoc[]>()
  return docs.map(toProduct)
}

export async function getProduct(id: string): Promise<Product | null> {
  await connectDB()
  try {
    const doc = await ProductModel.findById(id).lean<ProductDoc | null>()
    return doc ? toProduct(doc) : null
  } catch {
    // 형식이 잘못된 id(예: 조작된 URL)로 조회하면 Mongoose가 CastError를
    // 던집니다. 존재하지 않는 상품과 동일하게 처리합니다.
    return null
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  await connectDB()
  try {
    const docs = await ProductModel.find({ _id: { $in: ids } }).lean<
      ProductDoc[]
    >()
    return docs.map(toProduct)
  } catch {
    return []
  }
}

// 11주차: 주문이 만들어지면 그만큼 재고를 줄입니다. $inc는 "현재 값을
// 서버가 원자적으로 증감"하는 연산이라, 여러 사용자가 동시에 같은
// 상품을 주문해도 두 요청이 서로의 감소분을 덮어쓰지 않습니다(먼저
// 읽은 값에 -qty를 계산해 다시 쓰는 방식이었다면 경쟁 상태가 생겼을
// 것입니다).
export async function decrementStock(productId: string, qty: number) {
  await connectDB()
  await ProductModel.updateOne({ _id: productId }, { $inc: { stock: -qty } })
}

// ✅ [13주차 · 신규 기능, 처음부터 안전하게 작성] 상품 검색.
//
// 이 함수를 만드는 "위험한" 방법은 사용자가 입력한 검색어를 그대로
// Mongo 쿼리 연산자에 꽂는 것입니다. 예를 들어
//
//   ProductModel.find({ name: { $regex: rawQuery } })
//
// 이렇게 짜면, rawQuery에 정규식 특수문자(`.*`, `(`, `|` 등)가 그대로
// 해석되어 의도치 않은 대량 조회나 서버 부하를 유발할 수 있고, 검색어를
// 문자열이 아니라 객체로 조작해서 보낼 수 있는 경로(예: 폼이 아니라
// API를 직접 호출)가 있다면 `{ "$ne": null }` 같은 값이 그대로 쿼리
// 연산자로 해석되어 인증/조건을 우회하는 "NoSQL Injection"으로
// 이어질 수 있습니다 — SQL Injection의 MongoDB 버전입니다.
//
// 안전하게 만드는 방법은 두 가지를 함께 지키는 것입니다.
// 1) 입력값의 타입을 검증한다 — 반드시 string이어야 하고, 아니면 무시.
// 2) 정규식으로 쓰기 전에 정규식 특수문자를 이스케이프한다 — 사용자
//    입력이 "검색어 텍스트"로만 해석되게 만들고, "정규식 문법"이나
//    "쿼리 연산자"로는 절대 해석되지 않게 만든다.
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function searchProducts(rawQuery: unknown): Promise<Product[]> {
  await connectDB()
  await seedIfEmpty()

  // 타입부터 검증합니다 — searchParams는 URL에서 오는 값이라 항상
  // 문자열이지만, 이 함수를 다른 곳(예: API 라우트)에서도 재사용할 걸
  // 대비해 한 번 더 확인합니다.
  if (typeof rawQuery !== 'string' || rawQuery.trim() === '') {
    return getProducts()
  }

  const safePattern = escapeRegExp(rawQuery.trim())
  const docs = await ProductModel.find({
    name: { $regex: safePattern, $options: 'i' },
  })
    .sort({ createdAt: 1 })
    .lean<ProductDoc[]>()
  return docs.map(toProduct)
}
