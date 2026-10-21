# First-party analytics

## Storage and counting

- The same-origin `/api/collect` endpoint establishes a random UUID for a device only where identity tracking is permitted. The server sets the authoritative `device-id` cookie as HttpOnly, Secure in production, SameSite=Lax, and 400 days. A localStorage copy is maintained for client event batches.
- A unique `_id` per event and a MongoDB transaction make replay idempotent: the raw event and its counters either commit together or not at all.
- `devices` tracks first/last seen, page views, and visits. `device_days` records one document per device per day. `stats_daily` stores aggregate counters and dimensions. `analytics_live` has a five-minute TTL. Raw event documents have a configurable TTL.
- Sessions are shared through localStorage and roll after 30 minutes of inactivity or a new UTM campaign. Page views, sessions, engaged time, scroll depth, section views, click events, contact submission outcomes, and basic LCP/INP/CLS/TTFB samples are collected.
- Visitors without a permitted identifier are counted as cookieless aggregates. Probable-returning estimates use a salted monthly HMAC only where identity tracking is permitted; this estimate is never used to merge devices. Raw IP addresses and contact message contents are not stored.

## Consent and exclusions

`ANALYTICS_CONSENT_MODE` accepts `off`, `eu-only`, or `all`. In `eu-only` mode, EU/UK visitors remain cookieless and are not fingerprinted until consent. `DNT`, Global Privacy Control, admin sessions, bots, and owner-marked devices are excluded. `?analytics=off` persists the owner opt-out in localStorage. The privacy page offers a same-origin consent action.

The browser implementation is best-effort: private mode, cleared storage, shared devices, and privacy extensions can affect counts. A browser identifier is not proof of a person or physical device.

## Operational requirements

- Configure `MONGODB_URI`, `JWT_SECRET`, `ANALYTICS_SALT`, and `ANALYTICS_RAW_TTL_DAYS`.
- Run `pnpm ensure-indexes` after deploys and before event collection. TTL indexes expire rate-limit records, live markers, fingerprints, and raw events.
- MongoDB transactions require a replica set or sharded cluster. Use MongoDB Atlas or configure local development as a replica set.
- Admin read APIs are JWT-guarded and return `Cache-Control: private, no-store`.

## Known limitations

The admin page currently exposes aggregate period totals, active devices, top paths, country counts, and tracked clicks. Exact multi-period unique counts, custom date comparisons, CSV/JSON exports, per-device timelines/erasure, bounce rate, conversion funnels, full browser/device breakdowns, and histogram-derived p75 Web Vitals remain follow-up work. These are intentionally not presented as measured values.
