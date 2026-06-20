import AsyncStorage from "@react-native-async-storage/async-storage";
import { migrateStorageKey } from "./storage-migrate";

const DOCTOR_SESSION_KEY = "malamih_mobile_doctor_session";
const ADMIN_SESSION_KEY = "malamih_mobile_admin_session";
const LEGACY_DOCTOR_SESSION_KEY = "asnany_mobile_doctor_session";
const LEGACY_ADMIN_SESSION_KEY = "asnany_mobile_admin_session";

let migrationDone = false;

async function ensureMigrated() {
  if (migrationDone) return;
  await migrateStorageKey(DOCTOR_SESSION_KEY, LEGACY_DOCTOR_SESSION_KEY);
  await migrateStorageKey(ADMIN_SESSION_KEY, LEGACY_ADMIN_SESSION_KEY);
  migrationDone = true;
}

export type AuthSession = {
  token?: string;
  doctor?: Record<string, any> | null;
  admin?: Record<string, any> | null;
  raw?: Record<string, any>;
};

async function readSession(key: string): Promise<AuthSession | null> {
  await ensureMigrated();
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch {
    return null;
  }
}

async function writeSession(key: string, session: AuthSession) {
  await ensureMigrated();
  await AsyncStorage.setItem(key, JSON.stringify(session));
}

async function clearSession(key: string) {
  await ensureMigrated();
  await AsyncStorage.removeItem(key);
}

export const doctorSession = {
  read: () => readSession(DOCTOR_SESSION_KEY),
  write: (session: AuthSession) => writeSession(DOCTOR_SESSION_KEY, session),
  clear: () => clearSession(DOCTOR_SESSION_KEY),
};

export const adminSession = {
  read: () => readSession(ADMIN_SESSION_KEY),
  write: (session: AuthSession) => writeSession(ADMIN_SESSION_KEY, session),
  clear: () => clearSession(ADMIN_SESSION_KEY),
};
