import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { doctorMapCoordinates } from "../../lib/map-links";
import { Doctor, Review } from "../../types";

export default function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  async function fetchDoctorDetails() {
    setLoading(true);
    try {
      if (!supabase || !id) return;
      const [doctorRes, reviewsRes] = await Promise.all([
        supabase.from("doctors").select("*").eq("id", id).single(),
        supabase
          .from("reviews")
          .select("*")
          .eq("doctor_id", id)
          .eq("is_approved", true)
          .order("created_at", { ascending: false }),
      ]);

      if (doctorRes.error) throw doctorRes.error;
      setDoctor(doctorRes.data as Doctor);
      setReviews((reviewsRes.data as Review[]) || []);
    } catch (error) {
      console.error("Doctor details error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function submitReview() {
    if (!name || !comment) {
      setNotice("يرجى تعبئة الاسم والتقييم قبل الإرسال.");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      if (!supabase || !doctor) return;
      const { error } = await supabase.from("reviews").insert([
        {
          doctor_id: doctor.id,
          patient_name: name,
          rating,
          comment,
          is_approved: false,
        },
      ]);
      if (error) throw error;
      setName("");
      setComment("");
      setRating(5);
      setNotice("تم إرسال تقييمك بنجاح، وسيظهر بعد مراجعته من الإدارة.");
    } catch (error) {
      console.error("Review submit error:", error);
      setNotice("تعذر إرسال التقييم حالياً.");
    } finally {
      setSaving(false);
    }
  }

  function openMap() {
    if (!doctor) return;
    const coords = doctorMapCoordinates(doctor);
    const latLng = `${coords.latitude},${coords.longitude}`;
    const label = encodeURIComponent(doctor.name);
    const url = Platform.select({
      ios: `maps://0,0?q=${label}&ll=${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    });
    Linking.openURL(url || `https://www.google.com/maps/search/?api=1&query=${latLng}`);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.sky} />
        <Text style={styles.centerText}>جار تحميل ملف الطبيب...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>الطبيب غير موجود</Text>
        <Text style={styles.centerText}>تعذر العثور على هذا الملف أو أنه غير مفعل حالياً.</Text>
        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>رجوع</Text>
        </Pressable>
      </View>
    );
  }

  const photos = doctor.clinic_photos?.filter(Boolean) || [];

  return (
    <ScrollView
      contentContainerStyle={[styles.page, { paddingTop: Math.max(insets.top + 12, 24), paddingBottom: insets.bottom + 28 }]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>رجوع</Text>
      </Pressable>

      <View style={styles.hero}>
        <Image
          source={{ uri: doctor.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop" }}
          style={styles.avatar}
        />
        <View style={styles.heroInfo}>
          <Text style={styles.name}>د. {doctor.name}</Text>
          <Text style={styles.specialty}>{doctor.specialty?.join("، ") || "طب أسنان عام"}</Text>
          <View style={styles.heroBadges}>
            <Badge label={doctor.verified ? "طبيب موثق" : "قيد المراجعة"} color={doctor.verified ? colors.emerald : colors.muted} />
            <Badge label={`تقييم ${doctor.rating || 5}`} color={colors.amber} />
          </View>
        </View>
      </View>

      {photos.length > 0 ? (
        <Card title="صور العيادة">
          <Image source={{ uri: photos[activePhoto] }} style={styles.clinicImage} />
          {photos.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {photos.map((photo, index) => (
                <Pressable
                  key={`${photo}-${index}`}
                  onPress={() => setActivePhoto(index)}
                  style={[styles.thumbWrap, activePhoto === index && { borderColor: colors.sky }]}
                >
                  <Image source={{ uri: photo }} style={styles.thumb} />
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </Card>
      ) : null}

      {doctor.bio ? (
        <Card title="نبذة مهنية">
          <Text style={styles.paragraph}>{doctor.bio}</Text>
        </Card>
      ) : null}

      <Card title="العنوان والتواصل">
        <Text style={styles.infoText}>{doctor.city}{doctor.area ? ` - ${doctor.area}` : ""}</Text>
        {doctor.address ? <Text style={styles.infoText}>{doctor.address}</Text> : null}
        <View style={styles.actions}>
          {doctor.phone ? <ActionButton label="اتصال" color={colors.ink} onPress={() => Linking.openURL(`tel:${doctor.phone}`)} /> : null}
          {doctor.whatsapp ? (
            <ActionButton
              label="واتساب"
              color="#25D366"
              onPress={() => Linking.openURL(`https://wa.me/${doctor.whatsapp.replace(/\+/g, "").replace(/\s/g, "")}`)}
            />
          ) : null}
          <ActionButton label="الخريطة" color={colors.sky} onPress={openMap} />
        </View>
      </Card>

      {doctor.accepts_insurance ? (
        <Card title="التأمين الطبي">
          <View style={styles.wrapRow}>
            {(doctor.insurance_list?.length ? doctor.insurance_list : ["يقبل التأمينات المعتمدة"]).map((item) => (
              <Badge key={item} label={item} color={colors.sky} />
            ))}
          </View>
        </Card>
      ) : null}

      {doctor.working_hours ? (
        <Card title="أوقات الدوام">
          {Object.entries(doctor.working_hours).map(([day, slot]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.time}>{String(slot)}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Card title={`تقييمات المرضى (${reviews.length})`}>
        {reviews.length === 0 ? (
          <Text style={styles.mutedText}>لا توجد تقييمات منشورة بعد.</Text>
        ) : (
          <View style={styles.stack}>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{review.patient_name || review.name || "مريض"}</Text>
                  <Text style={styles.reviewRating}>{review.rating}/5</Text>
                </View>
                <Text style={styles.paragraph}>{review.comment || review.text}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card title="أضف تقييمك">
        <TextInput value={name} onChangeText={setName} placeholder="اسمك" placeholderTextColor="#94a3b8" style={styles.input} textAlign="right" />
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} onPress={() => setRating(value)} style={[styles.ratingChip, rating >= value && { backgroundColor: "#fef3c7", borderColor: "#f59e0b" }]}>
              <Text style={[styles.ratingChipText, rating >= value && { color: colors.amber }]}>{value}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="اكتب تجربتك مع الطبيب"
          placeholderTextColor="#94a3b8"
          style={[styles.input, styles.textArea]}
          textAlign="right"
          multiline
        />
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Pressable disabled={saving} onPress={submitReview} style={[styles.primaryButton, saving && { opacity: 0.7 }]}>
          <Text style={styles.primaryButtonText}>{saving ? "جار الإرسال..." : "إرسال التقييم"}</Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: `${color}33`, backgroundColor: `${color}14` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function ActionButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, { backgroundColor: color }]}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 16,
    gap: 14,
    backgroundColor: colors.soft,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.soft,
    gap: 12,
  },
  centerText: {
    color: colors.muted,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backText: {
    color: colors.ink,
    fontWeight: "900",
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: 28,
    padding: 18,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
  },
  heroInfo: {
    flex: 1,
    gap: 8,
  },
  name: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "right",
  },
  specialty: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    lineHeight: 20,
  },
  heroBadges: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right",
  },
  paragraph: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "right",
  },
  clinicImage: {
    width: "100%",
    height: 190,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  photoRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  thumbWrap: {
    width: 64,
    height: 54,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  infoText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },
  actions: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
  },
  wrapRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-end",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  hoursRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
  },
  day: {
    color: colors.ink,
    fontWeight: "900",
  },
  time: {
    color: colors.muted,
    fontWeight: "800",
  },
  mutedText: {
    color: colors.muted,
    fontWeight: "800",
    textAlign: "right",
  },
  stack: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  reviewName: {
    color: colors.ink,
    fontWeight: "900",
  },
  reviewRating: {
    color: colors.amber,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontWeight: "800",
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  ratingRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  ratingChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    alignItems: "center",
  },
  ratingChipText: {
    color: colors.muted,
    fontWeight: "900",
  },
  notice: {
    color: colors.teal,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.teal,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
});
