import "server-only"
import { createHmac } from "node:crypto"
import type { Document } from "mongodb"
import { getJwtSecret } from "@/lib/database"
import { getMongoClient } from "@/lib/mongodb"

export function getRequestIp(request: Request): string {
  return request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
}

export function hashRateLimitKey(value: string): string {
  return createHmac("sha256", getJwtSecret()).update(value).digest("hex")
}

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const client = await getMongoClient()
  const now = new Date()
  const collection = client.db("portfolio").collection<Document & { _id: string }>("rate_limits")
  const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs)
  const filter = { _id: `${key}:${windowStart.getTime()}` }
  const update = {
    $inc: { count: 1 },
    $setOnInsert: { expiresAt: new Date(windowStart.getTime() + windowMs * 2) },
  }
  let result
  try {
    result = await collection.findOneAndUpdate(filter, update, {
      upsert: true,
      returnDocument: "after",
      includeResultMetadata: false,
    })
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error
    result = await collection.findOneAndUpdate(filter, { $inc: { count: 1 } }, {
      returnDocument: "after",
      includeResultMetadata: false,
    })
  }
  return (result?.count ?? 0) <= limit
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return false
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}
