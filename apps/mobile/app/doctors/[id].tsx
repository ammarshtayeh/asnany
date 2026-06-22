import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../../lib/api";
import { Doctor } from "../../lib/types";
import { asStringArray, formatRating, formatSpecialty, normalizeRouteId } from "../../lib/format";
import { AppButton } from "../../components/Buttons";
import { AppCard } from "../../components/AppCard";
import { AppSubtitle, AppTitle } from "../../components/AppText";
import { ClinicMap } from "../../components/ClinicMap";
import { openNativeMaps } from "../../lib/map-links";
import { registerPushSubscription } from "../../lib/notifications";
import { useAppToast } from "../../components/AppToast";
import { theme } from "../../constants/theme";
import { BookingDateField, BookingTimeField } from "../../components/BookingPickers";
import { SITE_URL } from "../../lib/site-contact";

type ReviewRow = { patient_name: string; rating: number; comment?: string | null; created_at: string };

export default function DoctorProfileScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const doctorId = normalizeRouteId(params.id);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [canBookOnline, setCanBookOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [reviewsList, setReviewsList] = useState<ReviewRow[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const { showToast } = useAppToast();

  useEffect(() => {
    if (!doctorId) return;
    (async () => {
      setLoading(true);
      try {
        const { response, data } = await apiFetch<{ doctor?: Doctor; can_book_online?: boolean; error?: string }>(
          `/api/doctors/${doctorId}`
        );
        if (!response.ok || !data?.doctor) {
          setDoctor(null);
          setCanBookOnline(false);
        } else {
          setDoctor(data.doctor);
          setCanBookOnline(Boolean(data.can_book_online));
        }
      } catch (error) {
        console.error("Fetch doctor details error:", error);
        setDoctor(null);
        setCanBookOnline(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) return;
    void apiFetch<{ reviews?: ReviewRow[] }>(`/api/reviews?doctorId=${doctorId}`).then(({ data }) => {
      setReviewsList(Array.isArray(data?.reviews) ? data.reviews : []);
    });
  }, [doctorId]);

  const specialties = useMemo(() => asStringArray(doctor?.specialty), [doctor?.specialty]);
  const insuranceList = useMemo(
    () => asStringArray(doctor?.insurance_list || doctor?.insuranceList),
    [doctor?.insurance_list, doctor?.insuranceList],
  );
  const workingHours = useMemo(() => {
    const raw = doctor?.working_hours || doctor?.workingHours;
    if (!raw || typeof raw !== "object") return [] as Array<[string, string]>;
    return Object.entries(raw).map(([day, hours]) => [day, String(hours ?? "—")] as [string, string]);
  }, [doctor?.working_hours, doctor?.workingHours]);

  const book = async () => {
    if (!doctor) return;
    if (!fullName || !phone || !identity || !address || !date || !time) {
      showToast({ type: "info", title: "حقول ناقصة", message: "يرجى تعبئة بيانات الحجز المطلوبة." });
      return;
    }
    setBooking(true);
    const { response, data } = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: doctor.id,
        patient_full_name: fullName,
        patient_phone: phone,
        patient_identity: identity,
        patient_address: address,
        date,
        time,
        notes,
      }),
    });
    setBooking(false);
    if (!response.ok) {
      showToast({ type: "error", title: "تعذر الحجز", message: data?.error || "حاول لاحقاً" });
      return;
    }
    void registerPushSubscription({ role: "patient", patientPhone: phone }).catch(() => null);
    showToast({ type: "success", title: "تم الحجز بنجاح", message: "تم إرسال طلب الموعد للطبيب." });
    router.push(`/appointments?phone=${encodeURIComponent(phone)}`);
  };

  const shareProfile = async () => {
    if (!doctor) return;
    const url = `${SITE_URL}/doctors/${doctor.id}`;
    try {
      await Share.share({
        message: `تعرّف على ${doctor.name} على ملامح.ps\n${url}`,
        url,
        title: doctor.name,
      });
    } catch {
      // user dismissed
    }
  };

  const submitReview = async () => {
    if (!doctor || !reviewName.trim()) {
      showToast({ type: "info", title: "الاسم مطلوب", message: "يرجى إدخال اسمك قبل إرسال التقييم." });
      return;
    }
    setReviewSubmitting(true);
    setReviewMessage("");
    const { response, data } = await apiFetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: doctor.id,
        patient_name: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      }),
    });
    setReviewSubmitting(false);
    if (!response.ok) {
      showToast({ type: "error", title: "تعذر الإرسال", message: data?.error || "حاول لاحقاً" });
      return;
    }
    setReviewMessage(data?.message || "شكراً! سيُراجع تقييمك قبل النشر.");
    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc", padding: 24 }}>
        <Text style={{ fontWeight: "900", color: "#020617", fontSize: 20, textAlign: "right" }}>لم يتم العثور على الطبيب</Text>
        <AppButton label="الرجوع" onPress={goBack} style={{ marginTop: 12 }} />
      </View>
    );
  }

  const acceptsInsurance = Boolean(doctor.accepts_insurance || doctor.acceptsInsurance);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: "white", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ alignItems: "flex-end", flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b" }}>الملف الشخصي للأخصائي</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 4 }}>{doctor.name}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => void shareProfile()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
            <Feather name="share-2" size={18} color="#0f172a" />
          </Pressable>
          <Pressable onPress={goBack} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
            <Feather name="arrow-right" size={20} color="#0f172a" />
          </Pressable>
        </View>
      </View>

      <AppCard>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <AppTitle style={{ textAlign: "right" }}>{doctor.name}</AppTitle>
            {doctor.is_featured ? (
              <View style={{ marginTop: 6, backgroundColor: "#fffbeb", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#fde68a" }}>
                <Text style={{ color: "#b45309", fontWeight: "900", fontSize: 11 }}>⭐ طبيب مؤسّس</Text>
              </View>
            ) : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fef3c7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
            <Feather name="star" size={14} color="#d97706" />
            <Text style={{ color: "#d97706", fontWeight: "900", fontSize: 12 }}>{formatRating(doctor.rating)}</Text>
          </View>
        </View>
        <AppSubtitle style={{ textAlign: "right", marginTop: 4 }}>
          {doctor.city || "غير محدد"} {doctor.area ? `• ${doctor.area}` : ""}
        </AppSubtitle>
        {doctor.address ? (
          <Text style={{ textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: "700", marginTop: 4 }}>📍 {doctor.address}</Text>
        ) : null}
        <AppSubtitle style={{ marginTop: 12, textAlign: "right", lineHeight: 22 }}>
          {doctor.bio || "صفحة الطبيب المعتمد مع كل البيانات الأساسية مثل الموقع والتواصل والحجوزات."}
        </AppSubtitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
          {specialties.map((item) => (
            <View key={item} style={{ backgroundColor: "#eff6ff", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#dbeafe" }}>
              <Text style={{ color: "#2563eb", fontWeight: "900", fontSize: 11 }}>{item}</Text>
            </View>
          ))}
          {doctor.accepts_discount_card ? (
            <View style={{ backgroundColor: "#dcfce7", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#bbf7d0" }}>
              <Text style={{ color: "#166534", fontWeight: "900", fontSize: 11 }}>🎫 خصم البطاقة</Text>
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", marginTop: 18, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 14 }}>
          {doctor.whatsapp ? (
            <AppButton label="تواصل واتساب" variant="secondary" onPress={() => Linking.openURL(`https://wa.me/${doctor.whatsapp!.replace(/[^0-9]/g, "")}`)} style={{ flex: 1 }} />
          ) : null}
          {canBookOnline ? (
            <AppButton label="حجز موعد عيادة" onPress={() => router.push(`/booking?doctorId=${doctor.id}`)} style={{ flex: 1 }} />
          ) : (
            <AppButton label="تواصل للحجز" variant="secondary" onPress={() => doctor.phone && Linking.openURL(`tel:${doctor.phone}`)} style={{ flex: 1 }} />
          )}
        </View>
      </AppCard>

      <AppCard>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Feather name="shield" size={18} color="#0f172a" />
          <AppTitle style={{ fontSize: 16 }}>الغطاء التأميني والدفع</AppTitle>
        </View>
        <Text style={{ textAlign: "right", fontWeight: "800", color: acceptsInsurance ? "#166534" : "#64748b", fontSize: 13 }}>
          {acceptsInsurance ? "🏥 يقبل شركات التأمين الطبي" : "💳 الدفع شخصي فقط"}
        </Text>
        {acceptsInsurance && insuranceList.length > 0 ? (
          <View style={{ marginTop: 8, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 12, fontWeight: "900", color: "#475569", marginBottom: 4 }}>الشركات المعتمدة:</Text>
            <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 }}>
              {insuranceList.map((ins) => (
                <View key={ins} style={{ backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" }}>
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#334155" }}>{ins}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </AppCard>

      <AppCard>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Feather name="clock" size={18} color="#0f172a" />
          <AppTitle style={{ fontSize: 16 }}>أوقات العمل الأسبوعية</AppTitle>
        </View>
        {workingHours.length ? (
          <View style={{ gap: 6 }}>
            {workingHours.map(([day, hours]) => (
              <View key={day} style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f8fafc" }}>
                <Text style={{ fontSize: 12, fontWeight: "900", color: "#334155" }}>{day}</Text>
                <Text style={{ fontSize: 12, fontWeight: "800", color: hours.includes("مغلق") || hours.includes("Closed") ? "#ef4444" : "#0f172a" }}>{hours}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: "700" }}>اتصل بالعيادة للاستعلام عن أوقات الدوام.</Text>
        )}
      </AppCard>

      <ClinicMap doctor={doctor} />

      <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
        <Pressable onPress={() => router.push(`/doctors/${doctor.id}/map`)} style={{ flex: 1, minHeight: 48, borderRadius: 16, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>الخريطة داخل التطبيق</Text>
        </Pressable>
        <Pressable onPress={() => void openNativeMaps(doctor)} style={{ flex: 1, minHeight: 48, borderRadius: 16, backgroundColor: "#0ea5e9", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>فتح في خرائط الجهاز</Text>
        </Pressable>
      </View>

      <AppCard>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Feather name="message-square" size={18} color="#0f172a" />
          <AppTitle style={{ fontSize: 16 }}>تقييمات المرضى</AppTitle>
        </View>
        {reviewsList.length > 0 ? (
          <View style={{ gap: 10, marginBottom: 14 }}>
            {reviewsList.map((rev, index) => (
              <View key={`${rev.created_at}-${index}`} style={{ borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 10 }}>
                <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontWeight: "900", color: "#0f172a", fontSize: 13 }}>{rev.patient_name}</Text>
                  <Text style={{ fontWeight: "800", color: "#d97706", fontSize: 12 }}>{"★".repeat(rev.rating)}</Text>
                </View>
                {rev.comment ? (
                  <Text style={{ textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: "600", marginTop: 4, lineHeight: 20 }}>{rev.comment}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: "700", marginBottom: 12 }}>لا توجد تقييمات منشورة بعد — كن أول من يقيّم.</Text>
        )}
        <Field label="اسمك *" value={reviewName} onChangeText={setReviewName} />
        <View style={{ marginTop: 12 }}>
          <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>التقييم</Text>
          <View style={{ flexDirection: "row-reverse", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setReviewRating(star)}>
                <Text style={{ fontSize: 24, color: star <= reviewRating ? "#f59e0b" : "#cbd5e1" }}>★</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Field label="تعليقك (اختياري)" value={reviewComment} onChangeText={setReviewComment} multiline />
        {reviewMessage ? (
          <Text style={{ textAlign: "right", color: "#166534", fontWeight: "800", fontSize: 12, marginTop: 10 }}>{reviewMessage}</Text>
        ) : null}
        <AppButton label={reviewSubmitting ? "جارٍ الإرسال..." : "إرسال التقييم"} onPress={() => void submitReview()} style={{ marginTop: 14 }} disabled={reviewSubmitting} />
      </AppCard>

      {canBookOnline ? (
      <AppCard>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Feather name="calendar" size={18} color="#0f172a" />
          <AppTitle style={{ fontSize: 18 }}>احجز موعد مباشرة</AppTitle>
        </View>
        <Text style={{ textAlign: "right", color: "#166534", fontWeight: "800", fontSize: 12, marginBottom: 8, backgroundColor: "#ecfdf5", padding: 10, borderRadius: 12 }}>
          لا حاجة لإنشاء حساب — أدخل بياناتك وأرسل طلب الحجز مباشرة.
        </Text>
        <Field label="الاسم الرباعي للمريض *" value={fullName} onChangeText={setFullName} />
        <Field label="رقم الهاتف للتأكيد *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="رقم الهوية الشخصية *" value={identity} onChangeText={setIdentity} keyboardType="number-pad" />
        <Field label="العنوان السكني الحالي *" value={address} onChangeText={setAddress} />
        <BookingDateField label="التاريخ المطلوب للحجز *" value={date} onChange={setDate} />
        <BookingTimeField label="الوقت المفضل *" value={time} onChange={setTime} />
        <Field label="ملاحظات أو الأعراض الطبية" value={notes} onChangeText={setNotes} multiline />
        <AppButton label={booking ? "جارٍ إرسال طلب الحجز..." : "تأكيد طلب الحجز الإلكتروني"} onPress={book} style={{ marginTop: 18 }} disabled={booking} />
      </AppCard>
      ) : (
        <AppCard>
          <AppTitle style={{ fontSize: 16, textAlign: "right" }}>الحجز عبر التطبيق غير متاح</AppTitle>
          <AppSubtitle style={{ textAlign: "right", marginTop: 8 }}>
            الطبيب موثّق في الدليل، لكن الحجز الإلكتروني يتطلب حساب طبيب مفعّل. تواصل عبر واتساب أو الهاتف.
          </AppSubtitle>
        </AppCard>
      )}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "phone-pad" | "number-pad";
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={{
          minHeight: multiline ? 96 : 48,
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
