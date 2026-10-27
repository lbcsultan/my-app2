import { model, models, Schema } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    // 권한(RBAC)의 가장 단순한 형태 — 역할이 두 가지뿐입니다.
    // 기본값은 "user"이며, admin은 지금은 DB에서 직접 바꿔서 실습합니다
    // (관리자 승격 화면은 만들지 않습니다 — 그 자체가 공격 표면이 되기 쉽습니다).
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
)

export const User = models.User || model('User', userSchema)
