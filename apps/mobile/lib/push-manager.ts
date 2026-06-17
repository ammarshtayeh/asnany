import AsyncStorage from "@react-native-async-storage/async-storage";
import { doctorSession, adminSession } from "./session";
import { registerPushSubscription } from "./notifications";

const PATIENT_PHONE_KEY = "asnany_mobile_patient_phone";

export type PushRole = "patient" | "doctor" | "admin";

export async function getStoredPatientPhone() {
  return AsyncStorage.getItem(PATIENT_PHONE_KEY);
}

export async function setStoredPatientPhone(phone: string) {
  const normalized = phone.replace(/[^0-9]/g, "");
  if (!normalized) return;
  await AsyncStorage.setItem(PATIENT_PHONE_KEY, normalized);
}

export async function resolveActivePushRole(): Promise<{
  role: PushRole;
  authToken?: string;
  doctorId?: string;
  patientPhone?: string;
}> {
  const doctor = await doctorSession.read();
  if (doctor?.token) {
    const doctorId =
      (doctor.doctor as any)?.id ||
      (doctor.doctor as any)?.doctor_id ||
      (doctor.raw as any)?.account?.doctor_id ||
      (doctor.raw as any)?.doctor_id;
    return { role: "doctor", authToken: doctor.token, doctorId };
  }

  const admin = await adminSession.read();
  if (admin?.token) {
    return { role: "admin", authToken: admin.token };
  }

  const patientPhone = (await getStoredPatientPhone()) || undefined;
  return { role: "patient", patientPhone };
}

export async function syncPushForCurrentUser() {
  const context = await resolveActivePushRole();
  return registerPushSubscription({
    role: context.role,
    authToken: context.authToken,
    doctorId: context.doctorId,
    patientPhone: context.patientPhone,
  });
}

export async function onAuthLogin(role: PushRole, options: { authToken?: string; doctorId?: string; patientPhone?: string } = {}) {
  if (options.patientPhone) await setStoredPatientPhone(options.patientPhone);
  return registerPushSubscription({
    role,
    authToken: options.authToken,
    doctorId: options.doctorId,
    patientPhone: options.patientPhone,
  });
}

export async function onAuthLogout() {
  return syncPushForCurrentUser();
}
