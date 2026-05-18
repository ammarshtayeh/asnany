"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Locate } from "lucide-react";

// Red selected location marker icon
const locationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to fly to specific coordinate when it changes
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
}

// Click listener to set coordinates
function MapClickEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ lat, lng, onChange }: LocationPickerMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          alert("فشل تحديد الموقع التلقائي. يرجى تفعيل إذن الوصول للموقع.");
          console.error(error);
        }
      );
    } else {
      alert("متصفحك لا يدعم تحديد الموقع التلقائي.");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[lat, lng]} icon={locationIcon} />
        <MapRecenter lat={lat} lng={lng} />
        <MapClickEvents onMapClick={onChange} />
      </MapContainer>

      {/* GPS Locate Button */}
      <button
        type="button"
        onClick={handleLocateUser}
        className="absolute bottom-5 right-5 z-20 bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-200/80 transition-all flex items-center gap-2 text-xs"
      >
        <Locate className="w-4 h-4 text-primary animate-pulse" />
        تحديد موقعي الحالي (GPS)
      </button>
    </div>
  );
}
