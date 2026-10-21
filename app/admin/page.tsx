"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AuthGuard } from "@/components/admin/auth-guard"
import { usePortfolio } from "@/lib/admin-context"
import Link from "next/link"

export default function AdminDashboard() {
  const { data, messages, loading } = usePortfolio()

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <LegacyIcon className="ri-loader-4-line text-4xl animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const stats = [
    {
      label: "Total Projects",
      value: data.projects.length,
      icon: "ri-folder-line",
      color: "bg-blue-500/10 text-blue-500",
      href: "/admin/projects",
    },
    {
      label: "Skills",
      value: data.skills.length,
      icon: "ri-code-s-slash-line",
      color: "bg-green-500/10 text-green-500",
      href: "/admin/skills",
    },
    {
      label: "Experience",
      value: data.experience.length,
      icon: "ri-briefcase-line",
      color: "bg-orange-500/10 text-orange-500",
      href: "/admin/experience",
    },
    {
      label: "Messages",
      value: messages.filter((m) => !m.read).length,
      icon: "ri-mail-line",
      color: "bg-red-500/10 text-red-500",
      href: "/admin/messages",
      suffix: "unread",
    },
  ]

  const quickActions = [
    { label: "Add Project", icon: "ri-add-line", href: "/admin/projects?action=add", color: "bg-primary" },
    { label: "Edit Profile", icon: "ri-user-settings-line", href: "/admin/personal", color: "bg-secondary" },
    { label: "View Messages", icon: "ri-mail-open-line", href: "/admin/messages", color: "bg-secondary" },
    { label: "Manage Skills", icon: "ri-tools-line", href: "/admin/skills", color: "bg-secondary" },
  ]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="lg:ml-64">
          <AdminHeader title="Dashboard" />

          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 sm:p-6 border border-primary/20">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Welcome back, {data.personal.name}!
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                {"Here's what's happening with your portfolio. Manage and update your content from this dashboard."}
              </p>
            </div>

            {/* Stats Grid - Adjusted grid for mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/50 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                        {stat.value}
                        {stat.suffix && (
                          <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1 block sm:inline">
                            {stat.suffix}
                          </span>
                        )}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                    >
                      <LegacyIcon className={`${stat.icon} text-lg sm:text-xl`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions - Adjusted grid for mobile */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl ${action.color} ${action.color === "bg-primary" ? "text-primary-foreground" : "text-secondary-foreground"} hover:opacity-90 transition-all`}
                  >
                    <LegacyIcon className={`${action.icon} text-lg sm:text-xl`} />
                    <span className="font-medium text-sm sm:text-base">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Projects */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Projects</h3>
                  <Link href="/admin/projects" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {data.projects.slice(0, 4).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <LegacyIcon className="ri-folder-line text-lg sm:text-xl text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate text-sm sm:text-base">{project.title}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{project.date}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium hidden sm:block ${
                          project.status === "completed"
                            ? "bg-green-500/10 text-green-500"
                            : project.status === "in-progress"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Messages</h3>
                  <Link href="/admin/messages" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {messages.slice(0, 4).map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3 sm:gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${message.read ? "bg-secondary" : "bg-primary/10"}`}
                      >
                        <LegacyIcon
                          className={`ri-user-line text-sm sm:text-base ${message.read ? "text-muted-foreground" : "text-primary"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm sm:text-base">{message.name}</p>
                          {!message.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{message.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground hidden sm:block">{message.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
