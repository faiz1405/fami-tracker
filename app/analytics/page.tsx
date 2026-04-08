import { PieChart } from "lucide-react";
import { PeriodFilter } from "@/app/_components/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cheerfulCard } from "@/lib/cheerful-card";
import { formatIdr } from "@/lib/format";
import {
  getAnalyticsByCategory,
  getHistoryData,
  resolvePeriodParams,
} from "@/lib/queries/history";

import { CategoryPieChart } from "./_components/category-pie-chart";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
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
  const [categoryData, summary] = await Promise.all([
    getAnalyticsByCategory(params),
    getHistoryData({ ...params, page: 1 }),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="space-y-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <PieChart
            className="size-7 shrink-0 text-rose-500 dark:text-rose-400"
            aria-hidden
          />
          Analytics
        </h1>
        <PeriodFilter
          month={params.month}
          year={params.year}
          day={params.day}
        />
      </header>

      <Card className={cheerfulCard.emerald}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {params.day !== null
              ? `Total pengeluaran (${params.day}/${params.month}/${params.year})`
              : "Total pengeluaran bulan ini"}
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatIdr(summary.expense)}
          </p>
        </CardContent>
      </Card>

      <Card className={cheerfulCard.sky}>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Komposisi per kategori
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <CategoryPieChart data={categoryData} />
          {categoryData.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-sm">
              {categoryData.map((row) => (
                <li
                  key={row.category}
                  className="flex items-center justify-between rounded-xl bg-muted/35 px-3 py-2 ring-1 ring-foreground/5 transition-colors hover:bg-muted/50"
                >
                  <span className="text-muted-foreground">{row.category}</span>
                  <span className="font-semibold tabular-nums">
                    {formatIdr(row.total)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
