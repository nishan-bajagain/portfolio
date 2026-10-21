"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface AnalyticsDay {
  date: string
  pageviews: number
  uniqueDevices: number
  newDevices: number
  sessions: number
  engagedMs: number
}

export function AnalyticsChart({ data }: { data: AnalyticsDay[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
          <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: 12 }} />
          <Line type="monotone" dataKey="pageviews" stroke="var(--primary)" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="uniqueDevices" stroke="var(--accent)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
