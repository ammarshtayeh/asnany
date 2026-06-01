import { Platform } from "react-native";
import { cityToCoordinates } from "./palestine-locations";

type MapDoctor = {
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
  if (doctor.lat && doctor.lng) {
    return { latitude: doctor.lat, longitude: doctor.lng };
  }

  return cityToCoordinates(doctor.city || doctor.area || doctor.address || "");
}

export function buildNativeMapsUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const coords = doctorMapCoordinates(doctor);
  const label = encodeURIComponent(doctorMapLabel(doctor));

  if (Platform.OS === "ios") {
    return `https://maps.apple.com/?ll=${coords.latitude},${coords.longitude}&q=${label}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
}
