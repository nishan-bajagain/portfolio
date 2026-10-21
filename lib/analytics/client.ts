import type { AnalyticsEvent } from "./schema"
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals"

const DEVICE_KEY = "portfolio-device-id"
const SESSION_KEY = "portfolio-session"
const OWNER_KEY = "portfolio-analytics-off"
const OFFLINE_KEY = "portfolio-offline-events"
const MAX_QUEUE = 50
const SESSION_TIMEOUT = 30 * 60 * 1000

let deviceId: string | undefined
let sessionId = ""
let queue: AnalyticsEvent[] = []
let timer: number | undefined
let scrollDepth = new Set<number>()
let lastActivity = Date.now()
let analyticsStarted = false
let isNewSession = false
let persistentSessionAllowed = false
let optOutStorageCleared = false
let retryDelay = 1000
let jsErrorCount = 0
const seenJsErrors = new Set<string>()

function uuid(): string {
  return crypto.randomUUID()
}

function isOptedOut(): boolean {
  try {
    if (new URLSearchParams(location.search).get("analytics") === "off") {
      localStorage.setItem(OWNER_KEY, "1")
    }
    const optedOut = localStorage.getItem(OWNER_KEY) === "1" || navigator.webdriver || rejectsTracking() ||
      process.env.NEXT_PUBLIC_ANALYTICS_CONSENT_MODE === "off"
    if (optedOut && !optOutStorageCleared) {
      clearStoredAnalytics()
      optOutStorageCleared = true
    }
    return optedOut
  } catch {
    return true
  }
}

function rejectsTracking(): boolean {
  return navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}

function saveDeviceId(id: string): void {
  try {
    localStorage.setItem(DEVICE_KEY, id)
  } catch {
    // The HttpOnly cookie still supports identity when localStorage is unavailable.
  }
}

function clearStoredAnalytics(): void {
  try {
    localStorage.removeItem(DEVICE_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(OFFLINE_KEY)
  } catch {
    // Storage may be unavailable in private browsing.
  }
}

async function establishDeviceId(): Promise<string | undefined> {
  if (rejectsTracking()) return undefined
  let storedId: string | undefined
  try {
    const stored = localStorage.getItem(DEVICE_KEY)
    if (stored && /^[0-9a-f-]{36}$/i.test(stored)) storedId = stored
  } catch {}
  try {
    const response = await fetch("/api/collect", {
      method: "GET",
      headers: storedId ? { "X-Analytics-Device": storedId } : {},
      credentials: "same-origin",
      cache: "no-store",
    })
    if (!response.ok && response.status !== 204) throw new Error(`Analytics identity request failed (${response.status})`)
    if (response.headers.get("x-analytics-identity") !== "allowed") {
      persistentSessionAllowed = false
      clearStoredAnalytics()
      return undefined
    }
    const id = response.headers.get("x-analytics-device")
    if (id && /^[0-9a-f-]{36}$/i.test(id)) {
      persistentSessionAllowed = true
      saveDeviceId(id)
      return id
    }
  } catch {
    persistentSessionAllowed = false
  }
  return undefined
}

function createSession(): string {
  if (!persistentSessionAllowed) {
    if (!sessionId) {
      sessionId = uuid()
      isNewSession = true
    } else {
      isNewSession = false
    }
    return sessionId
  }
  let campaign = ""
  try {
    const params = new URLSearchParams(location.search)
    campaign = ["utm_source", "utm_medium", "utm_campaign"].map((key) => params.get(key) || "").join("|")
  } catch {}

  try {
    const now = Date.now()
    const prior = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as { id: string; last: number; campaign: string } | null
    const freshSession = !prior || now - prior.last > SESSION_TIMEOUT || (campaign !== "" && campaign !== prior.campaign)
    const id = freshSession ? uuid() : prior.id
    isNewSession = freshSession
    sessionId = id
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, last: now, campaign: campaign || prior?.campaign || "" }))
    return id
  } catch {
    sessionId = uuid()
    return sessionId
  }
}

function getPagePath(): string {
  return `${location.pathname}`.slice(0, 160) || "/"
}

function push(type: AnalyticsEvent["type"], props: Record<string, string | number | boolean> = {}): void {
  if (isOptedOut()) return
  const event: AnalyticsEvent = {
    id: uuid(),
    timestamp: Date.now(),
    type,
    path: getPagePath(),
    props,
  }
  queue.push(event)
  if (queue.length >= 10) void flush()
  if (timer === undefined) timer = window.setTimeout(() => void flush(), 5000)
}

function collectPageview(): void {
  const params = new URLSearchParams(location.search)
  const props: Record<string, string | number | boolean> = {
    title: document.title.slice(0, 160),
    referrer: (() => {
      try { return document.referrer ? new URL(document.referrer).hostname.slice(0, 120) : "" } catch { return "" }
    })(),
    viewport: `${Math.round(innerWidth / 100) * 100}x${Math.round(innerHeight / 100) * 100}`,
    screen: `${Math.round(screen.width / 100) * 100}x${Math.round(screen.height / 100) * 100}`,
    dpr: Math.min(4, devicePixelRatio || 1),
    language: navigator.language.slice(0, 20),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone.slice(0, 60),
    theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    displayMode: matchMedia("(display-mode: standalone)").matches ? "standalone" : "browser",
    browser: navigator.userAgent.includes("Firefox") ? "Firefox" :
      navigator.userAgent.includes("Edg/") ? "Edge" :
      navigator.userAgent.includes("Chrome/") ? "Chrome" :
      navigator.userAgent.includes("Safari/") ? "Safari" : "Other",
    os: /Android/i.test(navigator.userAgent) ? "Android" :
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "iOS" :
      /Windows/i.test(navigator.userAgent) ? "Windows" :
      /Mac OS/i.test(navigator.userAgent) ? "macOS" :
      /Linux/i.test(navigator.userAgent) ? "Linux" : "Other",
    touch: navigator.maxTouchPoints > 0,
    effectiveType: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || "unknown",
    saveData: (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData || false,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,
  }
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const value = params.get(key)
    if (value) props[key] = value.slice(0, 100)
  }
  push("pageview", props)
}

async function flush(useBeacon = false): Promise<void> {
  if (timer !== undefined) {
    clearTimeout(timer)
    timer = undefined
  }
  if (queue.length === 0) {
    if (persistentSessionAllowed) {
      try {
        const stored = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]") as AnalyticsEvent[]
        queue = stored.slice(-MAX_QUEUE)
      } catch {}
    }
  }
  if (!queue.length || isOptedOut()) return

  const events = queue.splice(0, 10)
  const body = JSON.stringify({ version: 1, deviceId, sessionId, events })
  if (useBeacon && navigator.sendBeacon) {
    const sent = navigator.sendBeacon("/api/collect", new Blob([body], { type: "text/plain;charset=UTF-8" }))
    if (!sent) queue = [...events, ...queue].slice(-MAX_QUEUE)
  } else {
    try {
      const response = await fetch("/api/collect", {
        method: "POST",
        body,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        credentials: "same-origin",
        keepalive: true,
      })
      if (!response.ok && response.status !== 204) throw new Error(`Analytics request failed (${response.status})`)
      const authoritativeId = response.headers.get("x-analytics-device")
      if (authoritativeId && authoritativeId !== deviceId) {
        deviceId = authoritativeId
        try {
          localStorage.setItem(DEVICE_KEY, authoritativeId)
        } catch {}
      }
      retryDelay = 1000
    } catch {
      queue = [...events, ...queue].slice(-MAX_QUEUE)
      if (persistentSessionAllowed) {
        try {
          localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue))
        } catch {}
      }
      retryDelay = Math.min(retryDelay * 2, 30_000)
    }
  }
  if (queue.length) timer = window.setTimeout(() => void flush(), retryDelay)
  else {
    try {
      localStorage.removeItem(OFFLINE_KEY)
    } catch {}
  }
}

function observeVitals(): void {
  const handleMetric = (metric: Metric) => push("vital", {
    metric: metric.name,
    value: Math.round(metric.value * 100) / 100,
    rating: metric.rating,
  })
  onLCP(handleMetric)
  onINP(handleMetric)
  onCLS(handleMetric)
  onFCP(handleMetric)
  onTTFB(handleMetric)
}

function observeSections(): void {
  const sections = document.querySelectorAll<HTMLElement>("main section[id]")
  if (!("IntersectionObserver" in window)) return
  const seen = new Set<string>()
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !seen.has(entry.target.id)) {
        seen.add(entry.target.id)
        push("section_view", { section: entry.target.id })
      }
    }
  }, { threshold: [0.5] })
  sections.forEach((section) => observer.observe(section))
}

export async function startAnalytics(): Promise<void> {
  if (isOptedOut() || analyticsStarted) return
  if (document.prerendering) {
    document.addEventListener("prerenderingchange", startAnalytics, { once: true })
    return
  }
  analyticsStarted = true
  sessionId = uuid()
  isNewSession = true
  deviceId = await establishDeviceId()
  createSession()
  if (isNewSession) push("session_start")
  collectPageview()
  observeSections()
  observeVitals()

  window.addEventListener("scroll", () => {
    const scrollable = document.documentElement.scrollHeight - innerHeight
    if (scrollable <= 0) return
    const depth = Math.floor((scrollY / scrollable) * 100)
    for (const threshold of [25, 50, 75, 90, 100]) {
      if (depth >= threshold && !scrollDepth.has(threshold)) {
        scrollDepth.add(threshold)
        push("scroll", { depth: threshold })
      }
    }
  }, { passive: true })
  document.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-track]")
    if (target?.dataset.track) push("click", { name: target.dataset.track.slice(0, 60), id: (target.dataset.trackId || "").slice(0, 80) })
  })
  for (const event of ["pointerdown", "keydown", "touchstart", "scroll"]) {
    document.addEventListener(event, () => { lastActivity = Date.now() }, { passive: true })
  }
  const heartbeat = window.setInterval(() => {
    if (document.visibilityState === "visible" && Date.now() - lastActivity < 60_000) {
      push("engagement", { elapsedMs: 15_000 })
    }
  }, 15_000)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush(true)
  })
  window.addEventListener("pagehide", () => {
    window.clearInterval(heartbeat)
    void flush(true)
  })
  window.addEventListener("error", (event) => {
    const message = (event.message || "Script error")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted]")
      .slice(0, 120)
    if (jsErrorCount >= 5 || seenJsErrors.has(message)) return
    jsErrorCount += 1
    seenJsErrors.add(message)
    push("js_error", { error: message })
  })
}

export function trackRouteChange(): void {
  if (!analyticsStarted || isOptedOut()) return
  scrollDepth = new Set()
  lastActivity = Date.now()
  createSession()
  if (isNewSession) push("session_start")
  collectPageview()
  observeSections()
}

export function trackEvent(type: AnalyticsEvent["type"], props: Record<string, string | number | boolean> = {}): void {
  if (!analyticsStarted) {
    void startAnalytics().then(() => push(type, props))
    return
  }
  push(type, props)
}
