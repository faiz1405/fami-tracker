import { neon } from "@neondatabase/serverless";

import { loadTestEnv } from "./load-env";

export function getDatabaseUrl(): string | undefined {
  loadTestEnv();
  return (
    process.env.E2E_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  );
}

export function hasDatabaseUrl(): boolean {
  return Boolean(getDatabaseUrl());
}

export async function truncateTransactions(): Promise<boolean> {
  const url = getDatabaseUrl();
  if (!url) {
    return false;
  }
  const sql = neon(url);
  await sql`TRUNCATE TABLE transactions`;
  return true;
}
