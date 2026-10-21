import type { MetadataRoute } from "next"
import { getPortfolio } from "@/lib/portfolio.server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nishanbajagain.com.np"
  const portfolio = await getPortfolio()
  const lastModified = portfolio.updatedAt ? new Date(portfolio.updatedAt) : undefined
  return [
    { url: new URL("/", siteUrl).toString(), lastModified },
    { url: new URL("/projects", siteUrl).toString(), lastModified },
  ]
}
