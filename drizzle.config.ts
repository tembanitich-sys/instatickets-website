// Used only by `npm run db:generate` (drizzle-kit is fetched on demand, not installed,
// so it adds nothing to the Vercel install). Plain object on purpose: no import needed.
const config = {
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
};

export default config;
