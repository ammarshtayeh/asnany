export function formatSpecialty(value?: string[] | string | null) {
  if (!value) return "غير محدد";
  if (Array.isArray(value)) return value.filter(Boolean).join("، ") || "غير محدد";
  return String(value);
}
