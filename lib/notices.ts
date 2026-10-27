import { Notice as NoticeModel } from '@/models/Notice'
import { connectDB } from './mongodb'

export type Notice = {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
}

type NoticeDocLike = {
  _id: unknown
  title: string
  content: string
  authorId: unknown
  authorName: string
  createdAt?: Date
}

function toNotice(doc: NoticeDocLike): Notice {
  return {
    id: String(doc._id),
    title: doc.title,
    content: doc.content,
    authorId: String(doc.authorId),
    authorName: doc.authorName,
    createdAt: (doc.createdAt ?? new Date()).toISOString().slice(0, 10),
  }
}

export async function getNotices(): Promise<Notice[]> {
  await connectDB()
  const docs = await NoticeModel.find().sort({ createdAt: -1 }).lean()
  return docs.map((doc) => toNotice(doc as NoticeDocLike))
}

export async function getNotice(id: string): Promise<Notice | undefined> {
  await connectDB()
  try {
    const doc = await NoticeModel.findById(id).lean()
    return doc ? toNotice(doc as NoticeDocLike) : undefined
  } catch {
    return undefined
  }
}

export async function createNotice(input: {
  title: string
  content: string
  authorId: string
  authorName: string
}): Promise<Notice> {
  await connectDB()
  const doc = await NoticeModel.create(input)
  return toNotice(doc)
}

// 삭제는 아무나 호출할 수 있는 함수가 아닙니다 — 이 함수 자체는 그냥
// DB에서 지우기만 할 뿐이고, "지울 권한이 있는가"는 반드시 호출하는 쪽
// (lib/actions.ts의 deleteNoticeAction)에서 먼저 확인해야 합니다.
export async function deleteNotice(id: string): Promise<void> {
  await connectDB()
  await NoticeModel.findByIdAndDelete(id)
}
