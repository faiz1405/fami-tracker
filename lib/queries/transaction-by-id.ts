import "server-only";

import { and, eq } from "drizzle-orm";

import { transactions } from "@/drizzle/schema";
import { getDb } from "@/lib/db";

export async function getTransactionById(id: string) {
  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";
  const db = getDb();
  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.familyId, familyId)))
    .limit(1);
  return row ?? null;
}
