import type { DefaultSession } from 'next-auth'

// Auth.js의 기본 Session/User/JWT 타입에는 id, role이 없습니다.
// 이 파일로 타입을 "확장"해서, session.user.id / session.user.role을
// 어디서든 타입 에러 없이 쓸 수 있게 합니다. (파일 내용을 직접 쓰지 않아도
// TypeScript가 자동으로 이 선언을 인식합니다 — declare module 패턴)
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'user' | 'admin'
    } & DefaultSession['user']
  }

  interface User {
    role?: 'user' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: 'user' | 'admin'
  }
}
