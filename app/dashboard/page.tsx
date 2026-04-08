import { Sparkles } from "lucide-react";
import Image from "next/image";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

import { cheerfulCard } from "@/lib/cheerful-card";
import { formatIdr } from "@/lib/format";
import { getDashboardData } from "@/lib/queries/dashboard";
import { buildForecastAlerts } from "@/lib/queries/forecast";

import { getInsightText } from "./_components/insight-text";
import { NaturalInputForm } from "./_components/natural-input-form";
import { RecentTransactionsTabs } from "./_components/recent-transactions-tabs";
import { SheetsSyncButton } from "./_components/sheets-sync-button";
import { SmartAlertCards } from "./_components/smart-alert-cards";

export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof getDashboardData>>;
  try {
    data = await getDashboardData();
  } catch {
    return (
      <div className="flex flex-col flex-1 gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Beranda</h1>
        <Card className="border-destructive/40 bg-card">
          <CardHeader className="">
            <CardTitle className="text-base">Database belum siap</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Setel <code className="px-1 rounded bg-muted">DATABASE_URL</code>{" "}
            (Neon) di file{" "}
            <code className="px-1 rounded bg-muted">.env.local</code>, lalu
            jalankan{" "}
            <code className="px-1 rounded bg-muted">npm run db:push</code> untuk
            membuat tabel.
          </CardContent>
        </Card>
      </div>
    );
  }

  const insight = getInsightText(data.thisMonthExpense, data.lastMonthExpense);
  const alerts = await buildForecastAlerts();

  return (
    <div className="flex flex-col flex-1 gap-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Fami logo"
            width={28}
            height={28}
            className="rounded-sm size-7 object-cover"
            priority
          />
          <h1 className="text-2xl font-semibold tracking-tight">Beranda</h1>
        </div>
        <ThemeToggle />
      </header>

      <Card className={cheerfulCard.emerald}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo gabungan
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {formatIdr(data.balance)}
          </p>
          <div className="flex gap-4 justify-between mt-4 rounded-xl bg-muted/40 px-3 py-2.5 text-sm ring-1 ring-foreground/5">
            <span className="text-muted-foreground">
              Pemasukan{" "}
              <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                {formatIdr(data.income)}
              </span>
            </span>
            <span className="text-muted-foreground">
              Pengeluaran{" "}
              <span className="font-semibold text-amber-600 dark:text-amber-300">
                {formatIdr(data.expense)}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className={cheerfulCard.violet}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Input cepat AI
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <NaturalInputForm />
        </CardContent>
      </Card>

      <Card className={cheerfulCard.amber}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ringkasan cerdas
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <p className="text-sm leading-relaxed text-foreground">{insight}</p>
        </CardContent>
      </Card>

      <section aria-labelledby="alerts-heading" className="space-y-2">
        <h2
          id="alerts-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          Smart alerts
        </h2>
        <SmartAlertCards alerts={alerts} />
      </section>

      <section aria-labelledby="recent-heading">
        <h2
          id="recent-heading"
          className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <Sparkles
            className="size-4 shrink-0 text-amber-500 dark:text-amber-400"
            aria-hidden
          />
          <span className="text-muted-foreground">Transaksi terbaru</span>
        </h2>
        <div className="mb-3">
          <SheetsSyncButton />
        </div>
        <RecentTransactionsTabs items={data.recent} />
      </section>
    </div>
  );
}
