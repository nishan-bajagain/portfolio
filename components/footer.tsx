import { LegacyIcon } from "@/components/legacy-icon"
import Link from "next/link"
import type { PortfolioData } from "@/lib/types"

export function Footer({ data, isHome = true }: { data: PortfolioData; isHome?: boolean }) {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: isHome ? "#home" : "/#home", label: "Home" },
    { href: isHome ? "#about" : "/#about", label: "About" },
    { href: isHome ? "#skills" : "/#skills", label: "Skills" },
    { href: isHome ? "#projects" : "/#projects", label: "Projects" },
    { href: isHome ? "#contact" : "/#contact", label: "Contact" },
  ]

  return (
    <footer className="bg-card border-t border-border w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-[1600px] mx-auto">
          {/* Main Footer Content */}
          <div className="py-10 sm:py-12 lg:py-16 grid sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="space-y-4 sm:col-span-2 md:col-span-1">
              <Link href="/" className="inline-block">
                <span className="text-2xl lg:text-3xl font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">
                  NB.
                </span>
              </Link>
              <p className="text-muted-foreground text-sm lg:text-base max-w-xs">
                Crafting digital experiences with passion and precision. Let&apos;s build something amazing together.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {Object.entries(data.personal.social).map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="social_link"
                    data-track-id={key}
                    className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    aria-label={key}
                  >
                    <LegacyIcon className={`ri-${key}-fill text-base lg:text-lg`} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 lg:mb-6 flex items-center gap-2 text-base lg:text-lg">
                <LegacyIcon className="ri-links-line text-primary" />
                Quick Links
              </h3>
              <ul className="space-y-2 lg:space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm lg:text-base"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 lg:mb-6 flex items-center gap-2 text-base lg:text-lg">
                <LegacyIcon className="ri-contacts-line text-primary" />
                Contact
              </h3>
              <ul className="space-y-3 lg:space-y-4 text-sm lg:text-base">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <LegacyIcon className="ri-mail-line text-primary" />
                  <a href={`mailto:${data.personal.email}`} data-track="email_tap">{data.personal.email}</a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <LegacyIcon className="ri-phone-line text-primary" />
                  <a href={`tel:${data.personal.phone}`} data-track="phone_tap">{data.personal.phone}</a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <LegacyIcon className="ri-map-pin-line text-primary" />
                  {data.personal.location}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm lg:text-base text-muted-foreground">
              © {currentYear} {data.personal.name}. All rights reserved.
            </p>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
            <p className="text-sm lg:text-base text-muted-foreground flex items-center gap-1">
              Crafted with <LegacyIcon className="ri-heart-fill text-red-500" /> using Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
