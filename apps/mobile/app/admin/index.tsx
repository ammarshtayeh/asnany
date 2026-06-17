import { Redirect } from "expo-router";
import { adminSession } from "../../lib/session";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AdminIndexScreen() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    void adminSession.read().then((session) => {
      setTarget(session?.token ? "/admin/dashboard" : "/admin/login");
    });
  }, []);

  if (!target) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return <Redirect href={target as any} />;
}
