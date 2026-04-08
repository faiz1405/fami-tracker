import { expect, test } from "@playwright/test";

test.describe("pindai struk (UI)", () => {
  test("tombol pindai struk terlihat di form tambah", async ({ page }) => {
    await page.goto("/transactions/new");
    await expect(
      page.getByRole("button", { name: /Pindai struk dengan AI/ }),
    ).toBeVisible();
    await expect(
      page.getByText("Foto struk (opsional)", { exact: true }),
    ).toBeVisible();
  });
});
