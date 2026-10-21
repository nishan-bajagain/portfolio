import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from "@/lib/auth.server"

export async function GET(request: NextRequest) {
  const user = verifyAdminRequest(request)
  return NextResponse.json(
    user ? { authenticated: true, user } : { authenticated: false },
    { status: user ? 200 : 401, headers: { "Cache-Control": "private, no-store" } },
  )
}
