import Constants from "expo-constants";
import { Platform } from "react-native";

const PRODUCTION_API_BASE = "https://malamih.ps";

function getConfiguredApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  if (fromExtra) return fromExtra.replace(/\/$/, "");

  return null;
}

function getHostFromExpo(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as any)?.manifest?.debuggerHost,
    (Constants as any)?.expoGoConfig?.debuggerHost,
    (Constants as any)?.linkingUrl,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const match = candidate.match(/^(?:exp|http|https):\/\/([^/:]+)(?::\d+)?/i);
    const host =
      match?.[1] ||
      candidate
        .split(":")[0]
        .replace(/^exp:\/\//i, "")
        .replace(/^https?:\/\//i, "");

    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }

  return null;
}

function getApiBaseUrl() {
  const configured = getConfiguredApiBaseUrl();
  if (configured) return configured;

  if (Platform.OS === "web") return "";

  const host = getHostFromExpo();
  if (host) return `http://${host}:3003`;

  if (!__DEV__) return PRODUCTION_API_BASE;

  return "http://127.0.0.1:3003";
}

export const API_BASE_URL = getApiBaseUrl();

export function apiUrl(path: string) {
  if (Platform.OS === "web" && !API_BASE_URL) return path;
  return `${API_BASE_URL}${path}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  try {
    const response = await fetch(apiUrl(path), {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      ...init,
    });

    let data: T & { error?: string; message?: string } | null = null;
    try {
      data = (await response.json()) as T & { error?: string; message?: string };
    } catch {
      data = null;
    }

    return { response, data };
  } catch (error: any) {
    return {
      response: { ok: false, status: 0 } as Response,
      data: { error: error?.message || "Network error" } as T & { error?: string; message?: string },
    };
  }
}
