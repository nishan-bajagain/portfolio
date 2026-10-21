import type React from "react"
import type { Metadata } from "next"
import type { Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsLoader } from "@/components/analytics-loader"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nishanbajagain.com.np"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nishan Bajagain | Software Developer",
    template: "%s | Nishan Bajagain",
  },
  description: "Passionate software developer exploring new technologies and modern web tools while completing +2 studies. Eager to build impactful projects and grow every day.",
  keywords: ["Software Developer", "Web Developer", "UX/UI Designer", "React", "Next.js", "Portfolio"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Nishan Bajagain",
    title: "Nishan Bajagain | Software Developer",
    description: "Explore software projects, skills, and experience from Nishan Bajagain.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Nishan Bajagain - Software Developer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nishan Bajagain | Software Developer",
    description: "Explore software projects, skills, and experience from Nishan Bajagain.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <AnalyticsLoader />
      </body>
    </html>
  )
}
