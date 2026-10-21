"use client"

import { useState } from "react"
import Link from "next/link"

export default function PrivacyPage() {
  const [consentSaved, setConsentSaved] = useState(false)
  const [error, setError] = useState("")

  async function allowAnalytics() {
    setError("")
    try {
      const response = await fetch("/api/analytics-consent", { method: "POST" })
      if (!response.ok) throw new Error(`Consent update failed (${response.status})`)
      setConsentSaved(true)
      window.setTimeout(() => window.location.reload(), 750)
    } catch {
      setError("Unable to save your preference. Please try again.")
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-16">
      <Link className="text-primary underline" href="/">Back to portfolio</Link>
      <h1 className="mt-8 text-4xl font-bold">Privacy and analytics</h1>
      <p className="mt-5 leading-relaxed text-muted-foreground">
        This site uses first-party analytics to understand page visits and improve the portfolio. It does not record
        contact-form contents or store raw IP addresses. Anonymous device identifiers are random and are used to count
        repeat visits; a salted, coarse signal may separately estimate probable returning visits where identity
        tracking is permitted. That estimate is not used to merge devices.
      </p>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        You can opt out with the <code>?analytics=off</code> query parameter. Do Not Track and Global Privacy Control
        disable analytics collection. In EU/UK regions, device identification and probable-returning estimates stay
        disabled until you consent. Browser storage can be cleared or unavailable, so exact one-device counting
        cannot be guaranteed.
      </p>
      <button
        className="mt-7 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground"
        onClick={() => void allowAnalytics()}
      >
        Allow analytics on this browser
      </button>
      {consentSaved && <p className="mt-3 text-sm text-green-700">Your preference has been saved.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </main>
  )
}
