"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { Activity, Eye, MousePointerClick, Users, UserRoundPlus, Gauge } from "lucide-react"
import { AdminHeader } from "@/components/admin/header"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AuthGuard } from "@/components/admin/auth-guard"
import type { AnalyticsDay } from "@/components/admin/analytics-chart"

const AnalyticsChart = dynamic(
  () => import("@/components/admin/analytics-chart").then((module) => module.AnalyticsChart),
  { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-xl bg-secondary" /> },
)

interface AnalyticsSummary {
  days: AnalyticsDay[]
  totals: Record<string, number>
  activeNow: number
  paths: [string, number][]
  countries: [string, number][]
  clicks: [string, number][]
  sections: [string, number][]
  probableReturning: number
}

const cards = [
  { key: "uniqueDevices", label: "Unique devices", icon: Users },
  { key: "newDevices", label: "New devices", icon: UserRoundPlus },
  { key: "pageviews", label: "Page views", icon: Eye },
  { key: "sessions", label: "Sessions", icon: Activity },
  { key: "engagedMs", label: "Engaged time", icon: Gauge },
  { key: "contactSubmissions", label: "Contact submissions", icon: MousePointerClick },
]

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d")
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [error, setError] = useState("")
  const [ownerMarked, setOwnerMarked] = useState(false)

  const loadSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics/summary?range=${range}`, { cache: "no-store" })
      if (!response.ok) throw new Error(`Analytics request failed (${response.status})`)
      setSummary(await response.json() as AnalyticsSummary)
      setError("")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load analytics.")
    }
  }, [range])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadSummary(), 0)
    const interval = window.setInterval(() => void loadSummary(), 15_000)
    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(interval)
    }
  }, [loadSummary])

  async function markDeviceAsMine() {
    try {
      const response = await fetch("/api/admin/analytics/owner", { method: "POST" })
      if (!response.ok) throw new Error(`Owner opt-out failed (${response.status})`)
      localStorage.setItem("portfolio-analytics-off", "1")
      setOwnerMarked(true)
    } catch (ownerError) {
      setError(ownerError instanceof Error ? ownerError.message : "Unable to mark this device.")
    }
  }

  const values = summary?.totals || {}
  const engagedMs = Number(values.engagedMs || 0)
  const sessions = Number(values.sessions || 0)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="lg:ml-64">
          <AdminHeader title="Analytics" />
          <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Device counts use a random first-party identifier and are best-effort, not fingerprint-based. Cleared
                storage, private browsing, and privacy tools can make a device appear new. Probable returning visits
                are a separate estimate and are never merged with devices.
              </p>
              <div className="flex gap-2">
                <select
                  value={range}
                  onChange={(event) => setRange(event.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2"
                  aria-label="Analytics date range"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button
                  onClick={() => void markDeviceAsMine()}
                  disabled={ownerMarked}
                  className="rounded-lg bg-secondary px-3 py-2 text-sm disabled:opacity-60"
                >
                  {ownerMarked ? "This device is excluded" : "Mark this device as mine"}
                </button>
              </div>
            </div>
            {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map(({ key, label, icon: Icon }) => (
                <div key={key} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-sm">{label}</span>
                    <Icon aria-hidden="true" size={19} />
                  </div>
                  <p className="mt-3 text-3xl font-bold">
                    {key === "uniqueDevices"
                      ? Number(values.uniqueDevices || 0)
                      : key === "engagedMs"
                        ? `${Math.round(engagedMs / Math.max(sessions, 1) / 1000)}s avg`
                        : Number(values[key] || 0)}
                  </p>
                  {key === "uniqueDevices" && summary && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      +{summary.probableReturning} probable returning, shown separately
                    </p>
                  )}
                </div>
              ))}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-sm">Active now</span>
                  <Activity aria-hidden="true" size={19} />
                </div>
                <p className="mt-3 text-3xl font-bold">{summary?.activeNow ?? 0}</p>
              </div>
            </div>
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-semibold">Traffic over time</h2>
              <AnalyticsChart data={summary?.days || []} />
            </section>
            <div className="grid gap-6 lg:grid-cols-2">
              {[
                ["Top paths", summary?.paths || []],
                ["Countries", summary?.countries || []],
                ["Tracked clicks", summary?.clicks || []],
                ["Sections viewed", summary?.sections || []],
              ].map(([title, entries]) => (
                <section key={title as string} className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-4 text-lg font-semibold">{title as string}</h2>
                  <ul className="space-y-2">
                    {(entries as [string, number][]).length
                      ? (entries as [string, number][]).map(([name, count]) => (
                        <li key={name} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
                          <span className="truncate">{name}</span><span className="ml-4 font-medium">{count}</span>
                        </li>
                      ))
                      : <li className="text-sm text-muted-foreground">No events recorded yet.</li>}
                  </ul>
                </section>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Session bounce rate, export, device-level timelines, and percentile Web Vitals are not reported until
              sufficient event data and privacy-safe aggregation are available.
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
