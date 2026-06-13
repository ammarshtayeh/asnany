import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../../lib/api";
import { AppButton } from "../../components/Buttons";
import { AppCard } from "../../components/AppCard";
import { AppSubtitle, AppTitle } from "../../components/AppText";
import { useAppToast } from "../../components/AppToast";

function isValidPalestineCoordinate(latitude: string, longitude: string) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 31 && lat <= 33 && lng >= 34 && lng <= 36;
}

export default function DoctorSetLocationScreen() {
  const [form, setForm] = useState({
    doctor_id: "",
    city: "",
    area: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const { showToast } = useAppToast();

  const canSubmit = useMemo(
    () => Boolean(form.doctor_id.trim()) && isValidPalestineCoordinate(form.latitude, form.longitude),
    [form.doctor_id, form.latitude, form.longitude]
  );

  const locateClinic = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showToast({ type: "info", title: "صلاحية الموقع", message: "فعّل صلاحية الموقع لالتقاط إحداثيات العيادة بدقة." });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = position.coords.latitude.toFixed(7);
      const longitude = position.coords.longitude.toFixed(7);

      if (!isValidPalestineCoordinate(latitude, longitude)) {
        showToast({ type: "info", title: "تحقق من الموقع", message: "الإحداثيات تبدو خارج نطاق فلسطين. شغّل GPS قرب العيادة." });
        return;
      }

      setForm((current) => ({
        ...current,
        latitude,
        longitude,
      }));
    } catch (error) {
      console.error("Clinic location error:", error);
      showToast({ type: "error", title: "تعذر تحديد الموقع", message: "تأكد من تشغيل GPS وخدمات الموقع ثم حاول مرة أخرى." });
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    if (!canSubmit) {
      showToast({ type: "info", title: "بيانات ناقصة", message: "أدخل رقم الطبيب وإحداثيات صحيحة داخل فلسطين." });
      return;
    }

    setLoading(true);
    const { response, data } = await apiFetch("/api/doctors/set-location", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: form.doctor_id.trim(),
        city: form.city.trim(),
        area: form.area.trim(),
        address: form.address.trim(),
        lat: form.latitude,
        lng: form.longitude,
      }),
    });
    setLoading(false);

    if (!response.ok) {
      showToast({ type: "error", title: "تعذر الحفظ", message: data?.error || "حاول مرة ثانية" });
      return;
    }
    showToast({ type: "success", title: "تم الحفظ", message: "تم تحديث إحداثيات العيادة." });
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>خرائط ملامح</Text>
          <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900", marginTop: 3 }}>تحديد موقع العيادة</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <AppCard>
        <AppTitle>إحداثيات العيادة</AppTitle>
        <AppSubtitle>قف داخل العيادة أو أمامها واضغط GPS. إذا كنت تحدثها من مكان آخر، أدخل الإحداثيات يدوياً بدقة.</AppSubtitle>

        <Field label="رقم الطبيب / Doctor ID *" value={form.doctor_id} onChangeText={(value) => setForm((current) => ({ ...current, doctor_id: value }))} />
        <Field label="المدينة" value={form.city} onChangeText={(value) => setForm((current) => ({ ...current, city: value }))} />
        <Field label="المنطقة" value={form.area} onChangeText={(value) => setForm((current) => ({ ...current, area: value }))} />
        <Field label="العنوان التفصيلي" value={form.address} onChangeText={(value) => setForm((current) => ({ ...current, address: value }))} />

        <View style={{ marginTop: 14, borderRadius: 20, backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe", padding: 14 }}>
          <Text style={{ textAlign: "right", color: "#0f172a", fontWeight: "900", marginBottom: 10 }}>الموقع الدقيق</Text>
          <View style={{ flexDirection: "row-reverse", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field label="خط العرض" value={form.latitude} keyboardType="decimal-pad" onChangeText={(value) => setForm((current) => ({ ...current, latitude: value }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="خط الطول" value={form.longitude} keyboardType="decimal-pad" onChangeText={(value) => setForm((current) => ({ ...current, longitude: value }))} />
            </View>
          </View>
          <Pressable
            onPress={locateClinic}
            disabled={locating}
            style={{ marginTop: 12, minHeight: 48, borderRadius: 16, backgroundColor: "#0ea5e9", alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 8, opacity: locating ? 0.65 : 1 }}
          >
            <Feather name="crosshair" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "900" }}>{locating ? "جاري تحديد GPS..." : "التقاط موقعي الحالي GPS"}</Text>
          </Pressable>
        </View>

        <AppButton label={loading ? "جارٍ الحفظ..." : "حفظ وتحديث الموقع"} onPress={submit} disabled={!canSubmit || loading} style={{ marginTop: 14 }} />
      </AppCard>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#94a3b8"
        style={{
          minHeight: 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#fff",
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlign: "right",
          fontWeight: "700",
          color: "#0f172a",
        }}
      />
    </View>
  );
}
