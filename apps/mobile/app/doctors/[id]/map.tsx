import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Link, useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Doctor } from "../../../lib/types";
import { ClinicMap } from "../../../components/ClinicMap";
import { openNativeMaps, doctorMapLabel } from "../../../lib/map-links";
import { supabase } from "../../../lib/supabase";

export default function DoctorMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("doctors")
            .select("*")
            .eq("id", id)
            .eq("verified", true)
            .single();
          if (error) throw error;
          setDoctor(data || null);
        }
      } catch (error) {
        console.error("Fetch map doctor error:", error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openDeviceMap = async () => {
    if (!doctor) return;
    await openNativeMaps(doctor);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator color="#0f172a" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc", paddingHorizontal: 24 }}>
        <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "900", color: "#020617" }}>لم يتم العثور على الطبيب</Text>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          style={{ marginTop: 16, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#0f172a", paddingHorizontal: 24 }}
        >
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>الرجوع</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      {/* Top Header with Back Button */}
      <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: "white", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ alignItems: "flex-end", flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b" }}>خريطة العيادة</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 4, textAlign: "right" }}>{doctor.name}</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <View style={{ borderRadius: 24, backgroundColor: "white", padding: 20, borderWidth: 1, borderColor: "#e2e8f0" }}>
        <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right" }}>العنوان بالتفصيل</Text>
        <Text style={{ marginTop: 6, fontSize: 15, fontWeight: "700", color: "#1e293b", textAlign: "right" }}>{doctorMapLabel(doctor)}</Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <ClinicMap doctor={doctor} />
      </View>

      <View style={{ marginTop: 16, flexDirection: "row", gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#0f172a", paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>العودة للملف</Text>
        </Pressable>
        <Pressable onPress={openDeviceMap} style={{ flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#0ea5e9", paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>فتح في خرائط الجهاز</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
