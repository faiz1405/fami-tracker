/**
 * Menghapus semua baris di tabel `transactions` (mulai dari nol).
 * Jalankan: npm run db:reset
 * Pastikan DATABASE_URL di .env atau .env.local mengarah ke database yang benar.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

function loadEnvFile(name) {
  const p = resolve(process.cwd(), name);
  if (!existsSync(p)) {
    return;
  }
  const content = readFileSync(p, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL tidak diset. Isi di .env atau .env.local.");
  process.exit(1);
}

const sql = neon(url);

await sql`TRUNCATE TABLE transactions`;

console.log("Selesai: semua transaksi dihapus. Data mulai dari 0.");
