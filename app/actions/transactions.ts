"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { transactions } from "@/drizzle/schema";
import { getDb } from "@/lib/db";

const createSchema = z.object({
  actorName: z
    .string()
    .refine((v) => v === "suami" || v === "istri", "Pilih pencatat transaksi."),
  amount: z
    .string()
    .min(1, "Masukkan jumlah.")
    .transform((s) => Number.parseFloat(s.replace(/\s/g, "").replace(",", ".")))
    .refine((n) => !Number.isNaN(n), "Jumlah tidak valid.")
    .refine((n) => n > 0, "Jumlah harus lebih dari 0."),
  type: z
    .string()
    .refine(
      (v) => v === "INCOME" || v === "EXPENSE",
      "Pilih jenis transaksi: pemasukan atau pengeluaran.",
    )
    .transform((v) => v as "INCOME" | "EXPENSE"),
  category: z
    .string()
    .trim()
    .min(1, "Pilih atau isi kategori.")
    .max(100, "Kategori maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter.")
    .optional(),
  transactionDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type CreateTransactionState = {
  error?: string;
};

export async function createTransaction(
  _prevState: CreateTransactionState | null,
  formData: FormData,
): Promise<CreateTransactionState> {
  const parsed = createSchema.safeParse({
    actorName: String(formData.get("actorName") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    type: formData.get("type"),
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? ""),
    transactionDate: String(formData.get("transactionDate") ?? ""),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Data tidak valid." };
  }

  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";
  const userId = `${familyId}:${parsed.data.actorName}`;
  const txDate = parsed.data.transactionDate
    ? new Date(`${parsed.data.transactionDate}T12:00:00.000Z`)
    : new Date();
  if (Number.isNaN(txDate.getTime())) {
    return { error: "Tanggal transaksi tidak valid." };
  }

  try {
    const db = getDb();
    await db.insert(transactions).values({
      userId,
      familyId,
      actorName: parsed.data.actorName,
      amount: parsed.data.amount.toFixed(2),
      type: parsed.data.type,
      category: parsed.data.category,
      description:
        parsed.data.description && parsed.data.description.length > 0
          ? parsed.data.description
          : null,
      date: txDate,
      imageUrl: null,
    });
  } catch {
    return { error: "Gagal menyimpan. Periksa koneksi database." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/analytics");
  redirect("/dashboard");
}
