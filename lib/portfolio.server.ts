import "server-only"
import { unstable_cache } from "next/cache"
import { defaultPortfolioData } from "@/lib/defaults"
import { getPortfolioData } from "@/lib/database"
import type { PortfolioData } from "@/lib/types"

export const PORTFOLIO_CACHE_TAG = "portfolio"

const getCachedPortfolio = unstable_cache(
  async (): Promise<PortfolioData> => getPortfolioData(),
  ["portfolio-data"],
  { revalidate: 3600, tags: [PORTFOLIO_CACHE_TAG] },
)

export function getPortfolio(): Promise<PortfolioData> {
  return getCachedPortfolio().catch((error: unknown) => {
    console.error("Unable to read portfolio from MongoDB; serving fallback data.", error)
    return defaultPortfolioData
  })
}
