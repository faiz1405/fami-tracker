# PRD: Family Ledger PWA (Next.js 16 Edition)

---

## 1. Visi Produk

Aplikasi pencatat keuangan keluarga yang **web-first**, bisa diinstal di HP (PWA), memiliki fitur AI-OCR untuk otomatisasi input struk, dan sinkronisasi real-time antara suami & istri menggunakan Neon PostgreSQL.

---

## 2. Technical Stack (Arsitektur 2026)

| Layer         | Teknologi                       | Alasan Pemilihan                                                                              |
| ------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| **Framework** | Next.js 16 (App Router)        | Memanfaatkan React 19 Compiler (tanpa useMemo/useCallback manual) & Server Actions            |
| **PWA Engine**| Next-PWA (Next 16 optimized)   | Mendukung offline-first & instalasi "Add to Home Screen"                                      |
| **Database**  | Neon PostgreSQL                | Serverless DB dengan autoscaling & branching untuk testing fitur baru                         |
| **ORM**       | Drizzle ORM                    | Ringan & type-safe maksimal dibandingkan Prisma, cocok untuk edge runtime                     |
| **AI (OCR)**  | Gemini 1.5 Flash SDK           | Memproses gambar struk langsung via Server Actions (multimodal)                               |
| **Styling**   | Tailwind CSS 4.0 + shadcn/ui   | Desain mobile-optimized dengan performa CSS-in-JS minimal                                     |
| **Auth**      | NextAuth.js (Auth.js v5)       | Login simpel (Google/Magic Link), khusus 2 akun keluarga                                      |


---

## 3. Fitur Utama & Kebutuhan Fungsional

### A. Shared Family Dashboard

- **Real-time Balance**: Menampilkan saldo gabungan dari semua akun/dompet.
- **Smart Summaries**: Ringkasan otomatis (misal: "Kopi bulan ini naik 10% dibanding bulan lalu").
- **Multi-User Sync**: Jika suami input, HP istri otomatis terupdate tanpa refresh (_via_ `revalidatePath` atau WebSockets).

### B. AI OCR Receipt Scanner (Web-Based)

- **Instant Capture**: Menggunakan kamera via Browser API untuk mengambil foto struk.
- **AI Extraction**: Gemini memproses gambar dan mengembalikan JSON (`total_amount`, `merchant_name`, `date`, `suggested_category`).
- **Auto-Categorization**: AI menebak kategori berdasarkan nama toko (misal: "Shell" → Transportasi).

### C. PWA & Offline Capability

- **Installable**: Icon aplikasi muncul di Home Screen tanpa browser bar.
- **Service Workers**: Aplikasi tetap bisa dibuka saat _dead zone_ (tanpa sinyal).
- **Background Sync**: Data input ketika offline otomatis terkirim ke Neon saat internet kembali.

---

## 4. Struktur Data (Drizzle Schema Preview)

Karena untuk keluarga, skema tablenya sederhana tapi efektif.

```typescript
// Contoh skema tabel transaksi
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),      // ID Suami atau Istri
  amount: numeric("amount").notNull(),
  type: text("type").notNull(),           // 'INCOME' | 'EXPENSE'
  category: text("category").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),            // Simpan link struk (jika perlu)
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 5. Rencana Antarmuka (UI/UX)

- **Mobile-First Design**: Navigasi utama di bawah (_Bottom Navigation_) agar mudah dijangkau jempol.
- **Haptic Feedback**: Simulasi getaran (via Web API) saat tombol ditekan agar terasa seperti aplikasi asli.
- **Fast Transition**: Menggunakan Next.js `loading.tsx` dan Skeleton Screens supaya tidak ada layar putih saat pindah menu.

---

## 6. Roadmap Pengembangan

- **Fase 1 (Core):** Setup Next.js 16, PWA Manifest, dan koneksi Neon DB via Drizzle.
- **Fase 2 (UI):** Pembuatan Dashboard & Form input manual (mobile-optimized).
- **Fase 3 (AI):** Integrasi Gemini API untuk OCR dan pembuatan Server Action untuk proses gambar.
- **Fase 4 (Sync):** Implementasi Auth dan sistem "Family Room" (sharing data suami-istri).
- **Fase 5 (Polish):** Optimasi offline mode & Push Notifications pengingat catat keuangan.

---