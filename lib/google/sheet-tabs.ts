const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/**
 * Nama tab Google Sheets untuk 1 bulan, contoh: `April_2026`.
 * - `month`: 1..12
 */
export function getMonthTabName(year: number, month: number): string {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("Tahun tidak valid.");
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Bulan tidak valid.");
  }
  return `${MONTHS_ID[month - 1]}_${year}`;
}
