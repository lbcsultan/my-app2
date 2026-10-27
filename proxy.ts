// export { auth as proxy } from '@/auth'

import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Next.js 16부터 이 파일의 이름이 middleware.ts에서 proxy.ts로 바뀌었습니다
// (기능은 동일합니다 — 요청이 페이지에 도달하기 전에 먼저 실행됩니다).
//
// 여기서는 auth.ts 전체가 아니라 auth.config.ts만 사용합니다. auth.ts에는
// mongoose/bcrypt를 쓰는 Credentials Provider가 들어있는데, 이 파일들은
// Node.js 전용이라 이 파일이 실행되는 Edge Runtime에서는 아예 동작하지
// 않습니다. proxy.ts는 세션 쿠키를 읽고 authConfig의 authorized 콜백으로
// "들어가도 되는지"만 판단하면 되므로, 무거운 로그인 로직 없이 이 정도로
// 충분합니다.
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ['/notices/new'],
}
