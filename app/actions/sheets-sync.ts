"use server";

import { z } from "zod";

import { getMonthTabName } from "@/lib/google/sheet-tabs";
import {
  appendRows,
  clearSheetRow,
  ensureSheetExists,
  getSheetRows,
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

function formatDateWib(date: Date): string {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function formatDateTimeWib(date: Date): string {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} WIB`;
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
      "Dibuat (WIB)",
    ]);

    const txs = await getTransactionsByMonth(parsed.data);

    const existingRows = await getSheetRows(tabName);
    const existingIds = new Set(
      existingRows.map((r) => r[0]?.trim() ?? "").filter((id) => id.length > 0),
    );

    // Hapus total lama agar total yang tampil hanya satu baris terbaru.
    const totalRowIndexes = existingRows
      .map((r, idx) => ({ marker: (r[3] ?? "").trim(), rowNumber: idx + 2 }))
      .filter(({ marker }) => marker === "TOTAL_SALDO")
      .map(({ rowNumber }) => rowNumber);
    for (const rowNumber of totalRowIndexes) {
      await clearSheetRow(tabName, rowNumber);
    }

    const newTxs = txs.filter((t) => !existingIds.has(String(t.id)));

    const rows = newTxs.map((t) => [
      t.id,
      formatDateWib(t.date ?? t.createdAt),
      String(t.type),
      String(t.category),
      Number.parseFloat(String(t.amount)),
      t.description ?? "",
      String(t.actorName),
      formatDateTimeWib(new Date(t.createdAt)),
    ]);

    const incomeTotal = txs
      .filter((t) => String(t.type) === "INCOME")
      .reduce((sum, t) => sum + Number.parseFloat(String(t.amount)), 0);
    const expenseTotal = txs
      .filter((t) => String(t.type) === "EXPENSE")
      .reduce((sum, t) => sum + Number.parseFloat(String(t.amount)), 0);
    const netTotal = incomeTotal - expenseTotal;

    rows.push([
      "",
      "",
      "",
      "TOTAL_SALDO",
      netTotal,
      `Pemasukan ${incomeTotal} - Pengeluaran ${expenseTotal}`,
      "",
      formatDateTimeWib(new Date()),
    ]);

    const appendedRows = await appendRows(tabName, rows);

    return { success: true, tabName, appendedRows };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Gagal sync ke Google Sheets.";
    // Pesan yang paling sering: spreadsheet belum di-share ke service account
    const isJsonConfigError =
      msg.includes("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON") ||
      msg.includes("client_email") ||
      msg.includes("private_key");
    return {
      success: false,
      error: isJsonConfigError
        ? "Konfigurasi Google Service Account belum valid. Cek format JSON di env dan pastikan field client_email + private_key ada."
        : msg.includes("decoder routines::unsupported") ||
            msg.includes("DECODER routines::unsupported")
          ? "Private key service account tidak valid/korup. Gunakan GOOGLE_SA_PRIVATE_KEY dengan format PEM asli (BEGIN/END PRIVATE KEY) dan pastikan newline benar."
          : msg.includes("Requested entity was not found") ||
              msg.includes("The caller does not have permission")
            ? "Tidak bisa akses spreadsheet. Pastikan spreadsheet di-share ke email service account (Editor)."
            : msg,
    };
  }
}
