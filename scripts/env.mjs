import { readFile } from "node:fs/promises"

export async function loadEnv() {
  for (const path of [".env.local", ".env"]) {
    try {
      const contents = await readFile(path, "utf8")
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
        if (!match || Object.hasOwn(process.env, match[1])) continue
        process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2")
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error
    }
  }
}
