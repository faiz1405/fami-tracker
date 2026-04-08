export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Untuk input `type="date"` — selaras dengan penyimpanan UTC di server. */
export function formatDateForDateInput(value: Date | null): string {
  if (!value) {
    return "";
  }
  const x = new Date(value);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}-${String(x.getUTCDate()).padStart(2, "0")}`;
}
