import "server-only"
import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { getJwtSecret } from "@/lib/database"

export interface AdminToken {
  email: string
}

export function verifyAdminRequest(request: NextRequest): AdminToken | null {
  const token = request.cookies.get("admin-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, getJwtSecret())
    if (typeof decoded === "string" || typeof decoded.email !== "string") return null
    return { email: decoded.email }
  } catch {
    return null
  }
}
