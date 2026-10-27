import type { NextAuthConfig } from 'next-auth'

// 미들웨어(Edge Runtime)에서도 안전하게 쓸 수 있는 "가벼운" 설정만
// 여기 담습니다. Credentials Provider의 authorize()는 bcrypt/mongoose
// 같은 Node.js 전용 API를 쓰는데, 이런 API는 Edge Runtime에서 아예 실행할
// 수 없습니다 — 그래서 providers는 여기서는 비워두고(실제 로그인 로직은
// auth.ts에만 둡니다), 라우트 보호에 필요한 authorized 콜백만 둡니다.
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // 이 콜백은 요청마다 실행되어 "이 사용자가 이 경로에 들어가도 되는가"를
    // true/false로만 답합니다. false를 반환하면 Auth.js가 자동으로
    // pages.signIn(/login)으로 리다이렉트합니다.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = nextUrl.pathname.startsWith('/notices/new')
      if (isProtectedRoute) return isLoggedIn
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
