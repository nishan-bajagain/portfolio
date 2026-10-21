"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import type React from "react"

import { useState } from "react"
import { sendMessage } from "@/lib/data"
import type { PortfolioData } from "@/lib/types"

function trackContactEvent(type: "contact_start" | "contact_submit", props: Record<string, string> = {}) {
  void import("@/lib/analytics/client").then(({ trackEvent }) => trackEvent(type, props))
}

export function ContactSection({ data }: { data: PortfolioData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      await sendMessage(formData)
      trackContactEvent("contact_submit", { result: "success" })
      setSubmitted(true)
      setFormData({ name: "", email: "", message: "" })
      setTimeout(() => setSubmitted(false), 5000)
    } catch {
      trackContactEvent("contact_submit", { result: "failure" })
      setError("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-secondary/30 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-[1600px] mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4">
              <LegacyIcon className="ri-mail-line" />
              Get In Touch
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4">
              {"Let's Work Together"}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-sm sm:text-base lg:text-lg">
              Have a project in mind or just want to say hello? Feel free to reach out!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">
                  {"Let's discuss your project"}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base lg:text-lg">
                  {
                    "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions. Let's create something amazing together!"
                  }
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <ContactInfoItem
                  icon="ri-mail-line"
                  label="Email"
                  value={data.personal.email}
                  href={`mailto:${data.personal.email}`}
                />
                <ContactInfoItem
                  icon="ri-phone-line"
                  label="Phone"
                  value={data.personal.phone}
                  href={`tel:${data.personal.phone}`}
                />
                <ContactInfoItem icon="ri-map-pin-line" label="Location" value={data.personal.location} />
              </div>

              {/* Social Links */}
              <div className="pt-4 sm:pt-6">
                <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Follow Me</h4>
                <div className="flex gap-3">
                  {Object.entries(data.personal.social).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="social_link"
                      data-track-id={key}
                      className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-all duration-300"
                      aria-label={key}
                    >
                      <LegacyIcon className={`ri-${key}-fill text-lg sm:text-xl lg:text-2xl`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 md:p-8 lg:p-10">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <LegacyIcon className="ri-error-warning-line" />
                    {error}
                  </p>
                </div>
              )}
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                    <LegacyIcon className="ri-check-line text-3xl sm:text-4xl text-green-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {"Thank you for reaching out. I'll get back to you soon!"}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} onFocus={() => trackContactEvent("contact_start")} className="space-y-5 sm:space-y-6">
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="website">Leave this field blank</label>
                    <input id="website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm sm:text-base font-medium text-foreground">
                      Your Name
                    </label>
                    <div className="relative">
                      <LegacyIcon className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 sm:py-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-foreground text-sm sm:text-base"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm sm:text-base font-medium text-foreground">
                      Your Email
                    </label>
                    <div className="relative">
                      <LegacyIcon className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 sm:py-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-foreground text-sm sm:text-base"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm sm:text-base font-medium text-foreground">
                      Your Message
                    </label>
                    <div className="relative">
                      <LegacyIcon className="ri-message-2-line absolute left-4 top-4 text-muted-foreground" />
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 sm:py-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 resize-none text-foreground text-sm sm:text-base"
                        placeholder="Tell me about your project..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <LegacyIcon className="ri-loader-4-line animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <LegacyIcon className="ri-send-plane-line" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactInfoItem({
  icon,
  label,
  value,
  href,
}: {
  icon: string
  label: string
  value: string
  href?: string
}) {
  const content = (
    <div className="flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <LegacyIcon className={`${icon} text-xl sm:text-2xl text-primary`} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground text-sm sm:text-base lg:text-lg">{value}</p>
      </div>
    </div>
  )

  if (href) {
    return     <a href={href} data-track={label === "Email" ? "email_tap" : "phone_tap"}>{content}</a>
  }

  return content
}
