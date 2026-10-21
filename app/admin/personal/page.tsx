"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AuthGuard } from "@/components/admin/auth-guard"
import { usePortfolio } from "@/lib/admin-context"

export default function PersonalInfoPage() {
  const { data, updateData } = usePortfolio()
  const [personal, setPersonal] = useState(data.personal)
  const [stats, setStats] = useState(data.stats)
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await updateData({ ...data, personal, stats })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to update personal info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="lg:ml-64">
          <AdminHeader title="Personal Information" />

          <div className="p-4 sm:p-6">
            <form onSubmit={handleSave} className="max-w-4xl space-y-6 sm:space-y-8">
              {/* Basic Info */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <LegacyIcon className="ri-user-line text-primary" />
                  Basic Information
                </h3>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input
                      type="text"
                      value={personal.name}
                      onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={personal.email}
                      onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <input
                      type="text"
                      value={personal.phone}
                      onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <input
                      type="text"
                      value={personal.location}
                      onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-foreground">Bio</label>
                    <textarea
                      rows={4}
                      value={personal.bio}
                      onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-foreground">Who I Am</label>
                    <textarea
                      rows={6}
                      value={personal.whoIAm || ''}
                      onChange={(e) => setPersonal({ ...personal, whoIAm: e.target.value })}
                      placeholder="Detailed description about yourself, your background, and what makes you unique..."
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Avatar URL</label>
                    <input
                      type="text"
                      value={personal.avatar}
                      onChange={(e) => setPersonal({ ...personal, avatar: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">CV URL</label>
                    <input
                      type="text"
                      value={personal.cvUrl}
                      onChange={(e) => setPersonal({ ...personal, cvUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <LegacyIcon className="ri-user-star-line text-primary" />
                  Roles (for typing animation)
                </h3>
                <div className="space-y-3">
                  {personal.roles.map((role, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => {
                          const newRoles = [...personal.roles]
                          newRoles[index] = e.target.value
                          setPersonal({ ...personal, roles: newRoles })
                        }}
                        className="flex-1 px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newRoles = personal.roles.filter((_, i) => i !== index)
                          setPersonal({ ...personal, roles: newRoles })
                        }}
                        className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <LegacyIcon className="ri-delete-bin-line" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPersonal({ ...personal, roles: [...personal.roles, ""] })}
                    className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <LegacyIcon className="ri-add-line" />
                    Add Role
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <LegacyIcon className="ri-share-line text-primary" />
                  Social Links
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <LegacyIcon className="ri-github-fill" />
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={personal.social.github}
                      onChange={(e) =>
                        setPersonal({ ...personal, social: { ...personal.social, github: e.target.value } })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <LegacyIcon className="ri-linkedin-fill" />
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={personal.social.linkedin}
                      onChange={(e) =>
                        setPersonal({ ...personal, social: { ...personal.social, linkedin: e.target.value } })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <LegacyIcon className="ri-facebook-fill" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={personal.social.facebook}
                      onChange={(e) =>
                        setPersonal({ ...personal, social: { ...personal.social, facebook: e.target.value } })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <LegacyIcon className="ri-twitter-x-fill" />
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={personal.social.twitter}
                      onChange={(e) =>
                        setPersonal({ ...personal, social: { ...personal.social, twitter: e.target.value } })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <LegacyIcon className="ri-bar-chart-line text-primary" />
                  Statistics
                </h3>
                <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Years of Experience</label>
                    <input
                      type="number"
                      value={stats.yearsExperience || ''}
                      onChange={(e) => setStats({ ...stats, yearsExperience: Number.parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Projects Completed</label>
                    <input
                      type="number"
                      value={stats.projectsCompleted || ''}
                      onChange={(e) => setStats({ ...stats, projectsCompleted: Number.parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Technologies Used</label>
                    <input
                      type="number"
                      value={stats.technologiesUsed || ''}
                      onChange={(e) => setStats({ ...stats, technologiesUsed: Number.parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button - Made responsive */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  <LegacyIcon className={isLoading ? "ri-loader-4-line animate-spin" : "ri-save-line"} />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                {saved && (
                  <span className="flex items-center justify-center gap-2 text-green-500">
                    <LegacyIcon className="ri-check-line" />
                    Saved successfully!
                  </span>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
