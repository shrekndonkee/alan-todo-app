// prisma.config.ts
import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },

  // 👇 NEW: move the datasource URL here (Prisma 7 style)
  datasource: {
    url: env("DATABASE_URL"),
  },
});

