"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { usePortfolio } from "@/lib/admin-context"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { messages } = usePortfolio()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const unreadCount = messages.filter((m) => !m.read).length

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "ri-dashboard-line" },
    { href: "/admin/personal", label: "Personal Info", icon: "ri-user-line" },
    { href: "/admin/skills", label: "Skills", icon: "ri-code-s-slash-line" },
    { href: "/admin/projects", label: "Projects", icon: "ri-folder-line" },
    { href: "/admin/experience", label: "Experience", icon: "ri-briefcase-line" },
    { href: "/admin/education", label: "Education", icon: "ri-graduation-cap-line" },
    { href: "/admin/messages", label: "Messages", icon: "ri-mail-line", badge: unreadCount },
    { href: "/admin/analytics", label: "Analytics", icon: "ri-bar-chart-line" },
  ]

  const handleNavClick = () => {
    setIsMobileOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 rounded-lg bg-card border border-border shadow-lg"
        aria-label="Toggle menu"
      >
        <LegacyIcon className={cn("text-xl", isMobileOpen ? "ri-close-line" : "ri-menu-line")} />
      </button>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3" onClick={handleNavClick}>
            <span className="text-xl font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">NB.</span>
            <span className="font-semibold text-foreground">Admin Panel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                <LegacyIcon className={`${item.icon} text-lg`} />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <LegacyIcon className="ri-external-link-line text-lg" />
            <span className="font-medium">View Site</span>
          </Link>

          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LegacyIcon className="ri-user-line text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email || "Admin"}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout()
              handleNavClick()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
          >
            <LegacyIcon className="ri-logout-box-line text-lg" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
