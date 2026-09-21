import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: '/api/hello 에서 응답한 JSON 입니다',
    week: 4,
  })
}
