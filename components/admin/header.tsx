"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { usePortfolio } from "@/lib/admin-context"
import Link from "next/link"

function subscribeToHydration() {
  return () => {}
}

export function AdminHeader({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false)
  const { messages } = usePortfolio()

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {title && <h1 className="text-xl sm:text-2xl font-bold text-foreground pl-12 lg:pl-0">{title}</h1>}

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <Link
            href="/admin/messages"
            className="relative p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <LegacyIcon className="ri-notification-3-line text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Toggle theme"
            >
              <LegacyIcon className={`text-xl ${theme === "dark" ? "ri-sun-line" : "ri-moon-line"}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
