import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import {
  normalizeCategory,
  TRANSACTION_CATEGORIES,
} from "@/lib/constants/transaction-categories";

const receiptJsonSchema = z.object({
  total_amount: z.preprocess((v) => {
    if (v === null || v === undefined) {
      return null;
    }
    if (typeof v === "number") {
      return Number.isFinite(v) ? v : null;
    }
    const s = String(v)
      .replace(/[^\d.,-]/g, "")
      .replace(",", ".");
    const n = Number.parseFloat(s);
    return Number.isNaN(n) ? null : n;
  }, z.number().nullable()),
  merchant_name: z
    .union([z.string(), z.number()])
    .nullable()
    .transform((v) => (v === null || v === undefined ? null : String(v))),
  date: z
    .union([z.string(), z.number()])
    .nullable()
    .transform((v) => {
      if (v === null || v === undefined) {
        return null;
      }
      return String(v);
    }),
  suggested_category: z
    .union([z.string(), z.number()])
    .transform((v) => String(v)),
  summary: z
    .union([z.string(), z.number()])
    .nullable()
    .transform((v) => {
      if (v === null || v === undefined) {
        return null;
      }
      const s = String(v).trim();
      return s.length > 0 ? s : null;
    }),
});

export type ReceiptExtraction = {
  total_amount: number | null;
  merchant_name: string | null;
  date: string | null;
  suggested_category: string;
  summary: string | null;
};

function normalizeDate(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return v;
  }
  return null;
}

function parseJsonFromModel(text: string): unknown {
  try {
    const trimmed = text.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const payload = fenced ? fenced[1].trim() : trimmed;
    return JSON.parse(payload);
  } catch {
    throw new Error("Model tidak mengembalikan JSON yang valid.");
  }
}

/**
 * Ekstrak field struk via OpenAI-compatible API (multimodal).
 */
export async function extractReceiptFromImage(
  buffer: Buffer,
  mimeType: string,
): Promise<ReceiptExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY tidak diset.");
  }

  const baseURL =
    process.env.OPENAI_BASE_URL?.trim() || "https://ai.sumopod.com/v1";
  const modelId =
    process.env.OPENAI_MODEL?.trim() || "gemini/gemini-2.0-flash-lite";

  const categoryList = TRANSACTION_CATEGORIES.join(", ");

  const prompt = `Kamu membaca foto struk belanja Indonesia (bisa buram). 
Kembalikan HANYA satu objek JSON valid (tanpa markdown, tanpa teks lain) dengan field:
- total_amount: number | null — total bayar dalam Rupiah (integer). Jika tidak yakin, null.
- merchant_name: string | null — nama toko/merchant jika terbaca.
- date: string | null — tanggal di struk sebagai "YYYY-MM-DD" jika terbaca, jika tidak yakin null.
- suggested_category: string — WAJIB salah satu persis dari daftar ini (pilih yang paling cocok): ${categoryList}
- summary: string | null — ringkasan singkat isi struk dalam bahasa Indonesia (maks 120 karakter). Fokus item penting/jenis belanja. Jika tidak yakin, null.

Contoh nama toko ke kategori: SPBU Shell/Pertamina → Transportasi; Indomaret/Alfamart → Belanja; restoran → Makan & minum.`;

  const openai = new OpenAI({
    apiKey,
    baseURL,
  });

  const base64Data = buffer.toString("base64");
  const imageDataUrl = `data:${mimeType};base64,${base64Data}`;

  const result = await openai.chat.completions.create({
    model: modelId,
    temperature: 0,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
            },
          },
        ],
      },
    ],
  });

  const text = result.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Model tidak mengembalikan teks.");
  }

  const parsed = parseJsonFromModel(text);
  const validated = receiptJsonSchema.parse(parsed);

  return {
    total_amount: validated.total_amount,
    merchant_name: validated.merchant_name,
    date: normalizeDate(validated.date),
    suggested_category: normalizeCategory(validated.suggested_category),
    summary: validated.summary,
  };
}
