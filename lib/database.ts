import "server-only"
import { ObjectId } from "mongodb"
import type { Collection } from "mongodb"
import type { Message, PortfolioData } from "@/lib/types"
import { getMongoClient } from "@/lib/mongodb"

const DB_NAME = "portfolio"

interface MessageDocument extends Omit<Message, "id"> {
  _id: ObjectId
}

async function getCollection<T extends object>(name: string): Promise<Collection<T>> {
  const client = await getMongoClient()
  return client.db(DB_NAME).collection<T>(name)
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const collection = await getCollection<PortfolioData & { _id?: ObjectId }>("portfolio")
  const portfolio = await collection.findOne({})
  if (!portfolio) {
    throw new Error("Portfolio data has not been configured in MongoDB.")
  }
  const { _id: discardedId, ...data } = portfolio
  void discardedId
  return data
}

export async function updatePortfolioData(data: PortfolioData): Promise<void> {
  const collection = await getCollection<PortfolioData>("portfolio")
  await collection.replaceOne({}, { ...data, updatedAt: new Date().toISOString() }, { upsert: true })
}

export async function getMessages(limit = 100, skip = 0): Promise<Message[]> {
  const collection = await getCollection<MessageDocument>("messages")
  const messages = await collection
    .find({}, { projection: { name: 1, email: 1, message: 1, date: 1, read: 1 } })
    .sort({ date: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()
  return messages.map(({ _id, ...message }) => ({ id: _id.toString(), ...message }))
}

export async function addMessage(message: Omit<Message, "id">): Promise<string> {
  const collection = await getCollection<Omit<Message, "id">>("messages")
  const result = await collection.insertOne(message)
  return result.insertedId.toString()
}

export async function setMessageRead(id: string, read: boolean): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const collection = await getCollection<MessageDocument>("messages")
  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { read } })
  return result.matchedCount > 0
}

export async function deleteMessage(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const collection = await getCollection<MessageDocument>("messages")
  const result = await collection.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}

export function getAdminCredentials(): { email: string; passwordHash: string } {
  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH } = process.env
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be configured.")
  }
  return { email: ADMIN_EMAIL, passwordHash: ADMIN_PASSWORD_HASH }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.")
  }
  return secret
}
