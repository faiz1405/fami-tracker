"use server";

import OpenAI from "openai";
import { z } from "zod";

import { getConsultantContext } from "@/lib/queries/consultant";

const inputSchema = z.object({
  question: z.string().trim().min(5, "Pertanyaan terlalu singkat."),
});

const responseSchema = z.object({
  answer: z.string(),
  highlights: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

export type FinancialConsultantState = {
  success?: boolean;
  error?: string;
  answer?: string;
  highlights?: string[];
  recommendations?: string[];
};

function safeJsonParse(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenced ? fenced[1].trim() : raw.trim();
  return JSON.parse(payload);
}

export async function askFinancialConsultant(
  _prev: FinancialConsultantState | null,
  formData: FormData,
): Promise<FinancialConsultantState> {
  const parsedInput = inputSchema.safeParse({
    question: String(formData.get("question") ?? ""),
  });
  if (!parsedInput.success) {
    return {
      error: parsedInput.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OPENAI_API_KEY belum diset." };
  }

  try {
    const context = await getConsultantContext();
    const openai = new OpenAI({
      apiKey,
      baseURL:
        process.env.OPENAI_BASE_URL?.trim() || "https://ai.sumopod.com/v1",
    });
    const model =
      process.env.OPENAI_MODEL?.trim() || "gemini/gemini-2.0-flash-lite";

    const systemPrompt = `Kamu adalah konsultan keuangan keluarga Indonesia.
Aturan wajib:
- Jawab hanya berdasarkan data konteks yang diberikan.
- Jangan mengarang angka; jika data tidak cukup, tulis keterbatasannya.
- Gunakan bahasa Indonesia yang hangat, singkat, dan actionable.
- Kembalikan HANYA JSON valid: {"answer": string, "highlights": string[], "recommendations": string[] }.
- Maks 3 highlight dan 3 rekomendasi.`;

    const userPayload = {
      question: parsedInput.data.question,
      context,
    };

    const result = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    });

    const content = result.choices[0]?.message?.content;
    if (!content) {
      return { error: "AI tidak mengembalikan jawaban." };
    }

    const parsed = responseSchema.safeParse(safeJsonParse(content));
    if (!parsed.success) {
      return { error: "Format jawaban AI tidak sesuai." };
    }

    return {
      success: true,
      answer: parsed.data.answer,
      highlights: parsed.data.highlights,
      recommendations: parsed.data.recommendations,
    };
  } catch {
    return { error: "Gagal memproses pertanyaan. Coba lagi sebentar." };
  }
}
