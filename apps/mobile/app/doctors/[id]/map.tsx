import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { Doctor } from "../../../lib/types";
import { ClinicMap } from "../../../components/ClinicMap";
import { openNativeMaps, doctorMapLabel } from "../../../lib/map-links";
import { supabase } from "../../../lib/supabase";
import { StackCard, StackPageLayout, StackPrimaryButton, StackSecondaryButton } from "../../../components/ui/StackPageLayout";
import { theme } from "../../../constants/theme";

export default function DoctorMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      setLoading(true);
      try {
        if (!supabase) return;
        const { data, error } = await supabase.from("doctors").select("*").eq("id", id).eq("verified", true).single();
        if (error) throw error;
        setDoctor(data || null);
      } catch (error) {
        console.error("Fetch map doctor error:", error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.teal} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <StackPageLayout title="خريطة العيادة" subtitle="لم يتم العثور على الطبيب">
        <StackCard>
          <StackSecondaryButton label="الرجوع" onPress={() => (router.canGoBack() ? router.back() : router.push("/"))} />
        </StackCard>
      </StackPageLayout>
    );
  }

  return (
    <StackPageLayout badge="📍 خريطة العيادة" title={doctor.name} subtitle={doctorMapLabel(doctor)}>
      <StackCard>
        <ClinicMap doctor={doctor} />
      </StackCard>
      <StackSecondaryButton label="العودة للملف" onPress={() => router.back()} />
      <StackPrimaryButton label="فتح في خرائط الجهاز" onPress={() => void openNativeMaps(doctor)} />
    </StackPageLayout>
  );
}
