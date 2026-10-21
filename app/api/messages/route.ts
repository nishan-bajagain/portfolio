import { NextRequest, NextResponse } from "next/server"
import { verifyAdminRequest } from "@/lib/auth.server"
import { addMessage, getMessages } from "@/lib/database"
import { contactSchema } from "@/lib/schemas"
import { checkRateLimit, getRequestIp, hashRateLimitKey, isSameOriginRequest } from "@/lib/rate-limit.server"

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" }

export async function GET(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS })
  }
  try {
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || 50)
    const requestedSkip = Number(request.nextUrl.searchParams.get("skip") || 0)
    if (!Number.isInteger(requestedLimit) || !Number.isInteger(requestedSkip) || requestedSkip < 0 || requestedSkip > 100_000) {
      return NextResponse.json({ error: "Invalid pagination values" }, { status: 400, headers: PRIVATE_HEADERS })
    }
    const limit = Math.min(Math.max(requestedLimit, 1), 100)
    const skip = requestedSkip
    const messages = await getMessages(limit, skip)
    return NextResponse.json(messages, { headers: PRIVATE_HEADERS })
  } catch (error) {
    console.error("Messages API GET error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500, headers: PRIVATE_HEADERS })
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403, headers: PRIVATE_HEADERS })
  }
  if (Number(request.headers.get("content-length") || 0) > 8_000) {
    return NextResponse.json({ error: "Request body too large" }, { status: 413, headers: PRIVATE_HEADERS })
  }

  try {
    const body = await request.text()
    if (new TextEncoder().encode(body).length > 8_000) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413, headers: PRIVATE_HEADERS })
    }
    let input: unknown
    try {
      input = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: PRIVATE_HEADERS })
    }
    const parsed = contactSchema.safeParse(input)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid contact form data" }, { status: 400, headers: PRIVATE_HEADERS })
    }
    if (parsed.data.website) {
      return new NextResponse(null, { status: 204, headers: PRIVATE_HEADERS })
    }

    const deviceId = request.cookies.get("device-id")?.value
    const identity = deviceId ? `device:${deviceId}` : `ip:${getRequestIp(request)}`
    const allowed = await checkRateLimit(hashRateLimitKey(`contact:${identity}`), 3, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429, headers: PRIVATE_HEADERS })
    }

    await addMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      date: new Date().toISOString(),
      read: false,
    })
    return new NextResponse(null, { status: 204, headers: PRIVATE_HEADERS })
  } catch (error) {
    console.error("Messages API POST error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500, headers: PRIVATE_HEADERS })
  }
}
