import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });
config({ path: ".env.production.local", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon: use DIRECT_URL for migrations (bypasses pooler), DATABASE_URL for runtime
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
