import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, Linking } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";

import { apiFetch } from "../../../lib/api";
import { Doctor } from "../../../lib/types";
import { ClinicMap } from "../../../components/ClinicMap";
import { buildNativeMapsUrl, doctorMapLabel } from "../../../lib/map-links";

export default function DoctorMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await apiFetch<{ doctors?: Doctor[] }>("/api/doctors");
      const doctors = Array.isArray(data) ? data : Array.isArray(data?.doctors) ? data.doctors : [];
      const found = doctors.find((item) => item.id === id) || null;
      setDoctor(found);
      setLoading(false);
    })();
  }, [id]);

  const openDeviceMap = async () => {
    if (!doctor) return;
    await Linking.openURL(buildNativeMapsUrl(doctor));
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#0f172a" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-center text-lg font-black text-slate-950">لم يتم العثور على الطبيب</Text>
        <Link href="/" asChild>
          <Pressable className="mt-4 min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-6">
            <Text className="text-sm font-black text-white">العودة للرئيسية</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <View className="rounded-3xl bg-white p-5">
        <Text className="text-sm font-black text-sky-600">خريطة العيادة</Text>
        <Text className="mt-2 text-3xl font-black text-slate-950">{doctor.name}</Text>
        <Text className="mt-2 text-sm font-semibold text-slate-500">{doctorMapLabel(doctor)}</Text>
      </View>

      <View className="mt-4">
        <ClinicMap doctor={doctor} />
      </View>

      <View className="mt-4 flex-row gap-3">
        <Link href={`/doctors/${doctor.id}`} asChild>
          <Pressable className="flex-1 min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-4">
            <Text className="text-sm font-black text-white">العودة للملف</Text>
          </Pressable>
        </Link>
        <Pressable onPress={openDeviceMap} className="flex-1 min-h-12 items-center justify-center rounded-2xl bg-sky-600 px-4">
          <Text className="text-sm font-black text-white">فتح في خرائط الجهاز</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
