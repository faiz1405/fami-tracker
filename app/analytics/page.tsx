import { PeriodFilter } from "@/app/_components/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <PeriodFilter
          month={params.month}
          year={params.year}
          day={params.day}
        />
      </header>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {params.day !== null
              ? `Total pengeluaran (${params.day}/${params.month}/${params.year})`
              : "Total pengeluaran bulan ini"}
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <p className="text-2xl font-semibold">{formatIdr(summary.expense)}</p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Komposisi per kategori
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <CategoryPieChart data={categoryData} />
          {categoryData.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {categoryData.map((row) => (
                <li
                  key={row.category}
                  className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground">{row.category}</span>
                  <span className="font-medium">{formatIdr(row.total)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
