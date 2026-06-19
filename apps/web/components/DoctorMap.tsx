"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Doctor } from "@/lib/types";
import { doctorMapCoordinates, openCoordinatesInExternalMaps } from "@/lib/map-links";
import type { UserMapLocation } from "@/lib/geolocation";
import L from "leaflet";
import Link from "next/link";
import { Home, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const doctorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function createUserHomeIcon() {
  return L.divIcon({
    className: "malamih-user-location-marker",
    html: `
      <div class="malamih-user-home-pin" aria-hidden="true">
        <span class="malamih-user-home-pin__pulse"></span>
        <span class="malamih-user-home-pin__core">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
            <path d="M12 3.2 4 10v10a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1V10L12 3.2z"/>
          </svg>
        </span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function MapFitter({
  doctors,
  userLocation,
}: {
  doctors: Doctor[];
  userLocation?: UserMapLocation;
}) {
  const map = useMap();

  useEffect(() => {
    if (doctors.length === 0 && !userLocation) return;

    const bounds = L.latLngBounds([]);

    doctors.forEach((doc) => {
      const coords = doctorMapCoordinates(doc);
      bounds.extend([coords.latitude, coords.longitude]);
    });

    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [doctors, userLocation, map]);

  return null;
}

export default function DoctorMap({
  doctors,
  userLocation,
}: {
  doctors: Doctor[];
  userLocation?: UserMapLocation;
}) {
  const [mounted, setMounted] = useState(false);
  const userHomeIcon = useMemo(() => createUserHomeIcon(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultCenter: [number, number] = [31.9038, 35.2034];

  if (!mounted) {
    return (
      <div className="h-full w-full rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg shadow-slate-200/40 z-10 bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg shadow-slate-200/40 z-10">
      <MapContainer center={defaultCenter} zoom={9} className="h-full w-full" scrollWheelZoom={false} touchZoom zoomControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFitter doctors={doctors} userLocation={userLocation} />

        {userLocation?.accuracy && userLocation.accuracy > 0 ? (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={Math.min(userLocation.accuracy, 500)}
            pathOptions={{
              color: "#0ea5e9",
              fillColor: "#0ea5e9",
              fillOpacity: 0.12,
              weight: 2,
              dashArray: "4 6",
            }}
          />
        ) : null}

        {userLocation ? (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userHomeIcon}>
            <Popup className="malamih-user-popup">
              <div className="min-w-[180px] text-right font-sans text-slate-800" dir="rtl">
                <div className="flex items-center justify-end gap-2">
                  <p className="font-black text-slate-900">موقعك الحالي</p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Home className="h-4 w-4" />
                  </span>
                </div>
                {userLocation.accuracy ? (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    دقة تقريبية: ±{Math.round(userLocation.accuracy)} م
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => openCoordinatesInExternalMaps(userLocation.lat, userLocation.lng, "موقعي")}
                  className="mt-3 w-full rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-primary"
                >
                  افتح في خرائط الجهاز
                </button>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {doctors.map((doc) => {
          const coords = doctorMapCoordinates(doc);
          return (
            <Marker key={doc.id} position={[coords.latitude, coords.longitude]} icon={doctorIcon}>
              <Popup className="rounded-xl overflow-hidden">
                <div className="flex flex-col gap-2 p-1 text-right font-sans" dir="rtl">
                  <h3 className="font-bold text-slate-900 text-[15px]">{doc.name}</h3>
                  <p className="text-xs text-slate-500 bg-slate-100 rounded-md px-2 py-1 inline-block w-fit">
                    {doc.specialty.join("، ")}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500 mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold text-slate-700">{doc.rating}</span>
                  </div>
                  <Link
                    href={`/doctors/${doc.id}`}
                    className="mt-3 text-xs bg-primary text-white text-center py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 font-bold"
                  >
                    عرض الملف والحجز
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {userLocation && doctors.length === 1 ? (
          <Polyline
            positions={[
              [userLocation.lat, userLocation.lng],
              [doctorMapCoordinates(doctors[0]).latitude, doctorMapCoordinates(doctors[0]).longitude],
            ]}
            pathOptions={{ color: "#0EA5E9", weight: 3, dashArray: "10, 10", opacity: 0.7 }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
