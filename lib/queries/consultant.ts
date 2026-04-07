import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { transactions } from "@/drizzle/schema";
import { getDb } from "@/lib/db";

type CategoryRow = { category: string; total: string };

export async function getConsultantContext() {
  const db = getDb();
  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";

  const recent = await db
    .select({
      amount: transactions.amount,
      type: transactions.type,
      category: transactions.category,
      description: transactions.description,
      actorName: transactions.actorName,
      date: transactions.date,
    })
    .from(transactions)
    .where(eq(transactions.familyId, familyId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(30);

  const summaryResult = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE
        WHEN type = 'INCOME' AND date >= date_trunc('month', now())
        THEN amount::numeric ELSE 0 END), 0)::text AS income_this_month,
      COALESCE(SUM(CASE
        WHEN type = 'EXPENSE' AND date >= date_trunc('month', now())
        THEN amount::numeric ELSE 0 END), 0)::text AS expense_this_month,
      COALESCE(SUM(CASE
        WHEN type = 'INCOME' AND date >= date_trunc('month', now()) - interval '1 month' AND date < date_trunc('month', now())
        THEN amount::numeric ELSE 0 END), 0)::text AS income_last_month,
      COALESCE(SUM(CASE
        WHEN type = 'EXPENSE' AND date >= date_trunc('month', now()) - interval '1 month' AND date < date_trunc('month', now())
        THEN amount::numeric ELSE 0 END), 0)::text AS expense_last_month
    FROM transactions
    WHERE family_id = ${familyId}
  `);

  const topCategoriesRows = (
    await db.execute(sql`
    SELECT category, COALESCE(SUM(amount::numeric),0)::text as total
    FROM transactions
    WHERE family_id = ${familyId}
      AND type = 'EXPENSE'
      AND date >= date_trunc('month', now())
    GROUP BY category
    ORDER BY SUM(amount::numeric) DESC
    LIMIT 5
  `)
  ).rows as CategoryRow[];

  const summaryRow = (summaryResult.rows[0] ?? {}) as Record<
    string,
    string | undefined
  >;
  const incomeThisMonth = Number.parseFloat(
    summaryRow.income_this_month ?? "0",
  );
  const expenseThisMonth = Number.parseFloat(
    summaryRow.expense_this_month ?? "0",
  );
  const incomeLastMonth = Number.parseFloat(
    summaryRow.income_last_month ?? "0",
  );
  const expenseLastMonth = Number.parseFloat(
    summaryRow.expense_last_month ?? "0",
  );

  return {
    incomeThisMonth,
    expenseThisMonth,
    balanceThisMonth: incomeThisMonth - expenseThisMonth,
    incomeLastMonth,
    expenseLastMonth,
    topExpenseCategories: topCategoriesRows.map((r) => ({
      category: r.category,
      total: Number.parseFloat(r.total),
    })),
    recent: recent.map((r) => ({
      amount: Number.parseFloat(String(r.amount)),
      type: r.type,
      category: r.category,
      actorName: r.actorName,
      description: r.description,
      date: r.date ? r.date.toISOString().slice(0, 10) : null,
    })),
  };
}

export async function getCategoryJumpAlerts() {
  const db = getDb();
  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";
  const rows = (
    await db.execute(sql`
    WITH this_month AS (
      SELECT category, COALESCE(SUM(amount::numeric),0) as total
      FROM transactions
      WHERE family_id = ${familyId}
        AND type = 'EXPENSE'
        AND date >= date_trunc('month', now())
      GROUP BY category
    ),
    last_month AS (
      SELECT category, COALESCE(SUM(amount::numeric),0) as total
      FROM transactions
      WHERE family_id = ${familyId}
        AND type = 'EXPENSE'
        AND date >= date_trunc('month', now()) - interval '1 month'
        AND date < date_trunc('month', now())
      GROUP BY category
    )
    SELECT
      t.category as category,
      t.total::text as this_total,
      COALESCE(l.total,0)::text as last_total
    FROM this_month t
    LEFT JOIN last_month l ON l.category = t.category
    WHERE COALESCE(l.total,0) > 0
      AND t.total >= l.total * 1.2
    ORDER BY (t.total - COALESCE(l.total,0)) DESC
    LIMIT 3
  `)
  ).rows as Array<{ category: string; this_total: string; last_total: string }>;

  return rows.map((r) => {
    const thisTotal = Number.parseFloat(r.this_total);
    const lastTotal = Number.parseFloat(r.last_total);
    const pct = Math.round(((thisTotal - lastTotal) / lastTotal) * 100);
    return { category: r.category, thisTotal, lastTotal, pctIncrease: pct };
  });
}
