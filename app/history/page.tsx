import { History } from "lucide-react";
import Link from "next/link";

import { PeriodFilter } from "@/app/_components/period-filter";
import { RecentTransactionsTabs } from "@/app/dashboard/_components/recent-transactions-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cheerfulCard } from "@/lib/cheerful-card";
import { formatIdr } from "@/lib/format";
import { getHistoryData, resolvePeriodParams } from "@/lib/queries/history";

export const dynamic = "force-dynamic";

function buildHistoryQuery(data: {
  month: number;
  year: number;
  day: number | null;
  page: number;
}) {
  const p = new URLSearchParams();
  p.set("month", String(data.month));
  p.set("year", String(data.year));
  p.set("page", String(data.page));
  if (data.day !== null) {
    p.set("day", String(data.day));
  }
  return p.toString();
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{
    month?: string;
    year?: string;
    page?: string;
    day?: string;
  }>;
}) {
  const params = resolvePeriodParams(await searchParams);
  const data = await getHistoryData(params);

  const prevHref =
    data.page > 1
      ? `/history?${buildHistoryQuery({
          month: data.month,
          year: data.year,
          day: data.day,
          page: data.page - 1,
        })}`
      : null;
  const nextHref = data.hasNextPage
    ? `/history?${buildHistoryQuery({
        month: data.month,
        year: data.year,
        day: data.day,
        page: data.page + 1,
      })}`
    : null;

  const periodLabel =
    data.day !== null
      ? `${data.day}/${data.month}/${data.year}`
      : `${data.month}/${data.year}`;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="space-y-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <History
            className="size-7 shrink-0 text-sky-500 dark:text-sky-400"
            aria-hidden
          />
          Riwayat
        </h1>
        <PeriodFilter month={data.month} year={data.year} day={data.day} />
      </header>

      <Card className={cheerfulCard.emerald}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ringkasan periode ({periodLabel})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="rounded-xl bg-muted/40 px-3 py-2.5 ring-1 ring-foreground/5">
            <p className="text-muted-foreground">
              Pemasukan:{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatIdr(data.income)}
              </span>
            </p>
            <p className="text-muted-foreground">
              Pengeluaran:{" "}
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                {formatIdr(data.expense)}
              </span>
            </p>
            <p className="text-muted-foreground">
              Saldo:{" "}
              <span className="font-semibold text-foreground">
                {formatIdr(data.balance)}
              </span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {data.totalItems} transaksi
          </p>
        </CardContent>
      </Card>

      {data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-foreground/15 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/5">
          Belum ada transaksi di periode ini. Tetap semangat catat keuangan
          keluarga.
        </p>
      ) : (
        <section aria-labelledby="history-tx-heading" className="space-y-2">
          <h2
            id="history-tx-heading"
            className="text-sm font-medium text-muted-foreground"
          >
            Daftar transaksi
          </h2>
          <RecentTransactionsTabs items={data.items} scope="history" />
        </section>
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="cursor-pointer rounded-xl border border-foreground/10 bg-card px-4 py-2.5 text-sm font-medium shadow-sm ring-1 ring-foreground/10 transition-colors duration-200 hover:bg-muted/60"
          >
            Sebelumnya
          </Link>
        ) : (
          <span />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="cursor-pointer rounded-xl border border-foreground/10 bg-card px-4 py-2.5 text-sm font-medium shadow-sm ring-1 ring-foreground/10 transition-colors duration-200 hover:bg-muted/60"
          >
            Selanjutnya
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
