import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("root redirects to dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("dashboard shows beranda or database setup message", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    const beranda = page.getByRole("heading", { name: "Beranda" });
    const dbCard = page.getByRole("heading", { name: "Database belum siap" });
    await expect(beranda.or(dbCard)).toBeVisible({ timeout: 15_000 });
  });

  test("offline page renders", async ({ page }) => {
    await page.goto("/offline");
    await expect(
      page.getByRole("heading", { name: "Koneksi terputus" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Coba lagi" })).toBeVisible();
  });

  test("tambah transaksi page renders", async ({ page }) => {
    await page.goto("/transactions/new");
    await expect(
      page.getByRole("heading", { name: "Tambah transaksi" }),
    ).toBeVisible();
  });
});
