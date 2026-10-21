import "server-only"

const allowedHosts = new Set(
  (process.env.NEXT_IMAGE_HOSTS || "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean),
)

export function getSafeImageSource(source: string, fallback: string): string {
  if (source.startsWith("/") && !source.startsWith("//") && !source.includes("\\")) return source
  try {
    const url = new URL(source)
    if (url.protocol === "https:" && allowedHosts.has(url.hostname.toLowerCase())) return source
  } catch {
    return fallback
  }
  console.warn("A project image host was not allowed by NEXT_IMAGE_HOSTS; using the local placeholder.")
  return fallback
}
