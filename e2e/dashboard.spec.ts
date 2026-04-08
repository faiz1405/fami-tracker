import { expect, test } from "@playwright/test";

import { hasDatabaseUrl, truncateTransactions } from "./db";
import { fillAmountIdr } from "./helpers/transaction-form";

test.describe("dashboard", () => {
  test("kartu saldo dan insight tampil jika DB siap", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page
        .getByRole("heading", { name: "Beranda" })
        .or(page.getByRole("heading", { name: "Database belum siap" })),
    ).toBeVisible({ timeout: 15_000 });

    const dbDown = page.getByRole("heading", { name: "Database belum siap" });
    if (await dbDown.isVisible()) {
      return;
    }

    await expect(page.getByText("Saldo gabungan")).toBeVisible();
    await expect(page.getByText("Input cepat AI")).toBeVisible();
    await expect(page.getByText("Ringkasan cerdas")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Smart alerts" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Transaksi terbaru" }),
    ).toBeVisible();
  });

  test("toggle tema dapat diklik", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page
        .getByRole("heading", { name: "Beranda" })
        .or(page.getByRole("heading", { name: "Database belum siap" })),
    ).toBeVisible({ timeout: 15_000 });

    const themeBtn = page.getByRole("button", {
      name: /Ganti tema|Aktifkan mode (terang|gelap)/,
    });
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
  });

  test.describe("transaksi terbaru — tab", () => {
    test.beforeEach(async () => {
      test.skip(
        !hasDatabaseUrl(),
        "Butuh DATABASE_URL (branch Neon tes) untuk integrasi DB",
      );
      await truncateTransactions();
    });

    test("filter Semua, Pemasukan, Pengeluaran", async ({ page }) => {
      const ts = Date.now();
      const markerExp = `E2E-TAB-EXP-${ts}`;
      const markerInc = `E2E-TAB-INC-${ts}`;

      await page.goto("/transactions/new");
      await expect(
        page.getByRole("heading", { name: "Tambah transaksi" }),
      ).toBeVisible();

      await fillAmountIdr(page, "25000");
      await page.getByLabel("Kategori").selectOption("Makan & minum");
      await page.getByLabel("Catatan (opsional)").fill(markerExp);
      await page.getByRole("button", { name: "Simpan transaksi" }).click();
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
      await expect(page.getByText(markerExp)).toBeVisible({ timeout: 15_000 });

      await page.goto("/transactions/new");
      await page.getByRole("radio", { name: "Pemasukan" }).click();
      await fillAmountIdr(page, "500000");
      await page.getByLabel("Kategori").selectOption("Lainnya");
      await page.getByLabel("Catatan (opsional)").fill(markerInc);
      await page.getByRole("button", { name: "Simpan transaksi" }).click();
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
      await expect(page.getByText(markerInc)).toBeVisible({ timeout: 15_000 });

      await page.goto("/dashboard");
      await expect(
        page
          .getByRole("heading", { name: "Beranda" })
          .or(page.getByRole("heading", { name: "Database belum siap" })),
      ).toBeVisible({ timeout: 15_000 });

      const dbDown = page.getByRole("heading", { name: "Database belum siap" });
      if (await dbDown.isVisible()) {
        return;
      }

      await expect(
        page.getByRole("heading", { name: "Transaksi terbaru" }),
      ).toBeVisible();

      await expect(page.getByRole("tab", { name: "Semua" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(page.getByText(markerExp)).toBeVisible();
      await expect(page.getByText(markerInc)).toBeVisible();

      await page.getByRole("tab", { name: "Pemasukan" }).click();
      await expect(
        page.getByRole("tab", { name: "Pemasukan" }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(page.getByText(markerInc)).toBeVisible();
      await expect(page.getByText(markerExp)).not.toBeVisible();

      await page.getByRole("tab", { name: "Pengeluaran" }).click();
      await expect(
        page.getByRole("tab", { name: "Pengeluaran" }),
      ).toHaveAttribute("aria-selected", "true");
      await expect(page.getByText(markerExp)).toBeVisible();
      await expect(page.getByText(markerInc)).not.toBeVisible();
    });
  });
});
