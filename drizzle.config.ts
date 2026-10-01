// Used only by `npm run db:generate` (drizzle-kit is a devDependency, so it is installed with
// the repo and uses the repo's own drizzle-orm). Plain object on purpose: no import needed.
const config = {
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
};

export default config;
