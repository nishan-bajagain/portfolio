# MongoDB setup

Use MongoDB Atlas or a local MongoDB replica set. Production analytics relies on MongoDB transactions for idempotent event ingestion; Atlas clusters support this by default.

1. Create a database user restricted to the portfolio database and allow the application's host in the network access list.
2. Set `MONGODB_URI` in `.env.local` (local) or the hosting provider's environment settings.
3. Set a random `JWT_SECRET` of at least 32 characters and `ANALYTICS_SALT` of at least 32 characters. Keep these values separate and private.
4. Set `ADMIN_EMAIL` and a bcrypt `ADMIN_PASSWORD_HASH`. Generate a hash with:

   ```powershell
   node -e "require('bcryptjs').hash('choose-a-unique-password', 12).then(console.log)"
   ```

5. Install packages and create indexes:

   ```powershell
   pnpm install
   pnpm ensure-indexes
   ```

The application uses the `portfolio`, `messages`, `rate_limits`, and analytics collections. Public portfolio reads never seed or mutate the database. To initialize a new portfolio, use the admin panel or explicitly seed a JSON export with `pnpm seed path\to\portfolio.json`; the seed command refuses to overwrite existing data.

Place the application and Atlas cluster in nearby regions. Configure the deployment platform's environment variables before enabling admin writes or analytics.
