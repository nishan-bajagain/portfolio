"use client"
import { LegacyIcon } from "@/components/legacy-icon"

import { useState, useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

function subscribeToHydration() {
  return () => {}
}

export function Navbar({ isHome = true }: { isHome?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: isHome ? "#home" : "/#home", label: "Home" },
    { href: isHome ? "#about" : "/#about", label: "About" },
    { href: isHome ? "#skills" : "/#skills", label: "Skills" },
    { href: isHome ? "#projects" : "/#projects", label: "Projects" },
    { href: isHome ? "#contact" : "/#contact", label: "Contact" },
  ]

  return (
    <nav aria-label="Primary navigation"
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm" : "bg-transparent",
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="relative group">
              <span className="text-2xl font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg transition-all duration-300 group-hover:scale-105 inline-block">
                NB.
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-track="nav_link"
                  data-track-id={link.label}
                  className="relative text-muted-foreground hover:text-foreground transition-colors duration-300 group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </a>
              ))}

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors duration-300"
                  aria-label="Toggle theme"
                >
                  <LegacyIcon className={cn("text-xl", theme === "dark" ? "ri-sun-line" : "ri-moon-line")} />
                </button>
              )}


            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden min-h-11 min-w-11 p-2 rounded-lg bg-secondary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <LegacyIcon
                className={cn(
                  "text-2xl transition-transform duration-300",
                  isMobileMenuOpen ? "ri-close-line" : "ri-menu-line",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-navigation"
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-track="nav_link"
              data-track-id={link.label}
              className="block px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-4 pt-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors duration-300"
              >
                <LegacyIcon className={cn("text-xl", theme === "dark" ? "ri-sun-line" : "ri-moon-line")} />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
