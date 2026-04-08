import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getMonthTabName } from "./sheet-tabs";

describe("getMonthTabName", () => {
  it("membuat nama tab MMMM_YYYY (id)", () => {
    assert.equal(getMonthTabName(2026, 4), "April_2026");
    assert.equal(getMonthTabName(2026, 12), "Desember_2026");
  });

  it("throw untuk input tidak valid", () => {
    assert.throws(() => getMonthTabName(1800, 4));
    assert.throws(() => getMonthTabName(2026, 0));
    assert.throws(() => getMonthTabName(2026, 13));
  });
});
