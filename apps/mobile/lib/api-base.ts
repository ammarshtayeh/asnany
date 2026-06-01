import Constants from "expo-constants";

export function getMobileApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:3003`;
    }
  }

  return "http://127.0.0.1:3003";
}

