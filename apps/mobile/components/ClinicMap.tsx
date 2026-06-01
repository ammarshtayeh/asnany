import { Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Doctor } from "../lib/types";
import { cityToCoordinates } from "../lib/palestine-locations";

export function ClinicMap({ doctor }: { doctor: Doctor }) {
  const coordinates = cityToCoordinates(doctor.city || doctor.area || doctor.address || "");
  const region = coordinates
    ? {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.45,
        longitudeDelta: 0.45,
      }
    : {
        latitude: 31.9,
        longitude: 35.2,
        latitudeDelta: 0.9,
        longitudeDelta: 0.9,
      };

  return (
    <View style={{ borderRadius: 24, backgroundColor: "#eff6ff", padding: 14, borderWidth: 1, borderColor: "#bfdbfe" }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#0f172a", fontSize: 16 }}>خريطة العيادة</Text>
      <Text style={{ textAlign: "right", color: "#475569", marginTop: 4, fontWeight: "700", fontSize: 12 }}>
        {doctor.city || "المدينة غير محددة"} {doctor.area ? `• ${doctor.area}` : ""}
      </Text>

      <View style={{ marginTop: 12, height: 220, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "#bfdbfe" }}>
        <MapView
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
        </MapView>
      </View>

      <Text style={{ marginTop: 10, textAlign: "right", color: "#334155", fontSize: 12, fontWeight: "700" }}>
        {doctor.address || doctor.availability_note || "اضغط على الطبيب لرؤية التفاصيل الكاملة والمواعيد والحجز."}
      </Text>
    </View>
  );
}
