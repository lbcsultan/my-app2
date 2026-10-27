import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { connectDB } from './lib/mongodb'
import { User } from './models/User'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

// Auth.js(NextAuth) v5 설정 파일입니다. 관례상 프로젝트 루트에 둡니다.
//
// auth.config.ts의 "가벼운" 설정에, 실제 로그인 로직(Credentials Provider)과
// role을 세션에 옮겨 담는 콜백을 더한 "완전한" 버전입니다. 이 파일은
// Server Component / Server Action / Route Handler처럼 Node.js 런타임에서
// 실행되는 곳에서만 import합니다 — 미들웨어(Edge Runtime)에서는 이 파일이
// 아니라 auth.config.ts를 직접 씁니다 (proxy.ts 참고).
type UserDocLike = {
  _id: unknown
  name: string
  email: string
  passwordHash: string
  role?: 'user' | 'admin'
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role ?? 'user',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    ...authConfig.callbacks,
    // authorize()가 반환한 user는 로그인하는 그 순간에만 존재합니다.
    // 그 정보를 jwt 토큰에 옮겨 담아둬야 이후 모든 요청에서 재사용됩니다.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: 'user' | 'admin' }).role ?? 'user'
      }
      return token
    },
    // 토큰의 내용을 실제로 화면 코드가 쓰는 session.user에 옮겨 담습니다.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id)
        session.user.role =
          (token.role as 'user' | 'admin' | undefined) ?? 'user'
      }
      return session
    },
  },
})
