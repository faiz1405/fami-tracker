import "server-only";

import { google } from "googleapis";

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  if (!id) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID belum diset.");
  }
  return id;
}

type ServiceAccountJson = {
  client_email: string;
  private_key: string;
};

function parseServiceAccountJson(raw: string): ServiceAccountJson {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON bukan JSON valid.");
  }
  if (!obj || typeof obj !== "object") {
    throw new Error("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON tidak valid.");
  }
  const record = obj as Record<string, unknown>;
  const client_email = record.client_email;
  const private_key = record.private_key;
  if (typeof client_email !== "string" || client_email.trim().length === 0) {
    throw new Error("client_email pada service account JSON tidak valid.");
  }
  if (typeof private_key !== "string" || private_key.trim().length === 0) {
    throw new Error("private_key pada service account JSON tidak valid.");
  }
  return { client_email, private_key };
}

function getServiceAccountCredentials(): ServiceAccountJson {
  const raw = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    throw new Error("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON belum diset.");
  }
  const { client_email, private_key } = parseServiceAccountJson(raw);
  return {
    client_email,
    // Private key di env sering disimpan dengan `\\n`
    private_key: private_key.replace(/\\n/g, "\n"),
  };
}

function createJwt() {
  const { client_email, private_key } = getServiceAccountCredentials();
  return new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getSheetsClient() {
  const auth = createJwt();
  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, spreadsheetId: getSpreadsheetId() };
}

export type SheetInfo = { sheetId: number; title: string };

export async function listSheets(): Promise<SheetInfo[]> {
  const { sheets, spreadsheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });
  const out: SheetInfo[] = [];
  for (const s of res.data.sheets ?? []) {
    const p = s.properties;
    if (!p?.sheetId || !p.title) continue;
    out.push({ sheetId: p.sheetId, title: p.title });
  }
  return out;
}

export async function ensureSheetExists(title: string): Promise<SheetInfo> {
  const existing = (await listSheets()).find((s) => s.title === title);
  if (existing) return existing;

  const { sheets, spreadsheetId } = getSheetsClient();
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }],
    },
  });
  const reply = res.data.replies?.[0]?.addSheet?.properties;
  if (!reply?.sheetId || !reply.title) {
    throw new Error("Gagal membuat tab baru di Google Sheets.");
  }
  return { sheetId: reply.sheetId, title: reply.title };
}

export async function writeHeaderIfEmpty(
  tabName: string,
  header: string[],
): Promise<void> {
  const { sheets, spreadsheetId } = getSheetsClient();

  const range = `${tabName}!A1:Z1`;
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const hasAny =
    (existing.data.values?.[0]?.some(
      (v) => String(v ?? "").trim().length > 0,
    ) ?? false) === true;
  if (hasAny) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [header] },
  });
}

export async function appendRows(
  tabName: string,
  rows: Array<Array<string | number | null>>,
): Promise<number> {
  const { sheets, spreadsheetId } = getSheetsClient();
  if (rows.length === 0) return 0;

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:H`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows },
  });

  const updated = res.data.updates?.updatedRows;
  return typeof updated === "number" ? updated : rows.length;
}
