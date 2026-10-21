import { readFile } from "node:fs/promises"
import { MongoClient } from "mongodb"
import { loadEnv } from "./env.mjs"

await loadEnv()
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.")
const inputPath = process.argv[2]
if (!inputPath) throw new Error("Pass a JSON portfolio file: pnpm seed <portfolio.json>")

const data = JSON.parse(await readFile(inputPath, "utf8"))
if (!data || typeof data !== "object" || !data.personal || !Array.isArray(data.projects)) {
  throw new Error("The seed file must contain a portfolio object with personal and projects fields.")
}

const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
try {
  await client.connect()
  const collection = client.db("portfolio").collection("portfolio")
  if (await collection.findOne({}, { projection: { _id: 1 } })) {
    throw new Error("Portfolio data already exists; refusing to overwrite it.")
  }
  await collection.insertOne({ ...data, updatedAt: new Date().toISOString() })
  console.log("Portfolio data seeded.")
} finally {
  await client.close()
}
