type Coordinates = {
  latitude: number;
  longitude: number;
};

const CITY_COORDINATES: Record<string, Coordinates> = {
  "القدس": { latitude: 31.7683, longitude: 35.2137 },
  "رام الله": { latitude: 31.9038, longitude: 35.2034 },
  "البيرة": { latitude: 31.9072, longitude: 35.2061 },
  "نابلس": { latitude: 32.2211, longitude: 35.2544 },
  "الخليل": { latitude: 31.5326, longitude: 35.0998 },
  "بيت لحم": { latitude: 31.7054, longitude: 35.2008 },
  "جنين": { latitude: 32.4595, longitude: 35.3006 },
  "طولكرم": { latitude: 32.3104, longitude: 35.0287 },
  "قلقيلية": { latitude: 32.1896, longitude: 34.9702 },
  "طوباس": { latitude: 32.3208, longitude: 35.3718 },
  "سلفيت": { latitude: 32.0717, longitude: 35.1805 },
  "أريحا": { latitude: 31.8569, longitude: 35.4444 },
  "غزة": { latitude: 31.5017, longitude: 34.4668 },
  "خان يونس": { latitude: 31.3462, longitude: 34.3039 },
  "رفح": { latitude: 31.2965, longitude: 34.2435 },
  "دير البلح": { latitude: 31.4183, longitude: 34.3508 },
  "بيت حانون": { latitude: 31.5354, longitude: 34.5351 },
  "بيت لاهيا": { latitude: 31.5505, longitude: 34.4997 },
};

export function normalizeLocation(value?: string | null) {
  return (value || "")
    .trim()
    .replace(/[ـ]+/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function cityToCoordinates(city?: string | null, area?: string | null) {
  const normalizedCity = normalizeLocation(city);
  const normalizedArea = normalizeLocation(area);

  const cityEntry = Object.entries(CITY_COORDINATES).find(([name]) => normalizeLocation(name) === normalizedCity);
  if (cityEntry) {
    return cityEntry[1];
  }

  const areaEntry = Object.entries(CITY_COORDINATES).find(([name]) => normalizeLocation(name) === normalizedArea);
  if (areaEntry) {
    return areaEntry[1];
  }

  return { latitude: 31.9522, longitude: 35.2332 };
}

