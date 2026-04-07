import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import {
  normalizeCategory,
  TRANSACTION_CATEGORIES,
} from "@/lib/constants/transaction-categories";

const nliSchema = z.object({
  amount: z.preprocess((v) => {
    if (typeof v === "number") {
      return v;
    }
    const s = String(v ?? "")
      .replace(/[^\d.,-]/g, "")
      .replace(",", ".");
    const n = Number.parseFloat(s);
    return Number.isNaN(n) ? null : n;
  }, z.number().positive()),
  type: z.union([z.literal("INCOME"), z.literal("EXPENSE")]),
  category: z.string(),
  description: z.string().trim().max(500).nullable().optional(),
  actor_name: z
    .union([z.literal("suami"), z.literal("istri")])
    .nullable()
    .optional(),
  date: z.string().trim().nullable().optional(),
});

export type ParsedNaturalInput = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string | null;
  actorName: "suami" | "istri" | null;
  date: string | null;
};

function parseJsonFromModel(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(payload);
}

function normalizeDate(date: string | null | undefined): string | null {
  if (!date) {
    return null;
  }
  const value = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return null;
}

export async function parseNaturalInputToTransaction(
  textInput: string,
): Promise<ParsedNaturalInput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY tidak diset.");
  }

  const baseURL =
    process.env.OPENAI_BASE_URL?.trim() || "https://ai.sumopod.com/v1";
  const modelId =
    process.env.OPENAI_MODEL?.trim() || "gemini/gemini-2.0-flash-lite";

  const categoryList = TRANSACTION_CATEGORIES.join(", ");
  const prompt = `Ubah kalimat transaksi user Indonesia menjadi JSON valid saja.
Field wajib:
- amount: number (Rupiah)
- type: "INCOME" | "EXPENSE"
- category: salah satu dari: ${categoryList}
- description: string|null
- actor_name: "suami" | "istri" | null
- date: "YYYY-MM-DD" | null

Aturan:
- jika kalimat mengandung pemasukan (gaji, transfer masuk), type=INCOME.
- jika tidak jelas, default EXPENSE.
- actor_name null jika tidak disebut.
- date null jika tidak disebut.
- output hanya JSON, tanpa markdown.

Kalimat user: "${textInput}"`;

  const openai = new OpenAI({ apiKey, baseURL });
  const result = await openai.chat.completions.create({
    model: modelId,
    temperature: 0,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = result.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Model tidak mengembalikan teks.");
  }

  const parsed = parseJsonFromModel(text);
  const validated = nliSchema.parse(parsed);

  return {
    amount: validated.amount,
    type: validated.type,
    category: normalizeCategory(validated.category),
    description: validated.description ?? null,
    actorName: validated.actor_name ?? null,
    date: normalizeDate(validated.date),
  };
}
