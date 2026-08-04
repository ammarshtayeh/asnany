export function formatSpecialty(value?: string[] | string | null) {
  if (!value) return "طب أسنان عام";
  if (Array.isArray(value)) return value.filter(Boolean).join("، ") || "طب أسنان عام";
  return String(value);
}

export function formatRating(value?: number | string | null, fallback = "—") {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return numeric.toFixed(1);
}

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

export function normalizeRouteId(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}
