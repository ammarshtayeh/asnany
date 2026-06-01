import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { apiFetch } from "../../lib/api";
import { Doctor, DoctorAccount } from "../../lib/types";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/Buttons";
import { AppSubtitle, AppTitle } from "../../components/AppText";
import { router } from "expo-router";

export default function DoctorAccountsScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [accounts, setAccounts] = useState<DoctorAccount[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [doctorsRes, accountsRes] = await Promise.all([
      apiFetch<{ doctors?: Doctor[] }>("/api/admin/doctors/list"),
      apiFetch<{ accounts?: DoctorAccount[] }>("/api/admin/doctor-accounts"),
    ]);
    if (!doctorsRes.response.ok || !accountsRes.response.ok) {
      setLoading(false);
      router.replace("/admin/login");
      return;
    }
    setDoctors(doctorsRes.data?.doctors || []);
    setAccounts(accountsRes.data?.accounts || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createAccount = async () => {
    const { response, data } = await apiFetch("/api/admin/doctor-accounts", {
      method: "POST",
      body: JSON.stringify({ doctor_id: doctorId, email, password, is_active: true }),
    });
    if (!response.ok) return Alert.alert("تعذر الإنشاء", data?.error || "تحقق من البيانات");
    setDoctorId("");
    setEmail("");
    setPassword("");
    load();
  };

  const toggle = async (account: DoctorAccount) => {
    const { response, data } = await apiFetch("/api/admin/doctor-accounts", {
      method: "PATCH",
      body: JSON.stringify({ id: account.id, is_active: !account.is_active }),
    });
    if (!response.ok) return Alert.alert("تعذر التحديث", data?.error || "حاول مرة ثانية");
    setAccounts((current) => current.map((item) => (item.id === account.id ? { ...item, is_active: !item.is_active } : item)));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>حسابات الأطباء</AppTitle>
        <AppSubtitle>حسابات منفصلة عن الأدمن وتدخل على لوحة الطبيب فقط.</AppSubtitle>
        <Field label="اختيار الطبيب" value={doctorId} onChangeText={setDoctorId} placeholder="ضع ID الطبيب هنا أو اختر من القائمة" />
        <Field label="البريد" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="doctor@example.com" />
        <Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton label="إنشاء الحساب" onPress={createAccount} style={{ marginTop: 12 }} />
        <AppButton label="تحديث القائمة" variant="secondary" onPress={load} style={{ marginTop: 10 }} />
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>الأطباء المسجلون</AppTitle>
        {loading ? (
          <AppSubtitle style={{ marginTop: 12 }}>جارٍ التحميل...</AppSubtitle>
        ) : accounts.length === 0 ? (
          <AppSubtitle style={{ marginTop: 12 }}>لا توجد حسابات بعد.</AppSubtitle>
        ) : (
          <View style={{ gap: 10, marginTop: 12 }}>
            {accounts.map((account) => (
              <View key={account.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "white", padding: 14 }}>
                <Text style={{ textAlign: "right", fontWeight: "900", color: "#020617" }}>{account.doctors?.name || "طبيب"}</Text>
                <Text style={{ textAlign: "right", color: "#64748b", marginTop: 4, fontWeight: "700" }}>{account.email}</Text>
                <Text style={{ textAlign: "right", color: "#64748b", marginTop: 4, fontWeight: "700" }}>{account.doctors?.city || ""} {account.doctors?.phone || ""}</Text>
                <AppButton
                  label={account.is_active ? "تعطيل" : "تفعيل"}
                  variant={account.is_active ? "success" : "secondary"}
                  onPress={() => toggle(account)}
                  style={{ marginTop: 10 }}
                />
              </View>
            ))}
          </View>
        )}
      </AppCard>

      <AppButton label="العودة للرئيسية" variant="secondary" onPress={() => router.push("/")} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={{
          minHeight: 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
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
