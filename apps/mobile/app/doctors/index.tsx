import { useEffect } from "react";
import { router } from "expo-router";

export default function DoctorsIndexScreen() {
  useEffect(() => {
    router.replace("/");
  }, []);

  return null;
}
