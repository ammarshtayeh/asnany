import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function DoctorLegacyMapRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      router.replace(`/doctors/${id}/map`);
    } else {
      router.replace("/");
    }
  }, [id]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
      <ActivityIndicator color="#0f172a" />
    </View>
  );
}
