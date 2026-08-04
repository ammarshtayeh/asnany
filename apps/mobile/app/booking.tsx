import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { apiFetch } from "../lib/api";
import { registerPushSubscription } from "../lib/notifications";
import { useAppToast } from "../components/AppToast";
import { StackCard, StackPageLayout, StackPrimaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";
import { BookingDateField, BookingTimeField } from "../components/BookingPickers";
import { ageFromBirthDate, isIdentityRequiredForAge } from "../lib/booking";

const WEEKDAY_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

type DoctorPreview = {
  id: string;
  name?: string;
  city?: string;
  area?: string;
  working_hours?: Record<string, string>;
  is_available?: boolean;
  availability_note?: string;
};

export default function BookingScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();
  const [doctor, setDoctor] = useState<DoctorPreview | null>(null);
  const [canBookOnline, setCanBookOnline] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(Boolean(doctorId));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useAppToast();

  const patientAge = useMemo(() => ageFromBirthDate(birthDate), [birthDate]);
  const identityRequired = isIdentityRequiredForAge(patientAge);

  useEffect(() => {
    let cancelled = false;

    const loadDoctor = async () => {
      if (!doctorId) return;
      setDoctorLoading(true);
      const { response, data } = await apiFetch<{ doctor?: DoctorPreview; can_book_online?: boolean; error?: string }>(
        `/api/doctors/${doctorId}`
      );
      if (cancelled) return;

      if (response.ok && data?.doctor) {
        setDoctor(data.doctor);
        setCanBookOnline(Boolean(data.can_book_online));
      } else {
        setDoctor(null);
        setCanBookOnline(false);
      }
      setDoctorLoading(false);
    };

    loadDoctor();
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const selectedWeekday = useMemo(() => {
    if (!date) return "";
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return "";
    return WEEKDAY_AR[parsed.getDay()];
  }, [date]);

  const isDoctorAvailableForSlot = useMemo(() => {
    if (!doctor) return true;
    if (doctor.is_available === false) return false;

    const note = String(doctor.availability_note || "");
    if (note.includes("مغلق")) return false;

    const hours = doctor.working_hours || {};
    const dayHours = selectedWeekday ? String(hours[selectedWeekday] || "") : "";
    if (dayHours.includes("مغلق")) return false;

    return true;
  }, [doctor, selectedWeekday]);

  const canSubmit = useMemo(
    () =>
      Boolean(
        fullName &&
          phone &&
          address &&
          birthDate &&
          date &&
          time &&
          doctorId &&
          canBookOnline &&
          (!identityRequired || identity.trim())
      ),
    [fullName, phone, address, birthDate, date, time, doctorId, canBookOnline, identityRequired, identity]
  );

  const submit = async () => {
    if (!doctorId) {
      showToast({ type: "info", title: "اختر طبيباً أولاً", message: "افتح صفحة الطبيب ثم احجز الموعد." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email)) {
      showToast({ type: "error", title: "خطأ في البيانات", message: "يرجى إدخال بريد إلكتروني صحيح." });
      return;
    }

    if (!isDoctorAvailableForSlot) {
      showToast({
        type: "info",
        title: "الطبيب غير متاح",
        message: selectedWeekday ? `الموعد المختار خارج دوام الطبيب يوم ${selectedWeekday}.` : "اختر موعداً آخر من فضلك.",
      });
      return;
    }

    if (!address.trim()) {
      showToast({ type: "error", title: "العنوان مطلوب", message: "يرجى إدخال عنوان السكن." });
      return;
    }
    if (!birthDate) {
      showToast({ type: "error", title: "تاريخ الميلاد مطلوب", message: "نحتاجه لمعرفة إن كانت الهوية إلزامية." });
      return;
    }
    if (patientAge === null) {
      showToast({ type: "error", title: "تاريخ ميلاد غير صالح", message: "تحقق من التاريخ." });
      return;
    }
    if (identityRequired && !identity.trim()) {
      showToast({ type: "error", title: "الهوية مطلوبة", message: "رقم الهوية إلزامي لمن عمرهم 17 سنة فأكثر." });
      return;
    }
    if (identity.trim() && !/^\d{9}$/.test(identity.trim())) {
      showToast({ type: "error", title: "هوية غير صحيحة", message: "رقم الهوية يجب أن يكون 9 أرقام." });
      return;
    }

    setLoading(true);
    const { response, data } = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: doctorId,
        patient_full_name: fullName,
        patient_email: email.trim() || null,
        patient_phone: phone,
        patient_identity: identity.trim() || null,
        patient_address: address.trim(),
        patient_birth_date: birthDate,
        date,
        time,
        notes,
        website: "",
      }),
    });
    setLoading(false);

    if (!response.ok) {
      const message =
        response.status === 409
          ? data?.error || "هذا الموعد محجوز للتو. اختر وقتاً آخر من فضلك."
          : data?.error || "حاول مرة ثانية";
      showToast({ type: "error", title: "تعذر الحجز", message });
      return;
    }

    const bookingRef = String((data as any)?.booking_ref || (data as any)?.appointment?.booking_ref || "");

    void registerPushSubscription({
      role: "patient",
      patientPhone: phone,
    }).catch(() => null);

    showToast({
      type: "success",
      title: "تم إرسال طلب الحجز",
      message: bookingRef ? `رمز الحجز: ${bookingRef}` : "يمكنك متابعة الحالة من صفحة حجوزاتي.",
    });
    router.replace({ pathname: "/appointments", params: { phone, ref: bookingRef } } as any);
  };

  return (
    <StackPageLayout badge="📅 عيادات ملامح" title="حجز موعد جديد" subtitle="املأ البيانات الأساسية — تابع الحالة من صفحة حجوزاتي">
      <StackCard>
        {doctorId ? (
          <View style={{ marginBottom: 12, borderRadius: 18, backgroundColor: theme.skyMuted, padding: 14, borderWidth: 1, borderColor: theme.borderLight }}>
            <Text style={{ textAlign: "right", fontWeight: "900", color: theme.text, marginBottom: 4 }}>
              {doctorLoading ? "جاري تحميل معلومات الطبيب..." : doctor?.name || "الطبيب المختار"}
            </Text>
            <Text style={{ textAlign: "right", fontWeight: "700", color: theme.textMuted, fontSize: 12, lineHeight: 18 }}>
              {doctorLoading
                ? "نتأكد من الدوام والحالة الحالية قبل إرسال الحجز."
                : !canBookOnline
                  ? "الحجز الإلكتروني غير مفعّل لهذا الطبيب."
                  : doctor?.is_available === false
                    ? "الطبيب غير متاح حالياً."
                    : isDoctorAvailableForSlot
                      ? "الطبيب يظهر متاحاً لهذا الموعد مبدئياً."
                      : `الوقت المختار يبدو خارج دوام ${selectedWeekday || "اليوم"}.`}
            </Text>
          </View>
        ) : null}

        <Field label="الاسم الرباعي *" value={fullName} onChangeText={setFullName} />
        <Field label="البريد الإلكتروني - اختياري" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="example@domain.com" />
        <Field label="رقم الهاتف *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <BookingDateField label="تاريخ الميلاد *" value={birthDate} onChange={setBirthDate} minimumDate={null} maximumDate={new Date()} />
        <Field
          label={identityRequired ? "رقم الهوية * (17 سنة فأكثر)" : "رقم الهوية (إلزامي لمن عمرهم 17 فأكثر)"}
          value={identity}
          onChangeText={setIdentity}
          keyboardType="number-pad"
        />
        <Field label="العنوان *" value={address} onChangeText={setAddress} />
        <BookingDateField label="التاريخ *" value={date} onChange={setDate} />
        <BookingTimeField label="الوقت *" value={time} onChange={setTime} />
        <Field label="ملاحظات" value={notes} onChangeText={setNotes} multiline />

        <View style={{ marginTop: 12, opacity: !canSubmit || loading || doctorLoading ? 0.6 : 1 }}>
          <StackPrimaryButton label={loading ? "جارٍ الحجز..." : "تأكيد الحجز"} onPress={submit} />
        </View>
      </StackCard>
    </StackPageLayout>
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
  keyboardType?: "default" | "phone-pad" | "number-pad" | "email-address";
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: theme.textMuted, marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={theme.textSoft}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          minHeight: multiline ? 96 : 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.borderLight,
          backgroundColor: theme.bg,
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlign: "right",
          fontWeight: "700",
          color: theme.text,
        }}
      />
    </View>
  );
}
