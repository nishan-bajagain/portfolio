import { z } from "zod"

const scalar = z.union([z.string().max(300), z.number().finite(), z.boolean()])
const allowedPropKeys = new Set([
  "title", "referrer", "viewport", "screen", "dpr", "language", "timezone", "theme",
  "reducedMotion", "displayMode", "browser", "os", "touch", "effectiveType", "saveData",
  "deviceMemory", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "name", "id", "section", "depth", "elapsedMs", "metric", "value", "rating", "result", "error",
])

const propsSchema = z.record(z.string().regex(/^[a-zA-Z0-9_]{1,40}$/), scalar).superRefine((props, context) => {
  for (const [key, value] of Object.entries(props)) {
    if (!allowedPropKeys.has(key)) {
      context.addIssue({ code: "custom", message: "Unsupported analytics property.", path: [key] })
    }
    if (typeof value === "string" && /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) {
      context.addIssue({ code: "custom", message: "Personal data is not accepted.", path: [key] })
    }
  }
})

export const analyticsEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number().int().positive(),
  type: z.enum([
    "pageview",
    "session_start",
    "scroll",
    "section_view",
    "click",
    "contact_start",
    "contact_submit",
    "contact_abandon",
    "engagement",
    "vital",
    "js_error",
  ]),
  path: z.string().min(1).max(160).regex(/^\/[a-zA-Z0-9/_-]*$/),
  props: propsSchema.optional(),
}).strict()

export const analyticsBatchSchema = z.object({
  version: z.literal(1),
  deviceId: z.string().uuid().optional(),
  sessionId: z.string().uuid(),
  events: z.array(analyticsEventSchema).min(1).max(10),
}).strict().superRefine((batch, context) => {
  const ids = new Set(batch.events.map((event) => event.id))
  if (ids.size !== batch.events.length) {
    context.addIssue({ code: "custom", message: "Event IDs must be unique within a batch.", path: ["events"] })
  }
})

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>
export type AnalyticsBatch = z.infer<typeof analyticsBatchSchema>
