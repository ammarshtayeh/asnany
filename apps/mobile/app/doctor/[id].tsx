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
  Dimensions
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

export default function DoctorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

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

      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setDoctor(data);
    } catch (err) {
      console.error("Error fetching mobile doctor detail:", err);
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0e766e" />
        <Text style={styles.loaderText}>جاري تحميل تفاصيل الطبيب والعيادة...</Text>
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
            style={styles.avatar} 
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
              style={styles.clinicMainImage} 
            />
            {doctor.clinic_photos.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
                {doctor.clinic_photos.map((photo, index) => (
                  <Pressable 
                    key={index} 
                    onPress={() => setActivePhoto(index)}
                    style={[styles.thumbnailWrapper, activePhoto === index && styles.thumbnailWrapperActive]}
                  >
                    <Image source={{ uri: photo }} style={styles.thumbnailImage} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
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

        {/* Bio */}
        {doctor.bio && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📝 نبذة وسيرة مهنية</Text>
            <Text style={styles.bioText}>{doctor.bio}</Text>
          </View>
        )}

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
    backgroundColor: "#f8fafc",
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
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#f1f5f9"
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
    borderColor: "#f1f5f9",
    shadowColor: "#000",
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
    height: 180,
    borderRadius: 16,
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
  }
});
