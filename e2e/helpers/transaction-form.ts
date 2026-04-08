import type { Page } from "@playwright/test";

/**
 * Isi jumlah IDR pada form tambah/edit transaksi.
 * Yang dikirim ke Server Action adalah `input[name="amount"]` (hidden).
 * Set properti DOM dengan setter asli + sinkronkan tampilan lewat input terlihat.
 */
export async function fillAmountIdr(page: Page, digits: string): Promise<void> {
  const visible = page.getByLabel("Jumlah (IDR)");
  await visible.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const desc = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    );
    desc?.set?.call(input, v);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, digits);

  await page
    .locator('form input[type="hidden"][name="amount"]')
    .evaluate((el, v) => {
      const input = el as HTMLInputElement;
      const desc = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      );
      desc?.set?.call(input, v);
    }, digits);
}
