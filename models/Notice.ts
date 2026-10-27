import { model, models, Schema } from 'mongoose'

const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    // author: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  },
)

export const Notice = models.Notice || model('Notice', noticeSchema)
