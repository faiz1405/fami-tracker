import Link from "next/link";

import { PeriodFilter } from "@/app/_components/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIdr } from "@/lib/format";
import { getHistoryData, resolvePeriodParams } from "@/lib/queries/history";

function formatDateLabel(date: Date | null): string {
  if (!date) {
    return "—";
  }
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

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
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Riwayat</h1>
        <PeriodFilter month={data.month} year={data.year} day={data.day} />
      </header>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ringkasan periode ({periodLabel})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Pemasukan:{" "}
            <span className="font-medium text-emerald-400">
              {formatIdr(data.income)}
            </span>
          </p>
          <p className="text-muted-foreground">
            Pengeluaran:{" "}
            <span className="font-medium text-amber-200">
              {formatIdr(data.expense)}
            </span>
          </p>
          <p className="text-muted-foreground">
            Saldo:{" "}
            <span className="font-medium text-foreground">
              {formatIdr(data.balance)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {data.totalItems} transaksi
          </p>
        </CardContent>
      </Card>

      {data.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Belum ada transaksi di periode ini. Tetap semangat catat keuangan
          keluarga.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.category}</p>
                  {item.description ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateLabel(item.date)} · dicatat{" "}
                    <span className="capitalize">{item.actorName}</span>
                  </p>
                </div>
                <p
                  className={
                    item.type === "INCOME"
                      ? "shrink-0 font-semibold text-emerald-400"
                      : "shrink-0 font-semibold text-amber-200"
                  }
                >
                  {item.type === "INCOME" ? "+" : "−"}
                  {formatIdr(Number.parseFloat(String(item.amount)))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            Sebelumnya
          </Link>
        ) : (
          <span />
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            className="rounded-lg border border-border px-3 py-2 text-sm"
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
