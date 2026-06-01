import { cityToCoordinates } from "./palestine-locations";

export type MapDoctor = {
  id?: string;
  name: string;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export function doctorMapLabel(doctor: Pick<MapDoctor, "city" | "area" | "address" | "name">) {
  return [doctor.city, doctor.area, doctor.address].filter(Boolean).join(" • ") || doctor.name;
}

export function doctorMapCoordinates(doctor: Pick<MapDoctor, "lat" | "lng" | "city" | "area" | "address">) {
  if (doctor.lat !== null && doctor.lat !== undefined && doctor.lng !== null && doctor.lng !== undefined) {
    return { latitude: doctor.lat, longitude: doctor.lng };
  }

  return cityToCoordinates(doctor.city || doctor.area || doctor.address || "");
}

export function buildDoctorMapUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const label = encodeURIComponent(doctorMapLabel(doctor));
  const hasCoords = doctor.lat !== null && doctor.lat !== undefined && doctor.lng !== null && doctor.lng !== undefined;
  if (hasCoords) {
    // Use directions API with exact destination coordinates for precise pinning
    return `https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lng}`;
  }

  // Fallback to searching the text label if no coords are present
  return `https://www.google.com/maps/dir/?api=1&destination=${label}`;
}

export function buildAppleMapsUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const coords = doctorMapCoordinates(doctor);
  const label = encodeURIComponent(doctorMapLabel(doctor));
  // Use 'daddr' for directions destination in Apple Maps
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
