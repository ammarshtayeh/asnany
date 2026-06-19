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
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
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
 * Always Google Maps — maps.apple.com shows a blank screen in Messenger/Facebook WebViews.
 */
export function buildDeviceMapUrl(
  doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">,
  userAgent = ""
) {
  void userAgent;
  return buildGoogleMapsUrl(doctor);
}

export function buildBrowserMapUrl(doctorId: string) {
  return `/doctors/${doctorId}/map`;
}

/** Client-side opener — more reliable than target=_blank in some WebViews */
export function openExternalMapsUrl(url: string) {
  if (typeof window === "undefined") return;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) window.location.assign(url);
}

export function openDoctorInExternalMaps(
  doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">
) {
  openExternalMapsUrl(buildGoogleMapsUrl(doctor));
}
