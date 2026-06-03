import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { apiFetch } from "./api";

const DEVICE_ID_KEY = "asnany_mobile_device_id";

type RegisterPushOptions = {
  role?: "patient" | "doctor" | "admin";
  patientPhone?: string;
  doctorId?: string;
  authToken?: string;
};

async function getDeviceId() {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const next = `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

function getProjectId() {
  return (
    (Constants as any)?.easConfig?.projectId ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    null
  );
}

export async function registerPushSubscription(options: RegisterPushOptions = {}) {
  if (Platform.OS === "web" || Constants.appOwnership === "expo") {
    return { ok: false, reason: "expo-go-or-web" };
  }

  const projectId = getProjectId();
  if (!projectId) {
    return { ok: false, reason: "missing-eas-project-id" };
  }

  const Notifications = await import("expo-notifications");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0ea5e9",
    });
  }

  const currentPermissions = await Notifications.getPermissionsAsync();
  let status = currentPermissions.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== "granted") {
    return { ok: false, reason: "permission-denied" };
  }

  const deviceId = await getDeviceId();
  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });

  const { response, data } = await apiFetch<{ success?: boolean; error?: string }>("/api/notifications/register", {
    method: "POST",
    headers: {
      ...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}),
    },
    body: JSON.stringify({
      expo_push_token: pushToken.data,
      device_id: deviceId,
      platform: Platform.OS,
      role: options.role || "patient",
      patient_phone: options.patientPhone,
      doctor_id: options.doctorId,
    }),
  });

  return { ok: response.ok && Boolean(data?.success), token: pushToken.data, error: data?.error };
}
