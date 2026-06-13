import { Linking, Pressable, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { Doctor } from "../lib/types";
import { buildNativeMapsUrl, doctorMapLabel, doctorMapCoordinates } from "../lib/map-links";
import { colors } from "../constants/theme";

export function ClinicMap({ doctor }: { doctor: Doctor }) {
  const mapRef = useRef<MapView>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const coordinates = doctorMapCoordinates(doctor);
  
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let location = await Location.getCurrentPositionAsync({});
        setUserLoc({ lat: location.coords.latitude, lng: location.coords.longitude });
      } catch (error) {
        console.log("Could not get location", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const points = [{ latitude: coordinates.latitude, longitude: coordinates.longitude }];
    if (userLoc) {
      points.push({ latitude: userLoc.lat, longitude: userLoc.lng });
    }

    mapRef.current.fitToCoordinates(points, {
      animated: true,
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
    });
  }, [coordinates.latitude, coordinates.longitude, userLoc]);

  const region = coordinates
    ? {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 31.9,
        longitude: 35.2,
        latitudeDelta: 0.9,
        longitudeDelta: 0.9,
      };

  const openInMaps = async () => {
    await Linking.openURL(buildNativeMapsUrl(doctor));
  };

  return (
    <View style={{ borderRadius: 24, backgroundColor: "#eff6ff", padding: 14, borderWidth: 1, borderColor: "#bfdbfe" }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#0f172a", fontSize: 16 }}>خريطة العيادة</Text>
      <Text style={{ textAlign: "right", color: "#475569", marginTop: 4, fontWeight: "700", fontSize: 12 }}>
        {doctorMapLabel(doctor)}
      </Text>

      <View style={{ marginTop: 12, height: 220, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "#bfdbfe" }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={region}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
        >
          {coordinates ? (
            <Marker coordinate={{ latitude: coordinates.latitude, longitude: coordinates.longitude }} title={doctor.name} description={doctor.address || doctor.availability_note || doctor.city || ""} />
          ) : null}
          
          {userLoc ? (
            <Marker coordinate={{ latitude: userLoc.lat, longitude: userLoc.lng }} title="موقعي الحالي">
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <View style={{
                  position: "absolute",
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(2, 132, 199, 0.2)",
                  borderWidth: 1.5,
                  borderColor: "rgba(2, 132, 199, 0.4)",
                }} />
                <View style={{
                  backgroundColor: "#fff",
                  padding: 6,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: colors.sky,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 6,
                }}>
                  <Ionicons name="location-sharp" size={20} color={colors.sky} />
                </View>
              </View>
            </Marker>
          ) : null}
        </MapView>
      </View>

      <Text style={{ marginTop: 10, textAlign: "right", color: "#334155", fontSize: 12, fontWeight: "700" }}>
        {doctor.address || doctor.availability_note || "اضغط على الطبيب لرؤية التفاصيل الكاملة والمواعيد والحجز."}
      </Text>

      <Pressable
        onPress={openInMaps}
        style={{
          marginTop: 12,
          minHeight: 44,
          borderRadius: 18,
          backgroundColor: "#0f172a",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>افتح في خرائط الجهاز</Text>
      </Pressable>
    </View>
  );
}
