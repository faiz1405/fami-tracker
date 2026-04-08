"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { transactions } from "@/drizzle/schema";
import { getDb } from "@/lib/db";

export type DeleteTransactionResult =
  | { success: true }
  | { success: false; error: string };

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

const updateSchema = createSchema.extend({
  id: z.string().uuid("ID transaksi tidak valid."),
});

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

export async function updateTransaction(
  _prevState: CreateTransactionState | null,
  formData: FormData,
): Promise<CreateTransactionState> {
  const parsed = updateSchema.safeParse({
    id: String(formData.get("id") ?? ""),
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
    const updated = await db
      .update(transactions)
      .set({
        userId,
        actorName: parsed.data.actorName,
        amount: parsed.data.amount.toFixed(2),
        type: parsed.data.type,
        category: parsed.data.category,
        description:
          parsed.data.description && parsed.data.description.length > 0
            ? parsed.data.description
            : null,
        date: txDate,
      })
      .where(
        and(
          eq(transactions.id, parsed.data.id),
          eq(transactions.familyId, familyId),
        ),
      )
      .returning({ id: transactions.id });

    if (updated.length === 0) {
      return { error: "Transaksi tidak ditemukan atau tidak bisa diubah." };
    }
  } catch {
    return { error: "Gagal menyimpan. Periksa koneksi database." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/analytics");
  redirect("/dashboard");
}

const idSchema = z.string().uuid("ID transaksi tidak valid.");

export async function deleteTransaction(
  id: string,
): Promise<DeleteTransactionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "ID tidak valid.",
    };
  }

  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";

  try {
    const db = getDb();
    const removed = await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, parsed.data),
          eq(transactions.familyId, familyId),
        ),
      )
      .returning({ id: transactions.id });

    if (removed.length === 0) {
      return {
        success: false,
        error: "Transaksi tidak ditemukan atau sudah dihapus.",
      };
    }
  } catch {
    return {
      success: false,
      error: "Gagal menghapus. Periksa koneksi database.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/analytics");
  return { success: true };
}
