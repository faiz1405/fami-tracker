import { expect, test } from "@playwright/test";

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
});
