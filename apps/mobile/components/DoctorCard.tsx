import { Pressable, Text, View } from "react-native";
import { Doctor } from "../lib/types";
import { AppCard } from "./AppCard";
import { AppButton } from "./Buttons";

export function DoctorCard({
  doctor,
  onPress,
  onBook,
  onCall,
  onWhatsApp,
}: {
  doctor: Doctor;
  onPress?: () => void;
  onBook?: () => void;
  onCall?: () => void;
  onWhatsApp?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <AppCard>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#020617", textAlign: "right" }}>{doctor.name}</Text>
        <Text style={{ marginTop: 4, color: "#64748b", fontSize: 13, fontWeight: "700", textAlign: "right" }}>
          {doctor.city || "غير محدد"}{doctor.area ? ` • ${doctor.area}` : ""}
        </Text>
        <Text style={{ marginTop: 8, color: "#334155", fontSize: 13, fontWeight: "700", textAlign: "right" }} numberOfLines={2}>
          {doctor.bio || "عيادة مرتبّة، حجز سريع، وتحديث مباشر لحالة الطبيب والدوام."}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
          {doctor.specialty?.slice(0, 3).map((item) => (
            <View key={item} style={{ backgroundColor: "#eff6ff", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: "#2563eb", fontSize: 12, fontWeight: "900" }}>{item}</Text>
            </View>
          ))}
          {doctor.is_available === false ? (
            <View style={{ backgroundColor: "#fee2e2", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: "#b91c1c", fontSize: 12, fontWeight: "900" }}>غير متواجد</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: "#dcfce7", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: "#166534", fontSize: 12, fontWeight: "900" }}>مفتوح</Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 14, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <AppButton label="احجز" onPress={onBook} style={{ minWidth: 88 }} />
          <AppButton label="اتصال" variant="secondary" onPress={onCall} style={{ minWidth: 88 }} />
          <AppButton label="واتساب" variant="secondary" onPress={onWhatsApp} style={{ minWidth: 88 }} />
        </View>
      </AppCard>
    </Pressable>
  );
}
