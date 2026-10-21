# Nishan Bajagain Portfolio

Next.js App Router portfolio with a MongoDB-backed admin area, first-party analytics, and responsive project pages.

## Requirements

- Node.js 20.9 or newer
- pnpm 9.15.9
- MongoDB 6+ (MongoDB Atlas is recommended; use a region close to the deployed app)

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and configure MongoDB, admin credentials, and secrets. Generate independent secrets with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
3. Generate the administrator password hash with `node -e "require('bcryptjs').hash('replace-this-password', 12).then(console.log)"`; set the result as `ADMIN_PASSWORD_HASH`. Do not use the example password.
4. Run `pnpm ensure-indexes` to create the message, rate-limit, and analytics indexes.
5. Add portfolio data using the admin panel or `pnpm seed path/to/portfolio.json` (the seed script refuses to overwrite existing data).
6. Start the dev server with `pnpm dev`.

The public site renders from cached server-side data and uses static fallback data when MongoDB is unavailable. Configure real CV and portfolio images in the admin panel; the bundled fallback intentionally does not advertise a missing CV.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the production app and type-check |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Node's built-in test runner |
| `pnpm ensure-indexes` | Create MongoDB indexes during deployment |

## Environment configuration

See [.env.example](./.env.example). `JWT_SECRET` and `ANALYTICS_SALT` must each be unique, random values with at least 32 characters. `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` are required for login; no default administrator is created. Set `NEXT_IMAGE_HOSTS` to a comma-separated allow-list if project images are hosted remotely.

`ANALYTICS_CONSENT_MODE` supports `off`, `eu-only`, and `all`; `NEXT_PUBLIC_ANALYTICS_CONSENT_MODE` must match it. Analytics never records raw IP addresses or contact-message contents. See [docs/ANALYTICS.md](./docs/ANALYTICS.md) for collection and retention details.

## Deployment notes

No hosting-platform configuration is committed in this repository. Set the same environment variables on the selected host, provision MongoDB in a nearby region, run `pnpm ensure-indexes` as a deployment step, and verify cache headers and image optimization from the deployed origin. Do not place a second proxy CDN in front of a platform-managed CDN without testing cache and client-IP behavior.
