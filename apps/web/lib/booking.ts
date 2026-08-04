/** Booking helpers — Asia/Hebron aware */

const HEBRON = "Asia/Hebron";

const WEEKDAY_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] as const;

export function normalizePhone(phone?: string | null) {
  return String(phone || "").replace(/[^0-9]/g, "");
}

export function normalizeBookingRef(ref?: string | null) {
  return String(ref || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^#/, "");
}

/** Force HH:MM (24h). Accepts Arabic am/pm labels from older mobile clients. */
export function normalizeTimeToHHMM(raw?: string | null): string | null {
  const value = String(raw || "").trim();
  if (!value) return null;

  const arabic = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(صباحاً|مساءً|ص|م)?$/);
  if (arabic) {
    let hour = Number(arabic[1]);
    const minute = Number(arabic[2]);
    const period = arabic[3];
    if (period === "مساءً" || period === "م") {
      if (hour < 12) hour += 12;
    } else if ((period === "صباحاً" || period === "ص") && hour === 12) {
      hour = 0;
    }
    if (hour > 23 || minute > 59) return null;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const iso = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!iso) return null;
  const hour = Number(iso[1]);
  const minute = Number(iso[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function isValidDateString(date?: string | null) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function hebronParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HEBRON,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour") === "24" ? "0" : get("hour")),
    minute: Number(get("minute")),
  };
}

export function hebronToday() {
  return hebronParts().date;
}

/** Age in full years as of Hebron "today". Returns null if birth date invalid/future. */
export function ageFromBirthDate(birthDate?: string | null, now = new Date()): number | null {
  if (!isValidDateString(birthDate || "")) return null;
  const today = hebronParts(now).date;
  if (birthDate! > today) return null;

  const [by, bm, bd] = birthDate!.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  if (age < 0 || age > 120) return null;
  return age;
}

/** Identity is required for patients aged 17+ (Palestinian ID practice). */
export function isIdentityRequiredForAge(age: number | null) {
  return age !== null && age >= 17;
}

/** Local calendar YYYY-MM-DD without UTC shift (for mobile pickers). */
export function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isPastAppointment(date: string, time: string, now = new Date()) {
  const current = hebronParts(now);
  if (date < current.date) return true;
  if (date > current.date) return false;
  const [h, m] = time.split(":").map(Number);
  return h < current.hour || (h === current.hour && m <= current.minute);
}

export function weekdayArFromDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return WEEKDAY_AR[parsed.getDay()];
}

export function isDoctorClosedOnDate(
  doctor: {
    is_available?: boolean | null;
    availability_note?: string | null;
    working_hours?: Record<string, string> | null;
  },
  date: string
) {
  if (doctor.is_available === false) return true;
  const note = String(doctor.availability_note || "");
  if (note.includes("مغلق")) return true;

  const day = weekdayArFromDate(date);
  const hours = String(doctor.working_hours?.[day] || "");
  if (!hours) return false;
  return hours.includes("مغلق") || /closed/i.test(hours);
}

export function generateBookingRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MLH-${code}`;
}

export function buildWhatsAppBookingMessage(input: {
  doctorName?: string;
  patientName?: string;
  phone?: string;
  date?: string;
  time?: string;
  notes?: string;
}) {
  const lines = [
    `مرحباً، أريد حجز موعد عبر ملامح`,
    input.doctorName ? `العيادة/الطبيب: ${input.doctorName}` : null,
    input.patientName ? `الاسم: ${input.patientName}` : null,
    input.phone ? `الهاتف: ${input.phone}` : null,
    input.date ? `التاريخ المفضل: ${input.date}` : null,
    input.time ? `الوقت المفضل: ${input.time}` : null,
    input.notes ? `ملاحظات: ${input.notes}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function whatsappHref(rawWhatsapp?: string | null, message?: string) {
  const phone = normalizePhone(rawWhatsapp);
  if (!phone) return null;
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
