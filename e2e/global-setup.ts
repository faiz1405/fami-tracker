import type { FullConfig } from "@playwright/test";

import { truncateTransactions } from "./db";

/**
 * Kosongkan transaksi sebelum suite (satu kali).
 * Pakai DATABASE_URL atau E2E_DATABASE_URL (branch Neon khusus tes — lihat rule project).
 */
async function globalSetup(_config: FullConfig) {
  const ok = await truncateTransactions();
  if (ok) {
    console.info("[e2e globalSetup] TRUNCATE transactions selesai.");
  } else {
    console.warn(
      "[e2e globalSetup] Lewati TRUNCATE (tidak ada DATABASE_URL / E2E_DATABASE_URL).",
    );
  }
}

export default globalSetup;
