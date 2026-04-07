"use server";

import { extractReceiptFromImage } from "@/lib/ai/extract-receipt";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getRetryDelayFromUnknownError(err: unknown): number | null {
  if (!err || typeof err !== "object") {
    return null;
  }
  const maybeErr = err as {
    errorDetails?: Array<{ "@type"?: string; retryDelay?: string }>;
  };
  const details = Array.isArray(maybeErr.errorDetails)
    ? maybeErr.errorDetails
    : [];
  const retryInfo = details.find(
    (item) => item?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo",
  );
  if (!retryInfo?.retryDelay) {
    return null;
  }

  // Format dari Gemini umumnya "56s".
  const secs = Number.parseInt(retryInfo.retryDelay.replace(/[^\d]/g, ""), 10);
  if (Number.isNaN(secs) || secs <= 0) {
    return null;
  }
  return secs;
}

export type ScanReceiptState = {
  success?: boolean;
  error?: string;
  data?: {
    total_amount: number | null;
    merchant_name: string | null;
    date: string | null;
    suggested_category: string;
    summary: string | null;
  };
};

export async function scanReceipt(
  _prev: ScanReceiptState | null,
  formData: FormData,
): Promise<ScanReceiptState> {
  const file = formData.get("receiptImage");
  if (!(file instanceof File)) {
    return { error: "Pilih atau ambil foto struk terlebih dahulu." };
  }
  if (file.size === 0) {
    return { error: "Berkas kosong." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Gambar terlalu besar (maks. 4 MB)." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP.",
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await extractReceiptFromImage(buffer, file.type);
    return { success: true, data };
  } catch (err) {
    console.error("[scanReceipt]", err);
    const status =
      err &&
      typeof err === "object" &&
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
        ? (err as { status: number }).status
        : undefined;
    const retryDelay = getRetryDelayFromUnknownError(err);

    if (status === 429) {
      if (retryDelay) {
        return {
          error: `Kuota AI sedang penuh. Coba lagi dalam ${retryDelay} detik.`,
        };
      }
      return {
        error: "Kuota AI sedang penuh. Coba lagi sebentar.",
      };
    }

    const msg =
      err instanceof Error && err.message.includes("OPENAI_API_KEY")
        ? "Kunci API OpenAI belum diset (OPENAI_API_KEY)."
        : "Gagal membaca struk. Coba foto lebih terang atau lebih dekat.";
    return { error: msg };
  }
}
