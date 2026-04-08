import { expect, test } from "@playwright/test";

test.describe("input cepat AI (NLI)", () => {
  test("validasi teks terlalu pendek", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page
        .getByRole("heading", { name: "Beranda" })
        .or(page.getByRole("heading", { name: "Database belum siap" })),
    ).toBeVisible({ timeout: 15_000 });

    if (
      await page
        .getByRole("heading", { name: "Database belum siap" })
        .isVisible()
    ) {
      test.skip();
    }

    await expect(page.getByText("Input cepat AI")).toBeVisible();

    await page.getByPlaceholder(/Contoh:/).fill("ab");
    await page.getByRole("button", { name: "AI" }).click();
    await expect(
      page.getByText(/lebih detail|tidak valid|Masukkan kalimat/i),
    ).toBeVisible({ timeout: 15_000 });
  });
});
