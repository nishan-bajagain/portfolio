"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AuthGuard } from "@/components/admin/auth-guard"
import { usePortfolio } from "@/lib/admin-context"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
  const { messages, markMessageRead: setMessageRead, deleteMessage: removeMessage, refreshMessages } = usePortfolio()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  useEffect(() => {
    // Refresh messages when the page loads
    refreshMessages()
  }, [refreshMessages])

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read
    if (filter === "read") return m.read
    return true
  })

  const selectedMessage = messages.find((m) => m.id === selectedId)

  const deleteMessage = async (id: string) => {
    await removeMessage(id)
    if (selectedId === id) {
      setSelectedId(null)
    }
  }

  const handleSelect = async (id: string) => {
    setSelectedId(id)
    const message = messages.find((m) => m.id === id)
    if (message && !message.read) {
      await setMessageRead(id, true)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      void deleteMessage(id)
      if (selectedId === id) setSelectedId(null)
    }
  }

  const handleBack = () => {
    setSelectedId(null)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="lg:ml-64">
          <AdminHeader title="Messages" />

          <div className="p-4 sm:p-6">
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 h-auto lg:h-[calc(100vh-180px)]">
              {/* Messages List - Hidden on mobile when message is selected */}
              <div
                className={cn(
                  "lg:col-span-1 bg-card border border-border rounded-xl flex flex-col",
                  selectedId ? "hidden lg:flex" : "flex",
                )}
              >
                {/* Filter */}
                <div className="p-3 sm:p-4 border-b border-border">
                  <div className="flex gap-2">
                    {(["all", "unread", "read"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all capitalize",
                          filter === f
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto max-h-[50vh] lg:max-h-none">
                  {filteredMessages.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <LegacyIcon className="ri-mail-line text-4xl mb-2 block" />
                      No messages found
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleSelect(message.id)}
                        className={cn(
                          "p-3 sm:p-4 border-b border-border cursor-pointer transition-colors",
                          selectedId === message.id ? "bg-primary/10" : "hover:bg-secondary/50",
                          !message.read && "bg-primary/5",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0",
                              message.read ? "bg-secondary" : "bg-primary/20",
                            )}
                          >
                            <LegacyIcon
                              className={cn(
                                "ri-user-line text-sm sm:text-base",
                                message.read ? "text-muted-foreground" : "text-primary",
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  "font-medium truncate text-sm sm:text-base",
                                  !message.read && "text-primary",
                                )}
                              >
                                {message.name}
                              </p>
                              {!message.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{message.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{message.date}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Message Detail - Full width on mobile when selected */}
              <div
                className={cn(
                  "lg:col-span-2 bg-card border border-border rounded-xl flex flex-col",
                  selectedId ? "flex" : "hidden lg:flex",
                )}
              >
                {selectedMessage ? (
                  <>
                    <div className="p-4 sm:p-6 border-b border-border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* Back button for mobile */}
                          <button
                            onClick={handleBack}
                            className="lg:hidden p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                          >
                            <LegacyIcon className="ri-arrow-left-line" />
                          </button>
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <LegacyIcon className="ri-user-line text-lg sm:text-2xl text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-xl font-semibold text-foreground truncate">
                              {selectedMessage.name}
                            </h3>
                            <a
                              href={`mailto:${selectedMessage.email}`}
                              className="text-primary hover:underline text-sm sm:text-base truncate block"
                            >
                              {selectedMessage.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a
                            href={`mailto:${selectedMessage.email}`}
                            className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
                          >
                            <LegacyIcon className="ri-reply-line text-lg" />
                          </a>
                          <button
                            onClick={() => handleDelete(selectedMessage.id)}
                            className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            <LegacyIcon className="ri-delete-bin-line text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                        Received on {selectedMessage.date}
                      </p>
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <LegacyIcon className="ri-mail-open-line text-5xl sm:text-6xl mb-4 block" />
                      <p className="text-sm sm:text-base">Select a message to view</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
