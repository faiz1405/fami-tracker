import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { transactions } from "@/drizzle/schema";
import { getDb } from "@/lib/db";

export async function getDashboardData() {
  const db = getDb();
  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";

  const [incomeRow] = await db
    .select({
      total: sql<string>`coalesce(sum(${transactions.amount}), 0)::text`,
    })
    .from(transactions)
    .where(
      and(eq(transactions.familyId, familyId), eq(transactions.type, "INCOME")),
    );

  const [expenseRow] = await db
    .select({
      total: sql<string>`coalesce(sum(${transactions.amount}), 0)::text`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.familyId, familyId),
        eq(transactions.type, "EXPENSE"),
      ),
    );

  const income = Number.parseFloat(incomeRow?.total ?? "0");
  const expense = Number.parseFloat(expenseRow?.total ?? "0");
  const balance = income - expense;

  const recent = await db
    .select()
    .from(transactions)
    .where(eq(transactions.familyId, familyId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(20);

  const trendResult = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE
        WHEN type = 'EXPENSE' AND date >= date_trunc('month', now())
        THEN amount::numeric ELSE 0 END), 0)::text AS this_month,
      COALESCE(SUM(CASE
        WHEN type = 'EXPENSE'
          AND date >= date_trunc('month', now()) - interval '1 month'
          AND date < date_trunc('month', now())
        THEN amount::numeric ELSE 0 END), 0)::text AS last_month
    FROM transactions
    WHERE family_id = ${familyId}
  `);

  const trendRow = trendResult.rows[0] as
    | { this_month: string; last_month: string }
    | undefined;

  const thisMonthExpense = Number.parseFloat(trendRow?.this_month ?? "0");
  const lastMonthExpense = Number.parseFloat(trendRow?.last_month ?? "0");

  return {
    income,
    expense,
    balance,
    recent,
    thisMonthExpense,
    lastMonthExpense,
  };
}
