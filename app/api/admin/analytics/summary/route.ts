import { NextRequest, NextResponse } from "next/server"
import type { Document } from "mongodb"
import { verifyAdminRequest } from "@/lib/auth.server"
import { getMongoClient } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } })
  }

  try {
    const range = request.nextUrl.searchParams.get("range")
    const days = range === "30d" ? 30 : range === "90d" ? 90 : 7
    const start = new Date()
    start.setUTCDate(start.getUTCDate() - (days - 1))
    const startDay = start.toISOString().slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)
    const client = await getMongoClient()
    const db = client.db("portfolio")
    const records = await db.collection<Document & { _id: string }>("stats_daily")
      .find({ _id: { $gte: startDay, $lte: today } })
      .sort({ _id: 1 })
      .toArray()
    const totals = records.reduce<Record<string, number>>((result, record) => {
      for (const [key, value] of Object.entries(record)) {
        if (typeof value === "number") result[key] = (result[key] || 0) + value
      }
      return result
    }, {})
    const uniqueDeviceCounts = await db.collection<Document & { _id: string }>("device_days").aggregate([
      { $match: { day: { $gte: startDay, $lte: today } } },
      { $group: { _id: "$deviceId" } },
      { $count: "count" },
    ]).toArray()
    totals.uniqueDevices = Number(uniqueDeviceCounts[0]?.count || 0)
    const activeNow = await db.collection("analytics_live").countDocuments({ expiresAt: { $gt: new Date() } })
    const breakdown = (name: string) => {
      const counts: Record<string, number> = {}
      for (const record of records) {
        const values = record[name]
        if (values && typeof values === "object") {
          for (const [key, value] of Object.entries(values)) {
            if (typeof value === "number") counts[key] = (counts[key] || 0) + value
          }
        }
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    }
    return NextResponse.json(
      {
        days: records.map((record) => ({
          date: record._id,
          pageviews: Number(record.pageviews || 0),
          uniqueDevices: Number(record.uniqueDevices || 0),
          newDevices: Number(record.newDevices || 0),
          sessions: Number(record.sessions || 0),
          engagedMs: Number(record.engagedMs || 0),
        })),
        totals,
        activeNow,
        paths: breakdown("paths"),
        countries: breakdown("countries"),
        clicks: breakdown("clicks"),
        sections: breakdown("sections"),
        probableReturning: Number(totals.probableReturning || 0),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    )
  } catch (error) {
    console.error("Analytics summary request failed.", error)
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    )
  }
}
