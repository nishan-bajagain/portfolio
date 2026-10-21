import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getAdminCredentials, getJwtSecret } from '@/lib/database'
import { checkRateLimit, getRequestIp, hashRateLimitKey } from '@/lib/rate-limit.server'
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
}).strict()

export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get("content-length") || 0) > 4_000) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 413 })
    }
    const body = await request.text()
    if (new TextEncoder().encode(body).length > 4_000) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 413 })
    }
    let input: unknown
    try {
      input = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }
    const parsed = credentialsSchema.safeParse(input)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }
    const allowed = await checkRateLimit(hashRateLimitKey(`login:${getRequestIp(request)}`), 5, 15 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
    }
    const { email, password } = parsed.data
    const adminData = getAdminCredentials()
    if (email !== adminData.email) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, adminData.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT token with 1 hour expiry
    const token = jwt.sign({ email }, getJwtSecret(), { expiresIn: '1h' })

    const response = NextResponse.json(
      { success: true, user: { email } },
      { headers: { "Cache-Control": "private, no-store" } },
    )
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login failed due to server configuration or database error.", error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
