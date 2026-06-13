import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getMobileApiBaseUrl } from "../../lib/api-base";
import { adminSession } from "../../lib/session";
import { useAppToast } from "../../components/AppToast";

const API_BASE = getMobileApiBaseUrl();

type MemberStatus = "pending" | "active" | "inactive" | "rejected" | "expired";

type Member = {
  id: string;
  full_name: string;
  phone: string;
  city?: string | null;
  status: MemberStatus;
  notes?: string | null;
  expires_at?: string | null;
  created_at?: string;
};

const STATUS_COPY: Record<MemberStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "بانتظار المتابعة", bg: "#fffbeb", text: "#b45309" },
  active: { label: "مشترك فعال", bg: "#ecfdf5", text: "#047857" },
  inactive: { label: "غير فعال", bg: "#f1f5f9", text: "#475569" },
  rejected: { label: "مرفوض", bg: "#fef2f2", text: "#b91c1c" },
  expired: { label: "منتهي", bg: "#fff7ed", text: "#c2410c" },
};

export default function AdminDiscountCardScreen() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [token, setToken] = useState<string | undefined>(undefined);
  const { showToast } = useAppToast();

  const stats = useMemo(
    () => ({
      total: members.length,
      pending: members.filter((member) => member.status === "pending").length,
      active: members.filter((member) => member.status === "active").length,
    }),
    [members]
  );

  useEffect(() => {
    void bootstrap();
  }, []);

  const bootstrap = async () => {
    const session = await adminSession.read();
    if (!session?.token && !session?.admin) {
      router.replace("/admin/login");
      return;
    }
    setToken(session?.token);
    await refresh(session?.token);
    setReady(true);
  };

  const headers = (authToken?: string) => (authToken ? { Authorization: `Bearer ${authToken}` } : undefined);

  const refresh = async (authToken = token) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/discount-card-members`, { headers: headers(authToken) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "تعذر تحميل طلبات البطاقة");
      setMembers(Array.isArray(data?.members) ? data.members : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تحميل طلبات البطاقة";
      showToast({ type: "error", title: "بطاقة الخصم", message });
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (member: Member, patch: Partial<Member>) => {
    try {
      const next = {
        ...member,
        ...patch,
        expires_at:
          patch.status === "active" && !patch.expires_at && !member.expires_at
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            : patch.expires_at ?? member.expires_at,
      };
      const response = await fetch(`${API_BASE}/api/admin/discount-card-members`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers(token) || {}),
        },
        body: JSON.stringify(next),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "تعذر تحديث البطاقة");
      setMembers((current) => current.map((item) => (item.id === member.id ? data.member : item)));
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تحديث البطاقة";
      showToast({ type: "error", title: "بطاقة الخصم", message });
    }
  };

  const removeMember = async (id: string) => {
    Alert.alert("حذف الطلب", "حذف طلب بطاقة الخصم؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          const response = await fetch(`${API_BASE}/api/admin/discount-card-members`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(headers(token) || {}),
            },
            body: JSON.stringify({ id }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            showToast({ type: "error", title: "بطاقة الخصم", message: data?.error || "تعذر حذف الطلب" });
            return;
          }
          setMembers((current) => current.filter((member) => member.id !== id));
          showToast({ type: "success", title: "تم الحذف", message: "تم حذف طلب بطاقة الخصم." });
        },
      },
    ]);
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#020617" }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <View style={{ marginBottom: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", padding: 24 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ alignItems: "flex-end", flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff", textAlign: "right" }}>طلبات بطاقة الخصم</Text>
            <Text style={{ marginTop: 8, color: "#cbd5e1", fontWeight: "700", textAlign: "right", lineHeight: 22 }}>
              تفعيل المشتركين وإظهار الحالة للطبيب داخل المواعيد.
            </Text>
          </View>
          <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
            <Feather name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </View>
        <Pressable onPress={() => refresh()} style={{ marginTop: 16, alignSelf: "flex-end", borderRadius: 16, backgroundColor: "#2563eb", paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>تحديث</Text>
        </Pressable>
      </View>

      <View style={{ marginBottom: 16, flexDirection: "row-reverse", gap: 10 }}>
        <Stat label="الطلبات" value={stats.total} />
        <Stat label="بانتظار" value={stats.pending} />
        <Stat label="فعال" value={stats.active} />
      </View>

      <View style={{ borderRadius: 24, backgroundColor: "#fff", padding: 20 }}>
        {loading ? (
          <ActivityIndicator color="#2563eb" />
        ) : members.length === 0 ? (
          <Text style={{ color: "#64748b", fontWeight: "700", textAlign: "right" }}>لا توجد طلبات بطاقة حالياً.</Text>
        ) : (
          members.map((member) => {
            const status = STATUS_COPY[member.status] || STATUS_COPY.pending;
            return (
              <View key={member.id} style={{ marginBottom: 12, borderRadius: 18, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", padding: 14 }}>
                <View style={{ flexDirection: "row-reverse", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900", textAlign: "right" }}>{member.full_name}</Text>
                    <Text style={{ color: "#64748b", marginTop: 4, fontWeight: "700", textAlign: "right" }}>{member.phone} - {member.city || "مدينة غير محددة"}</Text>
                  </View>
                  <View style={{ borderRadius: 999, backgroundColor: status.bg, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ color: status.text, fontSize: 11, fontWeight: "900" }}>{status.label}</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 10, marginBottom: 6, color: "#64748b", fontSize: 12, fontWeight: "900", textAlign: "right" }}>تاريخ الانتهاء</Text>
                <TextInput
                  value={member.expires_at || ""}
                  onChangeText={(value) => updateMember(member, { expires_at: value })}
                  placeholder="2026-12-31"
                  style={{ minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff", paddingHorizontal: 12, textAlign: "right", fontWeight: "800", color: "#0f172a" }}
                />
                <View style={{ marginTop: 12, flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
                  <Action label="تفعيل" color="#059669" onPress={() => updateMember(member, { status: "active" })} />
                  <Action label="إيقاف" color="#475569" onPress={() => updateMember(member, { status: "inactive" })} />
                  <Action label="رفض" color="#e11d48" onPress={() => updateMember(member, { status: "rejected" })} />
                  <Action label="حذف" color="#991b1b" onPress={() => removeMember(member.id)} />
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flex: 1, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14 }}>
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", textAlign: "right" }}>{value}</Text>
      <Text style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "800", textAlign: "right" }}>{label}</Text>
    </View>
  );
}

function Action({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 14, backgroundColor: color, paddingHorizontal: 14, paddingVertical: 9 }}>
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}
