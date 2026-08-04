/** Flexible Palestine city matching for mobile filters. */

export function normalizeCity(value?: string | null) {
  return String(value || "")
    .trim()
    .replace(/[ـ]+/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/البيرة/g, "البيره");
}

export const CITY_ALIASES: Record<string, string[]> = {
  "رام الله": ["رام الله", "رام الله والبيرة", "رام الله والبيره", "البيرة", "البيره"],
  "نابلس": ["نابلس", "مدينة نابلس"],
  "الخليل": ["الخليل", "مدينة الخليل"],
  "بيت لحم": ["بيت لحم", "بيت جالا", "بيت ساحور"],
  "جنين": ["جنين"],
  "طولكرم": ["طولكرم"],
  "قلقيلية": ["قلقيلية"],
  "أريحا": ["أريحا", "أريحا والأغوار"],
  "القدس": ["القدس", "القدس الشريف", "القدس الشرقية"],
  "سلفيت": ["سلفيت"],
  "طوباس": ["طوباس"],
  "غزة": ["غزة", "مدينة غزة", "شمال غزة"],
  "خان يونس": ["خان يونس", "خانيونس"],
  "رفح": ["رفح"],
  "دير البلح": ["دير البلح"],
};

function aliasPool(filterCity: string) {
  const direct = CITY_ALIASES[filterCity] || [filterCity];
  const normalizedFilter = normalizeCity(filterCity);
  for (const [canonical, list] of Object.entries(CITY_ALIASES)) {
    if (list.some((item) => normalizeCity(item) === normalizedFilter)) {
      return Array.from(new Set([...direct, ...list, canonical]));
    }
  }
  return direct;
}

export function cityMatchesFilter(doctorCity?: string | null, filterCity?: string | null) {
  if (!filterCity || filterCity === "الكل") return true;
  const doc = normalizeCity(doctorCity);
  if (!doc) return false;
  const pool = aliasPool(filterCity).map(normalizeCity);
  if (pool.some((alias) => doc === alias)) return true;
  if (pool.some((alias) => alias.length >= 3 && (doc.includes(alias) || alias.includes(doc)))) return true;
  const filter = normalizeCity(filterCity);
  return doc === filter || doc.includes(filter) || filter.includes(doc);
}
