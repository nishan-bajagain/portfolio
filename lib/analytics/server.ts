import "server-only"
import { createHmac } from "node:crypto"
import type { Document } from "mongodb"
import { getMongoClient } from "@/lib/mongodb"
import { hashRateLimitKey } from "@/lib/rate-limit.server"
import type { AnalyticsBatch, AnalyticsEvent } from "./schema"

const databaseName = "portfolio"
const retentionDays = Math.min(Math.max(Number(process.env.ANALYTICS_RAW_TTL_DAYS || 90), 1), 365)

function dayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function safeKey(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60) || "other"
}

function getCountry(request: Request): string {
  return (request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "unknown")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2) || "unknown"
}

function getAnalyticsSalt(): string {
  const salt = process.env.ANALYTICS_SALT
  if (!salt || salt.length < 32) {
    throw new Error("ANALYTICS_SALT must be configured with at least 32 characters.")
  }
  return salt
}

function hashedFingerprint(event: AnalyticsEvent, ipPrefixHash: string): string {
  const value = [
    event.props?.browser || "",
    event.props?.os || "",
    event.props?.screen || "",
    event.props?.dpr || "",
    event.props?.timezone || "",
    event.props?.language || "",
    event.props?.touch || "",
    ipPrefixHash,
    new Date().toISOString().slice(0, 7),
  ].join("|")
  return createHmac("sha256", getAnalyticsSalt()).update(value).digest("hex")
}

async function recordEvent(
  batch: AnalyticsBatch,
  event: AnalyticsEvent,
  deviceId: string | undefined,
  country: string,
  ipPrefixHash: string,
  allowFingerprint: boolean,
): Promise<void> {
  const client = await getMongoClient()
  const db = client.db(databaseName)
  const session = client.startSession()
  const day = dayKey(event.timestamp)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000)
  const events = db.collection<Document & { _id: string }>("analytics_events")
  const daily = db.collection<Document & { _id: string }>("stats_daily")

  try {
    await session.withTransaction(async () => {
      await events.insertOne({
        _id: event.id,
        deviceId: deviceId || null,
        sessionId: batch.sessionId,
        type: event.type,
        path: event.path,
        props: event.props || {},
        country,
        timestamp: new Date(event.timestamp),
        expiresAt,
      }, { session })

      const increments: Record<string, number> = { [`eventTypes.${safeKey(event.type)}`]: 1 }
      if (event.type === "pageview") increments.pageviews = 1
      if (event.type === "session_start") increments.sessions = 1
      if (event.type === "contact_submit") increments.contactSubmissions = 1
      if (event.type === "engagement") {
        const elapsedMs = Number(event.props?.elapsedMs || 0)
        increments.engagedMs = Math.min(Math.max(elapsedMs, 0), 15_000)
      }
      if (event.type === "pageview" || event.type === "click" || event.type === "section_view") {
        const field = event.type === "pageview" ? "paths" : event.type === "click" ? "clicks" : "sections"
        const value = event.type === "pageview"
          ? event.path
          : String(event.props?.name || event.props?.section || "other")
        increments[`${field}.${safeKey(value)}`] = 1
      }
      increments[`countries.${safeKey(country)}`] = 1
      if (event.type === "vital") {
        const metric = safeKey(String(event.props?.metric || "other"))
        const value = Number(event.props?.value || 0)
        increments[`vitals.${metric}.count`] = 1
        increments[`vitals.${metric}.sum`] = value
      }

      if (deviceId) {
        const devices = db.collection<Document & { _id: string }>("devices")
        const deviceResult = await devices.updateOne(
          { _id: deviceId },
          {
            $setOnInsert: {
              firstSeen: now,
              firstPath: event.path,
              firstCountry: country,
              firstReferrer: String(event.props?.referrer || "").slice(0, 120),
              firstUtmSource: String(event.props?.utm_source || "").slice(0, 100),
            },
            $set: { lastSeen: now, country },
            ...(event.type === "pageview" ? { $inc: { pageviews: 1 } } : {}),
          },
          { upsert: true, session },
        )
        if (deviceResult.upsertedCount === 1) increments.newDevices = 1
        if (event.type === "pageview") {
          const dayResult = await db.collection<Document & { _id: string }>("device_days").updateOne(
            { _id: `${day}:${deviceId}` },
            { $setOnInsert: { deviceId, day, firstSeen: now } },
            { upsert: true, session },
          )
          if (dayResult.upsertedCount === 1) increments.uniqueDevices = 1
        }
        if (event.type === "session_start") {
          await devices.updateOne({ _id: deviceId }, { $inc: { visits: 1 } }, { session })
        }
        await db.collection<Document & { _id: string }>("analytics_live").updateOne(
          { _id: deviceId },
          { $set: { lastSeen: now, expiresAt: new Date(now.getTime() + 5 * 60_000) } },
          { upsert: true, session },
        )
      } else if (allowFingerprint && event.type === "pageview") {
        const fingerprint = hashedFingerprint(event, ipPrefixHash)
        const probable = await db.collection<Document & { _id: string }>("analytics_fingerprints").updateOne(
          { _id: fingerprint },
          { $setOnInsert: { firstSeen: now, expiresAt: new Date(now.getTime() + 24 * 60 * 60_000) } },
          { upsert: true, session },
        )
        if (probable.upsertedCount === 0) increments.probableReturning = 1
      }

      await daily.updateOne(
        { _id: day },
        { $inc: increments, $setOnInsert: { day, createdAt: now } },
        { upsert: true, session },
      )
    })
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error
  } finally {
    await session.endSession()
  }
}

export async function recordAnalyticsBatch(
  batch: AnalyticsBatch,
  request: Request,
  deviceId?: string,
  allowFingerprint = true,
): Promise<void> {
  const country = getCountry(request)
  const rawIp = request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  const ipPrefix = rawIp.includes(".")
    ? `${rawIp.split(".").slice(0, 3).join(".")}.0/24`
    : `${rawIp.split(":").slice(0, 3).join(":")}::/48`
  const ipPrefixHash = allowFingerprint
    ? createHmac("sha256", getAnalyticsSalt())
      .update(`${new Date().toISOString().slice(0, 7)}|${ipPrefix}`)
      .digest("hex")
    : ""
  for (const event of batch.events) {
    await recordEvent(batch, event, deviceId, country, ipPrefixHash, allowFingerprint)
  }
}

export function hashAnalyticsRateKey(value: string): string {
  return hashRateLimitKey(`analytics:${value}`)
}
