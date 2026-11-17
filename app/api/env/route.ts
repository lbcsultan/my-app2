import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    MONGODB_URI: process.env.MONGODB_URI,
    AUTH_SECRET: process.env.AUTH_SECRET,
  })
}
