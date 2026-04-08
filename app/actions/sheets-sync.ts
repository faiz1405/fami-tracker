"use server";

import { z } from "zod";

import { getMonthTabName } from "@/lib/google/sheet-tabs";
import {
  appendRows,
  ensureSheetExists,
  writeHeaderIfEmpty,
} from "@/lib/google/sheets";
import { getTransactionsByMonth } from "@/lib/queries/transactions-by-month";

const inputSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

export type SheetsSyncResult =
  | { success: true; tabName: string; appendedRows: number }
  | { success: false; error: string };

function toDateIso(d: Date): string {
  // date is stored with timezone; represent as YYYY-MM-DD for Sheets
  return d.toISOString().slice(0, 10);
}

export async function syncTransactionsToGoogleSheets(
  _prev: SheetsSyncResult | null,
  formData: FormData,
): Promise<SheetsSyncResult> {
  const parsed = inputSchema.safeParse({
    year: Number(formData.get("year")),
    month: Number(formData.get("month")),
  });

  if (!parsed.success) {
    return { success: false, error: "Bulan/tahun tidak valid." };
  }

  const tabName = getMonthTabName(parsed.data.year, parsed.data.month);

  try {
    await ensureSheetExists(tabName);

    await writeHeaderIfEmpty(tabName, [
      "ID",
      "Tanggal",
      "Jenis",
      "Kategori",
      "Jumlah",
      "Catatan",
      "Dicatat oleh",
      "Dibuat (UTC)",
    ]);

    const txs = await getTransactionsByMonth(parsed.data);

    const rows = txs.map((t) => [
      t.id,
      toDateIso(t.date ?? t.createdAt),
      String(t.type),
      String(t.category),
      Number.parseFloat(String(t.amount)),
      t.description ?? "",
      String(t.actorName),
      new Date(t.createdAt).toISOString(),
    ]);

    const appendedRows = await appendRows(tabName, rows);

    return { success: true, tabName, appendedRows };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Gagal sync ke Google Sheets.";
    // Pesan yang paling sering: spreadsheet belum di-share ke service account
    return {
      success: false,
      error:
        msg.includes("Requested entity was not found") ||
        msg.includes("The caller does not have permission")
          ? "Tidak bisa akses spreadsheet. Pastikan spreadsheet di-share ke email service account (Editor)."
          : msg,
    };
  }
}
