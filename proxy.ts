import { randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0]?.toLowerCase() || ""
  if (hostname === "nishanbajagain.com.np") {
    const canonicalUrl = request.nextUrl.clone()
    canonicalUrl.hostname = "www.nishanbajagain.com.np"
    canonicalUrl.protocol = "https:"
    return NextResponse.redirect(canonicalUrl, 308)
  }

  if (hostname.startsWith("admin.")) {
    const rewrittenUrl = request.nextUrl.clone()
    if (rewrittenUrl.pathname === "/") rewrittenUrl.pathname = "/admin/login"
    else if (!rewrittenUrl.pathname.startsWith("/admin")) rewrittenUrl.pathname = `/admin${rewrittenUrl.pathname}`
    return NextResponse.rewrite(rewrittenUrl)
  }

  const nonce = randomBytes(16).toString("base64")
  const reportOnlyCsp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `frame-ancestors 'none'`,
  ].join("; ")
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy-Report-Only", reportOnlyCsp)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set("Content-Security-Policy-Report-Only", reportOnlyCsp)
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico)$).*)"],
}
