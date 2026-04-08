import { expect, test } from "@playwright/test";

import { hasDatabaseUrl, truncateTransactions } from "./db";

test.describe("transaksi manual", () => {
  test.beforeEach(async () => {
    test.skip(
      !hasDatabaseUrl(),
      "Butuh DATABASE_URL (branch Neon tes) untuk integrasi DB",
    );
    await truncateTransactions();
  });

  test("simpan pengeluaran lalu muncul di beranda", async ({ page }) => {
    const marker = `E2E-${Date.now()}`;

    await page.goto("/transactions/new");
    await expect(
      page.getByRole("heading", { name: "Tambah transaksi" }),
    ).toBeVisible();

    await page.getByLabel("Jumlah (IDR)").fill("25000");
    await page.getByLabel("Kategori").selectOption("Makan & minum");
    await page.getByLabel("Catatan (opsional)").fill(marker);
    await page.getByRole("button", { name: "Simpan transaksi" }).click();

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    await expect(page.getByText(marker)).toBeVisible({ timeout: 15_000 });
  });
});
