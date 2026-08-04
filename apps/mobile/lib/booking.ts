/** Local date/time helpers for mobile booking (avoid UTC day shift). */

export function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toHHMM(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function displayTimeLabel(hhmm: string) {
  const match = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!match) return hhmm;
  const hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? "مساءً" : "صباحاً";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

export function buildWhatsAppBookingMessage(input: {
  doctorName?: string;
  patientName?: string;
  phone?: string;
  date?: string;
  time?: string;
  notes?: string;
}) {
  return [
    `مرحباً، أريد حجز موعد عبر ملامح`,
    input.doctorName ? `العيادة/الطبيب: ${input.doctorName}` : null,
    input.patientName ? `الاسم: ${input.patientName}` : null,
    input.phone ? `الهاتف: ${input.phone}` : null,
    input.date ? `التاريخ المفضل: ${input.date}` : null,
    input.time ? `الوقت المفضل: ${input.time}` : null,
    input.notes ? `ملاحظات: ${input.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function ageFromBirthDate(birthDate?: string | null): number | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const today = toLocalDateString(new Date());
  if (birthDate > today) return null;
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  if (age < 0 || age > 120) return null;
  return age;
}

export function isIdentityRequiredForAge(age: number | null) {
  return age !== null && age >= 17;
}
