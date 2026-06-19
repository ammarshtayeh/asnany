const path = require("path");
const fs = require("fs");

const appJson = require("./app.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

// Monorepo: reuse web/local env files so mobile gets Supabase + API values in dev.
[
  path.join(__dirname, ".env"),
  path.join(__dirname, ".env.local"),
  path.join(__dirname, "../web/.env.local"),
  path.join(__dirname, "../web/.env"),
  path.join(__dirname, "../../.env"),
  path.join(__dirname, "../../.env.local"),
].forEach(loadEnvFile);

const productionApiBase = "https://www.malamih.ps";
const apiBase =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || productionApiBase;
const isLocalApi = /localhost|127\.0\.0\.1|192\.168\./.test(apiBase);

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0a1628",
  },
  android: {
    ...appJson.expo.android,
    usesCleartextTraffic: isLocalApi,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0a1628",
    },
  },
  extra: {
    ...appJson.expo.extra,
    apiBaseUrl: apiBase,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
    eas: {
      ...appJson.expo.extra?.eas,
      projectId:
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
        appJson.expo.extra?.eas?.projectId,
    },
  },
};
