import { expect, test } from "@playwright/test";

import { hasDatabaseUrl, truncateTransactions } from "./db";
import { fillAmountIdr } from "./helpers/transaction-form";

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

    await fillAmountIdr(page, "25000");
    await page.getByLabel("Kategori").selectOption("Makan & minum");
    await page.getByLabel("Catatan (opsional)").fill(marker);
    await page.getByRole("button", { name: "Simpan transaksi" }).click();

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    await expect(page.getByText(marker)).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("edit dan hapus transaksi", () => {
  test.beforeEach(async () => {
    test.skip(
      !hasDatabaseUrl(),
      "Butuh DATABASE_URL (branch Neon tes) untuk integrasi DB",
    );
    await truncateTransactions();
  });

  test("edit: ubah catatan lalu kembali ke beranda dengan data baru", async ({
    page,
  }) => {
    const ts = Date.now();
    const before = `E2E-EDIT-BEFORE-${ts}`;
    const after = `E2E-EDIT-AFTER-${ts}`;

    await page.goto("/transactions/new");
    await expect(
      page.getByRole("heading", { name: "Tambah transaksi" }),
    ).toBeVisible();

    await fillAmountIdr(page, "12000");
    await page.getByLabel("Kategori").selectOption("Makan & minum");
    await page.getByLabel("Catatan (opsional)").fill(before);
    await page.getByRole("button", { name: "Simpan transaksi" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    await expect(page.getByText(before)).toBeVisible({ timeout: 15_000 });

    const row = page.getByRole("listitem").filter({ hasText: before });
    await row.scrollIntoViewIfNeeded();
    await row
      .getByRole("link", { name: "Edit transaksi Makan & minum" })
      .click();

    await expect(page).toHaveURL(/\/transactions\/[^/]+\/edit$/, {
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: "Edit transaksi" }),
    ).toBeVisible();

    await page.getByLabel("Catatan (opsional)").fill(after);
    await page.getByRole("button", { name: "Simpan perubahan" }).click();

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    await expect(page.getByText(after)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(before)).not.toBeVisible();
  });

  test("hapus: konfirmasi dialog lalu transaksi hilang (Riwayat)", async ({
    page,
  }) => {
    const marker = `E2E-DEL-${Date.now()}`;

    await page.goto("/transactions/new");
    await expect(
      page.getByRole("heading", { name: "Tambah transaksi" }),
    ).toBeVisible();

    await fillAmountIdr(page, "8000");
    await page.getByLabel("Kategori").selectOption("Transportasi");
    await page.getByLabel("Catatan (opsional)").fill(marker);
    await page.getByRole("button", { name: "Simpan transaksi" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    await expect(page.getByText(marker)).toBeVisible({ timeout: 15_000 });

    await page.goto("/history");
    await expect(page.getByRole("heading", { name: "Riwayat" })).toBeVisible();
    await expect(page.getByText(marker)).toBeVisible({ timeout: 15_000 });

    const row = page.getByRole("listitem").filter({ hasText: marker });
    await row
      .getByRole("button", { name: "Hapus transaksi Transportasi" })
      .click();

    await expect(
      page.getByText("Hapus transaksi ini? Tindakan tidak bisa dibatalkan."),
    ).toBeVisible({ timeout: 15_000 });

    const panel = page.locator('[data-testid="transaction-delete-confirm"]');
    await panel.getByRole("button", { name: "Hapus" }).click();

    await expect(page.getByText(marker)).not.toBeVisible({ timeout: 15_000 });
  });

  test("hapus: Batal menutup dialog tanpa menghapus", async ({ page }) => {
    const marker = `E2E-DEL-CANCEL-${Date.now()}`;

    await page.goto("/transactions/new");
    await fillAmountIdr(page, "5000");
    await page.getByLabel("Kategori").selectOption("Belanja");
    await page.getByLabel("Catatan (opsional)").fill(marker);
    await page.getByRole("button", { name: "Simpan transaksi" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    await expect(page.getByText(marker)).toBeVisible({ timeout: 15_000 });

    await page.goto("/history");
    await expect(page.getByRole("heading", { name: "Riwayat" })).toBeVisible();
    await expect(page.getByText(marker)).toBeVisible({ timeout: 15_000 });

    const row = page.getByRole("listitem").filter({ hasText: marker });
    await row.getByRole("button", { name: "Hapus transaksi Belanja" }).click();

    await expect(
      page.getByText("Hapus transaksi ini? Tindakan tidak bisa dibatalkan."),
    ).toBeVisible({ timeout: 15_000 });

    const panel = page.locator('[data-testid="transaction-delete-confirm"]');
    await panel.getByRole("button", { name: "Batal" }).click();
    await expect(panel).not.toBeVisible();
    await expect(page.getByText(marker)).toBeVisible();
  });
});
