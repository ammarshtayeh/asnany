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

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return Number.NaN;
}

function hasUsableCoordinates(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 31 && lat <= 33 && lng >= 34 && lng <= 36;
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

export function buildDoctorMapUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const label = encodeURIComponent(doctorMapLabel(doctor));
  const lat = toNumber(doctor.lat);
  const lng = toNumber(doctor.lng);

  if (hasUsableCoordinates(lat, lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${label}`;
}

export function buildAppleMapsUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const coords = doctorMapCoordinates(doctor);
  const label = encodeURIComponent(doctorMapLabel(doctor));
  return `https://maps.apple.com/?daddr=${coords.latitude},${coords.longitude}&q=${label}`;
}

export function buildDeviceMapUrl(
  doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">,
  userAgent?: string
) {
  const ua = userAgent || "";
  const isApple = /iPad|iPhone|iPod|Macintosh/i.test(ua);
  return isApple ? buildAppleMapsUrl(doctor) : buildDoctorMapUrl(doctor);
}

export function buildBrowserMapUrl(doctorId: string) {
  return `/doctors/${doctorId}/map`;
}
