import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { transactions } from "@/drizzle/schema";
import { getDb } from "@/lib/db";

const PAGE_SIZE = 20;

export type PeriodParams = {
  month: number;
  year: number;
  page: number;
  /** Jika diset, hanya transaksi pada tanggal kalender ini (dalam bulan & tahun terpilih). */
  day: number | null;
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function clampDayToMonth(year: number, month: number, day: number): number {
  const max = daysInMonth(year, month);
  return Math.min(Math.max(1, day), max);
}

function parsePositiveInt(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) {
    return null;
  }
  return n;
}

export function resolvePeriodParams(searchParams?: {
  month?: string;
  year?: string;
  page?: string;
  day?: string;
}): PeriodParams {
  const now = new Date();
  const month = parsePositiveInt(searchParams?.month) ?? now.getMonth() + 1;
  const year = parsePositiveInt(searchParams?.year) ?? now.getFullYear();
  const page = parsePositiveInt(searchParams?.page) ?? 1;
  const m = Math.min(12, Math.max(1, month));
  const y = Math.max(2020, Math.min(2100, year));

  const rawDay = searchParams?.day?.trim();
  let day: number | null = null;
  if (rawDay !== undefined && rawDay !== "" && rawDay.toLowerCase() !== "all") {
    const d = parsePositiveInt(rawDay);
    if (d !== null) {
      day = clampDayToMonth(y, m, d);
    }
  }

  return {
    month: m,
    year: y,
    page,
    day,
  };
}

function periodWhere(
  month: number,
  year: number,
  familyId: string,
  day: number | null,
) {
  const base = and(
    eq(transactions.familyId, familyId),
    sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`,
    sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`,
  );
  if (day === null) {
    return base;
  }
  return and(base, sql`EXTRACT(DAY FROM ${transactions.date}) = ${day}`);
}

export async function getHistoryData(period: PeriodParams) {
  const db = getDb();
  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";
  const where = periodWhere(period.month, period.year, familyId, period.day);
  const offset = (period.page - 1) * PAGE_SIZE;

  const [incomeRow] = await db
    .select({
      total: sql<string>`coalesce(sum(case when ${transactions.type} = 'INCOME' then ${transactions.amount}::numeric else 0 end), 0)::text`,
    })
    .from(transactions)
    .where(where);

  const [expenseRow] = await db
    .select({
      total: sql<string>`coalesce(sum(case when ${transactions.type} = 'EXPENSE' then ${transactions.amount}::numeric else 0 end), 0)::text`,
    })
    .from(transactions)
    .where(where);

  const [countRow] = await db
    .select({ count: sql<string>`count(*)::text` })
    .from(transactions)
    .where(where);

  const items = await db
    .select()
    .from(transactions)
    .where(where)
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(PAGE_SIZE + 1)
    .offset(offset);

  const hasNextPage = items.length > PAGE_SIZE;
  const slicedItems = hasNextPage ? items.slice(0, PAGE_SIZE) : items;

  const income = Number.parseFloat(incomeRow?.total ?? "0");
  const expense = Number.parseFloat(expenseRow?.total ?? "0");
  const count = Number.parseInt(countRow?.count ?? "0", 10);

  return {
    month: period.month,
    year: period.year,
    day: period.day,
    page: period.page,
    income,
    expense,
    balance: income - expense,
    totalItems: count,
    hasNextPage,
    items: slicedItems,
  };
}

export async function getAnalyticsByCategory(period: PeriodParams) {
  const db = getDb();
  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";
  const where = periodWhere(period.month, period.year, familyId, period.day);

  const rows = await db
    .select({
      category: transactions.category,
      total: sql<string>`coalesce(sum(${transactions.amount}::numeric), 0)::text`,
    })
    .from(transactions)
    .where(and(where, eq(transactions.type, "EXPENSE")))
    .groupBy(transactions.category)
    .orderBy(sql`sum(${transactions.amount}::numeric) desc`);

  return rows.map((row) => ({
    category: row.category,
    total: Number.parseFloat(row.total),
  }));
}
