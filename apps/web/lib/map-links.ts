import { cityToCoordinates } from "./palestine-locations";

export type MapDoctor = {
  id?: string;
  name: string;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
};

/** In-app browsers (Messenger, Instagram, Facebook…) break maps.apple.com */
const IN_APP_BROWSER_PATTERN =
  /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Messenger|Twitter|TikTok|Snapchat|LinkedInApp|GSA\/|wv\)/i;

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return Number.NaN;
}

function hasUsableCoordinates(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 31 && lat <= 33 && lng >= 34 && lng <= 36;
}

export function isInAppBrowser(userAgent = "") {
  return IN_APP_BROWSER_PATTERN.test(userAgent);
}

export function doctorMapLabel(doctor: Pick<MapDoctor, "city" | "area" | "address" | "name">) {
  return [doctor.city, doctor.area, doctor.address].filter(Boolean).join(" - ") || doctor.name;
}

export function doctorMapCoordinates(doctor: Pick<MapDoctor, "lat" | "lng" | "city" | "area" | "address">) {
  const lat = toNumber(doctor.lat);
  const lng = toNumber(doctor.lng);

  if (hasUsableCoordinates(lat, lng)) {
    return { latitude: lat, longitude: lng };
  }

  return cityToCoordinates(doctor.city || doctor.area || doctor.address || "");
}

/** Google Maps — works on desktop, mobile Safari, PWA, and in-app browsers */
export function buildGoogleMapsUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const coords = doctorMapCoordinates(doctor);
  return buildGoogleMapsDirectionsUrl(coords.latitude, coords.longitude);
}

export function buildGoogleMapsDirectionsUrl(destLat: number, destLng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
}

export function buildGoogleMapsPlaceUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function getUserAgent(userAgent?: string) {
  return userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "");
}

/** Platform-aware external maps for coordinates (user location or any point) */
export function buildCoordinatesExternalUrl(
  lat: number,
  lng: number,
  label = "موقعي",
  userAgent?: string
) {
  const ua = getUserAgent(userAgent);

  if (isInAppBrowser(ua)) {
    return buildGoogleMapsPlaceUrl(lat, lng);
  }

  if (/iPad|iPhone|iPod/i.test(ua)) {
    return `maps://?ll=${lat},${lng}&q=${encodeURIComponent(label)}`;
  }

  if (/Android/i.test(ua)) {
    return `geo:0,0?q=${lat},${lng}(${encodeURIComponent(label)})`;
  }

  return buildGoogleMapsPlaceUrl(lat, lng);
}

/** Turn-by-turn / directions to a destination — platform-aware on web */
export function buildDirectionsExternalUrl(
  destLat: number,
  destLng: number,
  label: string,
  userAgent?: string
) {
  const ua = getUserAgent(userAgent);

  if (isInAppBrowser(ua)) {
    return buildGoogleMapsDirectionsUrl(destLat, destLng);
  }

  if (/iPad|iPhone|iPod/i.test(ua)) {
    return `maps://?daddr=${destLat},${destLng}&dirflg=d&q=${encodeURIComponent(label)}`;
  }

  if (/Android/i.test(ua)) {
    return `google.navigation:q=${destLat},${destLng}`;
  }

  return buildGoogleMapsDirectionsUrl(destLat, destLng);
}

/** @deprecated use buildGoogleMapsUrl */
export function buildDoctorMapUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  return buildGoogleMapsUrl(doctor);
}

/** Apple Maps HTTPS — avoid in webviews; kept for reference only */
export function buildAppleMapsWebUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const coords = doctorMapCoordinates(doctor);
  const label = encodeURIComponent(doctorMapLabel(doctor));
  return `https://maps.apple.com/?daddr=${coords.latitude},${coords.longitude}&q=${label}`;
}

/**
 * External maps link for the website (laptop, phone browser, PWA, in-app browsers).
 * Uses native maps on iOS/Android Safari; Google Maps in in-app browsers.
 */
export function buildDeviceMapUrl(
  doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">,
  userAgent = ""
) {
  const coords = doctorMapCoordinates(doctor);
  return buildDirectionsExternalUrl(coords.latitude, coords.longitude, doctorMapLabel(doctor), userAgent);
}

export function buildBrowserMapUrl(doctorId: string) {
  return `/doctors/${doctorId}/map`;
}

/** Client-side opener — native schemes use location.assign */
export function openExternalMapsUrl(url: string) {
  if (typeof window === "undefined") return;

  const isNativeScheme =
    url.startsWith("maps://") ||
    url.startsWith("geo:") ||
    url.startsWith("google.navigation:");

  if (isNativeScheme) {
    window.location.assign(url);
    return;
  }

  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) window.location.assign(url);
}

export function openCoordinatesInExternalMaps(lat: number, lng: number, label = "موقعي") {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  openExternalMapsUrl(buildCoordinatesExternalUrl(lat, lng, label, ua));
}

export function openDoctorInExternalMaps(
  doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">
) {
  const coords = doctorMapCoordinates(doctor);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  openExternalMapsUrl(
    buildDirectionsExternalUrl(coords.latitude, coords.longitude, doctorMapLabel(doctor), ua)
  );
}
