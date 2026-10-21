import { MongoClient } from "mongodb"
import { loadEnv } from "./env.mjs"

await loadEnv()
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.")
const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 3000,
})

try {
  await client.connect()
  const db = client.db("portfolio")
  await Promise.all([
    db.collection("messages").createIndex({ date: -1 }),
    db.collection("rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("analytics_events").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("analytics_events").createIndex({ deviceId: 1, timestamp: -1 }),
    db.collection("analytics_events").createIndex({ type: 1, timestamp: -1 }),
    db.collection("analytics_live").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("analytics_fingerprints").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ])
  console.log("Portfolio database indexes are ready.")
} finally {
  await client.close()
}
