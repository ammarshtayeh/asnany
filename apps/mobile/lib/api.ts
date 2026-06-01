import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_BASE_URL = Platform.OS === "web" ? "" : "http://127.0.0.1:3003";

function getHostFromExpo(): string | null {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost || "";
  if (!hostUri) return null;

  const match = hostUri.match(/^(?:exp|http|https):\/\/([^/:]+)(?::\d+)?/i);
  const host = match?.[1] || hostUri.split(":")[0].replace(/^exp:\/\//i, "");
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

function getApiBaseUrl() {
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (envBase) return envBase;

  if (Platform.OS === "web") return DEFAULT_BASE_URL;

  const host = getHostFromExpo();
  if (host) return `http://${host}:3003`;

  return DEFAULT_BASE_URL;
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
