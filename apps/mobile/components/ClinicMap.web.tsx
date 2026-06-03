import { Linking, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Doctor } from "../lib/types";
import { buildNativeMapsUrl, doctorMapLabel } from "../lib/map-links";

export function ClinicMap({ doctor }: { doctor: Doctor }) {
  const openInMaps = () => {
    void Linking.openURL(buildNativeMapsUrl(doctor));
  };

  return (
    <View style={{ borderRadius: 24, backgroundColor: "#eff6ff", padding: 14, borderWidth: 1, borderColor: "#bfdbfe" }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#0f172a", fontSize: 16 }}>خريطة العيادة</Text>
      <Text style={{ textAlign: "right", color: "#475569", marginTop: 4, fontWeight: "700", fontSize: 12 }}>{doctorMapLabel(doctor)}</Text>

      <View
        style={{
          marginTop: 12,
          minHeight: 220,
          borderRadius: 22,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#bfdbfe",
          backgroundColor: "#f8fafc",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            backgroundColor: "#dbeafe",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Feather name="map-pin" size={34} color="#0284c7" />
        </View>
        <Text style={{ textAlign: "center", color: "#0f172a", fontWeight: "900", fontSize: 16 }}>
          الخريطة التفاعلية تظهر على التطبيق
        </Text>
        <Text style={{ textAlign: "center", color: "#475569", fontWeight: "700", fontSize: 12, marginTop: 6, lineHeight: 18 }}>
          على الويب بنفتح لك الموقع مباشرة في خرائط الجهاز حتى تشوف العنوان والاتجاهات بدون مشاكل Bundling.
        </Text>
      </View>

      <Text style={{ marginTop: 10, textAlign: "right", color: "#334155", fontSize: 12, fontWeight: "700" }}>
        {doctor.address || doctor.availability_note || "اضغط على الزر أدناه لفتح الموقع في خرائط الجهاز."}
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
          flexDirection: "row-reverse",
          gap: 8,
        }}
      >
        <Feather name="external-link" size={16} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>افتح في خرائط الجهاز</Text>
      </Pressable>
    </View>
  );
}
