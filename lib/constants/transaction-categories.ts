export const TRANSACTION_CATEGORIES = [
  "Makan & minum",
  "Transportasi",
  "Belanja",
  "Tagihan & utilitas",
  "Kesehatan",
  "Hiburan",
  "Pendidikan",
  "Lainnya",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

/** Samakan keluaran model ke salah satu opsi form. */
export function normalizeCategory(raw: string): TransactionCategory {
  const t = raw.trim();
  if (
    TRANSACTION_CATEGORIES.includes(t as TransactionCategory) &&
    t.length > 0
  ) {
    return t as TransactionCategory;
  }
  const lower = t.toLowerCase();
  if (
    /makan|minum|resto|warung|kopi|food|kuliner/.test(lower) ||
    lower.includes("makan")
  ) {
    return "Makan & minum";
  }
  if (
    /transport|bensin|bbm|shell|pertamina|parkir|gojek|grab|taksi|tol|spbu/.test(
      lower,
    )
  ) {
    return "Transportasi";
  }
  if (/belanja|supermarket|indomaret|alfamart|mall|fashion|toko/.test(lower)) {
    return "Belanja";
  }
  if (
    /tagihan|listrik|air|pln|internet|wifi|utilitas|pulsa|bpjs|iuran/.test(
      lower,
    )
  ) {
    return "Tagihan & utilitas";
  }
  if (/kesehatan|apotek|dokter|rumah sak|rs |klinik|farmasi/.test(lower)) {
    return "Kesehatan";
  }
  if (/hiburan|nonton|bioskop|konser|game|spotify|netflix/.test(lower)) {
    return "Hiburan";
  }
  if (/pendidikan|sekolah|kuliah|buku|kursus|les/.test(lower)) {
    return "Pendidikan";
  }
  return "Lainnya";
}
