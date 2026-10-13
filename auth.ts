import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { connectDB } from './lib/mongodb'
import { User } from './models/User'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === 'string' ? credentials.email : undefined
        const password =
          typeof credentials?.password === 'string'
            ? credentials.password
            : undefined
        if (!email || !password) return null

        await connectDB()
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        // 여기서 반환하는 값이 세션(JWT)에 담깁니다 — passwordHash는 절대 포함하지 않습니다.
        return { id: String(user._id), name: user.name, email: user.email }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})
