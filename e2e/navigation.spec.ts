import { expect, test } from "@playwright/test";

test.describe("navigasi bottom bar", () => {
  test("buka semua tab utama dari bottom nav", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Beranda" })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("link", { name: "Tanya" }).click();
    await expect(
      page.getByRole("heading", { name: "Tanya Keuangan" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Riwayat" }).click();
    await expect(page.getByRole("heading", { name: "Riwayat" })).toBeVisible();

    await page.getByRole("link", { name: "Analitik" }).click();
    await expect(
      page.getByRole("heading", { name: "Analytics" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Tambah" }).click();
    await expect(
      page.getByRole("heading", { name: "Tambah transaksi" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Beranda" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
