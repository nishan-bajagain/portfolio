import { NextRequest, NextResponse } from 'next/server'
import { createHash } from "node:crypto"
import { revalidateTag } from "next/cache"
import { updatePortfolioData } from '@/lib/database'
import { verifyAdminRequest } from "@/lib/auth.server"
import { portfolioSchema } from "@/lib/schemas"
import { getPortfolio, PORTFOLIO_CACHE_TAG } from "@/lib/portfolio.server"

export async function GET(request: NextRequest) {
  try {
    const data = await getPortfolio()
    const body = JSON.stringify(data)
    const etag = `"${createHash("sha256").update(body).digest("base64url")}"`
    if (request.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400", ETag: etag },
      })
    }
    const response = new NextResponse(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        ETag: etag,
      },
    })
    return response
  } catch (error) {
    console.error('Portfolio API GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (Number(request.headers.get("content-length") || 0) > 1_000_000) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 })
    }
    const body = await request.text()
    if (new TextEncoder().encode(body).length > 1_000_000) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 })
    }
    let input: unknown
    try {
      input = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    const parsed = portfolioSchema.safeParse(input)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid portfolio data", issues: parsed.error.issues }, { status: 400 })
    }

    await updatePortfolioData(parsed.data)
    revalidateTag(PORTFOLIO_CACHE_TAG, "max")
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "private, no-store" } },
    )
  } catch (error) {
    console.error('Portfolio API PUT error:', error)
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}
