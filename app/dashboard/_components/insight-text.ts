import { formatIdr } from "@/lib/format";

export function getInsightText(
  thisMonthExpense: number,
  lastMonthExpense: number,
): string {
  if (thisMonthExpense === 0 && lastMonthExpense === 0) {
    return "Tambah transaksi untuk melihat ringkasan pengeluaran bulanan.";
  }
  if (lastMonthExpense === 0) {
    return `Pengeluaran bulan ini ${formatIdr(thisMonthExpense)}.`;
  }
  const pct = Math.round(
    ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100,
  );
  if (pct > 0) {
    return `Pengeluaran bulan ini naik ${pct}% dibanding bulan lalu (${formatIdr(thisMonthExpense)} vs ${formatIdr(lastMonthExpense)}).`;
  }
  if (pct < 0) {
    return `Pengeluaran bulan ini turun ${Math.abs(pct)}% dibanding bulan lalu (${formatIdr(thisMonthExpense)} vs ${formatIdr(lastMonthExpense)}).`;
  }
  return `Pengeluaran bulan ini sejajar dengan bulan lalu (${formatIdr(thisMonthExpense)}).`;
}
