import assert from "node:assert/strict"
import test from "node:test"
import { analyticsBatchSchema } from "./schema.ts"

const event = {
  id: "3b241101-e2bb-4255-8caf-4136c566a962",
  timestamp: 1_735_689_600_000,
  type: "pageview",
  path: "/projects",
  props: { title: "Projects", referrer: "example.com" },
}

const batch = (events = [event]) => ({
  version: 1,
  deviceId: "550e8400-e29b-41d4-a716-446655440000",
  sessionId: "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
  events,
})

test("accepts a valid first-party analytics batch", () => {
  assert.equal(analyticsBatchSchema.safeParse(batch()).success, true)
})

test("rejects duplicate event IDs within a batch", () => {
  assert.equal(analyticsBatchSchema.safeParse(batch([event, event])).success, false)
})

test("rejects private or unsupported event properties", () => {
  const withEmail = { ...event, props: { ...event.props, title: "user@example.com" } }
  const withMessage = { ...event, props: { message: "contact form content" } }

  assert.equal(analyticsBatchSchema.safeParse(batch([withEmail])).success, false)
  assert.equal(analyticsBatchSchema.safeParse(batch([withMessage])).success, false)
})

test("rejects query strings and unsafe paths", () => {
  assert.equal(analyticsBatchSchema.safeParse(batch([{ ...event, path: "/projects?email=a@b.com" }])).success, false)
  assert.equal(analyticsBatchSchema.safeParse(batch([{ ...event, path: "/../admin" }])).success, false)
})
