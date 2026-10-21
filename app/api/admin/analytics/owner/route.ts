import { NextRequest, NextResponse } from "next/server"
import { verifyAdminRequest } from "@/lib/auth.server"

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } })
  }
  const response = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "private, no-store" } },
  )
  response.cookies.set("analytics-owner", "yes", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 400 * 24 * 60 * 60,
    path: "/",
  })
  return response
}
