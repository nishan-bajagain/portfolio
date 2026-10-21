import { NextRequest, NextResponse } from "next/server"
import { isSameOriginRequest } from "@/lib/rate-limit.server"

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 })
  }
  const response = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "private, no-store" } },
  )
  response.cookies.set("analytics-consent", "yes", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 180 * 24 * 60 * 60,
    path: "/",
  })
  return response
}
