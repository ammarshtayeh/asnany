import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../../lib/api";
import { Doctor } from "../../lib/types";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/Buttons";
import { AppSubtitle, AppTitle } from "../../components/AppText";
import { DoctorCard } from "../../components/DoctorCard";

const quickActions = [
  { label: "ألم الآن", city: "رام الله" },
  { label: "تقويم", city: "نابلس" },
  { label: "زراعة", city: "الخليل" },
];

export default function HomeScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [offline, setOffline] = useState(false);

  const load = async () => {
    setLoading(true);
    const { response, data } = await apiFetch<{ doctors?: Doctor[] }>("/api/doctors");
    setOffline(!response.ok);
    setDoctors(data?.doctors || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((doctor) =>
      [doctor.name, doctor.city, doctor.area, doctor.bio, ...(doctor.specialty || [])].some((value) =>
        String(value || "").toLowerCase().includes(q),
      ),
    );
  }, [doctors, query]);

  const whatsapp = (phone?: string | null) => phone && Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, "")}`);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={{ padding: 16, paddingTop: 18, gap: 12, backgroundColor: "#e0f2fe" }}>
        <Text style={{ textAlign: "right", fontWeight: "900", color: "#0f172a", fontSize: 28 }}>أسناني .ps</Text>
        <AppSubtitle style={{ color: "#0f172a" }}>
          دليلك السريع لطبيب الأسنان، الحجز، الطوارئ، وعرض الأطباء الأقرب والأوضح.
        </AppSubtitle>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {quickActions.map((item) => (
            <AppButton key={item.label} label={item.label} variant="secondary" onPress={() => setQuery(item.label)} style={{ minWidth: 88 }} />
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: "white", paddingHorizontal: 14, borderRadius: 18, minHeight: 48, borderWidth: 1, borderColor: "#bfdbfe" }}>
          <Feather name="search" size={18} color="#64748b" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن طبيب أو تخصص أو مدينة"
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, textAlign: "right", fontWeight: "700", color: "#0f172a" }}
          />
        </View>
      </View>

      {offline ? (
        <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: "#fef3c7", borderRadius: 16, padding: 12 }}>
          <Text style={{ textAlign: "right", color: "#92400e", fontWeight: "800" }}>الاتصال ضعيف أو منقطع، يتم عرض آخر بيانات متاحة.</Text>
        </View>
      ) : null}

      <View style={{ padding: 16, gap: 16 }}>
        <AppCard>
          <AppTitle style={{ fontSize: 22 }}>اختيارات سريعة</AppTitle>
          <AppSubtitle>كل شيء أساسي تحت إبهامك، مثل الموقع تماماً.</AppSubtitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
            <AppButton label="احجز الآن" onPress={() => router.push("/booking")} style={{ minWidth: 108 }} />
            <AppButton label="بطاقة الخصم" variant="secondary" onPress={() => router.push("/discount-card")} style={{ minWidth: 108 }} />
            <AppButton label="دخول الطبيب" variant="secondary" onPress={() => router.push("/doctor/login")} style={{ minWidth: 108 }} />
            <AppButton label="دخول الأدمن" variant="secondary" onPress={() => router.push("/admin/login")} style={{ minWidth: 108 }} />
          </View>
        </AppCard>

        {loading ? (
          <View style={{ gap: 12 }}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={{ height: 180, borderRadius: 24, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator color="#0f172a" />
              </View>
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <AppCard>
            <Text style={{ textAlign: "right", fontSize: 18, fontWeight: "900", color: "#020617" }}>ما في نتائج مطابقة</Text>
            <AppSubtitle style={{ marginTop: 6 }}>جرب مدينة ثانية أو تخصص قريب، أو افتح صفحة الحجز مباشرة.</AppSubtitle>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
              {["رام الله", "نابلس", "الخليل", "تقويم الأسنان", "زراعة الأسنان"].map((item) => (
                <AppButton key={item} label={item} variant="secondary" onPress={() => setQuery(item)} style={{ minWidth: 96 }} />
              ))}
            </View>
          </AppCard>
        ) : (
          filtered.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onPress={() => router.push(`/doctors/${doctor.id}`)}
              onBook={() => router.push(`/booking?doctorId=${doctor.id}`)}
              onWhatsApp={() => whatsapp(doctor.whatsapp || doctor.phone)}
            />
          ))
        )}

        <AppCard>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <AppButton label="تحديث" variant="secondary" onPress={load} />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ textAlign: "right", fontWeight: "900", color: "#020617" }}>تجربة الموبايل متزامنة</Text>
              <Text style={{ textAlign: "right", color: "#64748b", fontWeight: "700", fontSize: 12 }}>نفس الداتا والفلو مع الموقع</Text>
            </View>
          </View>
        </AppCard>
      </View>
    </ScrollView>
  );
}
import { Linking } from "react-native";
