import { expect, test } from "@playwright/test";

test.describe("tanya keuangan (AI consultant)", () => {
  test("tombol Tanya nonaktif jika kurang dari 5 karakter", async ({
    page,
  }) => {
    await page.goto("/consultant");
    await expect(
      page.getByRole("heading", { name: "Tanya Keuangan" }),
    ).toBeVisible();

    await page
      .getByPlaceholder("Tanya kondisi keuangan keluarga...")
      .fill("abcd");
    await expect(page.getByRole("button", { name: "Tanya" })).toBeDisabled();
  });

  test("kirim pertanyaan panjang: sukses chat atau pesan error API", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const q = "Bagaimana pola pengeluaran kami bulan ini secara singkat?";
    await page.goto("/consultant");
    await page.getByPlaceholder("Tanya kondisi keuangan keluarga...").fill(q);
    await page.getByRole("button", { name: "Tanya" }).click();

    await expect(
      page
        .getByText(
          /OPENAI_API_KEY|Gagal memproses pertanyaan|Format jawaban AI/,
        )
        .or(page.getByText(q, { exact: true })),
    ).toBeVisible({ timeout: 90_000 });
  });
});
