"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function AnalyticsLoader() {
  const pathname = usePathname()
  const previousPath = useRef(pathname)

  useEffect(() => {
    if (pathname.startsWith("/admin")) return
    let cancelled = false
    let started = false
    const start = async () => {
      if (cancelled) return
      const { startAnalytics } = await import("@/lib/analytics/client")
      if (cancelled) return
      if (!started) {
        started = true
        startAnalytics()
      }
    }
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }
    const idleId = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(() => void start(), { timeout: 3000 })
      : window.setTimeout(() => void start(), 1000)
    return () => {
      cancelled = true
      if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
    }
  }, [pathname])

  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    if (pathname.startsWith("/admin")) return
    void import("@/lib/analytics/client").then(({ trackRouteChange }) => trackRouteChange())
  }, [pathname])

  return null
}
