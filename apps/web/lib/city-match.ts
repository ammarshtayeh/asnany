/** Flexible Palestine city matching — exact, contains, and aliases. */

export function normalizeCity(value?: string | null) {
  return String(value || "")
    .trim()
    .replace(/[ـ]+/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/البيرة/g, "البيره");
}

/** Canonical filter city → accepted stored spellings */
export const CITY_ALIASES: Record<string, string[]> = {
  "رام الله": ["رام الله", "رام الله والبيرة", "رام الله والبيره", "البيرة", "البيره", "رام الله والبيرة"],
  "نابلس": ["نابلس", "مدينة نابلس"],
  "الخليل": ["الخليل", "مدينة الخليل", "الخليل البلد"],
  "بيت لحم": ["بيت لحم", "بيت لحم المدينة", "بيت جالا", "بيت ساحور"],
  "جنين": ["جنين", "مدينة جنين"],
  "طولكرم": ["طولكرم", "مدينة طولكرم"],
  "قلقيلية": ["قلقيلية", "مدينة قلقيلية"],
  "أريحا": ["أريحا", "مدينة أريحا", "أريحا والأغوار"],
  "القدس": ["القدس", "القدس الشريف", "القدس الشرقية", "أورشليم"],
  "سلفيت": ["سلفيت", "مدينة سلفيت"],
  "طوباس": ["طوباس", "مدينة طوباس"],
  "غزة": ["غزة", "مدينة غزة", "غزة المدينة", "شمال غزة"],
  "خان يونس": ["خان يونس", "خانيونس"],
  "رفح": ["رفح", "مدينة رفح"],
  "دير البلح": ["دير البلح", "الوسطى"],
  "الضفة الغربية - أخرى": ["الضفة الغربية - أخرى", "أخرى", "الضفة"],
  "قطاع غزة - أخرى": ["قطاع غزة - أخرى", "غزة - أخرى"],
};

function aliasPool(filterCity: string) {
  const direct = CITY_ALIASES[filterCity] || [filterCity];
  const normalizedFilter = normalizeCity(filterCity);
  // Also match if filter itself is an alias of a canonical city
  for (const [canonical, list] of Object.entries(CITY_ALIASES)) {
    if (list.some((item) => normalizeCity(item) === normalizedFilter)) {
      return Array.from(new Set([...direct, ...list, canonical]));
    }
  }
  return direct;
}

export function cityMatchesFilter(doctorCity?: string | null, filterCity?: string | null) {
  if (!filterCity) return true;
  const doc = normalizeCity(doctorCity);
  if (!doc) return false;

  const pool = aliasPool(filterCity).map(normalizeCity);
  if (pool.some((alias) => doc === alias)) return true;
  if (pool.some((alias) => alias.length >= 3 && (doc.includes(alias) || alias.includes(doc)))) return true;

  const filter = normalizeCity(filterCity);
  return doc === filter || doc.includes(filter) || filter.includes(doc);
}
