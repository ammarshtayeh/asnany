"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Doctor } from "@/lib/types";
import { doctorMapCoordinates } from "@/lib/map-links";
import L from "leaflet";
import Link from "next/link";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

// Doctor marker icon
const doctorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// User marker icon
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle fitting map to markers
function MapFitter({ doctors, userLocation }: { doctors: Doctor[], userLocation?: { lat: number, lng: number } }) {
  const map = useMap();
  
  useEffect(() => {
    if (doctors.length === 0 && !userLocation) return;
    
    const bounds = L.latLngBounds([]);
    
  doctors.forEach(doc => {
      const coords = doctorMapCoordinates(doc);
      if (coords) bounds.extend([coords.latitude, coords.longitude]);
    });
    
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [doctors, userLocation, map]);

  return null;
}

export default function DoctorMap({ 
  doctors, 
  userLocation 
}: { 
  doctors: Doctor[]; 
  userLocation?: { lat: number; lng: number } 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Center on Palestine (Ramallah approx)
  const defaultCenter: [number, number] = [31.9038, 35.2034];

  if (!mounted) return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg shadow-slate-200/40 z-10 bg-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg shadow-slate-200/40 z-10">
      <MapContainer center={defaultCenter} zoom={9} className="h-full w-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapFitter doctors={doctors} userLocation={userLocation} />

        {/* User Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center font-bold font-sans text-slate-800" dir="rtl">
                موقعك الحالي
              </div>
            </Popup>
          </Marker>
        )}

        {/* Doctor Markers */}
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

        {/* Draw Line if there's 1 doctor and 1 user location */}
        {userLocation && doctors.length === 1 && (
          <Polyline 
            positions={[
              [userLocation.lat, userLocation.lng],
              [doctorMapCoordinates(doctors[0]).latitude, doctorMapCoordinates(doctors[0]).longitude]
            ]} 
            pathOptions={{ color: '#0EA5E9', weight: 3, dashArray: '10, 10', opacity: 0.7 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
