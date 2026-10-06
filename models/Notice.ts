import { model, models, Schema } from 'mongoose'

const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

export const Notice = models.Notice || model('Notice', noticeSchema)
