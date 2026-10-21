"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import { useState, useEffect } from "react"
import type { PortfolioData } from "@/lib/types"
import Image from "next/image"

export function HeroSection({ data }: { data: PortfolioData }) {

  return (
    <section
      id="home"
      className="relative z-10 min-h-[100dvh] flex items-center pt-20 md:pt-24 lg:pt-28 pb-8 w-full overflow-hidden"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Side - Content */}
            <div className="flex-1 space-y-6 lg:space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-full text-primary">
                <LegacyIcon className="ri-sparkle-line animate-pulse text-sm" />
                <span className="text-xs sm:text-sm font-medium">Make Something Awesome</span>
              </div>

              {/* Heading */}
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground">
                  {"I'm "}
                  <span className="text-primary">{data.personal.name}</span>
                </h1>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-muted-foreground min-h-[1.5em]">
                  <span>A</span>
                  <span className="text-primary font-semibold">
                    <Typewriter roles={data.personal.roles} />
                    <span className="animate-pulse">|</span>
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {data.personal.bio}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <a
                  href="#projects"
                  className="group flex items-center justify-center gap-2 px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all duration-300"
                >
                  <LegacyIcon className="ri-folder-line" />
                  View Projects
                  <LegacyIcon className="ri-arrow-right-line transition-transform group-hover:translate-x-1" />
                </a>
                {data.personal.cvUrl ? <a
                  href={data.personal.cvUrl}
                  download
                  data-track="cv_download"
                  className="group flex items-center justify-center gap-2 px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all duration-300"
                >
                  <LegacyIcon className="ri-download-line" />
                  Download CV
                </a> : null}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-4 sm:pt-8">
                <StatCard value={data.stats.yearsExperience} label="Years Experience" icon="ri-time-line" />
                <StatCard
                  value={data.stats.projectsCompleted}
                  label="Projects Completed"
                  icon="ri-folder-check-line"
                />
                <StatCard
                  value={data.stats.technologiesUsed}
                  label="Technologies"
                  icon="ri-code-s-slash-line"
                />
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative flex justify-center mb-4 lg:mb-0 flex-1 z-0">
              <div className="relative">
                {/* Decorative elements - contained within the image area */}
                <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary)/0.18,transparent_70%)] rounded-3xl -z-10" />
                <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 hidden sm:block w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-primary/20 rounded-full animate-float motion-reduce:animate-none -z-10" />
                <div
                  className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 hidden sm:block w-20 sm:w-32 lg:w-40 h-20 sm:h-32 lg:h-40 bg-accent/20 rounded-full animate-float motion-reduce:animate-none -z-10"
                  style={{ animationDelay: "2s" }}
                />

                {/* Image container */}
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] xl:w-[480px] xl:h-[480px] rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl">
                  <Image
                    src={data.personal.avatar || "/profile.png"}
                    alt={data.personal.name}
                    fill
                    className="object-cover"
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 1280px) 480px, (min-width: 1024px) 400px, (min-width: 768px) 320px, (min-width: 640px) 288px, 224px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Typewriter({ roles }: { roles: string[] }) {
  const firstRole = roles[0] || "Software Developer"
  const [roleIndex, setRoleIndex] = useState(0)
  const [displayText, setDisplayText] = useState(firstRole)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (roles.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const currentRole = roles[roleIndex] || firstRole
    const delay = !isDeleting && displayText === currentRole ? 2000 : isDeleting ? 50 : 100
    const timeout = window.setTimeout(() => {
      if (!isDeleting && displayText === currentRole) {
        setIsDeleting(true)
      } else if (isDeleting && displayText.length === 0) {
        setIsDeleting(false)
        setRoleIndex((index) => (index + 1) % roles.length)
      } else {
        setDisplayText((text) =>
          isDeleting ? text.slice(0, -1) : currentRole.slice(0, text.length + 1),
        )
      }
    }, delay)
    return () => window.clearTimeout(timeout)
  }, [displayText, firstRole, isDeleting, roleIndex, roles])

  return displayText
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  const [count, setCount] = useState(value)

  useEffect(() => {
    const resetFrame = window.requestAnimationFrame(() => setCount(0))
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const finalFrame = window.requestAnimationFrame(() => setCount(value))
      return () => {
        window.cancelAnimationFrame(resetFrame)
        window.cancelAnimationFrame(finalFrame)
      }
    }
    const duration = 2000
    const steps = 50
    const stepValue = value / steps
    const stepDuration = duration / steps
    let current = 0
    const timer = window.setInterval(() => {
      current += stepValue
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => {
      window.cancelAnimationFrame(resetFrame)
      clearInterval(timer)
    }
  }, [value])

  return (
    <div className="text-center p-2.5 sm:p-4 lg:p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
      <LegacyIcon className={`${icon} text-xl sm:text-2xl lg:text-3xl text-primary mb-1 sm:mb-2 block`} />
      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{count}+</div>
      <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">{label}</div>
    </div>
  )
}
