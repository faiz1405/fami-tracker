# Fami Finance Tracker

Aplikasi pencatat keuangan keluarga berbasis mobile-first PWA, dengan fitur AI untuk OCR struk, input bahasa natural, konsultasi keuangan, serta alert prediktif.

## Ringkasan Fitur

- Mobile-first UI (`max-w-md`) dengan bottom navigation.
- Dashboard saldo, transaksi terbaru, insight, dan smart alerts.
- Input transaksi manual + OCR struk AI.
- Input cepat via bahasa natural (NLI).
- Riwayat transaksi dengan filter bulan, tahun, dan tanggal.
- Analitik pengeluaran per kategori (pie chart).
- AI Financial Consultant (chat berbasis data transaksi).
- PWA (installable) + halaman offline + service worker custom.
- Tema dark/light.

## Tech Stack

- Next.js 16 (App Router, Server Actions, Turbopack)
- React 19
- Drizzle ORM + Neon PostgreSQL
- OpenAI-compatible API (OCR, NLI, consultant)
- Tailwind CSS + shadcn/base-ui components
- Recharts (analitik)
- Biome (lint/format)

## Fitur per Halaman

| Halaman | Route | Fitur Utama |
|---|---|---|
| Beranda | `/dashboard` | Saldo gabungan, pemasukan/pengeluaran, input cepat AI (NLI), ringkasan cerdas, smart alerts prediktif, transaksi terbaru, toggle theme. |
| Tambah Transaksi | `/transactions/new` | Form manual pemasukan/pengeluaran, pilih aktor (suami/istri), nominal format Rupiah, OCR struk AI (prefill jumlah/kategori/catatan/tanggal), validasi input. |
| Riwayat | `/history` | Daftar transaksi terurut, ringkasan periode, pagination, filter bulan/tahun/tanggal (harian dalam bulan terpilih). |
| Analitik | `/analytics` | Total pengeluaran periode, pie chart komposisi kategori, breakdown nominal per kategori, filter bulan/tahun/tanggal. |
| Tanya Keuangan | `/consultant` | Chat AI konsultasi keuangan berbasis histori DB, jawaban terstruktur (answer, highlights, recommendations), loading/error state. |
| Offline | `/offline` | Fallback saat tidak ada internet, tombol kembali ke dashboard. |
| Root | `/` | Redirect otomatis ke dashboard. |

## Struktur Fitur AI

- OCR struk: `app/actions/receipt-ocr.ts` + `lib/ai/extract-receipt.ts`
- Natural language input: `app/actions/natural-input.ts` + `lib/ai/parse-natural-input.ts`
- Consultant chat: `app/actions/financial-consultant.ts` + `lib/queries/consultant.ts`
- Forecast & alerts: `lib/queries/forecast.ts` + `app/dashboard/_components/smart-alert-cards.tsx`

## PWA dan Offline

- Manifest: `app/manifest.ts`
- Service Worker: `public/sw.js`
- Registrasi SW: `components/pwa-register.tsx`
- Offline page: `app/offline/page.tsx`

## Prasyarat

- Node.js 20+ (disarankan LTS)
- NPM 10+
- Akses ke Neon PostgreSQL
- API key OpenAI-compatible endpoint

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Siapkan env:

```bash
cp .env.example .env.local
```

3. Isi variabel penting di `.env.local`:
- `DATABASE_URL`
- `DEFAULT_FAMILY_ID`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (opsional, default sudah disiapkan)
- `OPENAI_MODEL` (opsional)

4. Buat/selaraskan schema DB:

```bash
npm run db:push
```

5. Jalankan aplikasi:

```bash
npm run dev
```

6. Buka `http://localhost:3000`.

## Scripts

- `npm run dev` - Jalankan development server.
- `npm run build` - Build production.
- `npm run start` - Jalankan hasil build production.
- `npm run lint` - Cek lint dengan Biome.
- `npm run format` - Format codebase dengan Biome.
- `npm run db:push` - Push schema Drizzle ke database.
- `npm run db:generate` - Generate migration Drizzle.
- `npm run db:reset` - Kosongkan data tabel transaksi (TRUNCATE).
- `npm run deploy:preview` - Deploy preview ke Vercel.
- `npm run deploy:prod` - Deploy production ke Vercel.

## Deploy

Project ini sudah kompatibel dengan Vercel. Jika project sudah terhubung:

```bash
npm run deploy:prod
```

Atau gunakan Git integration (push ke branch yang terhubung).

## Reset Database (Mulai dari Nol)

Untuk menghapus semua transaksi:

```bash
npm run db:reset
```

Perintah ini menjalankan `TRUNCATE TABLE transactions;` pada database yang dituju `DATABASE_URL`.

## Catatan

- Aplikasi saat ini memakai mode rumah tangga sederhana (tanpa auth full login).
- Data dipisah per `family_id` dan dicatat oleh `actor_name`.
- Untuk penggunaan produksi, pastikan env di Vercel sudah sama dengan env lokal.

## License

Belum ditentukan.
