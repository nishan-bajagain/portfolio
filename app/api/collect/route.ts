import { after, NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { analyticsBatchSchema } from "@/lib/analytics/schema"
import { recordAnalyticsBatch } from "@/lib/analytics/server"
import { verifyAdminRequest } from "@/lib/auth.server"
import { checkRateLimit, getRequestIp, hashRateLimitKey, isSameOriginRequest } from "@/lib/rate-limit.server"

export const runtime = "nodejs"

const privateHeaders = { "Cache-Control": "private, no-store" }
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function collectionAllowed(request: NextRequest): boolean {
  return process.env.ANALYTICS_CONSENT_MODE !== "off" &&
    request.headers.get("dnt") !== "1" &&
    request.headers.get("sec-gpc") !== "1"
}

function identityAllowed(request: NextRequest): boolean {
  if (!collectionAllowed(request)) return false
  const mode = process.env.ANALYTICS_CONSENT_MODE || "all"
  const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || ""
  const isEuropean = /^(AT|BE|BG|HR|CY|CZ|DK|EE|FI|FR|DE|GR|HU|IS|IE|IT|LV|LI|LT|LU|MT|NL|NO|PL|PT|RO|SK|SI|ES|SE|CH|GB)$/i.test(country)
  return !(mode === "eu-only" && isEuropean && request.cookies.get("analytics-consent")?.value !== "yes")
}

export async function GET(request: NextRequest) {
  const response = new NextResponse(null, { status: 204, headers: privateHeaders })
  if (verifyAdminRequest(request) || request.cookies.get("analytics-owner")?.value === "yes" || !identityAllowed(request)) {
    response.cookies.set("device-id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })
    response.headers.set("X-Analytics-Identity", "off")
    return response
  }

  const cookieId = request.cookies.get("device-id")?.value
  const localId = request.headers.get("x-analytics-device")
  const deviceId = cookieId && uuidPattern.test(cookieId)
    ? cookieId
    : localId && uuidPattern.test(localId)
      ? localId
      : randomUUID()
  response.headers.set("X-Analytics-Identity", "allowed")
  response.headers.set("X-Analytics-Device", deviceId)
  if (deviceId !== cookieId) {
    response.cookies.set("device-id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 400 * 24 * 60 * 60,
      path: "/",
    })
  }
  return response
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request) || (request.headers.get("sec-fetch-site") || "same-origin") !== "same-origin") {
    return new NextResponse(null, { status: 403, headers: privateHeaders })
  }
  if (verifyAdminRequest(request) || request.cookies.get("analytics-owner")?.value === "yes") {
    return new NextResponse(null, { status: 204, headers: privateHeaders })
  }
  if (Number(request.headers.get("content-length") || 0) > 8_000) {
    return new NextResponse(null, { status: 413, headers: privateHeaders })
  }

  const userAgent = request.headers.get("user-agent") || ""
  if (/bot|crawler|spider|headless|preview/i.test(userAgent)) {
    return new NextResponse(null, { status: 204, headers: privateHeaders })
  }

  try {
    const body = await request.text()
    if (new TextEncoder().encode(body).length > 8_000) {
      return new NextResponse(null, { status: 413, headers: privateHeaders })
    }
    let input: unknown
    try {
      input = JSON.parse(body)
    } catch {
      return new NextResponse(null, { status: 400, headers: privateHeaders })
    }
    const parsed = analyticsBatchSchema.safeParse(input)
    if (!parsed.success) {
      return new NextResponse(null, { status: 400, headers: privateHeaders })
    }
    const now = Date.now()
    if (parsed.data.events.some((event) => event.timestamp > now + 5 * 60_000 || event.timestamp < now - 24 * 60 * 60_000)) {
      return new NextResponse(null, { status: 400, headers: privateHeaders })
    }
    const mode = process.env.ANALYTICS_CONSENT_MODE || "all"
    if (!collectionAllowed(request)) return new NextResponse(null, { status: 204, headers: privateHeaders })

    const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || ""
    const isEuropean = /^(AT|BE|BG|HR|CY|CZ|DK|EE|FI|FR|DE|GR|HU|IS|IE|IT|LV|LI|LT|LU|MT|NL|NO|PL|PT|RO|SK|SI|ES|SE|CH|GB)$/i.test(country)
    const consentRequired = mode === "eu-only" && isEuropean && request.cookies.get("analytics-consent")?.value !== "yes"
    const trackingIdentityAllowed = !consentRequired
    const cookieDeviceId = request.cookies.get("device-id")?.value
    const candidateDeviceId = cookieDeviceId || parsed.data.deviceId
    const deviceId = trackingIdentityAllowed && candidateDeviceId && uuidPattern.test(candidateDeviceId)
      ? candidateDeviceId
      : undefined

    const ip = getRequestIp(request)
    if (!(await checkRateLimit(hashRateLimitKey(`analytics-ip:${ip}`), 600, 60_000))) {
      return new NextResponse(null, { status: 429, headers: privateHeaders })
    }
    if (deviceId && !(await checkRateLimit(hashRateLimitKey(`analytics-device:${deviceId}`), 120, 60_000))) {
      return new NextResponse(null, { status: 429, headers: privateHeaders })
    }

    after(async () => {
      try {
        await recordAnalyticsBatch(parsed.data, request, deviceId, trackingIdentityAllowed)
      } catch (error) {
        console.error("Analytics event processing failed.", error)
      }
    })

    const response = new NextResponse(null, { status: 204, headers: privateHeaders })
    if (deviceId && !cookieDeviceId) {
      response.cookies.set("device-id", deviceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 400 * 24 * 60 * 60,
        path: "/",
      })
    }
    if (deviceId) response.headers.set("X-Analytics-Device", deviceId)
    return response
  } catch (error) {
    console.error("Analytics collection request failed.", error)
    return new NextResponse(null, { status: 500, headers: privateHeaders })
  }
}
