import * as Linking from "expo-linking";

export function resolveDeepLinkRoute(url: string): string | null {
  if (!url) return null;

  const parsed = Linking.parse(url);
  const path = (parsed.path || "").replace(/^\//, "");

  const doctorMatch = path.match(/^doctors\/([^/?#]+)/);
  if (doctorMatch?.[1]) return `/doctors/${doctorMatch[1]}`;

  if (path === "join") return "/join";
  if (path === "offers") return "/(tabs)/offers";
  if (path === "booking") return "/booking";
  if (path.startsWith("appointments")) {
    const phone = parsed.queryParams?.phone;
    if (typeof phone === "string" && phone) return `/appointments?phone=${encodeURIComponent(phone)}`;
    return "/appointments";
  }

  return null;
}
