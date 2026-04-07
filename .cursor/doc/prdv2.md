# PRD v0.2: Family Ledger PWA (Next.js 16, AI-Powered)

## 1. Visi & Tujuan

Membangun aplikasi pencatat keuangan keluarga yang sangat ringan dan cerdas. Suami dan istri bisa mencatat transaksi dalam hitungan detik (via ketikan santai atau foto struk), serta memantau kesehatan finansial secara transparan setiap bulan.

---

## 2. Fitur Utama (Functional Requirements)

### A. Smart Input Engine (Powered by OpenAI)

- **AI OCR Scanner**  
  Memotret struk belanja, lalu OpenAI mengekstrak nominal, nama toko, tanggal, dan menyarankan kategori secara otomatis.
- **Natural Language Input (NLI)**  
  Input bar simpel — user bisa mengetik:  
  `"Tadi sore jajan kopi 35rb"` atau `"Gajian masuk 15jt"`.  
  AI akan memprosesnya menjadi data transaksi terstruktur (JSON) dan menyimpannya ke Neon DB.
- **Manual Entry**  
  Form standar sebagai fallback jika user ingin input detail secara manual.

### B. Dashboard & Reporting

- **Real-time Shared Balance**  
  Tampilan saldo gabungan yang terupdate otomatis (Server Actions + Revalidate Path).
- **Monthly Comparison**  
  Perbandingan pengeluaran bulan ini vs bulan lalu (naik/turun dalam persentase).

### C. Advanced History & Filtering

- **URL-State Based Filtering**  
  Filter transaksi berdasarkan Bulan dan Tahun, misal:  
  `/history?month=04&year=2026`
- **Summary per Filter**  
  Saat filter diterapkan, aplikasi otomatis menampilkan total pengeluaran dan pemasukan khusus untuk periode tersebut.
- **Infinite Scroll / Pagination**  
  List riwayat transaksi tetap ringan meski data sudah ribuan.

---

## 3. Spesifikasi Teknis (Tech Stack 2026)

| Komponen        | Teknologi                       | Detail Implementasi                                           |
| --------------- | ------------------------------ | ------------------------------------------------------------ |
| Framework       | Next.js 16 (App Router)        | React Server Components (RSC), Server Actions                |
| AI Engine       | OpenAI API (GPT-4o)            | Untuk OCR & Text-to-Transaction parsing                      |
| Database        | Neon PostgreSQL                | Serverless DB, Drizzle ORM                                   |
| PWA             | @ducanh2912/next-pwa           | Offline mode & instalasi ke Home Screen                      |
| State Management| Zustand + URL Params           | Zustand untuk UI state, URL Params untuk filter history      |
| UI Components   | Shadcn UI + Tailwind CSS 4.0   | Mobile-first, full dark mode                                 |

---

## 4. Skema Data (Database Design)

Tabel utama di Neon (menggunakan Drizzle ORM):

```typescript
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // 'suami' | 'istri'
  amount: numeric("amount").notNull(),
  type: text("type").notNull(),      // 'EXPENSE' | 'INCOME'
  category: text("category").notNull(),
  note: text("note"),
  date: timestamp("date").notNull().defaultNow(), // Untuk filter bulan/tahun
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 5. Antarmuka Pengguna (UI/UX)

- **Home Screen**
  - *Top Card*: Saldo saat ini
  - *Middle*: Input bar "Ketik pengeluaran..." (NLI)
  - *Bottom*: Tombol cepat "Scan Struk" (OCR)
- **History Screen**
  - *Header*: Month & Year Picker (Horizontal Scroll / Dropdown)
  - *Content*: List transaksi per tanggal
  - *Empty State*: Motivasi jika belum ada pengeluaran di bulan tsb
- **Analytics Screen**
  - Pie Chart pengeluaran per kategori (bulan terpilih)

---

## 6. Strategi Implementasi Filter (Roadmap Teknis)

Agar filter bulan/tahun berjalan smooth di Next.js 16:

- **Sync URL**:  
  Gunakan `useSearchParams` & `usePathname` dari Next.js supaya filter tidak memicu full page reload.
- **Server-Side Filtering**:  
  Query ke Neon DB selalu memakai  
  `EXTRACT(MONTH FROM date)` dan `EXTRACT(YEAR FROM date)` demi pemrosesan di server (bukan browser).
- **Optimistic UI**:  
  Waktu user mengganti bulan, tampilkan skeleton loading pada list transaksi agar terasa responsif.
