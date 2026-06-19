import { Linking, Platform } from "react-native";
import { cityToCoordinates } from "./palestine-locations";

type MapDoctor = {
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

export function buildGoogleMapsUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const coords = doctorMapCoordinates(doctor);
  return `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
}

function buildIosNativeMapsUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const coords = doctorMapCoordinates(doctor);
  const label = encodeURIComponent(doctorMapLabel(doctor));
  return `maps://?daddr=${coords.latitude},${coords.longitude}&q=${label}&dirflg=d`;
}

function buildAndroidGeoUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const coords = doctorMapCoordinates(doctor);
  const label = encodeURIComponent(doctorMapLabel(doctor));
  return `geo:0,0?q=${coords.latitude},${coords.longitude}(${label})`;
}

/** Opens native maps app (not in-app browser). Falls back to Google Maps web. */
export async function openNativeMaps(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  const googleWeb = buildGoogleMapsUrl(doctor);

  if (Platform.OS === "ios") {
    const nativeUrl = buildIosNativeMapsUrl(doctor);
    try {
      const canOpen = await Linking.canOpenURL(nativeUrl);
      if (canOpen) {
        await Linking.openURL(nativeUrl);
        return;
      }
    } catch {
      // fall through
    }
    try {
      await Linking.openURL(nativeUrl);
      return;
    } catch {
      await Linking.openURL(googleWeb);
    }
    return;
  }

  if (Platform.OS === "android") {
    const geoUrl = buildAndroidGeoUrl(doctor);
    try {
      await Linking.openURL(geoUrl);
      return;
    } catch {
      await Linking.openURL(googleWeb);
    }
    return;
  }

  await Linking.openURL(googleWeb);
}

/** @deprecated use openNativeMaps — kept for callers that need URL string on web */
export function buildNativeMapsUrl(doctor: Pick<MapDoctor, "name" | "city" | "area" | "address" | "lat" | "lng">) {
  if (Platform.OS === "ios") return buildIosNativeMapsUrl(doctor);
  if (Platform.OS === "android") return buildAndroidGeoUrl(doctor);
  return buildGoogleMapsUrl(doctor);
}
