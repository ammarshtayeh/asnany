import { NextResponse } from "next/server";

/** Parse request JSON safely — returns 400 on invalid body instead of crashing to 500. */
export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
): Promise<{ ok: true; body: T } | { ok: false; response: NextResponse }> {
  try {
    const body = (await request.json()) as T;
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "طلب غير صالح — تأكد من إرسال JSON صحيح" }, { status: 400 }),
    };
  }
}

/** Map caught errors to a stable JSON response with the right HTTP status. */
export function jsonError(error: unknown, fallback = "حدث خطأ غير متوقع") {
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "طلب غير صالح — تأكد من إرسال JSON صحيح" }, { status: 400 });
  }
  const message = error instanceof Error && error.message ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: 500 });
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

export async function readResponseJson<T = Record<string, unknown>>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
