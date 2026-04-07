import "server-only";

import { neon } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/drizzle/schema";

let cached: NeonHttpDatabase<typeof schema> | undefined;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) {
    return cached;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL tidak diset. Tambahkan ke file .env untuk koneksi Neon.",
    );
  }
  const sql = neon(url);
  cached = drizzle(sql, { schema });
  return cached;
}
