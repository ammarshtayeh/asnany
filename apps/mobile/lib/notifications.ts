import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { apiFetch } from "./api";
import { migrateStorageKey } from "./storage-migrate";

const DEVICE_ID_KEY = "malamih_mobile_device_id";
const LEGACY_DEVICE_ID_KEY = "asnany_mobile_device_id";
const ANDROID_CHANNEL_ID = "appointments";

type RegisterPushOptions = {
  role?: "patient" | "doctor" | "admin";
  patientPhone?: string;
  doctorId?: string;
  authToken?: string;
};

export function resolveNotificationRoute(data?: Record<string, unknown> | null) {
  const type = typeof data?.type === "string" ? data.type : "";
  const patientPhone = typeof data?.patientPhone === "string" ? data.patientPhone : "";

  if (type === "appointment_created") {
    return "/doctor/notifications";
  }

  if (type === "admin_appointment_created") {
    return "/admin/notifications";
  }

  if (type === "appointment_status") {
    return patientPhone ? `/appointments?phone=${encodeURIComponent(patientPhone)}` : "/appointments";
  }

  return null;
}

async function getDeviceId() {
  await migrateStorageKey(DEVICE_ID_KEY, LEGACY_DEVICE_ID_KEY);
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
  if (Platform.OS === "web" || Constants.appOwnership === "expo") return { ok: false, reason: "expo-go-or-web" };

  const projectId = getProjectId();
  if (!projectId) return { ok: false, reason: "missing-eas-project-id" };

  const Notifications = await configureNotifications();

  const currentPermissions = await Notifications.getPermissionsAsync();
  let status = currentPermissions.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowProvisional: false,
      },
    });
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

export async function configureNotifications() {
  const Notifications = await import("expo-notifications");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "ios") {
    await Notifications.setBadgeCountAsync(0).catch(() => null);
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "حجوزات وتنبيهات ملامح",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0ea5e9",
      sound: "default",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationChannelAsync("default", {
      name: "تنبيهات عامة",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: "#0ea5e9",
      sound: "default",
    });
  }

  return Notifications;
}

export async function playNotificationAlert() {
  if (Platform.OS === "web") return;
  const Notifications = await import("expo-notifications");
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "ملامح",
      body: "لديك إشعار جديد",
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  }).catch(() => null);
}

export function attachForegroundNotificationListener(onReceived?: (notification: any) => void) {
  if (Platform.OS === "web") return { remove: () => undefined };

  let subscription: { remove: () => void } | undefined;

  void import("expo-notifications").then((Notifications) => {
    subscription = Notifications.addNotificationReceivedListener((notification) => {
      onReceived?.(notification);
    });
  });

  return {
    remove: () => subscription?.remove(),
  };
}
