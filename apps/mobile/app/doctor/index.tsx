import { useEffect } from "react";
import { router } from "expo-router";

export default function DoctorIndexScreen() {
  useEffect(() => {
    router.replace("/doctor/login");
  }, []);

  return null;
}
