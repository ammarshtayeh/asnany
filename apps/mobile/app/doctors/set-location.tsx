import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../../lib/api";
import { StackCard, StackPageLayout, StackPrimaryButton } from "../../components/ui/StackPageLayout";
import { theme } from "../../constants/theme";
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
    [form.doctor_id, form.latitude, form.longitude],
  );

  const locateClinic = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showToast({ type: "info", title: "صلاحية الموقع", message: "فعّل صلاحية الموقع لالتقاط إحداثيات العيادة بدقة." });
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const latitude = position.coords.latitude.toFixed(7);
      const longitude = position.coords.longitude.toFixed(7);
      if (!isValidPalestineCoordinate(latitude, longitude)) {
        showToast({ type: "info", title: "تحقق من الموقع", message: "الإحداثيات تبدو خارج نطاق فلسطين." });
        return;
      }
      setForm((current) => ({ ...current, latitude, longitude }));
    } catch (error) {
      console.error("Clinic location error:", error);
      showToast({ type: "error", title: "تعذر تحديد الموقع", message: "تأكد من تشغيل GPS ثم حاول مرة أخرى." });
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
    <StackPageLayout badge="🗺️ خرائط ملامح" title="تحديد موقع العيادة" subtitle="قف داخل العيادة أو أمامها واضغط GPS — أو أدخل الإحداثيات يدوياً">
      <StackCard>
        <Field label="رقم الطبيب / Doctor ID *" value={form.doctor_id} onChangeText={(value) => setForm((c) => ({ ...c, doctor_id: value }))} />
        <Field label="المدينة" value={form.city} onChangeText={(value) => setForm((c) => ({ ...c, city: value }))} />
        <Field label="المنطقة" value={form.area} onChangeText={(value) => setForm((c) => ({ ...c, area: value }))} />
        <Field label="العنوان التفصيلي" value={form.address} onChangeText={(value) => setForm((c) => ({ ...c, address: value }))} />

        <View style={{ marginTop: 14, borderRadius: 20, backgroundColor: theme.skyMuted, borderWidth: 1, borderColor: theme.borderLight, padding: 14 }}>
          <Text style={{ textAlign: "right", color: theme.text, fontWeight: "900", marginBottom: 10 }}>الموقع الدقيق</Text>
          <Field label="Latitude" value={form.latitude} onChangeText={(value) => setForm((c) => ({ ...c, latitude: value }))} keyboardType="decimal-pad" />
          <Field label="Longitude" value={form.longitude} onChangeText={(value) => setForm((c) => ({ ...c, longitude: value }))} keyboardType="decimal-pad" />
          <Pressable
            onPress={locateClinic}
            disabled={locating}
            style={{ marginTop: 10, flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, backgroundColor: theme.navy, paddingVertical: 14, opacity: locating ? 0.7 : 1 }}
          >
            <Feather name="navigation" size={16} color={theme.white} />
            <Text style={{ color: theme.white, fontWeight: "900" }}>{locating ? "جاري التحديد..." : "التقاط GPS من موقعي الحالي"}</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 14, opacity: !canSubmit || loading ? 0.6 : 1 }}>
          <StackPrimaryButton label={loading ? "جارٍ الحفظ..." : "حفظ إحداثيات العيادة"} onPress={submit} />
        </View>
      </StackCard>
    </StackPageLayout>
  );
}

function Field({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (v: string) => void; keyboardType?: "default" | "decimal-pad" }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: theme.textMuted, marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={theme.textSoft}
        style={{ minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: theme.borderLight, backgroundColor: theme.bg, paddingHorizontal: 14, textAlign: "right", fontWeight: "700", color: theme.text }}
      />
    </View>
  );
}
