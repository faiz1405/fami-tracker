import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { formatIdr } from "@/lib/format";
import { getCategoryJumpAlerts } from "@/lib/queries/consultant";
import { getDashboardData } from "@/lib/queries/dashboard";

export type SmartAlert = {
  id: string;
  title: string;
  message: string;
  tone: "warning" | "info";
};

export async function buildForecastAlerts(): Promise<SmartAlert[]> {
  const db = getDb();
  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";
  const dashboard = await getDashboardData();

  const dayResult = await db.execute(sql`
    SELECT
      EXTRACT(DAY FROM now())::int AS current_day,
      EXTRACT(DAY FROM (date_trunc('month', now()) + interval '1 month - 1 day'))::int AS days_in_month
  `);

  const dayRow = (dayResult.rows[0] ?? {}) as {
    current_day?: number;
    days_in_month?: number;
  };
  const currentDay = Math.max(1, Number(dayRow.current_day ?? 1));
  const daysInMonth = Math.max(currentDay, Number(dayRow.days_in_month ?? 30));

  const dailyExpenseRunRate = dashboard.expense / currentDay;
  const forecastExpense = dailyExpenseRunRate * daysInMonth;
  const projectedBalance = dashboard.income - forecastExpense;

  const alerts: SmartAlert[] = [];

  if (projectedBalance < 0) {
    const dayExhaust = Math.max(
      currentDay,
      Math.floor(dashboard.income / Math.max(dailyExpenseRunRate, 1)),
    );
    alerts.push({
      id: "balance-warning",
      title: "Prediksi saldo menipis",
      message: `Dengan pola saat ini, saldo berpotensi habis sekitar tanggal ${dayExhaust}. Coba tekan pengeluaran harian sekitar ${formatIdr(Math.max(0, dailyExpenseRunRate - dashboard.income / daysInMonth))}.`,
      tone: "warning",
    });
  } else {
    alerts.push({
      id: "run-rate-info",
      title: "Proyeksi akhir bulan",
      message: `Estimasi pengeluaran bulan ini ${formatIdr(forecastExpense)}. Proyeksi saldo akhir bulan ${formatIdr(projectedBalance)} jika pola belanja tetap.`,
      tone: "info",
    });
  }

  const jumps = await getCategoryJumpAlerts();
  for (const jump of jumps.slice(0, 2)) {
    alerts.push({
      id: `jump-${jump.category}`,
      title: `Kategori ${jump.category} naik ${jump.pctIncrease}%`,
      message: `Bulan ini ${formatIdr(jump.thisTotal)} vs bulan lalu ${formatIdr(jump.lastTotal)}. Pertimbangkan batas mingguan untuk kategori ini.`,
      tone: "warning",
    });
  }

  if (alerts.length < 3) {
    const trendResult = await db.execute(sql`
      SELECT
        COALESCE(SUM(CASE
          WHEN type = 'EXPENSE'
            AND date >= date_trunc('month', now()) - interval '1 month'
            AND date < date_trunc('month', now())
          THEN amount::numeric ELSE 0 END), 0)::text AS last_month_expense
      FROM transactions
      WHERE family_id = ${familyId}
    `);
    const trendRow = (trendResult.rows[0] ?? {}) as {
      last_month_expense?: string;
    };
    const lastMonthExpense = Number.parseFloat(
      trendRow.last_month_expense ?? "0",
    );
    if (lastMonthExpense > 0 && dashboard.expense > lastMonthExpense * 1.1) {
      alerts.push({
        id: "month-trend",
        title: "Pengeluaran bulanan meningkat",
        message: `Pengeluaran saat ini sudah ${formatIdr(dashboard.expense)} dan cenderung lebih tinggi dari bulan lalu ${formatIdr(lastMonthExpense)}.`,
        tone: "warning",
      });
    }
  }

  return alerts.slice(0, 3);
}
