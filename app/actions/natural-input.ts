"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { transactions } from "@/drizzle/schema";
import { parseNaturalInputToTransaction } from "@/lib/ai/parse-natural-input";
import { getDb } from "@/lib/db";

const inputSchema = z.object({
  text: z.string().trim().min(3, "Masukkan kalimat transaksi lebih detail."),
  actorNameFallback: z.union([z.literal("suami"), z.literal("istri")]),
});

export type NaturalInputState = {
  success?: boolean;
  error?: string;
  parsed?: {
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string | null;
    actorName: "suami" | "istri";
    date: string;
  };
};

export async function parseNaturalInput(
  _prev: NaturalInputState | null,
  formData: FormData,
): Promise<NaturalInputState> {
  const parsedInput = inputSchema.safeParse({
    text: String(formData.get("text") ?? ""),
    actorNameFallback: String(formData.get("actorNameFallback") ?? ""),
  });
  if (!parsedInput.success) {
    return {
      error: parsedInput.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  const familyId = process.env.DEFAULT_FAMILY_ID ?? "rumah-utama";
  const fallbackActor = parsedInput.data.actorNameFallback;
  const userText = parsedInput.data.text;

  try {
    const parsed = await parseNaturalInputToTransaction(userText);
    const actorName = parsed.actorName ?? fallbackActor;
    const txDate = parsed.date
      ? new Date(`${parsed.date}T12:00:00.000Z`)
      : new Date();
    if (Number.isNaN(txDate.getTime())) {
      return { error: "Tanggal hasil AI tidak valid." };
    }

    const db = getDb();
    await db.insert(transactions).values({
      userId: `${familyId}:${actorName}`,
      familyId,
      actorName,
      amount: parsed.amount.toFixed(2),
      type: parsed.type,
      category: parsed.category,
      description: parsed.description,
      date: txDate,
      imageUrl: null,
    });

    revalidatePath("/dashboard");
    revalidatePath("/history");
    revalidatePath("/analytics");

    return {
      success: true,
      parsed: {
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        description: parsed.description,
        actorName,
        date: txDate.toISOString().slice(0, 10),
      },
    };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("OPENAI_API_KEY")
        ? "Kunci API OpenAI belum diset (OPENAI_API_KEY)."
        : "Gagal memproses kalimat dengan AI. Coba format kalimat lebih jelas.";
    return { error: msg };
  }
}
