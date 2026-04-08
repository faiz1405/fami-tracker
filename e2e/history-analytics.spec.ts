import { expect, test } from "@playwright/test";

import { hasDatabaseUrl, truncateTransactions } from "./db";

function firstDayOfCurrentMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

test.describe("riwayat dan analitik", () => {
  test.beforeEach(async () => {
    test.skip(!hasDatabaseUrl(), "Butuh DATABASE_URL untuk data & filter");
    await truncateTransactions();
  });

  test("filter periode dan tanggal di riwayat", async ({ page }) => {
    await page.goto("/transactions/new");
    await page.getByLabel("Tanggal transaksi").fill(firstDayOfCurrentMonth());
    await page.getByLabel("Jumlah (IDR)").fill("10000");
    await page.getByLabel("Kategori").selectOption("Transportasi");
    await page.getByRole("button", { name: "Simpan transaksi" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });

    await page.goto("/history");
    await expect(page.getByRole("heading", { name: "Riwayat" })).toBeVisible();
    await expect(page.getByText("Ringkasan periode")).toBeVisible();
    await expect(page.getByText("1 transaksi")).toBeVisible({
      timeout: 15_000,
    });

    const combos = page.getByRole("combobox");
    await combos.nth(2).selectOption("1");
    await expect(page).toHaveURL(/[?&]day=1/);
    await expect(page.getByText("1 transaksi")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("analitik menampilkan total dan komposisi", async ({ page }) => {
    await page.goto("/transactions/new");
    await page.getByLabel("Jumlah (IDR)").fill("50000");
    await page.getByLabel("Kategori").selectOption("Belanja");
    await page.getByRole("button", { name: "Simpan transaksi" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });

    await page.goto("/analytics");
    await expect(
      page.getByRole("heading", { name: "Analytics" }),
    ).toBeVisible();
    await expect(page.getByText("Total pengeluaran")).toBeVisible();
    await expect(page.getByText("Komposisi per kategori")).toBeVisible();
    await expect(page.getByText("Belanja")).toBeVisible({ timeout: 15_000 });
  });
});
