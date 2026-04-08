import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { transactions } from "@/drizzle/schema";
import { getDb } from "@/lib/db";

export type TransactionsByMonthParams = {
  year: number;
  /** 1..12 */
  month: number;
};

export async function getTransactionsByMonth(
  params: TransactionsByMonthParams,
) {
  const db = getDb();
  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";

  const y = Math.max(2020, Math.min(2100, Math.trunc(params.year)));
  const m = Math.max(1, Math.min(12, Math.trunc(params.month)));

  const where = and(
    eq(transactions.familyId, familyId),
    sql`EXTRACT(MONTH FROM ${transactions.date}) = ${m}`,
    sql`EXTRACT(YEAR FROM ${transactions.date}) = ${y}`,
  );

  return await db
    .select()
    .from(transactions)
    .where(where)
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
}
