import { handlers } from '@/auth' // Referring to the auth.ts we just created

// Auth.js가 로그인/로그아웃/세션 확인 등에 쓰는 모든 요청
// (/api/auth/signin, /api/auth/session, /api/auth/callback/... 등)을
// 이 파일 하나가 전부 처리합니다. auth.ts에서 만든 핸들러를 그대로 내보내기만 하면 됩니다.
export const { GET, POST } = handlers
