import { useEffect } from "react";
import { router } from "expo-router";

export default function AdminIndexScreen() {
  useEffect(() => {
    router.replace("/admin/login");
  }, []);

  return null;
}
