import React, { useState, useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { 
  Linking, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  Platform, 
  Image, 
  ActivityIndicator,
  Dimensions,
  TextInput
} from "react-native";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

interface Doctor {
  id: string;
  name: string;
  specialty: string[];
  city: string;
  area: string;
  phone: string;
  whatsapp: string;
  bio: string;
  lat: number;
  lng: number;
  image_url: string;
  clinic_photos: string[];
  insurance_list: string[];
  working_hours: any;
  verified: boolean;
  is_featured: boolean;
  rating: number;
  accepts_insurance: boolean;
}

interface Review {
  id: string;
  doctor_id: string;
  name: string;
  rating: number;
  text: string;
  is_approved: boolean;
  created_at: string;
}

export default function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  // Review form states
  const [revName, setRevName] = useState("");
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState("");
  const [revSuccess, setRevSuccess] = useState(false);
  const [revSaving, setRevSaving] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    try {
      if (!supabase || !id) {
        setLoading(false);
        return;
      }

      // Fetch Doctor Info
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setDoctor(data);

      // Fetch Approved Reviews
      const { data: reviewsData, error: revError } = await supabase
        .from("reviews")
        .select("*")
        .eq("doctor_id", id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (!revError) {
        setReviews(reviewsData || []);
      }

    } catch (err) {
      console.error("Error fetching mobile doctor detail & reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMap = () => {
    if (!doctor || !doctor.lat || !doctor.lng) return;
    const latLng = `${doctor.lat},${doctor.lng}`;
    const label = doctor.name;
    const url = Platform.select({
      ios: `maps://0,0?q=${label}&ll=${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`
    });

    Linking.openURL(url || `https://www.google.com/maps/search/?api=1&query=${latLng}`);
  };

  const handleReviewSubmit = async () => {
    if (!revName || !revText) {
      alert("يرجى إدخال اسمك وتفاصيل المراجعة.");
      return;
    }

    setRevSaving(true);
    try {
      const { error } = await supabase!
        .from("reviews")
        .insert([{
          doctor_id: id,
          name: revName,
          rating: revRating,
          text: revText,
          is_approved: false // Admin must approve review before display
        }]);

      if (error) throw error;

      setRevSuccess(true);
      setRevName("");
      setRevText("");
      setRevRating(5);
    } catch (err) {
      console.error("Error submitting doctor review mobile:", err);
      alert("فشل إرسال التقييم. حاول مرة أخرى.");
    } finally {
      setRevSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
        <Text style={styles.loaderText}>جاري تحميل تفاصيل الطبيب والعيادة والتقييمات...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>⚠️ الطبيب غير موجود</Text>
        <Text style={styles.emptyDesc}>عذراً، لم نتمكن من العثور على الطبيب المطلوب أو قد يكون غير مفعل حالياً.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: doctor.name, headerTitleAlign: "center" }} />
      <ScrollView contentContainerStyle={styles.page}>
        
        {/* Doctor Avatar Card */}
        <View style={styles.avatarCard}>
          <Image 
            source={{ uri: doctor.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=250&auto=format&fit=crop&q=80" }} 
            style={styles.avatar as any} 
          />
          <View style={styles.avatarInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.title}>{doctor.name}</Text>
              {doctor.verified && <Text style={styles.verifiedBadge}>✔ موثق</Text>}
            </View>
            
            <View style={styles.specialtyRow}>
              {doctor.specialty && doctor.specialty.map((spec, i) => (
                <Text key={i} style={styles.specialtyBadge}>{spec}</Text>
              ))}
            </View>

            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ تقييم {doctor.rating || 5.0} من 5</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Clinic Photos Gallery */}
        {doctor.clinic_photos && doctor.clinic_photos.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📸 جولة في عيادة الطبيب</Text>
            <Image 
              source={{ uri: doctor.clinic_photos[activePhoto] }} 
              style={styles.clinicMainImage as any} 
            />
            {doctor.clinic_photos.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
                {doctor.clinic_photos.map((photo, index) => (
                  <Pressable 
                    key={index} 
                    onPress={() => setActivePhoto(index)}
                    style={[styles.thumbnailWrapper, activePhoto === index && styles.thumbnailWrapperActive]}
                  >
                    <Image source={{ uri: photo }} style={styles.thumbnailImage as any} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Bio */}
        {doctor.bio && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📝 نبذة وسيرة مهنية</Text>
            <Text style={styles.bioText}>{doctor.bio}</Text>
          </View>
        )}

        {/* Location & Title */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 العنوان والموقع</Text>
          <Text style={styles.itemText}>المدينة: {doctor.city}</Text>
          <Text style={styles.itemText}>العنوان بالتفصيل: {doctor.area || "شارع الرئيسي، عمارة السلام"}</Text>
          
          {doctor.lat && doctor.lng && (
            <Pressable
              style={[styles.button, styles.mapButton]}
              onPress={handleOpenMap}
            >
              <Text style={styles.buttonText}>🗺️ فتح موقع العيادة في الخرائط (GPS)</Text>
            </Pressable>
          )}
        </View>

        {/* Insurances accepted */}
        {doctor.accepts_insurance && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🛡️ شركات التأمين المقبولة</Text>
            {doctor.insurance_list && doctor.insurance_list.length > 0 ? (
              <View style={styles.insuranceBadgeGrid}>
                {doctor.insurance_list.map((ins, i) => (
                  <Text key={i} style={styles.insuranceBadgeText}>{ins}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.itemText}>يقبل الطبيب شركات التأمين الطبي المعتمدة في فلسطين.</Text>
            )}
          </View>
        )}

        {/* Working Hours */}
        {doctor.working_hours && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🕒 أوقات وساعات العمل</Text>
            {Object.entries(doctor.working_hours).map(([day, slot]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>{day}</Text>
                <Text style={[styles.timeText, slot === "مغلق" && styles.closedText]}>
                  {slot as string}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 💬 Patient Reviews & Testimonials Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💬 تقييمات ومراجعات المرضى ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <Text style={[styles.itemText, { color: "#64748b", fontStyle: "italic", textAlign: "center", marginVertical: 10 }]}>
              لا توجد تقييمات منشورة لهذا الطبيب بعد. كن أول من يقيّم!
            </Text>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserBadge}>
                      <Text style={styles.reviewUserInitials}>{rev.name.substring(0, 1)}</Text>
                    </View>
                    <View style={styles.reviewUserInfo}>
                      <Text style={styles.reviewUserName}>{rev.name}</Text>
                      <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString("ar-EG")}</Text>
                    </View>
                    <View style={styles.reviewStarsBox}>
                      <Text style={styles.reviewStarsText}>⭐ {rev.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{rev.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ✍ Interactive Write Review Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>✍ قيّم طبيبك وشارك تجربتك</Text>
          {revSuccess ? (
            <View style={styles.successReviewBox}>
              <Text style={styles.successReviewTitle}>🎉 تم إرسال تقييمك بنجاح!</Text>
              <Text style={styles.successReviewDesc}>شكراً لك! تم استلام مراجعتك بنجاح وسوف تظهر في ملف الطبيب فور مراجعة واعتماد الإدارة للتأكد من الموثوقية.</Text>
              <Pressable onPress={() => setRevSuccess(false)} style={[styles.button, { backgroundColor: "#0f172a", marginTop: 8 }]}>
                <Text style={styles.buttonText}>كتابة تقييم آخر</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>الاسم الكامل *:</Text>
              <TextInput 
                value={revName} 
                onChangeText={setRevName} 
                placeholder="أدخل اسمك الكريم..." 
                style={styles.formInput} 
                textAlign="right" 
              />

              <Text style={styles.inputLabel}>اختر التقييم (من 1 إلى 5 نجوم) *:</Text>
              <View style={styles.starSelectorRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable 
                    key={star} 
                    onPress={() => setRevRating(star)} 
                    style={[styles.starBtn, revRating >= star && styles.starBtnActive]}
                  >
                    <Text style={[styles.starBtnText, revRating >= star && styles.starBtnTextActive]}>⭐</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>رأيك وتجربتك بالعيادة بالتفصيل *:</Text>
              <TextInput 
                value={revText} 
                onChangeText={setRevText} 
                multiline 
                numberOfLines={3} 
                placeholder="شاركنا رأيك في مستوى الخدمة، التعقيم، المعاملة والأسعار..." 
                style={[styles.formInput, { height: 80 }]} 
                textAlign="right" 
              />

              <Pressable 
                disabled={revSaving} 
                onPress={handleReviewSubmit} 
                style={[styles.button, { backgroundColor: "#0d9488", marginTop: 10 }]}
              >
                <Text style={styles.buttonText}>{revSaving ? "جاري الحفظ..." : "💾 إرسال تقييمي للمراجعة"}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* WhatsApp & Booking CTAs */}
        <View style={styles.bookingRow}>
          {doctor.whatsapp && (
            <Pressable
              style={[styles.button, styles.whatsappButton]}
              onPress={() => {
                const cleanWa = doctor.whatsapp.replace(/\+/g, "");
                Linking.openURL(`https://wa.me/${cleanWa}?text=${encodeURIComponent("مرحباً دكتور، أود الاستفسار وحجز موعد في عيادتكم الموقرة عبر منصة أسناني.")}`);
              }}
            >
              <Text style={styles.buttonText}>💬 حجز فوري عبر واتساب</Text>
            </Pressable>
          )}

          {doctor.phone && (
            <Pressable
              style={[styles.button, styles.phoneButton]}
              onPress={() => Linking.openURL(`tel:${doctor.phone}`)}
            >
              <Text style={styles.buttonText}>📞 اتصال هاتفي مباشر</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    gap: 16,
    backgroundColor: "#f4f6fa",
    paddingBottom: 40
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 40
  },
  loaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 40,
    backgroundColor: "#f8fafc"
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#e11d48"
  },
  emptyDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22
  },
  avatarCard: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row-reverse",
    gap: 16,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 4
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#334155"
  },
  avatarInfo: {
    flex: 1,
    gap: 6
  },
  nameRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff"
  },
  verifiedBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  specialtyRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6
  },
  specialtyBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0d9488",
    backgroundColor: "rgba(13, 148, 136, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  ratingBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-end",
    marginTop: 4
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#f59e0b"
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingBottom: 8,
    textAlign: "right"
  },
  clinicMainImage: {
    width: "100%",
    height: 185,
    borderRadius: 18,
    resizeMode: "cover",
    marginTop: 4
  },
  thumbnailRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 4
  },
  thumbnailWrapper: {
    width: 60,
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent"
  },
  thumbnailWrapperActive: {
    borderColor: "#0d9488"
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  itemText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    textAlign: "right",
    lineHeight: 20
  },
  bioText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    textAlign: "right",
    lineHeight: 22
  },
  insuranceBadgeGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8
  },
  insuranceBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0284c7",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0f2fe"
  },
  hoursRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4
  },
  dayText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569"
  },
  timeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  closedText: {
    color: "#ef4444",
    backgroundColor: "#fef2f2",
    borderColor: "#fee2e2"
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900"
  },
  mapButton: {
    backgroundColor: "#334155",
    marginTop: 8
  },
  bookingRow: {
    gap: 12,
    marginTop: 8
  },
  whatsappButton: {
    backgroundColor: "#25d366"
  },
  phoneButton: {
    backgroundColor: "#0f172a"
  },
  reviewsList: {
    gap: 12,
    marginTop: 4
  },
  reviewItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6
  },
  reviewHeader: {
    flexDirection: "row-reverse",
    gap: 10,
    alignItems: "center"
  },
  reviewUserBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0d9488",
    alignItems: "center",
    justifyContent: "center"
  },
  reviewUserInitials: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900"
  },
  reviewUserInfo: {
    flex: 1,
    gap: 2
  },
  reviewUserName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "right"
  },
  reviewDate: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "right"
  },
  reviewStarsBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8
  },
  reviewStarsText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#b45309"
  },
  reviewComment: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "right",
    lineHeight: 18
  },
  successReviewBox: {
    alignItems: "center",
    padding: 12,
    gap: 8
  },
  successReviewTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#10b981"
  },
  successReviewDesc: {
    fontSize: 11,
    color: "#475569",
    textAlign: "center",
    lineHeight: 16,
    fontWeight: "600"
  },
  formContainer: {
    gap: 8
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#475569",
    textAlign: "right",
    marginTop: 4
  },
  formInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b"
  },
  starSelectorRow: {
    flexDirection: "row-reverse",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 4
  },
  starBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  starBtnActive: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a"
  },
  starBtnText: {
    fontSize: 18,
    opacity: 0.2
  },
  starBtnTextActive: {
    opacity: 1
  }
});
